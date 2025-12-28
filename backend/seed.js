const mongoose = require('mongoose');
const dotenv = require('dotenv');
const PetModel = require('./Models/Pet');
const PostModel = require('./Models/Post');
require('./Models/db'); // Ensure DB connection is established

dotenv.config();

const samplePets = [
    {
        name: 'Buddy',
        age: '2 years',
        breed: 'Golden Retriever',
        category: 'Dog',
        type: 'Adoption',
        status: 'Available',
        description: 'Buddy is a friendly and energetic Golden Retriever who loves playing fetch and cuddles. He is great with kids and other dogs.',
        image: 'https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=800&q=80',
        images: [
            'https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=800&q=80',
            'https://images.unsplash.com/photo-1629740032636-2f618a81639d?auto=format&fit=crop&w=800&q=80',
            'https://images.unsplash.com/photo-1587300003388-59208cc962cb?auto=format&fit=crop&w=800&q=80'
        ],
        location: 'Lalitpur, Nepal',
        contactInfo: 'adoption@aashrey.org'
    },
    {
        name: 'Misty',
        age: '1 year',
        breed: 'Persian',
        category: 'Cat',
        type: 'Adoption',
        status: 'Available',
        description: 'Misty is a calm and affectionate Persian cat. She loves napping in sunny spots and being groomed.',
        image: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=800&q=80',
        images: [
            'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=800&q=80',
            'https://images.unsplash.com/photo-1573865526739-10659fec78a5?auto=format&fit=crop&w=800&q=80'
        ],
        location: 'Kathmandu, Nepal',
        contactInfo: 'adoption@aashrey.org'
    },
    {
        name: 'Rocky',
        age: '3 years',
        breed: 'German Shepherd',
        category: 'Dog',
        type: 'Adoption',
        status: 'Available',
        description: 'Rocky is a loyal and protective companion. He needs an experienced owner who can provide plenty of exercise.',
        image: 'https://images.unsplash.com/photo-1589941013453-ec89f33b5e95?auto=format&fit=crop&w=800&q=80',
        images: [
            'https://images.unsplash.com/photo-1589941013453-ec89f33b5e95?auto=format&fit=crop&w=800&q=80'
        ],
        location: 'Bhaktapur, Nepal',
        contactInfo: 'adoption@aashrey.org'
    },
    {
        name: 'Luna',
        age: '6 months',
        breed: 'Labrador Mix',
        category: 'Dog',
        type: 'Lost',
        status: 'Pending',
        description: 'Luna went missing near Thamel. She has a red collar. Please help us find her!',
        image: 'https://images.unsplash.com/photo-1591769225440-811ad7d6eca6?auto=format&fit=crop&w=800&q=80',
        images: ['https://images.unsplash.com/photo-1591769225440-811ad7d6eca6?auto=format&fit=crop&w=800&q=80'],
        location: 'Thamel, Kathmandu',
        contactInfo: '9800000000'
    }
];

const samplePosts = [
    {
        title: 'Tips for First-Time Dog Owners',
        content: 'Adopting a dog is a big responsibility. Here are some tips: 1. Set a routine. 2. Be patient. 3. Socialize early. Share your own tips below!',
        author: 'Admin',
        image: 'https://images.unsplash.com/photo-1581888227599-77981198520d?auto=format&fit=crop&w=800&q=80'
    },
    {
        title: 'Success Story: Finding Max',
        content: 'Thanks to this community, we found our lost beagle, Max, within 24 hours! The "Lost & Found" section really works. Thank you all!',
        author: 'Sarah J.',
        image: 'https://images.unsplash.com/photo-1537151608828-ea2b11777ee8?auto=format&fit=crop&w=800&q=80'
    }
];

const seedDB = async () => {
    try {
        await mongoose.connection.asPromise(); // Wait for connection
        console.log('Connected to DB for seeding...');

        // Clear existing data (Optional: comment out if you want to append)
        await PetModel.deleteMany({});
        await PostModel.deleteMany({});
        console.log('Cleared existing Pets and Posts.');

        // Insert new data
        await PetModel.insertMany(samplePets);
        await PostModel.insertMany(samplePosts);

        console.log('Database seeded successfully!');
        process.exit(0);
    } catch (err) {
        console.error('Error seeding database:', err);
        process.exit(1);
    }
};

seedDB();
