const Account = require('../../models/account-model');
const md5 = require('md5');
//GET /admin/my-profile
module.exports.index = async (req, res) => {
    res.render('admin/pages/profile/index', {
        pageTitle: 'My profile',
    });
}
//GET /admin/my-profile/edit
module.exports.edit = async (req, res) =>{
    res.render('admin/pages/profile/edit', {
        pageTitle: 'Edit profile',
    });
}
//PATCH /admin/my-profile/edit
module.exports.editPatch = async (req, res) =>{
    if(req.body.password){
        req.body.password = md5(req.body.password);
    }
    else{
        delete req.body.password;
    }
    await Account.updateOne({_id: res.locals.user._id}, req.body);
    req.flash('success', 'Cập nhật thông tin thành công!');
    res.redirect(`${systemConfig.prefixAdmin}/my-profile`);
}