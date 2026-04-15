const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const BoardPostSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    userName: { type: String, required: true },
    petType: { type: String, default: 'Dog' },
    breed: { type: String, default: '' },
    agePreference: { type: String, default: 'Any' },
    gender: { type: String, default: 'Any' },
    location: { type: String, required: true },
    contact: { type: String, required: true },
    email: { type: String, default: '' },
    description: { type: String, required: true },
    urgent: { type: Boolean, default: false },
    image: { type: String, default: '' },
    createdAt: { type: Date, default: Date.now }
});

const BoardPostModel = mongoose.model('BoardPost', BoardPostSchema);
module.exports = BoardPostModel;



