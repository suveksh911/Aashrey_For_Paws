const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ContactSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: false
    },
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    subject: {
        type: String,
        default: ''
    },
    message: {
        type: String,
        required: true
    },
    isReplied: {
        type: Boolean,
        default: false
    },
    replies: [{
        senderId: { type: Schema.Types.ObjectId, ref: 'User' },
        senderRole: { type: String, enum: ['Admin', 'User'], default: 'Admin' },
        message: String,
        createdAt: { type: Date, default: Date.now }
    }],
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const ContactModel = mongoose.model('Contact', ContactSchema);
module.exports = ContactModel;



