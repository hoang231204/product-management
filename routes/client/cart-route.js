const cartController = require('../../controllers/client/cart-controller');
const express = require('express');
const router = express.Router();

router.post('/add/:productId',cartController.add);
router.get('/',cartController.index);
router.post('/delete/:productId',cartController.delete);
module.exports = router;