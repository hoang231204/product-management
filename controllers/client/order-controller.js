const Order = require('../../models/order-model');
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