const Setting = require('../../models/setting-model');
const cacheService = require('../../helpers/cache-service');

module.exports = async (req, res, next) => {
    try {
        // Cache thông tin website — rất ít thay đổi, TTL 30 phút
        const websiteInfor = await cacheService.getOrSet(
            "settings:website",
            1800,
            async () => {
                return await Setting.findOne().lean();
            }
        );
        if (websiteInfor) {
            res.locals.websiteInfor = websiteInfor;
        }
        next();
    } catch (error) {
        // Fallback
        const websiteInfor = await Setting.findOne();
        if (websiteInfor) {
            res.locals.websiteInfor = websiteInfor;
        }
        next();
    }
}
