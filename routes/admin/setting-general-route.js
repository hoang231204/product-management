const express = require('express');
const router = express.Router();
const settingGeneralController = require('../../controllers/admin/setting-general-controller');

router.get("/general", settingGeneralController.index)
router.get("/website-infor", settingGeneralController.websiteInfor)
router.patch("/website-infor", settingGeneralController.websiteInforPatch)
module.exports = router;