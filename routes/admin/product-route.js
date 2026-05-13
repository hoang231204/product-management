const productController = require('../../controllers/admin/product-controller')
const productValidate = require("../../validates/admin/product-validate")
const express = require('express')
const multer  = require('multer')
const upload = multer();
const middleware = require("../../middleware/admin/uploadCloud-middleware")
const router = express.Router();

router.get('/',productController.index);
router.patch('/change-status/:status/:id',productController.changeStatus);
router.patch('/change-multi',productController.changeMulti);
router.patch('/delete/:id',productController.delete)
router.get("/recycle-bin",productController.recycleBin)
router.delete("/recycle-bin/hard-delete/:id",productController.hardDelete)
router.patch("/recycle-bin/restore/:id",productController.restore)
router.get("/create",productController.create)
router.post(
    "/create",
    upload.single('thumbnail'),
    productValidate.create,
    middleware.upload,
    productController.createPost
)
router.get("/edit/:id",productController.edit);
router.patch(
    "/edit/:id",
    upload.single('thumbnail'),
    productValidate.edit,
    middleware.upload,
    productController.editPatch
);
router.get("/details/:id", productController.details);
module.exports = router;