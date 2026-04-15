const productController = require('../../controllers/admin/product-controller')
const productValidate = require("../../validates/admin/product-validate")
const express = require('express')
const multer  = require('multer')
const storageMulti = require('../../helpers/storeMulti')
const upload = multer({ storage: storageMulti() })
const router = express.Router();

router.get('/',productController.index);
router.patch('/change-status/:status/:id',productController.changeStatus);
router.patch('/change-multi',productController.changeMulti);
router.delete('/delete/:id',productController.delete)
router.get("/recycleBin",productController.recycleBin)
    router.delete("/recycleBin/hardDelete/:id",productController.hardDelete)
    router.patch("/recycleBin/restore/:id",productController.restore)
router.get("/create",productController.create)
router.post("/create",upload.single('thumbnail'),productValidate.create,productController.createPost)
router.get("/edit/:id",productController.edit);
router.patch("/edit/:id",upload.single('thumbnail'),productValidate.edit,productController.editPost);
router.get("/details/:id", productController.details);
module.exports = router;