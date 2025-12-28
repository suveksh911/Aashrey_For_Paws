const router = require('express').Router();
const { getAllPets, getPetById, createPet } = require('../Controllers/PetController');

router.get('/', getAllPets);
router.get('/:id', getPetById);
router.post('/', createPet);

module.exports = router;
