const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const NgoApplicationSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    orgName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true
    },
    registrationNo: {
        type: String,
        required: true
    },
    address: {
        type: String,
        required: true
    },
    mission: {
        type: String
    },
    documentImage: {
        type: String,
        default: ''
    },
    status: {
        type: String,
        enum: ['Pending', 'Approved', 'Rejected'],
        default: 'Pending'
    },
    rejectReason: {
        type: String,
        default: ''
    },
    submittedAt: {
        type: Date,
        default: Date.now
    }
});

const NgoApplicationModel = mongoose.model('NgoApplication', NgoApplicationSchema);
module.exports = NgoApplicationModel;



