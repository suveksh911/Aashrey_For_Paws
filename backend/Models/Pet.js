const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const PetSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    age: {
        type: String,
        required: true
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
        enum: ['Adoption', 'Lost', 'Found'],
        default: 'Adoption'
    },
    status: {
        type: String,
        enum: ['Available', 'Adopted', 'Reunited', 'Pending'],
        default: 'Available'
    },
    description: {
        type: String,
        required: true
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
    contactInfo: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const PetModel = mongoose.model('Pet', PetSchema);
module.exports = PetModel;
