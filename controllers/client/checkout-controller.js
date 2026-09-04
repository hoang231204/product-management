const Order = require('../../models/order-model');
const Cart = require('../../models/cart-model');
const Product = require('../../models/product-model');
const crypto = require('crypto');
const querystring = require('qs');
const moment = require('moment');
const calcuNewPrice = require('../../helpers/calcu-new-price');
// Hàm sắp xếp key (bắt buộc cho VNPay)
function sortObject(obj) {
    let sorted = {};
    let str = [];
    let key;
    for (key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
            str.push(encodeURIComponent(key));
        }
    }
    str.sort();
    for (key = 0; key < str.length; key++) {
        sorted[str[key]] = encodeURIComponent(obj[str[key]]).replace(/%20/g, "+");
    }
    return sorted;
}
// GET /checkout
module.exports.checkout = async (req, res) =>{
    try{
        const cartId = req.cartId;
        const cart = await Cart.findOne({ _id: cartId }).populate('products.product_id', 'title price thumbnail discountPercentage').lean();
        if(!cart){
            req.flash('error', 'Giỏ hàng không tồn tại');
            return res.redirect('/products');
        }
        cart.products = cart.products.filter(item => item.product_id && typeof item.product_id === 'object' && item.product_id._id);
        cart.products.forEach(item => {
            const price = item.product_id.price || 0;
            const discount = item.product_id.discountPercentage || 0;
            item.product_id.priceNew = calcuNewPrice.priceNew(price, discount);
        });
        cart.totalPrice = cart.products.reduce((total, item) => {
            const itemPrice = (item.product_id.priceNew || 0) * item.quantity;
            return total + itemPrice;
        }, 0);
        res.render('client/pages/checkout/index', 
            {
                cartDetail: cart,
                pageTitle: 'Thanh toán'
            });
    }
    catch(error){
        req.flash('error', 'Đã có lỗi xảy ra, vui lòng thử lại');
        res.redirect('/products');
    }
}
// POST /checkout/cash
module.exports.checkoutCash = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const cartId = req.cartId;
        const fullname = req.body.fullname;
        const phone = req.body.phone;
        const address = req.body.address;

        let userInfor = {
            fullname: fullname,
            phone: phone,
            address: address
        };

        // --- BƯỚC 1: XỬ LÝ IDEMPOTENCY (Chống double-click / gửi request trùng lặp) ---
        // Nếu trong vòng 2 phút qua, giỏ hàng này đã tạo một đơn COD rồi thì tái sử dụng lại luôn đơn đó
        const existingOrder = await Order.findOne({ 
            cart_id: cartId, 
            paymentMethod: 'COD',
            createdAt: { $gte: new Date(Date.now() - 2 * 60 * 1000) } 
        }).session(session).lean();

        if (existingOrder) {
            await session.abortTransaction();
            session.endSession();
            return res.redirect(`/checkout/success/${existingOrder._id}`);
        }

        // --- BƯỚC 2: KIỂM TRA GIỎ HÀNG ---
        const cart = await Cart.findOne({ _id: cartId })
            .populate('products.product_id', 'title price thumbnail discountPercentage stock')
            .session(session)
            .lean();

        if (!cart) {
            await session.abortTransaction();
            session.endSession();
            req.flash('error', 'Giỏ hàng không tồn tại');
            return res.redirect('/products');
        }

        cart.products = cart.products.filter(item => item.product_id !== null);
        if (cart.products.length === 0) {
            await session.abortTransaction();
            session.endSession();
            req.flash('error', 'Giỏ hàng của bạn đang trống, không thể đặt hàng!');
            return res.redirect('/products');
        }

        // --- BƯỚC 3: KIỂM TRA TỒN KHO ---
        for (const item of cart.products) {
            const product = item.product_id;
            if (product.stock < item.quantity) {
                await session.abortTransaction();
                session.endSession();
                req.flash('error', `Sản phẩm "${product.title}" không đủ số lượng trong kho (chỉ còn ${product.stock})!`);
                return res.redirect('/carts'); 
            }
        }

        // --- BƯỚC 4: TRỪ KHO BẰNG BULKWRITE TRONG TRANSACTION ---
        const bulkOps = cart.products.map(item => ({
            updateOne: {
                filter: { _id: item.product_id._id, stock: { $gte: item.quantity } },
                update: { $inc: { stock: -item.quantity } }
            }
        }));
        
        const bulkResult = await Product.bulkWrite(bulkOps, { session });
        if (bulkResult.modifiedCount < cart.products.length) {
            await session.abortTransaction();
            session.endSession();
            req.flash('error', 'Một số sản phẩm vừa có người mua hoặc không đủ số lượng, vui lòng thử lại!');
            return res.redirect('/carts');
        }

        // --- BƯỚC 5: TÍNH TOÁN GIÁ VÀ TẠO ĐƠN HÀNG ---
        cart.products.forEach(item => {
            item.product_id.priceNew = calcuNewPrice.priceNew(item.product_id.price, item.product_id.discountPercentage);
        });

        cart.totalPrice = cart.products.reduce((total, item) => {
            const itemPrice = item.product_id.priceNew * item.quantity;
            return total + itemPrice;
        }, 0);

        const products = cart.products.map(item => ({
            product_id: item.product_id._id,
            price: item.product_id.price,
            discountPercentage: item.product_id.discountPercentage,
            quantity: item.quantity
        }));

        const order = new Order({
            cart_id: cartId,
            userInfor: userInfor,
            products: products,
            totalPrice: cart.totalPrice,
            paymentMethod: 'COD',
            paymentStatus: 'unpaid'
        });

        if (res.locals.user) {
            order.user_id = res.locals.user._id;
        }
        await order.save({ session });

        // --- BƯỚC 6: XÓA SẠCH GIỎ HÀNG NGAY TRONG TRANSACTION ---
        await Cart.updateOne(
            { _id: cartId }, 
            { $set: { products: [], totalPrice: 0 } }
        ).session(session);

        // --- BƯỚC 7: COMMIT TRANSACTION KHI MỌI THỨ THÀNH CÔNG ---
        await session.commitTransaction();
        session.endSession();
        return res.redirect(`/checkout/success/${order._id}`);
    } catch (error) {
        // Nếu có lỗi, rollback toàn bộ (kho được hoàn lại, không tạo đơn rác, giỏ hàng giữ nguyên)
        await session.abortTransaction();
        session.endSession();
        
        console.error(error);
        req.flash('error', 'Đã có lỗi xảy ra, vui lòng thử lại');
        return res.redirect('/products');
    }
};
//POST /checkout/vnpay
module.exports.checkoutVnpay = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const cartId = req.cartId;
        const fullname = req.body.fullname;
        const phone = req.body.phone;
        const address = req.body.address;

        let userInfor = {
            fullname: fullname,
            phone: phone,
            address: address
        };

        // --- BƯỚC 1: XỬ LÝ IDEMPOTENCY (Chống double-click / gửi request trùng lặp) ---
        // Nếu trong vòng 2 phút qua, giỏ hàng này đã có đơn hàng chưa thanh toán (unpaid),
        // ta không tạo mới nữa mà tái sử dụng luôn đơn hàng cũ đó để tạo lại link VNPay.
        const existingOrder = await Order.findOne({ 
            cart_id: cartId, 
            paymentStatus: 'unpaid',
            createdAt: { $gte: new Date(Date.now() - 2 * 60 * 1000) } 
        }).session(session).lean();

        if (existingOrder) {
            await session.abortTransaction();
            session.endSession();
            return redirectToVnpay(existingOrder, req, res);
        }

        // --- BƯỚC 2: KIỂM TRA GIỎ HÀNG ---
        const cart = await Cart.findOne({ _id: cartId })
            .populate('products.product_id', 'title price thumbnail discountPercentage stock')
            .session(session)
            .lean();

        if (!cart) {
            await session.abortTransaction();
            session.endSession();
            req.flash('error', 'Giỏ hàng không tồn tại');
            return res.redirect('/products');
        } 

        cart.products = cart.products.filter(item => item.product_id !== null);
        if (cart.products.length === 0) {
            await session.abortTransaction();
            session.endSession();
            req.flash('error', 'Giỏ hàng của bạn đang trống, không thể đặt hàng!');
            return res.redirect('/products');
        }

        // --- BƯỚC 3: KIỂM TRA TỒN KHO ---
        for (const item of cart.products) {
            const product = item.product_id;
            if (product.stock < item.quantity) {
                await session.abortTransaction();
                session.endSession();
                req.flash('error', `Sản phẩm "${product.title}" không đủ số lượng trong kho (chỉ còn ${product.stock})!`);
                return res.redirect('/carts'); 
            }
        }

        // --- BƯỚC 4: TRỪ KHO BẰNG BULKWRITE TRONG TRANSACTION ---
        const bulkOps = cart.products.map(item => ({
            updateOne: {
                filter: { _id: item.product_id._id, stock: { $gte: item.quantity } }, 
                update: { $inc: { stock: -item.quantity } }
            }
        }));
        const bulkResult = await Product.bulkWrite(bulkOps, { session });
        
        if (bulkResult.modifiedCount < cart.products.length) {
            await session.abortTransaction();
            session.endSession();
            req.flash('error', 'Một số sản phẩm vừa có người mua hoặc không đủ số lượng, vui lòng thử lại!');
            return res.redirect('/carts');
        }

        // --- BƯỚC 5: TÍNH TOÁN GIÁ VÀ TẠO ĐƠN HÀNG ---
        cart.products.forEach(item => {
            item.product_id.priceNew = calcuNewPrice.priceNew(item.product_id.price, item.product_id.discountPercentage);
        });

        cart.totalPrice = cart.products.reduce((total, item) => {
            const itemPrice = item.product_id.priceNew * item.quantity;
            return total + itemPrice;
        }, 0);

        const products = cart.products.map(item => ({
            product_id: item.product_id._id,
            price: item.product_id.price,
            discountPercentage: item.product_id.discountPercentage,
            quantity: item.quantity
        }));

        const order = new Order({
            cart_id: cartId,
            userInfor: userInfor,
            products: products,
            totalPrice: cart.totalPrice,
            paymentMethod: 'VNPAY', 
            paymentStatus: 'unpaid' 
        });

        if (res.locals.user) {
            order.user_id = res.locals.user._id;
        }
        
        await order.save({ session });

        // --- BƯỚC 6: COMMIT TRANSACTION KHI MỌI THỨ THÀNH CÔNG ---
        await session.commitTransaction();
        session.endSession();
        return redirectToVnpay(order.toObject ? order.toObject() : order, req, res);
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        
        console.error(error);
        req.flash('error', 'Đã có lỗi xảy ra, vui lòng thử lại');
        return res.redirect('/products');
    }
};

