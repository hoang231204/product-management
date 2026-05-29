const Order = require('../../models/order-model');
const search = require('../../helpers/search')
const filter = require('../../helpers/filter-status');
const mongoose = require('mongoose');
const pagination = require('../../helpers/pagination');
const systemConfig = require('../../config/system');
module.exports.index = async (req, res) => {
    try{
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
        const countData = await Order.find(find).countDocuments();
        const objectPagination = pagination(req.query, countData);
        const orders = await Order
            .find(find).limit(objectPagination.limitPage).skip(objectPagination.skipPage)
            .sort({ createdAt: -1 })
            .select('userInfor totalPrice status order_code _id')
            .lean();
        res.render('admin/pages/order/index', {
            pageTitle: "Quản lý đơn hàng",
            orders: orders,
            filterStatus: filterStatus,
            keyword: req.query.keyword,
            objectPagination: objectPagination
        });
    }
    catch(error){
        console.error(error);
        req.flash('error', 'Có lỗi xảy ra khi tải danh sách đơn hàng');
        res.redirect(`${systemConfig.prefixAdmin}/orders`);
    }
}
module.exports.changeStatus = async (req, res) => {
    try{
        const id = req.params.id;
        const status = req.params.status;
        await Order.updateOne({ _id: id }, { status: status });
        req.flash('success', 'Cập nhật trạng thái đơn hàng thành công');
        res.redirect(`${systemConfig.prefixAdmin}/orders`);
    }
    catch(error){
        console.error(error);
        req.flash('error', 'Có lỗi xảy ra khi cập nhật trạng thái đơn hàng');
        res.redirect(`${systemConfig.prefixAdmin}/orders`);
    }
}
module.exports.details = async (req, res) => {
    try{
        const id = req.params.id;
        const order = await Order.findOne({ _id: id }).lean();
        res.render('admin/pages/order/details', {
            pageTitle: "Chi tiết đơn hàng",
            order: order
        });
    }
    catch(error){
        console.error(error);
        req.flash('error', 'Có lỗi xảy ra khi xem chi tiết đơn hàng');
        res.redirect(`${systemConfig.prefixAdmin}/orders`);
    }
}
module.exports.changeMulti = async (req, res) => {
    try{
        const typeChange = req.body.type;
        const ids = req.body.ids.split(",");
        if(typeChange && ids.length > 0){
            switch(typeChange){
                case "delete":
                    let confirmDelete = confirm("Bạn chắc chắn muốn xóa các đơn hàng đã chọn?");
                    await Order.updateMany({ _id: { $in: ids } }, { $set: { deleted: true } });
                    req.flash('success', 'Xóa nhiều đơn hàng thành công');
                    break;
                default:
                    await Order.updateMany({ _id: { $in: ids } }, { status: typeChange });
                    req.flash('success', 'Cập nhật trạng thái nhiều đơn hàng thành công');
            }
                res.redirect(`${systemConfig.prefixAdmin}/orders`);  
        }  
    }
    catch(error){
        console.error(error);
        req.flash('error', 'Có lỗi xảy ra khi thực hiện thay đổi nhiều đơn hàng');
        res.redirect(`${systemConfig.prefixAdmin}/orders`);
    }
}
module.exports.delete = async (req, res) => {
    try{
        const id = req.params.id;
        await Order.updateOne({ _id: id }, { deleted: true });
        req.flash('success', 'Xóa đơn hàng thành công');
        res.redirect(`${systemConfig.prefixAdmin}/orders`);
    }
    catch(error){
        console.error(error);
        req.flash('error', 'Có lỗi xảy ra khi xóa đơn hàng');
        res.redirect(`${systemConfig.prefixAdmin}/orders`);
    }
}