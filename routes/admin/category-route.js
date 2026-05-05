const categoryController = require("../../controllers/admin/category-controller");
const categoryValidate = require("../../validates/admin/product-validate");
const express = require('express')
const multer  = require('multer')
const upload = multer();
const middleware = require("../../middleware/admin/uploadCloud-middleware")
const router = express.Router();
const validateCreate = require("../../validates/admin/product-validate")
router.get('/', categoryController.index);
router.get("/create", categoryController.create)
router.post(
    "/create",
    upload.single('thumbnail'),
    middleware.upload,
    validateCreate.create,
    categoryController.createPost
)
router.patch("/change-status/:status/:id", categoryController.changeStatus);
router.patch("/delete/:id", categoryController.delete)
router.get("/details/:id", categoryController.details)
router.get("/edit/:id", categoryController.edit)
router.patch(
    "/edit/:id", 
    upload.single('thumbnail'), 
    middleware.upload,
    categoryValidate.edit, 
    categoryController.editPatch);
router.patch("/change-multi", categoryController.changeMulti)
router.get("/recycleBin", categoryController.recycleBin)
router.patch("/recycleBin/restore/:id", categoryController.restore)
router.patch("/recycleBin/hard-delete/:id", categoryController.forceDelete)
module.exports = router;