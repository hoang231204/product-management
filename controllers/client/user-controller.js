const User = require('../../models/user-model');
const Cart = require('../../models/cart-model');
const ForgotPassword = require('../../models/forgot-password-model');
const sendEmail = require('../../helpers/sendEmail')
const md5 = require('md5');
//GET /register
module.exports.register = async (req, res) =>{
    res.render('client/pages/user/register',
        {
            pageTitle: "Đăng ký tài khoản",
        }
    )
}
//POST /register
module.exports.registerPost = async (req, res) =>{
    const fullname = req.body.fullname;
    const email = req.body.email;
    const password = md5(req.body.password);
    const emailExist = await User.findOne({email: email});
    if(emailExist){
        req.flash('error', 'Email đã tồn tại');
        res.redirect('/user/register');
    }
    const user = new User({
        fullname: fullname,
        email: email,
        password: password
    });
    await user.save();
    req.flash('success', 'Đăng ký thành công');
    res.redirect('/user/login');
}
//GET /login
module.exports.login = async (req, res) =>{
    res.render('client/pages/user/login',
        {
            pageTitle: "Đăng nhập tài khoản",
        }
    )
}
//POST /login
module.exports.loginPost = async (req, res) =>{
    const email = req.body.email;
    const password = md5(req.body.password);
    const user = await User.findOne({email: email, deleted: false});
    if(!user){
        req.flash('error', 'Email không đúng');
        res.redirect('/user/login');
    }
    if(user.password !== password){
        req.flash('error', 'Mật khẩu không đúng');
        res.redirect('/user/login');
    }
    if(user.status === "inactive"){
        req.flash('error', 'Tài khoản đã bị khóa');
        res.redirect('/user/login');
    }
    res.cookie('tokenUser',user.token);
    req.flash('success', 'Đăng nhập thành công');
    res.redirect('/');
}
//POST /logout
module.exports.logout = async (req, res) =>{
    res.clearCookie('tokenUser');
    res.clearCookie('cartId');
    req.flash('success', 'Đăng xuất thành công');
    res.redirect('/user/login');
}
//GET /password/forgot
module.exports.forgotPassword = async (req, res) =>{
    res.render('client/pages/user/forgot-password',
        {
            pageTitle: "Quên mật khẩu",
        }
    )
}
//POST /password/forgot
module.exports.forgotPasswordPost = async (req, res) =>{
    const email = req.body.email;
    const user = await User.findOne({email: email, deleted: false, status: "active"});
    if(!user){
        req.flash('error', 'Email không tồn tại hoặc tài khoản đã bị khóa');
        res.redirect('/user/password/forgot');
        return;
    }
    const forgotPassword = new ForgotPassword({
        email: email,
        expireAt: Date.now()
    });
    await forgotPassword.save();
    res.redirect(`/user/password/otp?email=${email}`);
   //Gửi email chứa mã OTP
    const subject = "Mã OTP đặt lại mật khẩu";
    const html = `<p>Mã OTP của bạn là: <b>${forgotPassword.otp}</b></p><p>Mã OTP có hiệu lực trong 3 phút.</p>`;
    sendEmail.send(email, subject, html);
}
//GET /password/otp
module.exports.otp = async (req, res) =>{
    const email = req.query.email;
    res.render('client/pages/user/otp',
        {
            pageTitle: "Nhập mã OTP",
            email: email
        }
    )
}
//POST /password/otp
module.exports.otpPost = async (req, res) =>{
    const email = req.body.email;
    const otp = req.body.otp;
    const forgotPassword = await ForgotPassword.findOne({email: email, otp: otp});
    if(!forgotPassword){
        req.flash('error', 'Mã OTP hoặc email không đúng');
        res.redirect(`/user/password/otp?email=${email}`);
        return;
    }
    const user = await User.findOne({email: email, deleted: false, status: "active"});
    if(!user){
        req.flash('error', 'Email không tồn tại hoặc tài khoản đã bị khóa');
        res.redirect(`/user/password/otp?email=${email}`);
        return;
    }
    res.cookie("tokenReset", user.token);
    res.redirect('/user/password/reset-password');
   
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
    const token = req.cookies.tokenReset;
    const password = md5(req.body.password);
    const user = await User.findOne({token: token, deleted: false, status: "active"});
    if(!user){
        req.flash('error', 'Liên kết đặt lại mật khẩu không hợp lệ');
        res.redirect('/user/login');
        return;
    }
    user.password = password;
    await user.save();
    res.clearCookie('tokenReset');
    req.flash('success', 'Đặt lại mật khẩu thành công');
    res.redirect('/user/login');
}
//GET /profile
module.exports.profile = async (req, res) =>{
    res.render('client/pages/user/profile',
        {
            pageTitle: "Thông tin tài khoản",
            user: res.locals.user
        }
    )
}