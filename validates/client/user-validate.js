module.exports.register = (req,res,next)=>{
    if(!req.body.fullname){
        req.flash("error","Vui lòng nhập họ và tên!");
        const backUrl = req.get("Referrer");
        res.redirect(backUrl);
        return
    }
    if(!req.body.email){
        req.flash("error","Vui lòng nhập email!");
        const backUrl = req.get("Referrer");  
        res.redirect(backUrl);
        return
    }
    if(req.body.email){
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(req.body.email)) {
            req.flash("error", "Email không hợp lệ!");
            const backUrl = req.get("Referrer");
            res.redirect(backUrl);
            return;
        }
    }
    if(!req.body.password){
        req.flash("error","Vui lòng nhập mật khẩu!");
        const backUrl = req.get("Referrer"); 
        res.redirect(backUrl);
        return
    }
    if(req.body.password.length < 6){
        req.flash("error","Mật khẩu phải có ít nhất 6 ký tự!");
        const backUrl = req.get("Referrer");
        res.redirect(backUrl);
        return
    }
    next();
}
module.exports.login = (req,res,next)=>{
    if(!req.body.email){
        req.flash("error","Vui lòng nhập email!");
        const backUrl = req.get("Referrer");
        res.redirect(backUrl);
        return
    }
    if(req.body.email){
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(req.body.email)) {
            req.flash("error", "Email không hợp lệ!");
            const backUrl = req.get("Referrer");
            res.redirect(backUrl);
            return;
        }
    }
    if(!req.body.password){
        req.flash("error","Vui lòng nhập mật khẩu!");
        const backUrl = req.get("Referrer");  
        res.redirect(backUrl);
        return
    }
    next();
}
module.exports.forgotPassword = (req,res,next)=>{
    if(!req.body.email){
        req.flash("error","Vui lòng nhập email!");
        const backUrl = req.get("Referrer");
        res.redirect(backUrl);
        return
    }
    next();
}
module.exports.otp = (req,res,next)=>{
    if(!req.body.email){
        req.flash("error","Vui lòng nhập email!");
        const backUrl = req.get("Referrer");
        res.redirect(backUrl);
        return
    }
    if(req.body.email){
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(req.body.email)) {
            req.flash("error", "Email không hợp lệ!");
            const backUrl = req.get("Referrer");
            res.redirect(backUrl);
            return;
        }
    }
    if(!req.body.otp){
        req.flash("error","Vui lòng nhập mã OTP!");
        const backUrl = req.get("Referrer");  
        res.redirect(backUrl);
        return
    }
    next();
}
module.exports.resetPassword = (req,res,next)=>{
    if(!req.body.password){
        req.flash("error","Vui lòng nhập mật khẩu mới!");
        const backUrl = req.get("Referrer");
        res.redirect(backUrl);
        return
    }
    if(req.body.password.length < 6){
        req.flash("error","Mật khẩu mới phải có ít nhất 6 ký tự!");
        const backUrl = req.get("Referrer");
        res.redirect(backUrl);
        return
    }
    if(!req.body.confirmPassword){
        req.flash("error","Vui lòng nhập lại mật khẩu mới!");
        const backUrl = req.get("Referrer");
        res.redirect(backUrl);
        return
    }
    if(req.body.password !== req.body.confirmPassword){
        req.flash("error","Mật khẩu mới và xác nhận mật khẩu mới không khớp!");
        const backUrl = req.get("Referrer");
        res.redirect(backUrl);
        return
    }   
    next();
}
module.exports.profile = (req,res,next)=>{
    if(!req.body.fullname){
        req.flash("error","Vui lòng nhập họ và tên!");
        const backUrl = req.get("Referrer");
        res.redirect(backUrl);
        return
    }
    if(!req.body.email){
        req.flash("error","Vui lòng nhập email!");
        const backUrl = req.get("Referrer");
        res.redirect(backUrl);
        return
    }
    if(req.body.email){
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(req.body.email)) {
            req.flash("error", "Email không hợp lệ!");
            const backUrl = req.get("Referrer");
            res.redirect(backUrl);
            return;
        }
    }
    if(!req.body.password){
        req.flash("error","Vui lòng nhập mật khẩu!");
        const backUrl = req.get("Referrer");
        res.redirect(backUrl);
        return
    }
    if(req.body.password.length < 6){
        req.flash("error","Mật khẩu phải có ít nhất 6 ký tự!");
        const backUrl = req.get("Referrer");
        res.redirect(backUrl);
        return
    }
    next();
}