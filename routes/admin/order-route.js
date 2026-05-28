const orderController = require('../../controllers/admin/order-controller');
const express = require('express');
const router = express.Router();
router.get('/', orderController.index);
module.exports = router;