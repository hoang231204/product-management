const jwt = require('jsonwebtoken')
const User = require('../../models/user-model')
const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET
module.exports.requireAuth = async (req, res, next) => {
    const token = req.cookies.token;
    if(token){
        try {
            const decoded = jwt.verify(token, ACCESS_TOKEN_SECRET);
            const user = await User.findById(decoded.userId).select("-hashedPassword").lean();
            if(user){
                res.locals.user = user;
                next();
            }else{
                res.clearCookie('token');
                req.flash('error', 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
                return res.redirect(`/users/login`);
            }
        } catch (error) {
            res.clearCookie('token');
            req.flash('error', 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
            return res.redirect(`/users/login`);
        }
    }else{
        if(req.cookies.refreshToken){
            return res.redirect(`/users/refresh-token`);
        }
        else{
            req.flash('error', 'Vui lòng đăng nhập để tiếp tục');
            return res.redirect(`/users/login`);
        }
    }
}