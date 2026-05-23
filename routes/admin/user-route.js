const userController = require('../../controllers/admin/user-controller');
const express = require('express');
const router = express.Router();
router.get('/', userController.index);
router.get('/details/:id', userController.details);
module.exports = router;