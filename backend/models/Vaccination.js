const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const VaccinationSchema = new Schema({
    petId: {
        type: Schema.Types.ObjectId,
        ref: 'Pet',
        required: false,  // Optional — not all pets need to be registered on the platform
        default: null
    },
    petName: {
        type: String,
        required: true
    },
    userId: { // Owner or NGO managing the pet
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    vaccineName: {
        type: String,
        required: true
    },
    vaccinationDate: {
        type: Date,
        required: true
    },
    nextVaccinationDate: {
        type: Date,
        required: true
    },
    notes: {
        type: String,
        default: ''
    },
    status: {
        type: String,
        enum: ['Upcoming', 'Soon', 'Completed'],
        default: 'Upcoming'
    },
    isNotified: {
        type: Boolean,
        default: false
    },
    lastNotifiedLevel: {
        type: String,
        enum: ['None', 'Soon', 'Today', 'Overdue'],
        default: 'None'
    },
    reminderDays: {
        type: Number,
        default: 3
    }
});

const VaccinationModel = mongoose.model('Vaccination', VaccinationSchema);
module.exports = VaccinationModel;



