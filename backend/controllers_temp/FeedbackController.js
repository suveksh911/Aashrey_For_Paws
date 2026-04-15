const FeedbackModel = require('../models/Feedback');
const { notifyAdmins } = require('./NotificationController');


const getAllFeedback = async (req, res) => {
    try {
        const feedback = await FeedbackModel.find().sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: feedback });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Failed to fetch feedback' });
    }
};


const createFeedback = async (req, res) => {
    try {
        const { rating, comment } = req.body;
        if (!rating) {
            return res.status(400).json({ success: false, message: 'Rating is required' });
        }

        const newFeedback = new FeedbackModel({
            userId: req.user._id,
            userName: req.user.name,
            rating,
            comment: comment || ''
        });

        await newFeedback.save();

        // Notify Admins
        await notifyAdmins(
            'info',
            `💬 New Feedback: Rating ${rating}/5 from ${req.user.name}`,
            '/admin?tab=reports'
        );

        res.status(201).json({ success: true, message: 'Feedback submitted successfully', data: newFeedback });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Failed to submit feedback' });
    }
};


const updateFeedback = async (req, res) => {
    try {
        const { rating, comment } = req.body;
        const feedback = await FeedbackModel.findById(req.params.id);
        
        if (!feedback) {
            return res.status(404).json({ success: false, message: 'Feedback not found' });
        }
        if (feedback.userId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }

        feedback.rating = rating || feedback.rating;
        feedback.comment = comment; 
        feedback.createdAt = new Date(); 
        await feedback.save();

        res.status(200).json({ success: true, message: 'Feedback updated', data: feedback });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Failed to update feedback' });
    }
};


const deleteFeedback = async (req, res) => {
    try {
        const feedback = await FeedbackModel.findById(req.params.id);
        
        if (!feedback) {
            return res.status(404).json({ success: false, message: 'Feedback not found' });
        }
        if (feedback.userId.toString() !== req.user._id.toString() && req.user.role !== 'Admin') {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }

        await FeedbackModel.findByIdAndDelete(req.params.id);
        res.status(200).json({ success: true, message: 'Feedback deleted' });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Failed to delete feedback' });
    }
};

module.exports = { getAllFeedback, createFeedback, updateFeedback, deleteFeedback };



