const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CampaignSchema = new Schema({
    ngoId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    ngoName: {
        type: String,
        required: true
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        default: ''
    },
    image: {
        type: String,
        default: ''
    },
    targetAmount: {
        type: Number,
        required: true
    },
    raisedAmount: {
        type: Number,
        default: 0
    },
    deadline: {
        type: Date,
        required: true
    },
    status: {
        type: String,
        enum: ['Active', 'Completed', 'Cancelled'],
        default: 'Active'
    },
    paymentDetails: {
        bankName: { type: String, default: '' },
        accountName: { type: String, default: '' },
        accountNumber: { type: String, default: '' },
        khaltiId: { type: String, default: '' }
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const CampaignModel = mongoose.model('Campaign', CampaignSchema);
module.exports = CampaignModel;



