const Role = require("../../models/role-model");
const systemConfig = require("../../config/system")
//GET 
module.exports.index = async (req, res) => {
    const permissions = res.locals.role.permissions;
    if(!permissions.includes("role_view")){
        req.flash("error","Bạn không có quyền thực hiện chức năng này!")
        return res.redirect(`${systemConfig.prefixAdmin}/dashboard`)
    }
    const roles = await Role
        .find()
        .populate("createdBy.account_id", "fullname")
        .populate("updatedBy.account_id", "fullname")
        .lean();
    res.render("admin/pages/role/index", {
        pageTitle: "Quản lý vai trò",
        roles: roles
    })
}
//GET /create
module.exports.create = async (req, res) => {
    res.render("admin/pages/role/create", {
        pageTitle: "Tạo vai trò mới"
    })
}
//POST /create
module.exports.createPost = async (req, res) => {
    const permissions = res.locals.role.permissions;
    if(!permissions.includes("role_create")){
        req.flash("error","Bạn không có quyền thực hiện chức năng này!")
        return res.redirect(`${systemConfig.prefixAdmin}/roles`)
    }
    const title = req.body.title;
    const description = req.body.description;
    try {
        const newRole = new Role({
            title,
            description,
            createdBy: {
            account_id: res.locals.user._id,
            createdAt: new Date()
            }  
        });
        await newRole.save();
        res.redirect(`${systemConfig.prefixAdmin}/roles`);
    } catch (error) {
       req.flash("error", "Lỗi khi tạo vai trò mới!");
       res.redirect(`${systemConfig.prefixAdmin}/roles/create`);
    }
}
//GET /details/:id
module.exports.details = async (req, res) => {
    const permissions = res.locals.role.permissions;
    if(!permissions.includes("role_view")){
        req.flash("error","Bạn không có quyền thực hiện chức năng này!")
        return res.redirect(`${systemConfig.prefixAdmin}/roles`)
    }
    const id = req.params.id;
    let find={
        _id: id,
        deleted: false
    }
    const role = await Role
    .findOne(find)
    .populate("createdBy.account_id", "fullname")
    .populate("updatedBy.account_id", "fullname")
    .lean();
    res.render("admin/pages/role/details", {
        pageTitle: "Chi tiết vai trò",
        role: role
    })
}
//PATCH /delete/:id
module.exports.delete = async (req, res) => {
    const { id } = req.params;
    const permissions = res.locals.role.permissions;
    if(!permissions.includes("role_delete")){
        req.flash("error","Bạn không có quyền thực hiện chức năng này!")
        return res.redirect(`${systemConfig.prefixAdmin}/roles`)
    }
    try {
        await Role.updateOne(
            { 
                _id: id, 
                deleted: false 
            },
            {
                $set: {
                    deleted: true,
                    deletedBy: {
                        account_id: res.locals.user._id,
                        deletedAt: new Date()
                    }
                }
            }
        );
        req.flash("success", "Xóa vai trò thành công!");
        res.redirect("/admin/roles");
    } catch (error) {
        req.flash("error", "Lỗi khi xóa vai trò!");
        res.redirect(`${systemConfig.prefixAdmin}/roles`);
    }
}
//GET /edit/:id
module.exports.edit = async (req, res) => {
    const id = req.params.id;
    let find={
        _id: id,
        deleted: false
    }
    const role = await Role.findOne(find).lean();
    res.render("admin/pages/role/edit", {
        pageTitle: "Chỉnh sửa vai trò",
        role: role
    })
}
//PATCH /edit/:id
module.exports.editPatch = async (req, res) => {
    const permissions = res.locals.role.permissions;
    if(!permissions.includes("role_edit")){
        req.flash("error","Bạn không có quyền thực hiện chức năng này!")
        return res.redirect(`${systemConfig.prefixAdmin}/roles`)
    }   
    const id = req.params.id;
    const title = req.body.title;
    const description = req.body.description;
    try {
        let updatedBy = {
            account_id: res.locals.user._id,
            updatedAt: new Date()
        };
        await Role.updateOne({ _id: id }, { title: title, description: description, $push: { updatedBy: updatedBy } });
        req.flash("success", "Cập nhật vai trò thành công!");
        res.redirect(`${systemConfig.prefixAdmin}/roles`);
    } catch (error) {
        req.flash("error", "Lỗi khi cập nhật vai trò!");
        res.redirect(`${systemConfig.prefixAdmin}/roles/edit/${id}`);
    }
}
//GET /permission/:id
module.exports.permission = async (req, res) => {
    const records = await Role.find().lean();
    res.render("admin/pages/role/permissions", {
        pageTitle: "Phân quyền",
        records: records
    })
}
//PATCH /permission/:id
module.exports.permissionPatch = async (req, res) => {
    const roles = JSON.parse(req.body.permissions);
    if(roles){
        for (const role of roles) {
            await Role.updateOne({ _id: role.id }, { permissions: role.permissions });
        }
    }
    req.flash("success", "Cập nhật quyền thành công!");
    res.redirect(`${systemConfig.prefixAdmin}/roles/permissions`);
}
//GET /recycle-bin
module.exports.recycleBin = async (req, res) => {
    const roles = await Role.find({ deleted: true }).populate("deletedBy.account_id", "fullname").lean();
    res.render("admin/pages/role/recycle-bin", {
        pageTitle: "Thùng rác vai trò",
        roles: roles
    })
}
//PATCH /recycle-bin/restore/:id
module.exports.restore = async (req, res) => {
    const id = req.params.id;
    try {        
        await Role.updateOne({ _id: id }, { deleted: false });
        req.flash("success", "Khôi phục vai trò thành công!");
        res.redirect(`${systemConfig.prefixAdmin}/roles/recycle-bin`);
    }
    catch (error) {
        req.flash("error", "Lỗi khi khôi phục vai trò!");
        res.redirect(`${systemConfig.prefixAdmin}/roles/recycle-bin`);
    }
}
//DELETE /recycle-bin/destroy/:id
module.exports.destroy = async (req, res) => {
    const id = req.params.id;
    try {
        await Role.deleteOne({ _id: id });
        req.flash("success", "Xóa vĩnh viễn vai trò thành công!");
        res.redirect(`${systemConfig.prefixAdmin}/roles/recycle-bin`);
    } catch (error) {
        req.flash("error", "Lỗi khi xóa vĩnh viễn vai trò!");
        res.redirect(`${systemConfig.prefixAdmin}/roles/recycle-bin`);
    } 
}