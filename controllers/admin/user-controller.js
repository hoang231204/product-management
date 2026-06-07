const User = require('../../models/user-model');
const systemConfig = require('../../config/system');
const filter = require('../../helpers/filter-status');
const search = require('../../helpers/search');
const pagination = require('../../helpers/pagination');
//GET /admin/users
module.exports.index = async(req, res) =>{
    const permissions = res.locals.role.permissions;
    if(!permissions.includes("user_view")){
        req.flash("error","Bạn không có quyền thực hiện chức năng này!")
        return res.redirect(`${systemConfig.prefixAdmin}/dashboard`)
    }
    const filterStatus = filter(req.query, 'account');
    const regex = search(req.query);
    let find = {deleted: false};
    if(req.query.status){
        find.status = req.query.status;
    }
    if(req.query.keyword){
        find.$or = [
            { fullname: { $regex: req.query.keyword, $options: "i" } },
            { email: { $regex: req.query.keyword, $options: "i" } }
        ];
    }
    try {
        const countData = await User.countDocuments(find);
        const objectPagination = pagination(req.query,countData);
        const users = await User.find(find);
        res.render('admin/pages/user/index',{
            pageTitle: "Quản lý người dùng",
            users: users,
            objectPagination: objectPagination,
            filterStatus: filterStatus,
            keyword: req.query.keyword || ""
        })
    } catch(error){
        req.flash("error","Đã có lỗi xảy ra, vui lòng thử lại!")
        res.redirect(`${systemConfig.prefixAdmin}/dashboard`)
    }
}
//GET /admin/users/details/:id
module.exports.details = async(req, res) =>{
    const permissions = res.locals.role.permissions;
    if(!permissions.includes("user_view")){
        req.flash("error","Bạn không có quyền thực hiện chức năng này!")
        return res.redirect(`${systemConfig.prefixAdmin}/dashboard`)
    }
    const id = req.params.id;
    try {
        const user = await User.findOne({_id: id, deleted: false});
        if(!user){
            req.flash('error', 'Không tìm thấy người dùng');
            return res.redirect('/admin/users');
        }
        res.render('admin/pages/user/details',{
            pageTitle: "Chi tiết người dùng",
            user: user
        })
    } catch(error){
        req.flash("error","Đã có lỗi xảy ra, vui lòng thử lại!")
        res.redirect(`${systemConfig.prefixAdmin}/dashboard`)
    }
}
//PATCH /admin/users/change-status/:status/:id
module.exports.changeStatus = async(req, res) =>{
    try{
        const permissions = res.locals.role.permissions;
        if(!permissions.includes("user_edit")){
            req.flash("error","Bạn không có quyền thực hiện chức năng này!")
            return res.redirect(`${systemConfig.prefixAdmin}/dashboard`)
        }
        const id = req.params.id;
        const status = req.params.status;
        const user = await User.findOne({_id: id, deleted: false});
        if(!user){
            req.flash('error', 'Không tìm thấy người dùng');
            return res.redirect('/admin/users');
        }
        let updateBy={
            account_id: res.locals.user._id,
            updateAt: new Date()
        }
        user.status = status;
        user.updatedBy.push(updateBy);
        await user.save();
        req.flash('success', 'Cập nhật trạng thái thành công');
        res.redirect(`${systemConfig.prefixAdmin}/users`);
    }
    catch(error){
        req.flash("error","Đã có lỗi xảy ra, vui lòng thử lại!")
        res.redirect(`${systemConfig.prefixAdmin}/dashboard`)
    }
}
//PATCH /admin/users/delete/:id
module.exports.delete = async(req, res) =>{
    try{
        const permissions = res.locals.role.permissions;
        if(!permissions.includes("user_delete")){
            req.flash("error","Bạn không có quyền thực hiện chức năng này!")
            return res.redirect(`${systemConfig.prefixAdmin}/dashboard`)
        }
        const id = req.params.id;
        const user = await User.findOne({_id: id, deleted: false});
        if(!user){
            req.flash('error', 'Không tìm thấy người dùng');
            return res.redirect(`${systemConfig.prefixAdmin}/users`);
        }
        user.deleted = true;
        let deletedBy={
            account_id: res.locals.user._id,
            deletedAt: new Date()
        }
        user.deletedBy = deletedBy;
        await user.save();
        req.flash('success', 'Xóa người dùng thành công');
        res.redirect(`${systemConfig.prefixAdmin}/users`);
    }
    catch(error){
        req.flash("error","Đã có lỗi xảy ra, vui lòng thử lại!")
        res.redirect(`${systemConfig.prefixAdmin}/dashboard`)
    }
}
//GET /admin/users/edit/:id
module.exports.edit = async(req, res) =>{
    const permissions = res.locals.role.permissions;
    if(!permissions.includes("user_edit")){
        req.flash("error","Bạn không có quyền thực hiện chức năng này!")
        return res.redirect(`${systemConfig.prefixAdmin}/dashboard`)
    }
    const id = req.params.id;
    try{
        const user = await User.findOne({_id: id, deleted: false, status: "active"});
        if(!user){
            req.flash('error', 'Không tìm thấy người dùng');
            return res.redirect(`${systemConfig.prefixAdmin}/users`);
        }
        res.render('admin/pages/user/edit',{
            pageTitle: "Chỉnh sửa người dùng",
            user: user
        })
    }
    catch(error){
        req.flash("error","Đã có lỗi xảy ra, vui lòng thử lại!")
        res.redirect(`${systemConfig.prefixAdmin}/dashboard`)
    }
}
//PATCH /admin/users/edit/:id
module.exports.editPatch = async (req, res) =>{
    const permissions = res.locals.role.permissions;
    if(!permissions.includes("user_edit")){
        req.flash("error","Bạn không có quyền thực hiện chức năng này!")
        return res.redirect(`${systemConfig.prefixAdmin}/dashboard`)
    }
    const id = req.params.id;
    let updateBy={
        account_id: res.locals.user._id,
        updateAt: new Date()
    }
    try{
        await User.updateOne({_id: id}, {...req.body, $push: {updatedBy: updateBy}});
        req.flash('success', 'Cập nhật người dùng thành công');
        res.redirect(`${systemConfig.prefixAdmin}/users`);
    } catch(error){
        req.flash('error', 'Đã có lỗi xảy ra, vui lòng thử lại!');
        res.redirect(`${systemConfig.prefixAdmin}/users`);
    }
}
//GET /admin/users/create
module.exports.create = async(req, res) =>{
    const permissions = res.locals.role.permissions;
    if(!permissions.includes("user_create")){
        req.flash("error","Bạn không có quyền thực hiện chức năng này!")
        return res.redirect(`${systemConfig.prefixAdmin}/dashboard`)
    }
    res.render('admin/pages/user/create',{
        pageTitle: "Thêm người dùng"
    })
}
//GET /admin/users/recycle-bin
module.exports.recycleBin = async(req, res) =>{
    try{
        const users = await User.find({deleted: true})
        res.render('admin/pages/user/recycle-bin',{
            pageTitle: "Thùng rác người dùng",
            users: users
        })
    } catch(error){
        req.flash("error","Đã có lỗi xảy ra, vui lòng thử lại!")
        res.redirect(`${systemConfig.prefixAdmin}/dashboard`)
    }
}
//PATCH /admin/users/recycle-bin/restore
module.exports.restore = async(req, res) =>{
    const permissions = res.locals.role.permissions;
    if(!permissions.includes("user_edit")){
        req.flash("error","Bạn không có quyền thực hiện chức năng này!")
        return res.redirect(`${systemConfig.prefixAdmin}/dashboard`)
    }
    const id = req.params.id;
    let updateBy={
        account_id: res.locals.user._id,
        updateAt: new Date()
    }
    try{
        await User.updateOne({_id: id},{deleted: false, $push: {updatedBy: updateBy}});
        req.flash('success', 'Khôi phục người dùng thành công');
        res.redirect(`${systemConfig.prefixAdmin}/users/recycle-bin`);
    } catch(error){
        req.flash("error","Đã có lỗi xảy ra, vui lòng thử lại!")
        res.redirect(`${systemConfig.prefixAdmin}/dashboard`)
    }
}
//DELETE /admin/users/recycle-bin/hard-delete
module.exports.hardDelete = async(req, res) =>{
    const permissions = res.locals.role.permissions;
    if(!permissions.includes("user_delete")){
        req.flash("error","Bạn không có quyền thực hiện chức năng này!")
        return res.redirect(`${systemConfig.prefixAdmin}/dashboard`)
    }
    const id = req.params.id;
    try{
        await User.deleteOne({_id: id});
    } catch(error){
        req.flash("error","Đã có lỗi xảy ra, vui lòng thử lại!")
        res.redirect(`${systemConfig.prefixAdmin}/dashboard`)
    } 
    req.flash('success', 'Xóa vĩnh viễn người dùng thành công');
    res.redirect(`${systemConfig.prefixAdmin}/users/recycle-bin`);
} 