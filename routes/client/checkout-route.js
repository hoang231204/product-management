const checkoutController = require('../../controllers/client/checkout-controller');
const checkoutValidate = require('../../validates/client/checkout-validate');
const express = require('express');
const router = express.Router();
router.get('/', checkoutController.index);
router.post('/order', checkoutValidate.checkout, checkoutController.order);
router.get('/success/:id', checkoutController.success);
module.exports = router;