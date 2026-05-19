const cartController = require('../../controllers/client/cart-controller');
const express = require('express');
const router = express.Router();

router.post('/add/:productId',cartController.add);
router.get('/',cartController.index);
router.get('/delete/:productId',cartController.delete);
router.get('/update/:productId',cartController.update);
module.exports = router;