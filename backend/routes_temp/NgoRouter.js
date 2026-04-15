const router = require('express').Router();
const { getVerificationStatus, uploadDocuments } = require('../controllers/NgoController');
const ensureAuthenticated = require('../middlewares/Auth');

// All NGO routes require auth
router.get('/verification-status', ensureAuthenticated, getVerificationStatus);
router.post('/upload-documents', ensureAuthenticated, uploadDocuments);

module.exports = router;



