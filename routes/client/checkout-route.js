const checkoutController = require('../../controllers/client/checkout-controller');
const checkoutValidate = require('../../validates/client/checkout-validate');
const express = require('express');
const router = express.Router();
router.get('/', checkoutController.checkout);
router.post('/', checkoutValidate.checkout, checkoutController.checkoutPost);
router.get('/vnpay_return', checkoutController.vnpayReturn);
router.get("/success/:id", checkoutController.success);
module.exports = router;