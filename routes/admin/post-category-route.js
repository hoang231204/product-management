const express = require('express');
const router = express.Router();
const postCategoryController = require('../../controllers/admin/post-category-controller');
router.get("/",postCategoryController.index)
module.exports = router;