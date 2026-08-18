const express = require('express')
const router = express.Router();
const controller = require("../../controllers/client/product-controller")

router.get('/', controller.index)
router.get('/details/:slugProduct', controller.details);
router.get('/:slugCategory', controller.category)

module.exports = router;