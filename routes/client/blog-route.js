const blogController = require('../../controllers/client/blog-controller');
const express = require('express');
const router = express.Router();
router.get('/', blogController.index);
router.get('/details/:slugBlog', blogController.details);
module.exports = router;
