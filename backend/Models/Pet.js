const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const PetSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    age: {
        type: String,
        default: 'Unknown'
    },
    breed: {
        type: String,
        required: true
    },
    category: {
        type: String, // 'Dog', 'Cat', etc.
        required: true
    },
    type: {
        type: String,
        enum: ['Adoption', 'Lost', 'Found', 'Rehoming', 'Sale'],
        default: 'Adoption'
    },
    gender: {
        type: String,
        enum: ['Male', 'Female', 'Unknown'],
        default: 'Unknown'
    },
    healthStatus: {
        type: String,
        default: 'Healthy'
    },
    urgent: {
        type: Boolean,
        default: false
    },
    personalities: {
        type: [String],
        default: []
    },
    ownerId: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    owner: { // Display name of the owner/NGO
        type: String
    },
    status: {
        type: String,
        enum: ['Available', 'Adopted', 'Reunited', 'Pending'],
        default: 'Available'
    },
    listingType: {
        type: String,
        enum: ['Adoption', 'Rehoming', 'Sale'],
        default: 'Adoption'
    },
    price: {
        type: Number,
        default: 0
    },
    quantity: {
        type: Number,
        default: 1,
        min: 0
    },
    quantity: {
        type: Number,
        default: 1,
        min: 0
    },
    paymentDetails: {
        type: String,
        default: ''
    },
    vaccinated: {
        type: Boolean,
        default: false
    },
    description: {
        type: String,
        default: ''
    },
    images: {
        type: [String], // Array of URLs
        default: ['https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=800&q=80']
    },
    image: { // Main display image (kept for easier frontend access if needed, or derived from images[0])
        type: String,
        default: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=800&q=80'
    },
    location: {
        type: String,
        required: true
    },
    lat: {
        type: Number,
        default: null
    },
    lng: {
        type: Number,
        default: null
    },
    contactInfo: {
        type: String
    },
    isApproved: {
        type: Boolean,
        default: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const PetModel = mongoose.model('Pet', PetSchema);
module.exports = PetModel;



