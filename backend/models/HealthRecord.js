const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const HealthRecordSchema = new Schema({
    petId: {
        type: Schema.Types.ObjectId,
        ref: 'Pet',
        required: true
    },
    recordType: {
        type: String,
        enum: ['Vaccination', 'Treatment', 'Checkup', 'Surgery'],
        required: true
    },
    date: {
        type: String, // YYYY-MM-DD
        required: true
    },
    description: {
        type: String,
        required: true
    },
    nextDueDate: {
        type: String, // YYYY-MM-DD
        default: ''
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const HealthRecordModel = mongoose.model('HealthRecord', HealthRecordSchema);
module.exports = HealthRecordModel;



