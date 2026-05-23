const User = require('../../models/user-model');
module.exports.index = async(req, res) =>{
    const users = await User.find({deleted: false});
    res.render('admin/pages/user/index',{
        pageTitle: "Quản lý người dùng",
        users: users
    })
}
module.exports.details = async(req, res) =>{
    const id = req.params.id;
    const user = await User.findOne({_id: id, deleted: false});
    if(!user){
        req.flash('error', 'Không tìm thấy người dùng');
        return res.redirect('/admin/users');
    }
    res.render('admin/pages/user/details',{
        pageTitle: "Chi tiết người dùng",
        user: user
    })
}
module.exports.delete = async(req, res) =>{
    const id = req.params.id;
    const user = await User.findOne({_id: id, deleted: false});
    if(!user){
        req.flash('error', 'Không tìm thấy người dùng');
        return res.redirect('/admin/users');
    }
    user.deleted = true;
    await user.save();
    req.flash('success', 'Xóa người dùng thành công');
    return res.redirect('/admin/users');
}