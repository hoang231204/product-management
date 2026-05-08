const authController = require('../../controllers/admin/auth-controller');
const authValidate= require('../../validates/admin/auth-validate');
const express = require('express');
const router = express.Router();
router.get("/login",authController.login)
router.post("/login",authValidate.login,authController.loginPost)
router.get("/logout",authController.logout)
module.exports = router