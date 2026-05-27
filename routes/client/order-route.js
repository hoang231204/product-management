const orderController = require('../../controllers/client/order-controller');
const express = require('express');
const router = express.Router();
router.get('/', orderController.index);
module.exports = router;