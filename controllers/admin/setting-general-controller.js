const Setting = require('../../models/setting-model');
const systemConfig = require('../../config/system');
//GET /admin/setting/general
module.exports.index = (req, res) => {
    const permission = res.locals.role.permissions;
    if(!permission.includes('setting_general_view')){
        req.flash('error', 'Bạn không có quyền thực hiện hành động này!');
        return res.redirect(`${systemConfig.prefixAdmin}/dashboard`);
    }
    res.render('admin/pages/setting/general',{
        pageTitle: 'Cài đặt chung',
    });
}
//GET /admin/setting/website-infor
module.exports.websiteInfor = async (req, res) => {
    const permission = res.locals.role.permissions;
    if(!permission.includes('setting_general_view')){
        req.flash('error', 'Bạn không có quyền thực hiện hành động này!');
        return res.redirect(`${systemConfig.prefixAdmin}/dashboard`);
    }
    try{
        const setting = await Setting.findOne();
        res.render('admin/pages/setting/website-infor',{
            pageTitle: 'Thông tin website',
            setting: setting
        });
    }
    catch(err){
        req.flash('error', 'Có lỗi xảy ra, vui lòng thử lại sau!');
        res.redirect(`${systemConfig.prefixAdmin}/setting/website-infor`);
    }
}
//PATCH /admin/setting/website-infor
module.exports.websiteInforPatch = async (req, res) => {
    const permission = res.locals.role.permissions
    if(!permission.includes('setting_general_edit')){
        req.flash('error', 'Bạn không có quyền thực hiện hành động này!');
        return res.redirect(`${systemConfig.prefixAdmin}/setting/website-infor`);
    }
    try{
        await Setting.updateOne(req.body);
        req.flash('success', 'Cập nhật thông tin website thành công!');
        res.redirect(`${systemConfig.prefixAdmin}/setting/website-infor`);
    }
    catch(err){
        req.flash('error', 'Có lỗi xảy ra, vui lòng thử lại sau!');
        res.redirect(`${systemConfig.prefixAdmin}/setting/website-infor`);
    }
}