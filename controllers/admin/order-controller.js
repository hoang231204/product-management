const Order = require('../../models/order-model');
const search = require('../../helpers/search')
const filter = require('../../helpers/filter-status');
const mongoose = require('mongoose');
const pagination = require('../../helpers/pagination');
module.exports.index = async (req, res) => {
    const filterStatus = filter(req.query, 'order');
    const regex = search(req.query);
    let find = {};
    if (req.query.status) {
        find.status = req.query.status;
    }
    if (req.query.keyword) {
        find.$or = [
            { order_code: regex },
            { "userInfor.fullname": regex },
            { "userInfor.phone": regex },
            { "userInfor.address": regex }
        ];
    }
    const countData = await Order.find(find).countDocuments(find);
    const objectPagination = pagination(req.query,countData)
    const orders = await Order
        .find(find).limit(objectPagination.limitPage).skip(objectPagination.skipPage)
        .sort({ createdAt: -1 })
        .select('userInfor totalPrice status order_code')
        .lean();
    res.render('admin/pages/order/index', {
        pageTitle: "Quản lý đơn hàng",
        orders: orders,
        filterStatus: filterStatus,
        keyword: req.query.keyword,
        objectPagination: objectPagination
    });
}
module.exports.changeStatus = async (req, res) => {
    try{
        const id = req.params.id;
        const status = req.params.status;
        await Order.updateOne({ _id: id }, { status: status });
        req.flash('success', 'Cập nhật trạng thái đơn hàng thành công');
        res.redirect('/admin/orders');
    }
    catch(error){
        console.error(error);
        req.flash('error', 'Có lỗi xảy ra khi cập nhật trạng thái đơn hàng');
        res.redirect('/admin/orders');
    }
}