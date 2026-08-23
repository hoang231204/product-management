const Order = require('../../models/order-model');
const Cart = require('../../models/cart-model');
const Product = require('../../models/product-model');
const crypto = require('crypto');
const querystring = require('qs');
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
module.exports.checkout = async (req, res) =>{
    try{
        const cartId = req.cartId;
        const cart = await Cart.findOne({ _id: cartId }).populate('products.product_id', 'title price thumbnail discountPercentage').lean();
        if(!cart){
            req.flash('error', 'Giỏ hàng không tồn tại');
            return res.redirect('/products');
        }
        cart.products = cart.products.filter(item => item.product_id !== null);
        cart.products.forEach(item => {
            item.product_id.priceNew = calcuNewPrice.priceNew(item.product_id.price, item.product_id.discountPercentage);
        });
        cart.totalPrice = cart.products.reduce((total, item) => {
            const itemPrice = item.product_id.priceNew * item.quantity;
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
module.exports.checkoutPost = async (req, res) =>{
    try{
        const fullname = req.body.fullname;
        const phone = req.body.phone;
        const address = req.body.address;
        let userInfor= {
            fullname: fullname,
            phone: phone,
            address: address
        }
        const cartId = req.cartId;
        const cart = await Cart.findOne({ _id: cartId }).populate('products.product_id', 'title price thumbnail discountPercentage').lean();
        if(!cart){
            req.flash('error', 'Giỏ hàng không tồn tại');
            return res.redirect('/products');
        } 
        cart.products = cart.products.filter(item => item.product_id !== null);
        if(cart.products.length === 0){
            req.flash('error', 'Giỏ hàng của bạn đang trống, không thể đặt hàng!');
            return res.redirect('/products');
        }
        cart.products.forEach(item => {
            item.product_id.priceNew = calcuNewPrice.priceNew(item.product_id.price, item.product_id.discountPercentage);
        });
        cart.totalPrice = cart.products.reduce((total, item) => {
            const itemPrice = item.product_id.priceNew * item.quantity;
            return total + itemPrice;
        }, 0);
        const products= cart.products.map(item => {
            return {
                product_id: item.product_id._id,
                price: item.product_id.price,
                discountPercentage: item.product_id.discountPercentage,
                quantity: item.quantity
            }
        });
        const order = new Order({
            cart_id: cartId,
            userInfor: userInfor,
            products: products,
            totalPrice: cart.totalPrice,
            paymentMethod: 'VNPAY', 
            paymentStatus: 'unpaid' 
        })
        if(res.locals.user){
            order.user_id = res.locals.user._id;
        }
        await order.save();

        let ipAddr = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
        let tmnCode = process.env.VNP_TMN_CODE;
        let secretKey = process.env.VNP_HASH_SECRET;
        let vnpUrl = process.env.VNP_URL;
        let returnUrl = process.env.VNP_RETURN_URL;

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
            vnp_CreateDate: new Date().toISOString().slice(0, 10).replace(/-/g, '') + new Date().toTimeString().slice(0, 8).replace(/:/g, '')
        };

        vnp_Params = sortObject(vnp_Params);
        let signData = querystring.stringify(vnp_Params, { encode: false });
        let hmac = crypto.createHmac("sha512", secretKey);
        let signed = hmac.update(Buffer.from(signData, 'utf-8')).digest("hex");
        vnp_Params['vnp_SecureHash'] = signed;

        vnpUrl += '?' + querystring.stringify(vnp_Params, { encode: false });
        res.redirect(vnpUrl);
    }
    catch(error){
        req.flash('error', 'Đã có lỗi xảy ra, vui lòng thử lại');
        res.redirect('/products');
    }
}
module.exports.vnpayReturn = async (req, res) =>{
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
                newCart.products = [];
                newCart.totalPrice = 0;
                await newCart.save();
                const bulkOps = updatedOrder.products.map(item => ({
                    updateOne: {
                        filter: { _id: item.product_id }, 
                        update: { $inc: { stock: -item.quantity } }
                    }
                }));
                await Product.bulkWrite(bulkOps);
            } else {
                return res.render('client/pages/checkout/fail', { message: 'Đơn hàng đã được thanh toán hoặc không tồn tại!, vui lòng không thực hiện thao tác trùng lặp' });
            }

            return res.redirect(`/checkout/success/${updatedOrder._id}`);
        } else {
            return res.render('client/pages/checkout/fail', { message: 'Thanh toán thất bại từ phía ngân hàng!' });
        }
    } else {
        return res.render('client/pages/checkout/fail', { message: 'Chữ ký bảo mật không hợp lệ (Checksum failed)!' });
    }
}
module.exports.success = async (req, res) => {
    try {
        const orderId = req.params.id;
        const order = await Order.findById(orderId).populate('products.product_id', 'title price thumbnail discountPercentage').lean();
        if (!order) {
            req.flash('error', 'Đơn hàng không tồn tại');
            return res.redirect('/products');
        }
        res.render('client/pages/checkout/success', { order: order, pageTitle: 'Thanh toán thành công!' });
    } catch (error) {
        req.flash('error', 'Đã có lỗi xảy ra, vui lòng thử lại');
        res.redirect('/products');
    }
}