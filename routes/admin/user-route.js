const userController = require('../../controllers/admin/user-controller');
const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer();
router.get('/', userController.index);
router.get('/details/:id', userController.details);
router.patch('/change-status/:status/:id', userController.changeStatus);
router.patch('/delete/:id',userController.delete);
router.get('/edit/:id', userController.edit);
router.patch(
    '/edit/:id',
    upload.single('avatar'),
    userController.editPatch
);
router.get('/create', userController.create);
module.exports = router;