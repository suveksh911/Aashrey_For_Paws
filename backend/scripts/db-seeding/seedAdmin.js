const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const dotenv = require('dotenv');

dotenv.config(); // Must load env vars before requiring DB connection

const UserModel = require('../models/User');
require('./config/db');

const seedAdmin = async () => {
    try {
        await mongoose.connection.asPromise();
        console.log('Connected to DB...');

        const adminEmail = process.env.ADMIN_EMAIL || 'admin@aashrey.com';
        const adminPass = process.env.ADMIN_PASSWORD || 'admin123';
        let user = await UserModel.findOne({ email: adminEmail });

        if (user) {
            console.log(`Admin user with email ${adminEmail} already exists. Updating password...`);
            user.password = adminPass;
            user.role = 'Admin'; // Ensure role is still Admin
            user.ngoStatus = 'verified';
            await user.save();
            console.log('Password updated successfully!');
        } else {
            console.log('Creating new admin user...');
            user = new UserModel({
                name: 'Admin User',
                email: adminEmail,
                password: adminPass, // Let the model handle the hashing
                role: 'Admin',
                status: 'active',
                isVerified: true,
                ngoStatus: 'verified'
            });
            await user.save();
            console.log(`Admin user seeded successfully with email: ${adminEmail} and password: ${adminPass}`);
        }
        process.exit(0);
    } catch (err) {
        console.error('Error seeding admin user:', err);
        process.exit(1);
    }
};

seedAdmin();



