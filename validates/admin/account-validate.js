module.exports.create = (req,res,next)=>{
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