const express = require('express');
const router = express.Router();
const multer  = require('multer')
const upload = multer();
const postCategoryController = require('../../controllers/admin/post-category-controller');
const middleware = require("../../middleware/admin/uploadCloud-middleware")
const postCategoryValidate = require("../../validates/admin/category-validate")
router.get("/",postCategoryController.index)
router.get("/create", postCategoryController.create)
router.post(
    "/create",
    upload.single('thumbnail'),
    postCategoryValidate.create,
    middleware.upload,
    postCategoryController.createPost
)
router.patch("/change-status/:status/:id", postCategoryController.changeStatus);
router.patch("/delete/:id", postCategoryController.delete)
router.get("/details/:id", postCategoryController.details)
router.get("/edit/:id", postCategoryController.edit)
router.patch(
    "/edit/:id", 
    upload.single('thumbnail'), 
    postCategoryValidate.edit,
    middleware.upload,
    postCategoryController.editPatch);
router.patch("/change-multi", postCategoryController.changeMulti)
router.get("/recycle-bin", postCategoryController.recycleBin)
router.patch("/recycle-bin/restore/:id", postCategoryController.restore)
router.delete("/recycle-bin/hard-delete/:id", postCategoryController.hardDelete)
router.patch("/change-status/:status/:id", postCategoryController.changeStatus)
module.exports = router;