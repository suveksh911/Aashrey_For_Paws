const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = new Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true, select: false },
    role: {
        type: String,
        enum: ['Adopter', 'NGO', 'Owner', 'Admin'],
        required: true,
        default: 'Adopter'
    },
    phone: { type: String, default: '' },
    address: { type: String, default: '' },
    bio: { type: String, default: '' },
    profileImage: { type: String, default: '' },
    lat: { type: Number, default: null },
    lng: { type: Number, default: null },
    petType: { type: String, default: '' },
    experience: { type: String, default: '' },
    status: {
        type: String,
        enum: ['active', 'suspended'],
        default: 'active'
    },
    ngoStatus: {
        type: String,
        enum: ['pending', 'verified', 'rejected', 'none'],
        default: 'none'
    },
    otp: { 
        type: String, 
        select: false 
    },
    otpExpires: { 
        type: Date 
    },
    isVerified: { 
        type: Boolean, 
        default: false 
    },
    orgName: { type: String, default: '' },
    registrationNo: { type: String, default: '' },
    website: { type: String, default: '' },
    mission: { type: String, default: '' },
    avgRating: { type: Number, default: 0 },
    reviewCount: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now }
});

// Hash password before saving
UserSchema.pre('save', async function() {
    if (!this.isModified('password')) {
        return;
    }
    const bcrypt = require('bcrypt');
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// Match user entered password to hashed password in database
UserSchema.methods.matchPassword = async function(enteredPassword) {
    const bcrypt = require('bcrypt');
    return await bcrypt.compare(enteredPassword, this.password);
};

const UserModel = mongoose.model('User', UserSchema);
module.exports = UserModel;


