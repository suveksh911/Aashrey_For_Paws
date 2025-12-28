const router = require('express').Router();
const { submitContact } = require('../Controllers/ContactController');

router.post('/', submitContact);

module.exports = router;
