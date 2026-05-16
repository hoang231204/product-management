const Account = require("../../models/account-model")
const Role = require("../../models/role-model")
const systemConfig = require("../../config/system")
const md5 = require("md5")
//GET /admin/accounts
module.exports.index = async (req, res) =>{
    const permissions = res.locals.role.permissions;
    if(!permissions.includes("account_view")){
        req.flash("error","Bạn không có quyền thực hiện chức năng này!")
        return res.redirect(`${systemConfig.prefixAdmin}/dashboard`)
    }
    let find= {deleted: false};
    const accounts = await Account
        .find(find)
        .select("-password -token")
        .populate("role_id", "title")
        .populate("createdBy.account_id", "fullname")
        .populate("updatedBy.account_id", "fullname")
        .lean()
    res.render("admin/pages/account/index",{
        pageTitle: "Quản lý tài khoản",
        accounts: accounts
    })
}
//GET /admin/accounts/create
module.exports.create = async (req, res) =>{
    const roles = await Role.find().select("_id title");
    res.render("admin/pages/account/create", {
        roles: roles
    });
}
//POST /admin/accounts/create
module.exports.createPost = async (req, res) =>{
    const permissions = res.locals.role.permissions;
    if(!permissions.includes("account_create")){
        req.flash("error","Bạn không có quyền thực hiện chức năng này!")
        return res.redirect(`${systemConfig.prefixAdmin}/accounts`)
    }
    req.body.password = md5(req.body.password);
    
    const emailExists = await Account.findOne({email: req.body.email});
    if(emailExists){
        req.flash('error', 'Email đã tồn tại!');
        const backUrl = req.get("Referrer");
        return res.redirect(backUrl);
    }
    req.body.createdBy = {
        account_id: res.locals.user._id
    }
    const account = new Account(req.body);
    await account.save();
    req.flash('success', 'Tạo tài khoản thành công!');
    res.redirect(`${systemConfig.prefixAdmin}/accounts`);
}
//GET /admin/accounts/details/:id
module.exports.details = async (req, res) =>{
    const permissions = res.locals.role.permissions;
    if(!permissions.includes("account_view")){
        req.flash("error","Bạn không có quyền thực hiện chức năng này!")
        return res.redirect(`${systemConfig.prefixAdmin}/accounts`)
    }
    const id = req.params.id;
    const account = await Account
        .findOne({ _id: id})
        .select("-password -token")
        .populate("role_id", "title")
        .populate("createdBy.account_id", "fullname")
        .populate("updatedBy.account_id", "fullname")
        .lean();
    res.render("admin/pages/account/details", {
        pageTitle: "Chi tiết tài khoản",  
        account: account
    });
}
//GET /admin/accounts/edit/:id
module.exports.edit = async (req, res) =>{
    const id = req.params.id;
    const account = await Account.findOne({ _id: id }).select("-password -token").populate("role_id", "title");
    const roles = await Role.find().select("_id title");
    res.render("admin/pages/account/edit", {
        pageTitle: "Chỉnh sửa tài khoản",
        account: account,
        roles: roles
    });
}
//PATCH /admin/accounts/edit/:id
module.exports.editPatch = async (req, res) =>{
    const permissions = res.locals.role.permissions;
    if(!permissions.includes("account_edit")){
        req.flash("error","Bạn không có quyền thực hiện chức năng này!")
        return res.redirect(`${systemConfig.prefixAdmin}/accounts`)
    }
    const id = req.params.id;
    const emailExists = await Account.findOne({email: req.body.email, _id: {$ne: id}, deleted: false});
    if(emailExists){
        req.flash('error', 'Email đã tồn tại!');
        const backUrl = req.get("Referrer");
        return res.redirect(backUrl);
    }
    if(req.body.password){
        req.body.password = md5(req.body.password);
    }else{
        delete req.body.password;
    }
    let updatedBy = {
        account_id: res.locals.user._id,
        updatedAt: new Date()
    };
    await Account.updateOne({_id: id}, {...req.body, $push: { updatedBy: updatedBy }});
    req.flash('success', 'Cập nhật tài khoản thành công!');
    res.redirect(`${systemConfig.prefixAdmin}/accounts`);
}
//PATCH /admin/accounts/delete/:id
module.exports.delete = async (req, res) =>{
    const permissions = res.locals.role.permissions;
    if(!permissions.includes("account_delete")){
        req.flash("error","Bạn không có quyền thực hiện chức năng này!")
        return res.redirect(`${systemConfig.prefixAdmin}/accounts`)
    }
    const id = req.params.id;
    const accountId = res.locals.user._id;
    await Account.updateOne(
        { 
                _id: id, 
                deleted: false 
            },
            {
                $set: {
                    deleted: true,
                    deletedBy: {
                        account_id: accountId,
                        deletedAt: new Date()
                    }
                }
            }
    );
    req.flash('success', 'Xóa tài khoản thành công!');
    res.redirect(`${systemConfig.prefixAdmin}/accounts`);
}
//PATCH /admin/accounts/change-status/:id
module.exports.changeStatus = async (req, res) =>{
    const permissions = res.locals.role.permissions;
    if(!permissions.includes("account_edit")){
        req.flash("error","Bạn không có quyền thực hiện chức năng này!")
        return res.redirect(`${systemConfig.prefixAdmin}/accounts`)
    }
    const id = req.params.id;
    const status = req.params.status;
    let updatedBy = {
        account_id: res.locals.user._id,
        updatedAt: new Date()
    };
    await Account.updateOne({_id: id}, {status: status, $push: { updatedBy: updatedBy }});
    req.flash('success', 'Cập nhật trạng thái thành công!');
    res.redirect(`${systemConfig.prefixAdmin}/accounts`);
}
//GET /admin/accounts/recycle-bin
module.exports.recycleBin = async (req, res) =>{
    const accounts = await Account
        .find({deleted: true})
        .select("-password -token")
        .populate("role_id", "title")
        .populate("deletedBy.account_id", "fullname")
        .lean();
    res.render("admin/pages/account/recycle-bin", {
        pageTitle: "Thùng rác tài khoản",
        accounts: accounts
    })
}
//PATCH /admin/accounts/recycle-bin/restore/:id
module.exports.restore = async (req, res) =>{
    const id = req.params.id;
    await Account.updateOne({_id: id}, {deleted: false,deletedBy: null});
    req.flash('success', 'Khôi phục tài khoản thành công!');
    res.redirect(`${systemConfig.prefixAdmin}/accounts/recycle-bin`);
} 
//DELETE /admin/accounts/recycle-bin/destroy/:id
module.exports.destroy = async (req, res) =>{
    const id = req.params.id;
    await Account.deleteOne({_id: id});
    req.flash('success', 'Xóa vĩnh viễn tài khoản thành công!');
    res.redirect(`${systemConfig.prefixAdmin}/accounts/recycle-bin`);
} 