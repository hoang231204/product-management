const cartController = require('../../controllers/client/cart-controller');
const express = require('express');
const router = express.Router();

router.post('/add/:productId',cartController.add);
module.exports = router;