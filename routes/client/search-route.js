const searchController = require('../../controllers/client/search-controller');
const express = require('express');
const router = express.Router();
router.get('/', searchController.index);
module.exports = router;