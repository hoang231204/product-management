const Role = require("../../models/role-model");
const systemConfig = require("../../config/system")
//GET 
module.exports.index = async (req, res) => {
    const roles = await Role.find().lean();
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
    const title = req.body.title;
    const description = req.body.description;
    try {
        const newRole = new Role({
            title,
            description,
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
    const id = req.params.id;
    let find={
        _id: id
    }
    const role = await Role.findOne(find).lean();
    res.render("admin/pages/role/details", {
        pageTitle: "Chi tiết vai trò",
        role: role
    })
}
//PATCH /delete/:id
module.exports.delete = async (req, res) => {
    const { id } = req.params;
    try {
        await Role.updateOne({ _id: id }, { deleted: true });
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
        _id: id
    }
    const role = await Role.findOne(find).lean();
    res.render("admin/pages/role/edit", {
        pageTitle: "Chỉnh sửa vai trò",
        role: role
    })
}
//PATCH /edit/:id
module.exports.editPatch = async (req, res) => {
    const id = req.params.id;
    const title = req.body.title;
    const description = req.body.description;
    try {
        await Role.updateOne({ _id: id }, { title, description });
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