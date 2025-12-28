const router = require('express').Router();
const { getAllPosts, createPost } = require('../Controllers/PostController');

router.get('/', getAllPosts);
router.post('/', createPost);

module.exports = router;
