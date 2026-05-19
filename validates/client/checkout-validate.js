module.exports.checkout = (req,res,next)=>{
    if(!req.body.fullname){
        req.flash("error","Vui lòng nhập họ và tên!");
        const backUrl = req.get("Referrer");
        res.redirect(backUrl);
        return
    }
    if(!req.body.phone){
        req.flash("error","Vui lòng nhập số điện thoại!");
        const backUrl = req.get("Referrer");  
        res.redirect(backUrl);
        return
    }
    if(!req.body.address){
        req.flash("error","Vui lòng nhập địa chỉ!");
        const backUrl = req.get("Referrer"); 
        res.redirect(backUrl);
        return
    }
    next();
}