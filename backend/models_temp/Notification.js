const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const NotificationSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    type: {
        type: String,
        enum: ['info', 'success', 'alert', 'warning'],
        default: 'info'
    },
    message: { type: String, required: true },
    read: { type: Boolean, default: false },
    link: { type: String, default: '' }, // optional deep-link e.g. /pet/123
    createdAt: { type: Date, default: Date.now }
});

const NotificationModel = mongoose.model('Notification', NotificationSchema);
module.exports = NotificationModel;



