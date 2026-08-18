const jwt = require('jsonwebtoken')
const Account = require('../../models/account-model')
const Role = require('../../models/role-model')
const system = require('../../config/system')
const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET
module.exports.requireAuth = async (req, res, next) => {
    const token = req.cookies.token;
    if(token){
        try {
            const decoded = jwt.verify(token, ACCESS_TOKEN_SECRET);
            const account = await Account.findById(decoded.accountId).select("-password").lean();
            if(account){
                res.locals.user = account;
                const role = await Role.findById(account.role_id).lean();
                res.locals.role = role;
                next();
            }else{
                res.clearCookie('token');
                req.flash('error', 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
                return res.redirect(`${system.prefixAdmin}/auth/login`);
            }
        } catch (error) {
            res.clearCookie('token');
            req.flash('error', 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
            return res.redirect(`${system.prefixAdmin}/auth/login`);
        }
    }else{
        if(req.cookies.refreshToken){
            return res.redirect(`${system.prefixAdmin}/auth/refresh-token`);
        }
        else{
            req.flash('error', 'Vui lòng đăng nhập để tiếp tục');
            return res.redirect(`${system.prefixAdmin}/auth/login`);
        }
    }
}