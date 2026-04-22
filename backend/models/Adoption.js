const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const AdoptionSchema = new Schema({
    petId: {
        type: Schema.Types.ObjectId,
        ref: 'Pet',
        required: true
    },
    petName: { // Stored for easier display in tables
        type: String,
        required: true
    },
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    userName: { 
        type: String,
        required: true
    },
    ownerId: { 
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    status: {
        type: String,
        enum: ['Pending', 'Approved', 'Rejected', 'Adopted'],
        default: 'Pending'
    },
    reason: {
        type: String,
        required: true
    },
    phone: {
        type: String
    },
    date: {
        type: Date,
        default: Date.now
    }
});

const AdoptionModel = mongoose.model('Adoption', AdoptionSchema);
module.exports = AdoptionModel;



