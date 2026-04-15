const router = require('express').Router();
const { 
    getAllPets, getPetById, createPet, getMyPets, updatePet, deletePet, approvePet, rejectPet,
    getHealthRecords, addHealthRecord, deleteHealthRecord
} = require('../controllers/PetController');
const ensureAuthenticated = require('../middlewares/Auth');

router.get('/', getAllPets);
router.get('/my-pets', ensureAuthenticated, getMyPets);
router.get('/:id', getPetById);
router.post('/', ensureAuthenticated, createPet);
router.put('/:id', ensureAuthenticated, updatePet);
router.delete('/:id', ensureAuthenticated, deletePet);

// Health Records
router.get('/:id/health-records', getHealthRecords);
router.post('/:id/health-records', ensureAuthenticated, addHealthRecord);
router.delete('/:id/health-records/:recordId', ensureAuthenticated, deleteHealthRecord);

// Admin approval routes
router.patch('/:id/approve', ensureAuthenticated, approvePet);
router.delete('/:id/reject', ensureAuthenticated, rejectPet);

module.exports = router;



