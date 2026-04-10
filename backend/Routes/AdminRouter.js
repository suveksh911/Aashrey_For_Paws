const router = require('express').Router();
const {
    getStats,
    getAllUsers,
    updateUserStatus,
    deleteUser,
    getNgoApplications,
    verifyNGO,
    getNgos,
    getAdminNotifications
} = require('../controllers/AdminController');
const ensureAuthenticated = require('../middlewares/Auth');
const isAdmin = require('../middlewares/IsAdmin');

// ── Public routes (no auth needed) ───────────────────────────
router.get('/ngos/public', getNgos);   // Used by Donate page for all visitors

// ── Admin-only routes ─────────────────────────────────────────
router.get('/stats', ensureAuthenticated, isAdmin, getStats);
router.get('/users', ensureAuthenticated, isAdmin, getAllUsers);
router.patch('/users/:id/status', ensureAuthenticated, isAdmin, updateUserStatus);
router.delete('/users/:id', ensureAuthenticated, isAdmin, deleteUser);
router.get('/ngo-applications', ensureAuthenticated, isAdmin, getNgoApplications);
router.patch('/ngo-verify/:id', ensureAuthenticated, isAdmin, verifyNGO);
router.get('/ngos', ensureAuthenticated, isAdmin, getNgos);
router.get('/notifications', ensureAuthenticated, isAdmin, getAdminNotifications);

module.exports = router;





