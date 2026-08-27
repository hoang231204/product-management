module.exports.create = (req,res,next)=>{
    if(!req.body.fullname){
        req.flash("error","Vui lòng nhập họ và tên!");
        const backUrl = req.get("Referrer");
        res.redirect(backUrl);
        return
    }
    if(typeof req.body.email !== 'string'|| typeof req.body.password !== 'string'){
        req.flash("error", "Email hoặc mật khẩu không hợp lệ!");
        const backUrl = req.get("Referrer");
        res.redirect(backUrl);
        return;
    }
    if(!req.body.email){
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
module.exports.edit = (req,res,next)=>{
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
    next();
}