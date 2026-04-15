const router = require('express').Router();
const { getProfile, updateProfile, getPublicProfile } = require('../controllers/UserController');
const ensureAuthenticated = require('../middlewares/Auth');

router.get('/me', ensureAuthenticated, getProfile);
router.patch('/me', ensureAuthenticated, updateProfile);
router.get('/:id', getPublicProfile); // Public profile — no auth required

module.exports = router;



