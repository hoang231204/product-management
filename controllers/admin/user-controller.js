const User = require('../../models/user-model');
const systemConfig = require('../../config/system');
//GET /admin/users
module.exports.index = async(req, res) =>{
    const permissions = res.locals.role.permissions;
    if(!permissions.includes("user_view")){
        req.flash("error","Bạn không có quyền thực hiện chức năng này!")
        return res.redirect(`${systemConfig.prefixAdmin}/dashboard`)
    }
    const users = await User.find({deleted: false});
    res.render('admin/pages/user/index',{
        pageTitle: "Quản lý người dùng",
        users: users
    })
}
//GET /admin/users/details/:id
module.exports.details = async(req, res) =>{
    const permissions = res.locals.role.permissions;
    if(!permissions.includes("user_view")){
        req.flash("error","Bạn không có quyền thực hiện chức năng này!")
        return res.redirect(`${systemConfig.prefixAdmin}/dashboard`)
    }
    const id = req.params.id;
    const user = await User.findOne({_id: id, deleted: false});
    if(!user){
        req.flash('error', 'Không tìm thấy người dùng');
        return res.redirect('/admin/users');
    }
    res.render('admin/pages/user/details',{
        pageTitle: "Chi tiết người dùng",
        user: user
    })
}
//PATCH /admin/users/change-status/:status/:id
module.exports.changeStatus = async(req, res) =>{
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
    user.status = status;
    await user.save();
    req.flash('success', 'Cập nhật trạng thái thành công');
    res.redirect(`${systemConfig.prefixAdmin}/users`);
}
//PATCH /admin/users/delete/:id
module.exports.delete = async(req, res) =>{
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
    await user.save();
    req.flash('success', 'Xóa người dùng thành công');
    res.redirect(`${systemConfig.prefixAdmin}/users`);
}
//GET /admin/users/edit/:id
module.exports.edit = async(req, res) =>{
    const permissions = res.locals.role.permissions;
    if(!permissions.includes("user_edit")){
        req.flash("error","Bạn không có quyền thực hiện chức năng này!")
        return res.redirect(`${systemConfig.prefixAdmin}/dashboard`)
    }
    const id = req.params.id;
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
//PATCH /admin/users/edit/:id
module.exports.editPatch = async (req, res) =>{
    const permissions = res.locals.role.permissions;
    if(!permissions.includes("user_edit")){
        req.flash("error","Bạn không có quyền thực hiện chức năng này!")
        return res.redirect(`${systemConfig.prefixAdmin}/dashboard`)
    }
    const id = req.params.id;
    await User.updateOne({_id: id}, req.body);
    req.flash('success', 'Cập nhật người dùng thành công');
    res.redirect(`${systemConfig.prefixAdmin}/users`);
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
