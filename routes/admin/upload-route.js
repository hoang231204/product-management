const uploadController = require('../../controllers/admin/upload-controller');
const express = require('express');
const router = express.Router();
const multer  = require('multer')
const upload = multer();
const uploadMiddleware = require("../../middleware/admin/uploadCloud-middleware")

router.post('/', upload.single('file'), uploadMiddleware.upload, uploadController.index);
module.exports = router;