const express = require('express');
const router = express.Router();
const postController = require('../../controllers/admin/post-controller');
router.get("/",postController.index)
router.get("/details/:id",postController.details)
module.exports = router;