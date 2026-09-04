const Order = require('../../models/order-model');
const calcuNewPrice = require('../../helpers/calcu-new-price');
const axios = require('axios');
const crypto = require('crypto');
const moment = require('moment');
const querystring = require('qs');
const Product = require('../../models/product-model');
// Hàm hỗ trợ sắp xếp tham số cho VNPAY (nếu chưa có ở file chung)
function sortObject(obj) {
    let sorted = {};
    let str = [];
    let key;
    for (key in obj) {
        if (obj.hasOwnProperty(key)) {
            str.push(encodeURIComponent(key));
        }
    }
    str.sort();
    for (key = 0; key < str.length; key++) {
        sorted[str[key]] = encodeURIComponent(obj[str[key]]).replace(/%20/g, "+");
    }
    return sorted;
}
//GET /orders
module.exports.index = async (req, res) =>{
    try{
        const cartId = req.cartId;
        const orders = await Order.find({ cart_id: cartId }).sort({ createdAt: -1 }).select('userInfor totalPrice status createdAt').lean();
        orders.forEach(order => {
            order.fullname = order.userInfor.fullname;
            order.phone = order.userInfor.phone;
            order.address = order.userInfor.address;
        });
        res.render('client/pages/order/index', {
            pageTitle: 'Đơn hàng đã mua',
            orders: orders
        });
    }
    catch(error){
        req.flash('error', 'Đã có lỗi xảy ra, vui lòng thử lại');
        res.redirect('/products');
    }
    
}
//GET /orders/details/:id
module.exports.details = async (req, res) =>{
    try{
        const orderId = req.params.id;
        const order = await Order.findOne({ _id: orderId}).populate('products.product_id', 'title thumbnail slug').lean()
        order.products.forEach(item => {
            item.priceNew = calcuNewPrice.priceNew(item.price, item.discountPercentage);
        });
        res.render('client/pages/order/details', 
        {
            order: order,
            pageTitle: 'Chi tiết đơn hàng'
        });
    }
    catch(error){
        req.flash('error', 'Đã có lỗi xảy ra, vui lòng thử lại');
        res.redirect('/products');
    }
}
//PATCH /orders/cancel/:id
module.exports.cancel = async (req, res) => {
    try {
        const orderId = req.params.id;
        const order = await Order.findOne({ _id: orderId });
        if (!order) {
            req.flash('error', 'Đơn hàng không tồn tại!');
            return res.redirect('/orders');
        }
        if (order.status !== 'pending' && order.status !== 'confirmed') {
            req.flash('error', 'Đơn hàng đã được xử lý, không thể hủy!');
            return res.redirect('/orders');
        }
        if (order.paymentMethod === 'VNPAY' && order.paymentStatus === 'paid') {
            let tmnCode = process.env.VNP_TMN_CODE;
            let secretKey = process.env.VNP_HASH_SECRET;
            let vnpApiUrl = process.env.VNP_API_URL;
            let ipAddr = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
            let vnp_Params = {
                vnp_Version: '2.1.0',
                vnp_Command: 'refund',
                vnp_TmnCode: tmnCode,
                vnp_TransactionType: '02', 
                vnp_TxnRef: order.order_code,
                vnp_Amount: order.totalPrice * 100,
                vnp_TransactionNo: order.vnpayTransactionNo || '',
                vnp_TransactionDate: moment(order.createdAt).format('YYYYMMDDHHmmss'),
                vnp_CreateBy: res.locals.user ? res.locals.user.fullname : 'Customer',
                vnp_CreateDate: moment().format('YYYYMMDDHHmmss'),
                vnp_IpAddr: ipAddr,
                vnp_OrderInfo: `Hoan tien cho don hang ${order.order_code}`
            };

            vnp_Params = sortObject(vnp_Params);
            let signData = querystring.stringify(vnp_Params, { encode: false });
            let hmac = crypto.createHmac("sha512", secretKey);
            let signed = hmac.update(Buffer.from(signData, 'utf-8')).digest("hex");
            vnp_Params['vnp_SecureHash'] = signed;
            const vnpayResponse = await axios.post(vnpApiUrl, vnp_Params, {
                headers: { 'Content-Type': 'application/json' }
            });
            const data = vnpayResponse.data;
            if (!data || data.vnp_ResponseCode !== '00') {
                req.flash('error', `Hoàn tiền thất bại từ VNPAY (Mã lỗi: ${data ? data.vnp_ResponseCode : 'Unknown'})`);
                return res.redirect('/orders');
            }
            order.paymentStatus = 'cancelled';
        }
        order.status = 'cancelled';
        await order.save();
        const bulkOps = order.products.map(item => ({
            updateOne: {
                filter: { _id: item.product_id }, 
                update: { $inc: { stock: item.quantity } }
            }
        }));
        await Product.bulkWrite(bulkOps);
        req.flash('success', 'Đơn hàng đã được hủy và hoàn tiền thành công!');
        return res.redirect('/orders');
    } catch (error) {
        console.error("Cancel Order Error:", error);
        req.flash('error', 'Đã có lỗi hệ thống xảy ra, vui lòng thử lại');
        return res.redirect('/orders');
    }
}
//GET /orders/edit/:id
module.exports.edit = async (req, res) =>{
    try{
        const orderId = req.params.id;
        const order = await Order.findOne({ _id: orderId }).lean();
        if(order.status !== 'pending' && order.status !== 'confirmed'){
            req.flash('error', 'Đơn hàng đã được xử lý, không thể sửa');
            return res.redirect('/orders');
        }
        res.render('client/pages/order/edit', {
            pageTitle: 'Thay đổi thông tin giao hàng',
            order: order
        });
    }
    catch(err){
        console.error(err);
        req.flash('error', 'Đã xảy ra lỗi, vui lòng thử lại');
        res.redirect('/orders');
    }
}
//PATCH /orders/edit/:id
module.exports.editPatch = async (req, res) =>{
    try{
        const orderId = req.params.id;
        const order = await Order.findOne({ _id: orderId }).lean();
        if(order.status !== 'pending' && order.status !== 'confirmed'){
            req.flash('error', 'Đơn hàng đã được xử lý, không thể sửa thông tin giao hàng');
            return res.redirect('/orders');
        }
        const fullname = req.body.fullname;
        const phone = req.body.phone;
        const address = req.body.address;
        await Order.updateOne({ _id: orderId }, { 'userInfor.fullname': fullname, 'userInfor.phone': phone, 'userInfor.address': address });
        req.flash('success', 'Thông tin giao hàng đã được cập nhật thành công');
        res.redirect('/orders');
    }
    catch(err){
        console.error(err);
        req.flash('error', 'Đã xảy ra lỗi, vui lòng thử lại');
        res.redirect('/orders');
    }
}