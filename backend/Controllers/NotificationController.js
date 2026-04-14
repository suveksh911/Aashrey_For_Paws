const NotificationModel = require('../models/Notification');
const UserModel = require('../models/User');

// GET /notifications
const getNotifications = async (req, res) => {
    try {
        const notifications = await NotificationModel.find({ userId: req.user._id }).sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: notifications });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Failed to fetch notifications' });
    }
};


const addNotification = async (req, res) => {
    try {
        const { type, message, link } = req.body;
        const notification = await NotificationModel.create({
            userId: req.user._id,
            type: type || 'info',
            message,
            link: link || ''
        });
        res.status(201).json({ success: true, data: notification });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Failed to create notification' });
    }
};


const markAsRead = async (req, res) => {
    try {
        const notification = await NotificationModel.findOneAndUpdate(
            { _id: req.params.id, userId: req.user._id },
            { read: true },
            { new: true }
        );
        if (!notification) return res.status(404).json({ success: false, message: 'Notification not found or unauthorized' });
        res.status(200).json({ success: true, message: 'Marked as read' });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Failed to mark as read' });
    }
};


const markAllRead = async (req, res) => {
    try {
        await NotificationModel.updateMany({ userId: req.user._id, read: false }, { read: true });
        res.status(200).json({ success: true, message: 'All marked as read' });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Failed to update notifications' });
    }
};


const deleteNotification = async (req, res) => {
    try {
        const notification = await NotificationModel.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
        if (!notification) return res.status(404).json({ success: false, message: 'Notification not found or unauthorized' });
        res.status(200).json({ success: true, message: 'Notification deleted' });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Failed to delete notification' });
    }
};


const deleteAllNotifications = async (req, res) => {
    try {
        await NotificationModel.deleteMany({ userId: req.user._id });
        res.status(200).json({ success: true, message: 'All notifications deleted' });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Failed to clear notifications' });
    }
};


const createNotification = async (userId, type, message, link = '') => {
    try {
        await NotificationModel.create({ userId, type, message, link });
    } catch (err) {
        console.error('Failed to create notification:', err);
    }
};

const notifyAdmins = async (type, message, link = '') => {
    try {
        const admins = await UserModel.find({ role: 'Admin' });
        if (!admins || admins.length === 0) return;

        const notifications = admins.map(admin => ({
            userId: admin._id,
            type,
            message,
            link
        }));

        await NotificationModel.insertMany(notifications);
    } catch (err) {
        console.error('Failed to notify admins:', err);
    }
};

module.exports = { getNotifications, addNotification, markAsRead, markAllRead, deleteNotification, deleteAllNotifications, createNotification, notifyAdmins };



