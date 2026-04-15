const router = require('express').Router();
const { getSettings, updateSettings } = require('../controllers/SettingController');
const Auth = require('../middlewares/Auth');
const IsAdmin = require('../middlewares/IsAdmin');

router.get('/', getSettings);
router.put('/', Auth, IsAdmin, updateSettings);

module.exports = router;
