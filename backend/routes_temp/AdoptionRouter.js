const router = require('express').Router();
const {
    createAdoptionRequest,
    getMyAdoptionRequests,
    getIncomingAdoptionRequests,
    updateAdoptionStatus,
    deleteAdoptionRequest
} = require('../controllers/AdoptionController');
const ensureAuthenticated = require('../middlewares/Auth');

router.post('/', ensureAuthenticated, createAdoptionRequest);
router.get('/my-requests', ensureAuthenticated, getMyAdoptionRequests);
router.get('/mine', ensureAuthenticated, getMyAdoptionRequests);  // alias
router.get('/my', ensureAuthenticated, getMyAdoptionRequests);    // alias
router.get('/incoming', ensureAuthenticated, getIncomingAdoptionRequests);
router.patch('/:id/status', ensureAuthenticated, updateAdoptionStatus);
router.delete('/:id', ensureAuthenticated, deleteAdoptionRequest);

module.exports = router;




