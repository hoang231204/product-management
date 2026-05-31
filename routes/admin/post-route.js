const express = require('express');
const router = express.Router();
const postController = require('../../controllers/admin/post-controller');
router.get("/",postController.index)
router.get("/details/:id",postController.details)
router.get("/create",postController.create)
router.post("/create",postController.postCreate)
module.exports = router;