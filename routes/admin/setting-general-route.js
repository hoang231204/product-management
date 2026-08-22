const express = require('express');
const router = express.Router();
const settingGeneralController = require('../../controllers/admin/setting-general-controller');
const multer = require('multer');
const upload = multer();
const middleware = require("../../middleware/admin/uploadCloud-middleware")

router.get("/general", settingGeneralController.index)
router.get("/website-infor", settingGeneralController.websiteInfor)
router.patch(
  "/website-infor",
  upload.fields([
    { name: "logo", maxCount: 1 }, 
    { name: "banner", maxCount: 1 } 
  ]),
  middleware.uploadFields, 
  settingGeneralController.websiteInforPatch
);
module.exports = router;