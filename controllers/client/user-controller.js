const User = require('../../models/user-model');
const Cart = require('../../models/cart-model');
const ForgotPassword = require('../../models/forgot-password-model');
const VerifyEmail = require('../../models/verify-email-model');
const sendEmail = require('../../helpers/sendEmail')
const md5 = require('md5');
//GET /register
module.exports.register = async (req, res) =>{
    res.render('client/pages/user/register',{
        pageTitle: "Đăng ký tài khoản",
    }
    )
}
//POST /register
module.exports.registerPost = async (req, res) =>{
    try{
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
    catch(error){
        req.flash('error', 'Đã có lỗi xảy ra, vui lòng thử lại');
        res.redirect('/user/register');
    }
}
//GET /login
module.exports.login = async (req, res) =>{
    res.render('client/pages/user/login',{
        pageTitle: "Đăng nhập tài khoản",
    }
    )
}
//POST /login
module.exports.loginPost = async (req, res) =>{
    try{
        const email = req.body.email;
        const password = md5(req.body.password);
        const user = await User.findOne({email: email, deleted: false});
        if(!user){
            req.flash('error', 'Email không đúng');
            return res.redirect('/user/login');
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
    catch(error){
        req.flash('error', 'Đã có lỗi xảy ra, vui lòng thử lại');
        res.redirect('/user/login');
    }
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
    catch(error){
        req.flash('error', 'Đã có lỗi xảy ra, vui lòng thử lại');
        res.redirect('/user/password/forgot');
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
    catch(error){
        req.flash('error', 'Đã có lỗi xảy ra, vui lòng thử lại');
        res.redirect(`/user/password/otp?email=${email}`);
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
    catch(error){
        req.flash('error', 'Đã có lỗi xảy ra, vui lòng thử lại');
        res.redirect('/user/login');
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
            const oldPassword = md5(req.body.password);
            const checkPassword = await User.findOne({_id: userId, password: oldPassword, deleted: false, status: "active"});
            if(!checkPassword){
                req.flash('error', 'Mật khẩu cũ không đúng');
                res.redirect('/user/profile/edit');
                return;
            }
            req.body.password = md5(req.body.newPassword);
        
        }
        else{
            delete req.body.password;
        }
            delete req.body.newPassword;
            delete req.body.confirmPassword;
            await User.updateOne({_id: userId}, req.body);
            req.flash('success', 'Cập nhật thông tin thành công');
            res.redirect('/user/profile');
    }
    catch(error){
        req.flash('error', 'Đã có lỗi xảy ra, vui lòng thử lại');
        res.redirect('/user/profile/edit');
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
            res.redirect('/user/change-email');
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