const User = require('../../models/user-model');
module.exports.index = async(req, res) =>{
    const users = await User.find({deleted: false});
    res.render('admin/pages/user/index',{
        pageTitle: "Quản lý người dùng",
        users: users
    })
}