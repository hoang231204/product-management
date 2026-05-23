const userController = require('../../controllers/admin/user-controller');
const express = require('express');
const router = express.Router();
router.get('/', userController.index);
module.exports = router;