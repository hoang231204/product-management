const categoryController = require("../../controllers/admin/category-controller");
const categoryValidate = require("../../validates/admin/product-validate");
const express = require('express')
const multer  = require('multer')
const upload = multer();
const middleware = require("../../middleware/admin/uploadCloud-middleware")
const router = express.Router();
const validateCreate = require("../../validates/admin/product-validate");
const { route } = require("./account-route");
router.get('/', categoryController.index);
router.get("/create", categoryController.create)
router.post(
    "/create",
    upload.single('thumbnail'),
    validateCreate.create,
    middleware.upload,
    categoryController.createPost
)
router.patch("/change-status/:status/:id", categoryController.changeStatus);
router.patch("/delete/:id", categoryController.delete)
router.get("/details/:id", categoryController.details)
router.get("/edit/:id", categoryController.edit)
router.patch(
    "/edit/:id", 
    upload.single('thumbnail'), 
    categoryValidate.edit,
    middleware.upload,
    categoryController.editPatch);
router.patch("/change-multi", categoryController.changeMulti)
router.get("/recycleBin", categoryController.recycleBin)
router.patch("/recycleBin/restore/:id", categoryController.restore)
router.patch("/change-status/:status/:id", categoryController.changeStatus)
module.exports = router;