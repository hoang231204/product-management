const User = require('../../models/user-model');
const Cart = require('../../models/cart-model');
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
    req.flash('success', 'Đăng xuất thành công');
    res.redirect('/user/login');
}