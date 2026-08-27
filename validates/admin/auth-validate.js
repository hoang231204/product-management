module.exports.login = (req,res,next)=>{
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