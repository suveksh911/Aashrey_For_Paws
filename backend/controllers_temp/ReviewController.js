const ReviewModel = require('../models/Review');
const { createNotification, notifyAdmins } = require('./NotificationController');

// GET /reviews/ngo/:ngoId — public, get all reviews for an NGO
const getReviewsByNgo = async (req, res) => {
    try {
        const reviews = await ReviewModel.find({ ngoId: req.params.ngoId })
            .sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: reviews });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Failed to fetch reviews' });
    }
};

// Helper function to update User model with rating statistics
const updateUserRating = async (ngoId) => {
    try {
        const reviews = await ReviewModel.find({ ngoId });
        const reviewCount = reviews.length;
        const avgRating = reviewCount > 0 
            ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviewCount 
            : 0;

        const UserModel = require('../models/User');
        await UserModel.findByIdAndUpdate(ngoId, { avgRating, reviewCount });
    } catch (err) {
        console.error("Error updating user rating:", err);
    }
};

// POST /reviews — submit a review (auth required)
const createReview = async (req, res) => {
    try {
        const { ngoId, rating, comment } = req.body;
        if (!ngoId || !rating) {
            return res.status(400).json({ success: false, message: 'ngoId and rating are required' });
        }
        // Prevent self-review
        if (ngoId === req.user._id.toString()) {
            return res.status(400).json({ success: false, message: 'You cannot review yourself' });
        }

        // Prevent duplicate review — update existing instead
        const existing = await ReviewModel.findOne({ ngoId, userId: req.user._id });
        if (existing) {
            existing.rating = rating;
            existing.comment = comment || '';
            await existing.save();
            await updateUserRating(ngoId); // Update user stats

            // Fetch target user to determine correct dashboard link
            const UserModel = require('../models/User');
            const targetUser = await UserModel.findById(ngoId);
            const path = targetUser && targetUser.role === 'NGO' ? '/ngo?tab=reviews' : '/user?tab=reviews';

            // Notify Target User
            await createNotification(
                ngoId,
                'info',
                `⭐ ${req.user.name} updated their review for you.`,
                path
            );

            return res.status(200).json({ success: true, message: 'Review updated', data: existing });
        }

        const review = new ReviewModel({
            ngoId,
            userId: req.user._id,
            userName: req.user.name,
            rating,
            comment: comment || ''
        });
        await review.save();
        await updateUserRating(ngoId); // Update user stats

        // Fetch target user for correct dashboard link
        const UserModel = require('../models/User');
        const targetUser = await UserModel.findById(ngoId);
        const path = targetUser && targetUser.role === 'NGO' ? '/ngo?tab=reviews' : '/user?tab=reviews';

        // Notify Target User
        await createNotification(
            ngoId,
            'success',
            `⭐ New ${rating}-star review from ${req.user.name}!`,
            path
        );

        // Notify Admins
        await notifyAdmins(
            'info',
            `⭐ New User Review: ${req.user.name} gave ${rating} stars to ${targetUser?.name || ngoId}`,
            '/admin?tab=overview'
        );

        res.status(201).json({ success: true, message: 'Review submitted', data: review });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Failed to submit review' });
    }
};

// DELETE /reviews/:id — delete own review
const deleteReview = async (req, res) => {
    try {
        const review = await ReviewModel.findById(req.params.id);
        if (!review) return res.status(404).json({ success: false, message: 'Review not found' });
        if (review.userId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }
        const ngoId = review.ngoId;
        await ReviewModel.findByIdAndDelete(req.params.id);
        await updateUserRating(ngoId); // Update user stats
        res.status(200).json({ success: true, message: 'Review deleted' });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Failed to delete review' });
    }
};

// GET /reviews/latest — public, get latest reviews from the platform
const getLatestReviews = async (req, res) => {
    try {
        const reviews = await ReviewModel.find({}).sort({ createdAt: -1 }).limit(10);
        res.status(200).json({ success: true, data: reviews });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Failed to fetch latest reviews' });
    }
};

module.exports = { getReviewsByNgo, getLatestReviews, createReview, deleteReview };



