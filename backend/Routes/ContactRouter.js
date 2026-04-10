const router = require('express').Router();
const { submitContact, getContacts, getMyContacts, replyToContact, deleteContact } = require('../controllers/ContactController');
const ensureAuthenticated = require('../middlewares/Auth');
const isAdmin = require('../middlewares/IsAdmin');

router.post('/', submitContact);
router.get('/my-messages', ensureAuthenticated, getMyContacts);
router.get('/', ensureAuthenticated, isAdmin, getContacts);
router.patch('/:id/reply', ensureAuthenticated, isAdmin, replyToContact);
router.delete('/:id', ensureAuthenticated, isAdmin, deleteContact);

module.exports = router;



