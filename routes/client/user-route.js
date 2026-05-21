const userController = require('../../controllers/client/user-controller');
const userValidate = require('../../validates/client/user-validate');
const privateRoute = require('../../middleware/client/private-route');
const express = require('express');
const multer  = require('multer')
const upload = multer();
const mongoose = require('mongoose');
const router = express.Router();
router.get('/register', userController.register);
router.post('/register', userValidate.register, userController.registerPost);
router.get('/login', userController.login);
router.post('/login', userValidate.login, userController.loginPost);
router.get('/logout', userController.logout);
router.get('/password/forgot', userController.forgotPassword);
router.post('/password/forgot', userValidate.forgotPassword, userController.forgotPasswordPost);
router.get('/password/otp', userController.otp);
router.post('/password/otp', userValidate.otp, userController.otpPost);
router.get('/password/reset-password', userController.resetPassword);
router.post('/password/reset-password', userValidate.resetPassword, userController.resetPasswordPost);
router.get('/profile', privateRoute.requireLogin, userController.profile);
router.get('/profile/edit', privateRoute.requireLogin, userController.editProfile);
router.patch(
    '/profile/edit',
    upload.single('avatar'),
    privateRoute.requireLogin, 
    userValidate.profile, 
    userController.editProfilePost
    );
module.exports = router;