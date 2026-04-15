const router = require('express').Router();
const { getNotifications, addNotification, markAsRead, markAllRead, deleteNotification, deleteAllNotifications } = require('../controllers/NotificationController');
const ensureAuthenticated = require('../middlewares/Auth');

router.use(ensureAuthenticated); // all notification routes require auth

router.get('/', getNotifications);
router.post('/', addNotification);
router.patch('/read-all', markAllRead);
router.patch('/:id/read', markAsRead);
router.delete('/', deleteAllNotifications);
router.delete('/:id', deleteNotification);

module.exports = router;



