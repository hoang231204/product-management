const Setting = require('../../models/setting-model');
module.exports = async (req, res, next) => {
    const websiteInfor = await Setting.findOne();
    if (websiteInfor) {
        res.locals.websiteInfor = websiteInfor;
    }
    next();
}
