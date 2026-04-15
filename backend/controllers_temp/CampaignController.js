const CampaignModel = require('../models/Campaign');
const UserModel = require('../models/User');


const getAllCampaigns = async (req, res) => {
    try {
        const campaigns = await CampaignModel.find({ status: 'Active' }).sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: campaigns });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Failed to fetch campaigns' });
    }
};


const getMyCampaigns = async (req, res) => {
    try {
        const campaigns = await CampaignModel.find({ ngoId: req.user._id }).sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: campaigns });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Failed to fetch your campaigns' });
    }
};


const createCampaign = async (req, res) => {
    try {
        const { title, description, targetAmount, deadline, image, paymentDetails } = req.body;
        if (!title || !targetAmount || !deadline) {
            return res.status(400).json({ success: false, message: 'Title, target amount, and deadline are required' });
        }

        
        const ngoUser = await UserModel.findById(req.user._id);
        const campaign = new CampaignModel({
            ngoId: req.user._id,
            ngoName: ngoUser?.name || req.user.name,
            isVerified: ngoUser?.isVerified || false,
            title,
            description: description || '',
            targetAmount: Number(targetAmount),
            deadline: new Date(deadline),
            image: image || '',
            raisedAmount: 0,
            status: 'Active',
            paymentDetails: {
                bankName: paymentDetails?.bankName || '',
                accountName: paymentDetails?.accountName || '',
                accountNumber: paymentDetails?.accountNumber || '',
                khaltiId: paymentDetails?.khaltiId || ''
            }
        });
        await campaign.save();
        res.status(201).json({ success: true, message: 'Campaign created', data: campaign });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Failed to create campaign' });
    }
};


const deleteCampaign = async (req, res) => {
    try {
        const campaign = await CampaignModel.findById(req.params.id);
        if (!campaign) return res.status(404).json({ success: false, message: 'Campaign not found' });
        if (campaign.ngoId.toString() !== req.user._id.toString() && req.user.role !== 'Admin') {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }
        await CampaignModel.findByIdAndDelete(req.params.id);
        res.status(200).json({ success: true, message: 'Campaign deleted' });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Failed to delete campaign' });
    }
};

module.exports = { getAllCampaigns, getMyCampaigns, createCampaign, deleteCampaign };



