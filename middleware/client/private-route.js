const User = require('../../models/user-model');
module.exports.requireLogin = async (req, res, next) =>{
    if(req.cookies.tokenUser){
       const token = req.cookies.tokenUser;
       const user = await User.findOne({token: token, deleted: false, status: "active"});
         if(user){
                next();
            }
            else{
                req.flash('error', 'Tài khoản không tồn tại');
                res.clearCookie('tokenUser');
                res.redirect('/user/login');
            }
    }
    else{
        req.flash('error', 'Vui lòng đăng nhập để tiếp tục');
        res.redirect('/user/login');
    }
}