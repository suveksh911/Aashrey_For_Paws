const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['Adopter', 'NGO', 'Owner'],
        required: true,
        default: 'Adopter'
    }
})

const UserModel = mongoose.model('User', UserSchema);
module.exports = UserModel;