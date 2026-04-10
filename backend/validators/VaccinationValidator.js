const Joi = require('joi');

const scheduleVaccinationSchema = Joi.object({
    petId: Joi.string().allow('', null),
    petName: Joi.string().trim().required().messages({
        'string.empty': 'Pet name is required'
    }),
    vaccineName: Joi.string().trim().required().messages({
        'string.empty': 'Vaccine name is required'
    }),
    vaccinationDate: Joi.date().required().messages({
        'date.base': 'A valid vaccination date is required'
    }),
    executionDate: Joi.date().allow(null),
    notes: Joi.string().trim().allow('', null).max(500),
    reminderDays: Joi.number().integer().min(0).max(30).default(3)
});

const editVaccinationSchema = Joi.object({
    petName: Joi.string().trim(),
    vaccineName: Joi.string().trim(),
    vaccinationDate: Joi.date(),
    executionDate: Joi.date().allow(null),
    notes: Joi.string().trim().allow('', null).max(500),
    reminderDays: Joi.number().integer().min(0).max(30)
}).min(1); // At least one field should be provided for update

module.exports = {
    scheduleVaccinationSchema,
    editVaccinationSchema
};