// --- HÀM HỖ TRỢ TẠO URL VNPAY (Tránh lặp code) ---
function redirectToVnpay(order, req, res) {
    let ipAddr = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    let tmnCode = process.env.VNP_TMN_CODE;
    let secretKey = process.env.VNP_HASH_SECRET;
    let vnpUrl = process.env.VNP_URL;
    let returnUrl = process.env.VNP_RETURN_URL;
    let createDate = new Date();
    let expireDate = new Date(createDate.getTime() + 10 * 60 * 1000);

    function formatDate(date) {
        let d = new Date(date),
            month = '' + (d.getMonth() + 1),
            day = '' + d.getDate(),
            year = d.getFullYear(),
            hour = '' + d.getHours(),
            minute = '' + d.getMinutes(),
            second = '' + d.getSeconds();

        if (month.length < 2) month = '0' + month;
        if (day.length < 2) day = '0' + day;
        if (hour.length < 2) hour = '0' + hour;
        if (minute.length < 2) minute = '0' + minute;
        if (second.length < 2) second = '0' + second;

        return [year, month, day].join('') + [hour, minute, second].join('');
    }

    let vnp_Params = {
        vnp_Version: '2.1.0',
        vnp_Command: 'pay',
        vnp_TmnCode: tmnCode,
        vnp_Locale: 'vn',
        vnp_CurrCode: 'VND',
        vnp_TxnRef: order.order_code,
        vnp_OrderInfo: `Thanh toan don hang ${order.order_code}`,
        vnp_OrderType: 'other',
        vnp_Amount: order.totalPrice * 100,
        vnp_ReturnUrl: returnUrl,
        vnp_IpAddr: ipAddr,
        vnp_CreateDate: formatDate(createDate),
        vnp_ExpireDate: formatDate(expireDate)
    };

    vnp_Params = sortObject(vnp_Params);
    let signData = querystring.stringify(vnp_Params, { encode: false });
    let hmac = crypto.createHmac("sha512", secretKey);
    let signed = hmac.update(Buffer.from(signData, 'utf-8')).digest("hex");
    vnp_Params['vnp_SecureHash'] = signed;

    vnpUrl += '?' + querystring.stringify(vnp_Params, { encode: false });
    return res.redirect(vnpUrl);
}
// GET /checkout/vnpay_return
module.exports.vnpayReturn = async (req, res) =>{
    try{
        let vnp_Params = req.query;
        let secureHash = vnp_Params['vnp_SecureHash'];
        delete vnp_Params['vnp_SecureHash'];
        delete vnp_Params['vnp_SecureHashType'];

        vnp_Params = sortObject(vnp_Params);
        let secretKey = process.env.VNP_HASH_SECRET;
        let signData = querystring.stringify(vnp_Params, { encode: false });
        let hmac = crypto.createHmac("sha512", secretKey);
        let signed = hmac.update(Buffer.from(signData, 'utf-8')).digest("hex");
        if (secureHash === signed) {
            let orderCode = vnp_Params['vnp_TxnRef'];
            let responseCode = vnp_Params['vnp_ResponseCode'];
            if (responseCode === '00') {
                const updatedOrder = await Order.findOneAndUpdate(
                    { order_code: orderCode, paymentStatus: 'unpaid' }, 
                    { 
                        paymentStatus: 'paid', 
                        vnpayTransactionNo: vnp_Params['vnp_TransactionNo'] 
                    },
                    { new: true }
                );
                if (updatedOrder) {
                    const cartId = req.cartId;
                    const newCart = await Cart.findById(cartId);
                    if (newCart) {
                        newCart.products = [];
                        newCart.totalPrice = 0;
                        await newCart.save();
                    }
                } else {
                    return res.render('client/pages/checkout/fail', { message: 'Đơn hàng đã được thanh toán hoặc không tồn tại!, vui lòng không thực hiện thao tác trùng lặp' });
                }
                return res.redirect(`/checkout/success/${updatedOrder._id}`);
            } 
            else if (responseCode === '11' || responseCode === '24') {
                const updatedOrder = await Order.findOneAndUpdate(
                    { order_code: orderCode, paymentStatus: 'unpaid' },
                    { paymentStatus: responseCode === '11' ? 'expired' : 'cancelledPayment' },
                    { new: true }
                );
                if (updatedOrder) {
                    const bulkOps = updatedOrder.products.map(item => ({
                        updateOne: {
                            filter: { _id: item.product_id }, 
                            update: { $inc: { stock: item.quantity } }
                        }
                    }));
                    await Product.bulkWrite(bulkOps);
                }
                let message = responseCode === '11' 
                    ? 'Giao dịch đã hết thời gian chờ thanh toán (Timeout)! Đơn hàng của bạn đã bị hủy và hoàn lại kho.' 
                    : 'Bạn đã hủy giao dịch thanh toán qua VNPay.';

                return res.render('client/pages/checkout/fail', { message: message });
            } 
            else {
                const updatedOrder = await Order.findOneAndUpdate(
                    { order_code: orderCode, paymentStatus: 'unpaid' },
                    { paymentStatus: 'cancelledPayment' },
                    { new: true }
                );

                if (updatedOrder) {
                    const bulkOps = updatedOrder.products.map(item => ({
                        updateOne: {
                            filter: { _id: item.product_id }, 
                            update: { $inc: { stock: item.quantity } }
                        }
                    }));
                    await Product.bulkWrite(bulkOps);
                }
                return res.render('client/pages/checkout/fail', { message: 'Thanh toán thất bại từ phía ngân hàng!' });
            }
        } else {
            return res.render('client/pages/checkout/fail', { message: 'Chữ ký bảo mật không hợp lệ (Checksum failed)!' });
        }
    }
    catch(error){
        req.flash('error', 'Đã có lỗi xảy ra, vui lòng thử lại');
        res.redirect('/products');
    }
}
// GET /checkout/success/:id
module.exports.success = async (req, res) => {
    try {
        const orderId = req.params.id;
        const order = await Order.findById(orderId).populate('products.product_id', 'title price thumbnail discountPercentage').lean();
        if (!order) {
            req.flash('error', 'Đơn hàng không tồn tại');
            return res.redirect('/products');
        }
        order.products.forEach(item => {
            item.priceNew = calcuNewPrice.priceNew(item.price, item.discountPercentage);
        });
        res.render('client/pages/checkout/success', { order: order, pageTitle: 'Thanh toán thành công!' });
    } catch (error) {
        req.flash('error', 'Đã có lỗi xảy ra, vui lòng thử lại');
        res.redirect('/products');
    }
}