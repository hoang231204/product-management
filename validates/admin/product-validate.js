module.exports.create = (req,res,next)=>{
    if(!req.body.title){
        req.flash("error","Vui lòng nhập tiêu đề sản phẩm!");
        const backUrl = req.get("Referrer");
        res.redirect(backUrl);
        return
    }
    next();
}
module.exports.edit = (req,res,next)=>{
    if(!req.body.title){
        req.flash("error","Vui lòng nhập tiêu đề sản phẩm!");
        const backUrl = req.get("Referrer");
        res.redirect(backUrl);
        return
    } 
    next();
}