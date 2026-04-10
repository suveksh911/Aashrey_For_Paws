/**
 * Middleware to restrict access to Admin-only routes.
 * Must be used AFTER ensureAuthenticated so that req.user is populated.
 */
const isAdmin = (req, res, next) => {
    if (!req.user || req.user.role !== 'Admin') {
        return res.status(403).json({
            success: false,
            message: 'Access denied. Admin role required.'
        });
    }
    next();
};

module.exports = isAdmin;



