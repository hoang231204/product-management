const Cart = require('../../models/cart-model');
const ForgotPassword = require('../../models/forgot-password-model');
const VerifyEmail = require('../../models/verify-email-model');
const sendEmail = require('../../helpers/sendEmail')
const User = require('../../models/user-model')
const Session = require('../../models/session-model')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const crypto = require('crypto')
const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET
const ACCESS_TOKEN_TTL = '15m'
const REFRESH_TOKEN_TTL = '7d'
//GET /auth/register
module.exports.register = (req, res) => {
    res.render('client/pages/user/register', {
        pageTitle: 'Đăng ký'
    })
}
//POST /auth/register
module.exports.registerPost = async (req, res) => {
    try{
        const { fullname, email, password } = req.body;
        //KIỂM TRA TỒN TẠI
        const existingUser = await User.findOne({ email })
        if(existingUser){
            req.flash('error', 'Email đã được sử dụng')
            return res.redirect('/users/register')
        }
        //MÃ HÓA MẬT KHẨU
        const hashedPassword = await bcrypt.hash(password, 10)
        //TẠO USER MỚI
        const newUser = new User({
            fullname: fullname,
            email: email,
            hashedPassword: hashedPassword
        })
        await newUser.save()
        //RETURN KẾT QUẢ
        req.flash('success', 'Đăng ký thành công')
        return res.redirect('/users/login')
    }
    catch(error){
        if (error.code === 11000) {
            req.flash('error', 'Email này vừa được đăng ký bởi một người khác, vui lòng chọn email khác.');
        }
        else {
            req.flash('error', 'Đã có lỗi xảy ra, vui lòng thử lại');
        }
        res.redirect('/users/register')
    }
}
//GET /auth/login
module.exports.login = (req, res) => {
    res.render('client/pages/user/login', {
        pageTitle: 'Đăng nhập'
    })
}
//POST /auth/login
module.exports.loginPost = async (req, res) => {
    try{
        const { email, password } = req.body
        //KIỂM TRA TỒN TẠI
        const user = await User.findOne({ email: email })
        if(!user){
            req.flash('error', 'Email hoặc mật khẩu không đúng')
            return res.redirect('/users/login')
        }
        //KIỂM TRA MẬT KHẨU
        const isMatch = await bcrypt.compare(password, user.hashedPassword)
        if(!isMatch){
            req.flash('error', 'Email hoặc mật khẩu không đúng')
            return res.redirect('/users/login')
        }
        //TẠO TOKEN
        const accessToken = jwt.sign({ userId: user._id }, ACCESS_TOKEN_SECRET, { expiresIn: ACCESS_TOKEN_TTL })
        const refreshToken = crypto.randomBytes(64).toString('hex')
        //LƯU TOKEN VÀO DB
        const session = new Session({
            userId: user._id,
            token: refreshToken,
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        })
        await session.save()
        //RETURN KẾT QUẢ
        res.cookie('token', accessToken, { httpOnly: true, maxAge: 15 * 60 * 1000 })
        res.cookie('refreshToken', refreshToken, { httpOnly: true, maxAge: 7 * 24 * 60 * 60 * 1000 })
        req.flash('success', 'Đăng nhập thành công')
        return res.redirect('/')
    }
    catch(error){
        console.error(error)
        req.flash('error', 'Đã có lỗi xảy ra, vui lòng thử lại')
        return res.redirect('/users/login')
    }
}
//GET /auth/refresh-token
module.exports.refreshToken = async (req, res) => {
    const oldRefreshToken = req.cookies.refreshToken;
    if (!oldRefreshToken) return res.redirect('/users/login');
    try {
        //Tìm token trong DB
        const tokenRecord = await Session.findOne({ token: oldRefreshToken });
        if (!tokenRecord) {
            req.flash('error', 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
            return res.redirect('/users/login');
        }
        //Xoay vòng (Rotation): Xóa cái cũ, tạo cái mới
        await Session.deleteOne({ token: oldRefreshToken });
        const newAccessToken = jwt.sign({ userId: tokenRecord.userId }, ACCESS_TOKEN_SECRET, { expiresIn: ACCESS_TOKEN_TTL });
        const newRefreshToken = crypto.randomBytes(64).toString('hex');
        // Lưu mới vào DB
        await Session.create({
            userId: tokenRecord.userId,
            token: newRefreshToken,
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        });
        //Cập nhật Cookie
        res.cookie('token', newAccessToken, { httpOnly: true, maxAge: 15 * 60 * 1000 });
        res.cookie('refreshToken', newRefreshToken, { httpOnly: true, maxAge: 7 * 24 * 60 * 60 * 1000 });
        req.flash('success', 'Đăng nhập thành công');
        return res.redirect('/'); 
    } catch (err) {
        req.flash('error', 'Đã có lỗi xảy ra, vui lòng thử lại');
        return res.redirect('/users/login');
    }
}
//POST /auth/logout
module.exports.logout = async (req, res) => {
    const refreshToken = req.cookies.refreshToken;
    if (refreshToken) {
        await Session.deleteOne({ token: refreshToken });
    }
    res.clearCookie('token');
    res.clearCookie('refreshToken');
    req.flash('success', 'Đăng xuất thành công');
    return res.redirect('/users/login');
}
//GET /password/forgot
module.exports.forgotPassword = async (req, res) =>{
    res.render('client/pages/user/forgot-password',{
        pageTitle: "Quên mật khẩu",
    }
    )
}
//POST /password/forgot
module.exports.forgotPasswordPost = async (req, res) =>{
    try{
        const email = req.body.email;
        const user = await User.findOne({email: email, deleted: false, status: "active"});
        if(!user){
            req.flash('error', 'Email không tồn tại hoặc tài khoản đã bị khóa');
            res.redirect('/users/password/forgot');
            return;
        }
        const forgotPassword = new ForgotPassword({
            email: email,
            expireAt: Date.now()
        });
        await forgotPassword.save();
        res.redirect(`/users/password/otp?email=${email}`);
    //Gửi email chứa mã OTP
        const subject = "Mã OTP đặt lại mật khẩu";
        const html = `<p>Mã OTP của bạn là: <b>${forgotPassword.otp}</b></p><p>Mã OTP có hiệu lực trong 3 phút.</p>`;
        sendEmail.send(email, subject, html);
    }
    catch(error){
        req.flash('error', 'Đã có lỗi xảy ra, vui lòng thử lại');
        res.redirect('/users/password/forgot');
    }
}
//GET /password/otp
module.exports.otp = async (req, res) =>{
    const email = req.query.email;
    res.render('client/pages/user/otp',{
        pageTitle: "Nhập mã OTP",
        email: email
    }
    )
}
//POST /password/otp
module.exports.otpPost = async (req, res) =>{
    try{
        const email = req.body.email;
        const otp = req.body.otp;
        const forgotPassword = await ForgotPassword.findOne({email: email, otp: otp});
        if(!forgotPassword){
            req.flash('error', 'Mã OTP hoặc email không đúng');
            res.redirect(`/users/password/otp?email=${email}`);
            return;
        }
        const user = await User.findOne({email: email, deleted: false, status: "active"});
        if(!user){
            req.flash('error', 'Email không tồn tại hoặc tài khoản đã bị khóa');
            res.redirect(`/users/password/otp?email=${email}`);
            return;
        }
        const tokenReset = crypto.randomBytes(64).toString('hex');
        user.tokenReset = tokenReset;
        user.tokenResetExpires = Date.now() + 180000;
        await user.save();
        res.cookie("tokenReset", tokenReset, { httpOnly: true, maxAge: 180000 });
        res.redirect('/users/password/reset-password');
    }
    catch(error){
        req.flash('error', 'Đã có lỗi xảy ra, vui lòng thử lại');
        res.redirect(`/users/password/otp?email=${email}`);
    }
   
}
//GET /password/reset
module.exports.resetPassword = async (req, res) =>{
    res.render('client/pages/user/reset-password',
        {
            pageTitle: "Đặt lại mật khẩu",
        }
    )
}
//POST /password/reset
module.exports.resetPasswordPost = async (req, res) =>{
    try{
        const token = req.cookies.tokenReset;
        const password = req.body.password;
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await User.findOne({tokenReset: token, tokenResetExpires: {$gt: Date.now()}, deleted: false, status: "active"});
        if(!user){
            req.flash('error', 'Liên kết đặt lại mật khẩu không hợp lệ');
            res.redirect('/users/login');
            return;
        }
        user.hashedPassword = hashedPassword;
        await user.save();
        res.clearCookie('tokenReset');
        req.flash('success', 'Đặt lại mật khẩu thành công');
        res.redirect('/users/login');
    }
    catch(error){
        req.flash('error', 'Đã có lỗi xảy ra, vui lòng thử lại');
        res.redirect('/users/login');
    }
}
//GET /profile
module.exports.profile = async (req, res) =>{
    res.render('client/pages/user/profile',{
        pageTitle: "Thông tin cá nhân"
    }
    )
}
//GET /profile/edit
module.exports.editProfile = async (req, res) =>{
    res.render('client/pages/user/edit-profile',{
        pageTitle: "Chỉnh sửa thông tin cá nhân"
    }
    )
}
//PATCH /profile/edit
module.exports.editProfilePatch = async (req, res) =>{
    try{
        const userId = res.locals.user._id;
        if(req.body.password){
            const oldPassword = req.body.password;
            const checkPassword = await User.findOne({_id: userId, hashedPassword: oldPassword, deleted: false, status: "active"});
            if(!checkPassword){
                req.flash('error', 'Mật khẩu cũ không đúng');
                res.redirect('/users/profile/edit');
                return;
            }
            req.body.hashedPassword = await bcrypt.hash(req.body.newPassword, 10);
        
        }
        else{
            delete req.body.password;
        }
            delete req.body.newPassword;
            delete req.body.confirmPassword;
            await User.updateOne({_id: userId}, req.body);
            req.flash('success', 'Cập nhật thông tin thành công');
            res.redirect('/users/profile');
    }
    catch(error){
        req.flash('error', 'Đã có lỗi xảy ra, vui lòng thử lại');
        res.redirect('/users/profile/edit');
    }
}
//GET /change-email
module.exports.changeEmail = async (req, res) =>{
    res.render('client/pages/user/change-email',{
        pageTitle: "Đổi email"
    }
    )
}
module.exports.changeEmailPost = async (req, res) =>{
    try{
        const newEmail = req.body.newEmail;
        const userId = res.locals.user._id;
        const emailExist = await User.findOne({email: newEmail, deleted: false ,status: "active"});
        if(emailExist){
            req.flash('error', 'Email đã tồn tại');
            res.redirect('/users/change-email');
            return;
        }
        const verifyEmail = new VerifyEmail({
            newEmail: newEmail,
            expireAt: Date.now()
        });
        await verifyEmail.save();
        //Gửi email chứa mã OTP
        const subject = "Mã OTP xác nhận đổi email";
        const html = `<p>Mã OTP của bạn là: <b>${verifyEmail.otp}</b></p><p>Mã OTP có hiệu lực trong 3 phút.</p>`;
        sendEmail.send(newEmail, subject, html);
        res.redirect(`/user/change-email/otp?email=${newEmail}`);
    }
    catch(error){
        req.flash('error', 'Đã có lỗi xảy ra, vui lòng thử lại');
        res.redirect('/user/change-email');
    }
}
//GET /change-email/otp
module.exports.changeEmailOtp = async (req, res) =>{
    const newEmail = req.query.email;
    res.render('client/pages/user/change-email-otp',{
        pageTitle: "Nhập mã OTP",
        newEmail: newEmail
    }
    )
}
//POST /change-email/otp
module.exports.changeEmailOtpPost = async (req, res) =>{
    try{
        const newEmail = req.body.newEmail;
        const otp = req.body.otp;
        const verifyEmail = await VerifyEmail.findOne({newEmail: newEmail, otp: otp});
        if(!verifyEmail){
            req.flash('error', 'Mã OTP hoặc email không đúng');
            res.redirect(`/user/change-email/otp?email=${newEmail}`);
            return;
        }
        const userId = res.locals.user._id;
        await User.updateOne({_id: userId}, {email: newEmail});
        req.flash('success', 'Đổi email thành công');
        res.redirect('/user/profile');
    }
    catch(error){
        req.flash('error', 'Đã có lỗi xảy ra, vui lòng thử lại');
        res.redirect('/user/change-email');
    }
}