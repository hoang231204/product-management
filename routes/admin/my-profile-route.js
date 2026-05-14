const myProfileController = require('../../controllers/admin/my-profile-controller');
const express = require('express');
const router = express.Router();
const multer  = require('multer')
const upload = multer();
const middleware = require("../../middleware/admin/uploadCloud-middleware")
const validate = require("../../validates/admin/account-validate")

router.get('/', myProfileController.index);
router.get('/edit', myProfileController.edit);
router.patch('/edit', upload.single('avatar'), validate.edit, middleware.upload, myProfileController.editPatch);
module.exports = router;