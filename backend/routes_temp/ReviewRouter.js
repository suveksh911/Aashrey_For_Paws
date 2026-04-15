const router = require('express').Router();
const { getReviewsByNgo, getLatestReviews, createReview, deleteReview } = require('../controllers/ReviewController');
const ensureAuthenticated = require('../middlewares/Auth');

// Public: get reviews
router.get('/latest', getLatestReviews);
router.get('/ngo/:ngoId', getReviewsByNgo);

// Auth required: submit or delete
router.post('/', ensureAuthenticated, createReview);
router.delete('/:id', ensureAuthenticated, deleteReview);

module.exports = router;



