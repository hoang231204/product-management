const Order = require('../../models/order-model');
module.exports.index = async (req, res) => {
    const orders = await Order.find().select('userInfor totalPrice status _id').lean();
    res.render('admin/pages/order/index', {
        pageTitle: "Quản lý đơn hàng",
        orders: orders
    });
}