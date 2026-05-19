const Account = require('../../models/account-model');
const Role = require('../../models/role-model');
const systemConfig = require('../../config/system')
module.exports.requireLogin = async (req,res,next)=>{
    if(!req.cookies.token){
        req.flash("error", "Vui lòng đăng nhập để tiếp tục");
        return res.redirect(`${systemConfig.prefixAdmin}/auth/login`);
    }
    const user = await Account.findOne({token: req.cookies.token, deleted: false}).select("-password -token")
    if(!user){
        req.flash("error", "Tài khoản không tồn tại");
        res.clearCookie("token");
        return res.redirect(`${systemConfig.prefixAdmin}/auth/login`);
    }
    const role = await Role.findOne({_id:user.role_id}).select("title permissions");
    res.locals.user = user;
    res.locals.role = role;
    next();
}