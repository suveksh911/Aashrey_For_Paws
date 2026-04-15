const router = require('express').Router();
const { verifyKhaltiPayment, initiatePayment } = require('../controllers/PaymentController');
const ensureAuthenticated = require('../middlewares/Auth');

router.post('/initiate', ensureAuthenticated, initiatePayment);
router.post('/verify', ensureAuthenticated, verifyKhaltiPayment);

module.exports = router;



