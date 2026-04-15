const router = require('express').Router();
const { 
    getAllPosts, createPost, deletePost, toggleLike, addComment, deleteComment, editComment,
    toggleCommentLike, addCommentReply, toggleReplyLike, deleteCommentReply 
} = require('../controllers/PostController');
const ensureAuthenticated = require('../middlewares/Auth');

router.get('/', getAllPosts);                                                       // public
router.post('/', ensureAuthenticated, createPost);                                 // auth
router.delete('/:id', ensureAuthenticated, deletePost);                            // auth + owner
router.post('/:id/like', ensureAuthenticated, toggleLike);                         // auth
router.post('/:id/comment', ensureAuthenticated, addComment);                      // auth
router.delete('/:id/comment/:commentId', ensureAuthenticated, deleteComment);      // auth + owner
router.put('/:id/comment/:commentId', ensureAuthenticated, editComment);           // auth + owner

router.post('/:id/comment/:commentId/like', ensureAuthenticated, toggleCommentLike);   // auth
router.post('/:id/comment/:commentId/reply', ensureAuthenticated, addCommentReply);   // auth
router.post('/:id/comment/:commentId/reply/:replyId/like', ensureAuthenticated, toggleReplyLike); // auth
router.delete('/:id/comment/:commentId/reply/:replyId', ensureAuthenticated, deleteCommentReply); // auth + owner

module.exports = router;



