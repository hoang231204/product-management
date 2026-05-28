const Order = require('../../models/order-model');
const calcuNewPrice = require('../../helpers/calcu-new-price');
module.exports.index = async (req, res) =>{
    const cartId = req.cartId;
    const orders = await Order.find({ cart_id: cartId }).select('userInfor totalPrice status').lean();
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
module.exports.details = async (req, res) =>{
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
module.exports.cancel = async (req, res) =>{
    const orderId = req.params.id;
    const checkOrder = await Order.findOne({ _id: orderId }).lean();
    if(checkOrder.status !== 'pending' && checkOrder.status !== 'confirmed'){
        req.flash('error', 'Đơn hàng đã được xử lý, không thể hủy');
        return res.redirect('/client/orders');
    }
    await Order.updateOne({ _id: orderId }, { status: 'cancelled' });
    req.flash('success', 'Đơn hàng đã được hủy thành công');
    res.redirect('/client/orders');
}