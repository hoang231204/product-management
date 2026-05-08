const accountController = require('../../controllers/admin/account-controller');
const accountValidate = require('../../validates/admin/account-validate');
const accountMiddleware = require('../../middleware/admin/uploadCloud-middleware');
const express = require('express');
const multer = require('multer');
const upload = multer();
const router = express.Router();
router.get("/", accountController.index);
router.get("/create", accountController.create);
router.post(
    "/create", 
    upload.single('avatar'),
    accountValidate.create,
    accountMiddleware.upload,
    accountController.createPost
);
router.get("/details/:id", accountController.details);
router.get("/edit/:id", accountController.edit);
router.patch(
    "/edit/:id",
    upload.single('avatar'),
    accountValidate.edit,
    accountMiddleware.upload,
    accountController.editPatch
);
router.patch("/delete/:id", accountController.delete);
router.patch("/change-status/:status/:id", accountController.changeStatus);
module.exports = router;