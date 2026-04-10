const router = require('express').Router();
const {
    getMyVaccinations,
    markVaccinationAsCompleted,
    addVaccinationSchedule,
    checkAndNotify,
    editVaccination,
    deleteVaccination
} = require('../controllers/VaccinationController');
const ensureAuthenticated = require('../middlewares/Auth');
const validate = require('../middlewares/validate');
const { 
    scheduleVaccinationSchema, 
    editVaccinationSchema 
} = require('../validators/VaccinationValidator');

// Health record routes
router.get('/my-vaccines', ensureAuthenticated, getMyVaccinations);
router.post('/add', ensureAuthenticated, validate(scheduleVaccinationSchema), addVaccinationSchedule);
router.post('/check-reminders', ensureAuthenticated, checkAndNotify);
router.patch('/:id/complete', ensureAuthenticated, markVaccinationAsCompleted);
router.put('/:id', ensureAuthenticated, validate(editVaccinationSchema), editVaccination);
router.delete('/:id', ensureAuthenticated, deleteVaccination);

module.exports = router;
