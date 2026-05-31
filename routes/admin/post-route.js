const express = require('express');
const router = express.Router();
const postController = require('../../controllers/admin/post-controller');
const multer  = require('multer')
const upload = multer();
const middleware = require("../../middleware/admin/uploadCloud-middleware")
const router = express.Router();
router.get("/",postController.index)
router.get("/details/:id",postController.details)
router.get("/create",postController.create)
router.post(
    "/create",
    upload.single('thumbnail'),
    middleware.upload,
    postController.postCreate
);
router.get("/edit/:id",postController.edit)
router.patch(
    "/edit/:id",
    upload.single('thumbnail'),
    middleware.upload,
    postController.editPatch
)
router.patch("/change-status/:status/:id",postController.changeStatus)
router.patch("/delete/:id",postController.delete)
module.exports = router;