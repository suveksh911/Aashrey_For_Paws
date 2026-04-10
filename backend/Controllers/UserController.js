const UserModel = require('../models/User');
const { uploadBase64Image } = require('../utils/cloudinary');
const { createNotification } = require('./NotificationController');

// GET /users/me
const getProfile = async (req, res) => {
    try {
        const user = await UserModel.findById(req.user._id).select('-password');
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });
        res.status(200).json({ success: true, data: user });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Failed to fetch profile' });
    }
};

// PATCH /users/me
const updateProfile = async (req, res) => {
    try {
        const { email, name, phone, address, bio, profileImage, lat, lng, petType, experience, orgName, website, registrationNo, mission } = req.body;
        const updates = {};

        // Special handling for email update (check for uniqueness)
        if (email && email !== req.user.email) {
            const existingUser = await UserModel.findOne({ email });
            if (existingUser) {
                return res.status(400).json({ success: false, message: 'Email address is already in use' });
            }
            updates.email = email;
        }

        if (name) updates.name = name;
        if (orgName) {
            updates.orgName = orgName;
            // If it's an NGO, keep the display name in sync with the organization name
            if (!name) updates.name = orgName;
        }
        if (phone !== undefined) updates.phone = phone;
        if (address !== undefined) {
            updates.address = address;
            if (lat === undefined && lng === undefined && address.trim() !== '') {
                try {
                    const axios = require('axios');
                    const geoRes = await axios.get(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`, {
                        headers: { 'User-Agent': 'AashreyForPaws/1.0' }
                    });
                    if (geoRes.data && geoRes.data.length > 0) {
                        updates.lat = parseFloat(geoRes.data[0].lat);
                        updates.lng = parseFloat(geoRes.data[0].lon);
                    }
                } catch (geoErr) {
                    console.error("Geocoding failed for address:", address, geoErr.message);
                }
            }
        }
        if (bio !== undefined) updates.bio = bio;
        if (lat !== undefined) updates.lat = lat;
        if (lng !== undefined) updates.lng = lng;
        if (petType !== undefined) updates.petType = petType;
        if (experience !== undefined) updates.experience = experience;
        if (website !== undefined) updates.website = website;
        if (registrationNo !== undefined) updates.registrationNo = registrationNo;
        if (mission !== undefined) updates.mission = mission;
        if (profileImage !== undefined) {
            updates.profileImage = await uploadBase64Image(profileImage, 'aashrey_profiles');
        }

        const user = await UserModel.findByIdAndUpdate(
            req.user._id,
            updates,
            { new: true }
        ).select('-password');

        // Create notification (removed as requested)
        res.status(200).json({ success: true, message: 'Profile updated', data: user });
    } catch (err) {
        console.error("Profile update error:", err);
        res.status(500).json({ success: false, message: 'Failed to update profile: ' + (err.message || err) });
    }
};
// GET /users/:id (public profile)
const getPublicProfile = async (req, res) => {
    try {
        const user = await UserModel.findById(req.params.id).select(
            'name email phone address bio profileImage role ngoStatus isVerified orgName registrationNo website mission lat lng createdAt avgRating reviewCount'
        );
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });
        
        let data = user.toObject();

        // FAIL-SAFE: If stored rating is 0 but user has actual reviews, calculate on the fly
        // This solves syncing issues without requiring a full manual database migration
        if (data.reviewCount === 0) {
            const ReviewModel = require('../models/Review');
            const reviews = await ReviewModel.find({ ngoId: req.params.id });
            if (reviews.length > 0) {
                data.reviewCount = reviews.length;
                data.avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
            }
        }

        res.status(200).json({ success: true, data });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Failed to fetch user profile' });
    }
};

module.exports = { getProfile, updateProfile, getPublicProfile };



