const Account = require("../../models/account-model")
const Role = require("../../models/role-model")
const systemConfig = require("../../config/system")
const md5 = require("md5")
//GET /admin/accounts
module.exports.index = async (req, res) =>{
    let find= {deleted: false};
    const accounts = await Account.find(find).select("-password ").populate("role_id", "title");
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
    req.body.password = md5(req.body.password);
    const emailExists = await Account.findOne({email: req.body.email});
    if(emailExists){
        req.flash('error', 'Email đã tồn tại!');
        const backUrl = req.get("Referrer");
        return res.redirect(backUrl);
    }
    const account = new Account(req.body);
    await account.save();
    req.flash('success', 'Tạo tài khoản thành công!');
    res.redirect(`${systemConfig.prefixAdmin}/accounts`);
}
//GET /admin/accounts/details/:id
module.exports.details = async (req, res) =>{
    const id = req.params.id;
    const account = await Account.findOne({ _id: id }).select("-password").populate("role_id", "title");
    res.render("admin/pages/account/details", {
        pageTitle: "Chi tiết tài khoản",  
        account: account
    });
}
//GET /admin/accounts/edit/:id
module.exports.edit = async (req, res) =>{
    const id = req.params.id;
    const account = await Account.findOne({ _id: id }).select("-password").populate("role_id", "title");
    const roles = await Role.find().select("_id title");
    res.render("admin/pages/account/edit", {
        pageTitle: "Chỉnh sửa tài khoản",
        account: account,
        roles: roles
    });
}
//PATCH /admin/accounts/edit/:id
module.exports.editPatch = async (req, res) =>{
    const id = req.params.id;
    if(req.body.password){
        req.body.password = md5(req.body.password);
    }else{
        delete req.body.password;
    }
    await Account.updateOne({_id: id}, req.body);
    req.flash('success', 'Cập nhật tài khoản thành công!');
    res.redirect(`${systemConfig.prefixAdmin}/accounts`);
}
//PATCH /admin/accounts/delete/:id
module.exports.delete = async (req, res) =>{
    const id = req.params.id;
    await Account.updateOne({_id: id}, {deleted: true});
    req.flash('success', 'Xóa tài khoản thành công!');
    res.redirect(`${systemConfig.prefixAdmin}/accounts`);
}
//PATCH /admin/accounts/change-status/:id
module.exports.changeStatus = async (req, res) =>{
    const id = req.params.id;
    const status = req.params.status;
    await Account.updateOne({_id: id}, {status: status});
    req.flash('success', 'Cập nhật trạng thái thành công!');
    res.redirect(`${systemConfig.prefixAdmin}/accounts`);
}