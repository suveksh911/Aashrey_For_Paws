const UserModel = require('../models/User');
const NgoApplicationModel = require('../models/NgoApplication');
const PetModel = require('../models/Pet');
const AdoptionModel = require('../models/Adoption');
const CampaignModel = require('../models/Campaign');
const NotificationModel = require('../models/Notification');
const notificationService = require('../services/NotificationService');

/**
 * Get dashboard statistics
 */
const getStats = async (req, res) => {
    try {
        const [userCount, petCount, pendingNGO, adoptionCount, verifiedNGOs, pendingRequests] = await Promise.all([
            UserModel.countDocuments({ role: { $ne: 'Admin' } }),
            PetModel.countDocuments(),
            NgoApplicationModel.countDocuments({ status: 'Pending' }),
            AdoptionModel.countDocuments({ status: 'Approved' }),
            UserModel.countDocuments({ role: 'NGO', ngoStatus: 'verified' }),
            AdoptionModel.countDocuments({ status: 'Pending' })
        ]);

        res.status(200).json({
            success: true,
            data: {
                users: userCount,
                pets: petCount,
                ngoApps: pendingNGO,
                adoptions: adoptionCount,
                verifiedNGOs: verifiedNGOs,
                requests: pendingRequests
            }
        });
    } catch (err) {
        res.status(500).json({ success: false, message: "Failed to fetch stats" });
    }
};

/**
 * Get all users with filtering
 */
const getAllUsers = async (req, res) => {
    try {
        const { role, search } = req.query;
        let query = { role: { $ne: 'Admin' } };
        
        if (role && role !== 'All') query.role = role;
        
        if (search) {
            const searchRegex = { $regex: search, $options: 'i' };
            query.$or = [{ name: searchRegex }, { email: searchRegex }];
        }
        
        const users = await UserModel.find(query, '-password').sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: users });
    } catch (err) {
        res.status(500).json({ success: false, message: "Failed to fetch users" });
    }
};

/**
 * Update user active/suspended status
 */
const updateUserStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, isVerified } = req.body;
        const updates = {};
        
        if (status) updates.status = status;
        if (isVerified !== undefined) updates.isVerified = isVerified;

        const updatedUser = await UserModel.findByIdAndUpdate(id, updates, { new: true });
        if (!updatedUser) return res.status(404).json({ success: false, message: "User not found" });

        // Update campaigns if NGO verification changed
        if (isVerified !== undefined && updatedUser.role === 'NGO') {
            await CampaignModel.updateMany({ ngoId: id }, { isVerified });
        }

        // Send specialized notifications
        if (status === 'suspended') {
            await notificationService.createNotification(
                id,
                'alert',
                'Your account has been suspended by the admin. Please contact support.',
                '/contact'
            );
        } else if (status === 'active') {
            await notificationService.createNotification(
                id,
                'success',
                'Your account has been reactivated by the admin.',
                '/user'
            );
        }

        res.status(200).json({ success: true, message: "User status updated" });
    } catch (err) {
        res.status(500).json({ success: false, message: "Failed to update user" });
    }
};

/**
 * NGO Application Management
 */
const verifyNGO = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, rejectReason } = req.body;

        const app = await NgoApplicationModel.findByIdAndUpdate(id, { status, rejectReason }, { new: true });
        if (!app) return res.status(404).json({ success: false, message: "Application not found" });

        if (status === 'Approved') {
            await UserModel.findByIdAndUpdate(app.userId, { 
                ngoStatus: 'verified', 
                isVerified: true,
                orgName: app.orgName,
                registrationNo: app.registrationNo,
                address: app.address,
                mission: app.mission,
                phone: app.phone
            });
            
            await notificationService.createNotification(
                app.userId,
                'success',
                'Your NGO application has been approved! You now have full NGO access.',
                '/ngo'
            );
            
            await CampaignModel.updateMany({ ngoId: app.userId }, { isVerified: true });
        } else if (status === 'Rejected') {
            await UserModel.findByIdAndUpdate(app.userId, { ngoStatus: 'rejected', isVerified: false });
            await CampaignModel.updateMany({ ngoId: app.userId }, { isVerified: false });
            
            await notificationService.createNotification(
                app.userId,
                'alert',
                `NGO application rejected. ${rejectReason || ''}`,
                '/ngo-documents'
            );
        }

        res.status(200).json({ success: true, message: `NGO ${status}`, data: app });
    } catch (err) {
        res.status(500).json({ success: false, message: "Failed to verify NGO" });
    }
};

/**
 * Admin Notification Feed
 */
const getAdminNotifications = async (req, res) => {
    try {
        const notifications = await NotificationModel.find({ userId: req.user._id })
            .sort({ createdAt: -1 })
            .limit(50);
        res.status(200).json({ success: true, data: notifications });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Failed to fetch notifications' });
    }
};

/**
 * Delete a user permanently
 */
const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await UserModel.findByIdAndDelete(id);
        if (!user) return res.status(404).json({ success: false, message: "User not found" });

        // Log for admin
        await notificationService.createNotification(req.user._id, 'alert', `User Permanently Deleted: ${user.name}`);

        res.status(200).json({ success: true, message: "User deleted" });
    } catch (err) {
        res.status(500).json({ success: false, message: "Failed to delete user" });
    }
};

module.exports = {
    getStats,
    getAllUsers,
    updateUserStatus,
    deleteUser,
    getNgoApplications: async (req, res) => {
        try {
            const apps = await NgoApplicationModel.find().sort({ submittedAt: -1 });
            res.status(200).json({ success: true, data: apps });
        } catch (err) {
            res.status(500).json({ success: false, message: "Failed to fetch applications" });
        }
    },
    verifyNGO,
    getNgos: async (req, res) => {
        try {
            const ngos = await UserModel.find({ role: 'NGO' }, '-password').sort({ createdAt: -1 });
            res.status(200).json({ success: true, data: ngos });
        } catch (err) {
            res.status(500).json({ success: false, message: 'Failed to fetch NGOs' });
        }
    },
    getAdminNotifications
};
