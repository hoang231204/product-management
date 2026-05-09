const Account = require('../../models/account-model');
const systemConfig = require('../../config/system')
const md5 = require('md5');
// GET /admin/login
module.exports.login = (req,res)=>{
    if(req.cookies.token){
        return res.redirect(`${systemConfig.prefixAdmin}/dashboard`);
    }
    res.render("admin/pages/auth/login",{
        pageTitle: "Đăng nhập",
    })
}
//POST /admin/login
module.exports.loginPost = async (req,res)=>{
    const email = req.body.email;
    const password = md5(req.body.password);
    const account = await Account.findOne({email: email, deleted: false});
    if(!account){
        req.flash("error", "Tài khoản không tồn tại");
        return res.redirect(`${systemConfig.prefixAdmin}/auth/login`);
    }
    if(account.password !== password){
        req.flash("error", "Mật khẩu không đúng");
        return res.redirect(`${systemConfig.prefixAdmin}/auth/login`);
    }
    if(account.status === "inactive"){
        req.flash("error", "Tài khoản đã bị khóa");
        return res.redirect(`${systemConfig.prefixAdmin}/auth/login`);
    }
    res.cookie("token",account.token);
    req.flash("success", "Đăng nhập thành công");
    res.redirect(`${systemConfig.prefixAdmin}/dashboard`);
}
//GET /admin/logout
module.exports.logout = (req,res)=>{
    res.clearCookie("token");
    req.flash("success", "Đăng xuất thành công");
    res.redirect(`${systemConfig.prefixAdmin}/auth/login`);
}