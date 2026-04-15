const router = require('express').Router();
const { getAllFeedback, createFeedback, updateFeedback, deleteFeedback } = require('../controllers/FeedbackController');
const ensureAuthenticated = require('../middlewares/Auth');

// Public route
router.get('/', getAllFeedback);

// Auth required routes
router.post('/', ensureAuthenticated, createFeedback);
router.put('/:id', ensureAuthenticated, updateFeedback);
router.delete('/:id', ensureAuthenticated, deleteFeedback);

module.exports = router;



