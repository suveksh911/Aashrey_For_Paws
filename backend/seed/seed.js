require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const PetModel = require('../models/Pet');
const PostModel = require('../models/Post');
const UserModel = require('../models/User');
const CampaignModel = require('../models/Campaign');

// Connect directly with longer timeouts for running from terminal
mongoose.connect(process.env.MONGO_CONN, {
    serverSelectionTimeoutMS: 30000,
    connectTimeoutMS: 30000,
    socketTimeoutMS: 60000,
}).then(() => console.log('Connected to MongoDB for seeding...'))
  .catch(err => { console.error('DB connection error:', err.message); process.exit(1); });

// ── Real Nepal NGO Users ─────────────────────────────────────
const ngoUsers = [
    {
        name: "Sneha's Care",
        email: 'info@snehacare.com',
        password: 'ngo1234',
        role: 'NGO',
        phone: '9841333333',
        address: 'Bhaisepati, Lalitpur',
        isVerified: true,
        orgName: "Sneha's Care",
        registrationNo: 'NGO-NP-2014',
        mission: 'To provide a safe haven for injured and abandoned animals and promote animal welfare in Nepal.'
    },
    {
        name: 'KAT Centre (Kathmandu Animal Treatment)',
        email: 'kat@katcentre.com',
        password: 'ngo1234',
        role: 'NGO',
        phone: '9841222222',
        address: 'Budhanilkantha, Kathmandu',
        isVerified: true,
        orgName: 'KAT Centre',
        registrationNo: 'NGO-NP-2004',
        mission: 'Ending the suffering of street dogs in Kathmandu and protecting the public from rabies.'
    },
    {
        name: 'Animal Nepal',
        email: 'info@animalnepal.org.np',
        password: 'ngo1234',
        role: 'NGO',
        phone: '9841111111',
        address: 'Dhobighat, Lalitpur',
        isVerified: true,
        orgName: 'Animal Nepal',
        registrationNo: 'NGO-NP-2003',
        mission: 'Improving the welfare of working equines and companion animals through rescue and community education.'
    },
    {
        name: 'Street Dog Care',
        email: 'info@streetdogcare.org',
        password: 'ngo1234',
        role: 'NGO',
        phone: '9841444444',
        address: 'Boudha, Kathmandu',
        isVerified: true,
        orgName: 'Street Dog Care',
        registrationNo: 'NGO-NP-2007',
        mission: 'Providing medical care and love to street dogs in the Boudha area and beyond.'
    }
];

// ── Pet Listings ─────────────────────────────────────────────
const samplePets = [
    {
        name: 'Buddy', age: '2 years', breed: 'Golden Retriever', category: 'Dog',
        type: 'Adoption', status: 'Available', isApproved: true,
        description: 'Buddy is a friendly and energetic Golden Retriever who loves playing fetch and cuddles.',
        image: 'https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=800&q=80',
        images: ['https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=800&q=80'],
        location: 'Lalitpur, Nepal', contactInfo: 'info@snehacare.com',
        owner: "Sneha's Care", gender: 'Male', healthStatus: 'Healthy', vaccinated: true
    },
    {
        name: 'Misty', age: '1 year', breed: 'Persian', category: 'Cat',
        type: 'Adoption', status: 'Available', isApproved: true,
        description: 'Misty is a calm and affectionate Persian cat. She loves napping in sunny spots.',
        image: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=800&q=80',
        images: ['https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=800&q=80'],
        location: 'Kathmandu, Nepal', contactInfo: 'kat@katcentre.com',
        owner: 'KAT Centre', gender: 'Female', healthStatus: 'Healthy', vaccinated: true
    },
    {
        name: 'Rocky', age: '3 years', breed: 'German Shepherd', category: 'Dog',
        type: 'Adoption', status: 'Available', isApproved: true,
        description: 'Rocky is a loyal and protective companion. He needs an experienced owner.',
        image: 'https://images.unsplash.com/photo-1589941013453-ec89f33b5e95?auto=format&fit=crop&w=800&q=80',
        images: ['https://images.unsplash.com/photo-1589941013453-ec89f33b5e95?auto=format&fit=crop&w=800&q=80'],
        location: 'Bhaktapur, Nepal', contactInfo: 'info@streetdogcare.org',
        owner: 'Street Dog Care', gender: 'Male', healthStatus: 'Healthy', vaccinated: false
    },
    {
        name: 'Luna', age: '6 months', breed: 'Labrador Mix', category: 'Dog',
        type: 'Lost', status: 'Pending', isApproved: true,
        description: 'Luna went missing near Thamel. She has a red collar. Please help us find her!',
        image: 'https://images.unsplash.com/photo-1591769225440-811ad7d6eca6?auto=format&fit=crop&w=800&q=80',
        images: ['https://images.unsplash.com/photo-1591769225440-811ad7d6eca6?auto=format&fit=crop&w=800&q=80'],
        location: 'Thamel, Kathmandu', contactInfo: '9841000000',
        owner: 'Community Rescue', gender: 'Female', healthStatus: 'Healthy'
    }
];

