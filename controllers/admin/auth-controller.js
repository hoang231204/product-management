const Account = require('../../models/account-model')
const Session = require('../../models/session-model')
const system = require('../../config/system')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const crypto = require('crypto')
const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET
const ACCESS_TOKEN_TTL = '15m'
const REFRESH_TOKEN_TTL = '7d'
//GET /auth/login
module.exports.login = (req, res) => {
    res.render('admin/pages/auth/login', {
        pageTitle: 'Đăng nhập'
    })
}
//POST /auth/login
module.exports.loginPost = async (req, res) => {
    try{
        const email = String(req.body.email).trim().toLowerCase()
        const password = String(req.body.password).trim()
        //KIỂM TRA TỒN TẠI
        const account = await Account.findOne({ email: email })
        if(!account){
            req.flash('error', 'Email hoặc mật khẩu không đúng')
            return res.redirect(`${system.prefixAdmin}/auth/login`)
        }
        //KIỂM TRA MẬT KHẨU
        const isMatch = await bcrypt.compare(password, account.password)
        if(!isMatch){
            req.flash('error', 'Email hoặc mật khẩu không đúng')
            return res.redirect(`${system.prefixAdmin}/auth/login`)
        }
        //TẠO TOKEN
        const accessToken = jwt.sign({ accountId: account._id }, ACCESS_TOKEN_SECRET, { expiresIn: ACCESS_TOKEN_TTL })
        const refreshToken = crypto.randomBytes(64).toString('hex')
        //LƯU TOKEN VÀO DB
        const session = new Session({
            userId: account._id,
            token: refreshToken,
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        })
        await session.save()
        //RETURN KẾT QUẢ
        res.cookie('token', accessToken, { httpOnly: true, maxAge: 15 * 60 * 1000, secure: true, sameSite: 'strict' })
        res.cookie('refreshToken', refreshToken, { httpOnly: true, maxAge: 7 * 24 * 60 * 60 * 1000, secure: true, sameSite: 'strict' })
        req.flash('success', 'Đăng nhập thành công')
        return res.redirect(`${system.prefixAdmin}/dashboard`)
    }
    catch(error){
        console.error(error)
        return res.redirect(`${system.prefixAdmin}/auth/login`)
    }
}
//GET /auth/refresh-token
module.exports.refreshToken = async (req, res) => {
    const oldRefreshToken = req.cookies.refreshToken;
    if (!oldRefreshToken) return res.redirect(`${system.prefixAdmin}/auth/login`);
    try {
        //Tìm token trong DB
        const tokenRecord = await Session.findOne({ token: oldRefreshToken });
        if (!tokenRecord) {
            req.flash('error', 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
            return res.redirect(`${system.prefixAdmin}/auth/login`);
        }
        //Xoay vòng (Rotation): Xóa cái cũ, tạo cái mới
        await Session.deleteOne({ token: oldRefreshToken });
        const newAccessToken = jwt.sign({ accountId: tokenRecord.userId }, ACCESS_TOKEN_SECRET, { expiresIn: ACCESS_TOKEN_TTL });
        const newRefreshToken = crypto.randomBytes(64).toString('hex');
        // Lưu mới vào DB
        await Session.create({
            userId: tokenRecord.userId,
            token: newRefreshToken,
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        });
        //Cập nhật Cookie
        res.cookie('token', newAccessToken, { httpOnly: true, maxAge: 15 * 60 * 1000, secure: true, sameSite: 'strict' });
        res.cookie('refreshToken', newRefreshToken, { httpOnly: true, maxAge: 7 * 24 * 60 * 60 * 1000, secure: true, sameSite: 'strict' });
        req.flash('success', 'Đăng nhập thành công');
        return res.redirect(`${system.prefixAdmin}/dashboard`); 
    } catch (err) {
        console.error(err);
        req.flash('error', 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
        return res.redirect(`${system.prefixAdmin}/auth/login`);
    }
}
//POST /auth/logout
module.exports.logout = async (req, res) => {
   try{
        const refreshToken = req.cookies.refreshToken;
        if (refreshToken) {
            await Session.deleteOne({ token: refreshToken });
        }
        res.clearCookie('token');
        res.clearCookie('refreshToken');
        req.flash('success', 'Đăng xuất thành công');
        return res.redirect(`${system.prefixAdmin}/auth/login`);
    }
    catch(error){
        console.error(error);
        req.flash('error', 'Đăng xuất thất bại. Vui lòng thử lại.');
        return res.redirect(`${system.prefixAdmin}/dashboard`);
    }
}