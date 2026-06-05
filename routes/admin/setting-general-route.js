const express = require('express');
const router = express.Router();
const settingGeneralController = require('../../controllers/admin/setting-general-controller');

router.get("/general", settingGeneralController.index)
module.exports = router;