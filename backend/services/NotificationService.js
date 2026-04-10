const NotificationModel = require('../models/Notification');

/**
 * Creates an in-app notification for a specific user
 * @param {string} userId - ID of the target user
 * @param {string} type - 'info', 'success', 'warning', 'alert', 'urgent', 'critical'
 * @param {string} message - Notification text
 * @param {string} link - Optional dashboard link
 */
const createNotification = async (userId, type, message, link = '') => {
    try {
        await NotificationModel.create({ userId, type, message, link });
    } catch (err) {
        console.error('Failed to create notification service error:', err);
    }
};

/**
 * Broadcasts a notification to multiple users
 * @param {Array} userIds - List of user IDs
 * @param {string} type - Notification type
 * @param {string} message - Notification text
 * @param {string} link - Optional link
 */
const broadcastNotification = async (userIds, type, message, link = '') => {
    try {
        const notifications = userIds.map(id => ({ userId: id, type, message, link }));
        await NotificationModel.insertMany(notifications);
    } catch (err) {
        console.error('Failed to broadcast notification service error:', err);
    }
};

module.exports = {
    createNotification,
    broadcastNotification
};
