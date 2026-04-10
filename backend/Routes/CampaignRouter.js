const router = require('express').Router();
const { getAllCampaigns, getMyCampaigns, createCampaign, deleteCampaign } = require('../controllers/CampaignController');
const ensureAuthenticated = require('../middlewares/Auth');

// Public: get all active campaigns
router.get('/', getAllCampaigns);

// Auth required
router.get('/mine', ensureAuthenticated, getMyCampaigns);
router.post('/', ensureAuthenticated, createCampaign);
router.delete('/:id', ensureAuthenticated, deleteCampaign);

module.exports = router;