// ── Blog Posts ───────────────────────────────────────────────
const samplePosts = [
    {
        title: 'Tips for First-Time Dog Owners',
        content: 'Adopting a dog is a big responsibility. Set a routine, be patient, and socialize early.',
        author: "Sneha's Care",
        image: 'https://images.unsplash.com/photo-1581888227599-77981198520d?auto=format&fit=crop&w=800&q=80',
        category: 'Advice'
    }
];

const seedDB = async () => {
    try {
        await mongoose.connection.asPromise();
        console.log('Connected to DB for seeding...');

        // Clear existing data
        await PetModel.deleteMany({});
        await PostModel.deleteMany({});
        await CampaignModel.deleteMany({});
        // Remove only previous seeded NGO accounts
        await UserModel.deleteMany({ role: 'NGO', email: { $regex: /(@snehacare\.com|@katcentre\.com|@animalnepal\.org\.np|@streetdogcare\.org)$/ } });
        console.log('Cleared existing data.');

        // Seed NGO users
        const createdNGOs = [];
        for (const ngo of ngoUsers) {
            const hashed = await bcrypt.hash(ngo.password, 10);
            const u = new UserModel({ ...ngo, password: hashed });
            const saved = await u.save();
            createdNGOs.push(saved);
            console.log(`Created NGO: ${ngo.name}`);
        }

        // Seed pets
        const petsToInsert = samplePets.map((pet, i) => ({
            ...pet,
            ownerId: createdNGOs[i % createdNGOs.length]._id
        }));
        await PetModel.insertMany(petsToInsert);
        console.log(`Seeded ${petsToInsert.length} pets.`);

        // Seed campaigns
        const campaigns = [
            {
                ngoId: createdNGOs[0]._id,
                ngoName: createdNGOs[0].name,
                isVerified: true,
                title: 'Medical Fund for Sneha Rescue Animal',
                description: 'Support our sanctuary with food and medical supplies for rescued dogs.',
                targetAmount: 500000,
                raisedAmount: 125000,
                deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                image: 'https://www.snehacare.org/wp-content/uploads/2022/09/advocacy-2.jpg',
                status: 'Active'
            },
            {
                ngoId: createdNGOs[1]._id,
                ngoName: createdNGOs[1].name,
                isVerified: true,
                title: 'KAT Centre Rabies Vaccination Drive',
                description: 'Our goal is to vaccinate 1000 street dogs in Kathmandu to prevent Rabies.',
                targetAmount: 200000,
                raisedAmount: 55000,
                deadline: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
                image: 'https://images.unsplash.com/photo-1612531823729-f44cc7a2ef1f?auto=format&fit=crop&w=800&q=80',
                status: 'Active'
            }
        ];
        await CampaignModel.insertMany(campaigns);
        console.log(`Seeded ${campaigns.length} campaigns.`);

        // Seed posts
        const postsToInsert = samplePosts.map((post, i) => ({
            ...post,
            authorId: createdNGOs[i % createdNGOs.length]._id
        }));
        await PostModel.insertMany(postsToInsert);
        console.log(`Seeded ${postsToInsert.length} posts.`);

        console.log('\n✅ Database seeded with official Nepal NGOs successfully!');
        process.exit(0);
    } catch (err) {
        console.error('Error seeding database:', err);
        process.exit(1);
    }
};

seedDB();



