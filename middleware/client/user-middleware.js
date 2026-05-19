const User = require('../../models/user-model');
module.exports.checkLogin = async (req, res, next) =>{
    if(req.cookies.tokenUser){
       const token = req.cookies.tokenUser;
       const user = await User.findOne({token: token, deleted: false, status: "active"});
       if(user){
           res.locals.user = user;
       }
       else{
            req.flash('error', 'Tài khoản không tồn tại');
            res.clearCookie('tokenUser');
       }
    }
    next();
}