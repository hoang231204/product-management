const Account = require('../../models/account-model');
const systemConfig = require('../../config/system')
module.exports.requireLogin = (req,res,next)=>{
    if(!req.cookies.token){
        req.flash("error", "Vui lòng đăng nhập để tiếp tục");
        return res.redirect(`${systemConfig.prefixAdmin}/auth/login`);
    }
    const user = Account.findOne({token: req.cookies.token, deleted: false});
    if(!user){
        req.flash("error", "Tài khoản không tồn tại");
        return res.redirect(`${systemConfig.prefixAdmin}/auth/login`);
    }
    next();
}