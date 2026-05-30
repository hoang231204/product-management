const Order = require('../../models/order-model');
const search = require('../../helpers/search')
const filter = require('../../helpers/filter-status');
const mongoose = require('mongoose');
const pagination = require('../../helpers/pagination');
const systemConfig = require('../../config/system');
const calcuNewPrice = require('../../helpers/calcu-new-price');
//GET /admin/orders
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
            .select('userInfor totalPrice status order_code _id updatedBy createdAt')
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
//PATCH /admin/orders/change-status/:status/:id
module.exports.changeStatus = async (req, res) => {
    try{
        const id = req.params.id;
        const status = req.params.status;
        let updateBy={
            account_id: res.locals.user._id,
            updatedAt: Date.now()
        }
        await Order.updateOne({ _id: id }, { status: status, $push: { updatedBy: updateBy } });
        req.flash('success', 'Cập nhật trạng thái đơn hàng thành công');
        res.redirect(`${systemConfig.prefixAdmin}/orders`);
    }
    catch(error){
        console.error(error);
        req.flash('error', 'Có lỗi xảy ra khi cập nhật trạng thái đơn hàng');
        res.redirect(`${systemConfig.prefixAdmin}/orders`);
    }
}
//GET /admin/orders/details/:id
module.exports.details = async (req, res) => {
    try{
        const id = req.params.id;
        const order = await Order
            .findOne({ _id: id })
            .populate('products.product_id', 'title thumbnail')
            .lean();
        order.products.forEach(item => {
            item.priceNew = calcuNewPrice.priceNew(item.price, item.discountPercentage);
        });
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
//PATCH /admin/orders/change-multi
module.exports.changeMulti = async (req, res) => {
    try{
        const typeChange = req.body.type;
        const ids = req.body.ids.split(",");
        if(typeChange && ids.length > 0){
            switch(typeChange){
                case "delete":
                    let deletedBy={
                        account_id: res.locals.user._id,
                        deletedAt: Date.now()
                    }
                    await Order.updateMany({ _id: { $in: ids } }, { $set: { deleted: true, deletedBy: deletedBy } });
                    req.flash('success', 'Xóa nhiều đơn hàng thành công');
                    break;
                default:
                    let updateBy={
                        account_id: res.locals.user._id,
                        updatedAt: Date.now()
                    }
                    await Order.updateMany({ _id: { $in: ids } }, { status: typeChange, $push: { updatedBy: updateBy } });
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
//PATCH /admin/orders/delete/:id
module.exports.delete = async (req, res) => {
    try{
        const id = req.params.id;
        let deletedBy={
            account_id: res.locals.user._id,
            deletedAt: Date.now()
        }
        await Order.updateOne({ _id: id }, { deleted: true, deletedBy: deletedBy });
        req.flash('success', 'Xóa đơn hàng thành công');
        res.redirect(`${systemConfig.prefixAdmin}/orders`);
    }
    catch(error){
        console.error(error);
        req.flash('error', 'Có lỗi xảy ra khi xóa đơn hàng');
        res.redirect(`${systemConfig.prefixAdmin}/orders`);
    }
}
//GET /admin/orders/recycle-bin
module.exports.recycleBin = async (req, res) => {
    try{
        const orders = await Order.find({ deleted: true }).lean();
        res.render('admin/pages/order/recycle-bin', {
        pageTitle: "Thùng rác đơn hàng",
        orders: orders
    });
    }
    catch(error){
        console.error(error);
        req.flash('error', 'Có lỗi xảy ra khi tải thùng rác đơn hàng');
        res.redirect(`${systemConfig.prefixAdmin}/orders`);
    }
}
//DELETE /admin/orders/recycle-bin/hard-delete/:id
module.exports.hardDelete = async (req, res) => {
    try{
        const id = req.params.id;
        await Order.deleteOne({ _id: id });
        req.flash('success', 'Xóa vĩnh viễn đơn hàng thành công');
        res.redirect(`${systemConfig.prefixAdmin}/orders/recycle-bin`);
    }
    catch(error){
        console.error(error);
        req.flash('error', 'Có lỗi xảy ra khi xóa vĩnh viễn đơn hàng');
        res.redirect(`${systemConfig.prefixAdmin}/orders/recycle-bin`);
    }
}
//PATCH /admin/orders/recycle-bin/restore/:id
module.exports.restore = async (req, res) => {
    try{
        const id = req.params.id;
        let updateBy={
            account_id: res.locals.user._id,
            updatedAt: Date.now()
        }
        await Order.updateOne({ _id: id }, { deleted: false, $push: { updatedBy: updateBy } });
        req.flash('success', 'Khôi phục đơn hàng thành công');
        res.redirect(`${systemConfig.prefixAdmin}/orders/recycle-bin`);
    }
    catch(error){
        console.error(error);
        req.flash('error', 'Có lỗi xảy ra khi khôi phục đơn hàng');
        res.redirect(`${systemConfig.prefixAdmin}/orders/recycle-bin`);
    }
}