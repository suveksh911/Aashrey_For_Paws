const NgoApplicationModel = require('../models/NgoApplication');
const UserModel = require('../models/User');
const { uploadBase64Image } = require('../utils/cloudinary');


const getVerificationStatus = async (req, res) => {
    try {
        
        const user = await UserModel.findById(req.user._id);
        if (user && user.isVerified) {
            return res.status(200).json({
                success: true,
                data: {
                    status: 'Approved',
                    rejectionReason: '',
                    orgName: user.orgName || ''
                }
            });
        }

        const app = await NgoApplicationModel.findOne({ userId: req.user._id }).sort({ submittedAt: -1 });
        if (!app) {
            return res.status(200).json({
                success: true,
                data: { status: 'Unverified', rejectionReason: '' }
            });
        }
        res.status(200).json({
            success: true,
            data: {
                status: app.status,
                rejectionReason: app.rejectReason || '',
                submittedAt: app.submittedAt,
                orgName: app.orgName
            }
        });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Failed to fetch verification status' });
    }
};


const uploadDocuments = async (req, res) => {
    try {
        const { orgName, phone, registrationNo, address, mission, email, documentImage } = req.body;

        if (!orgName || !phone || !registrationNo || !address) {
            return res.status(400).json({
                success: false,
                message: 'Organisation name, phone, registration number, and address are required'
            });
        }

        
        const existing = await NgoApplicationModel.findOne({ userId: req.user._id });
        if (existing && existing.status === 'Pending') {
            return res.status(400).json({
                success: false,
                message: 'You already have a pending verification application'
            });
        }
        if (existing && existing.status === 'Approved') {
            return res.status(400).json({
                success: false,
                message: 'Your organization is already verified'
            });
        }

        let docImageUrl = '';
        if (documentImage) {
            docImageUrl = await uploadBase64Image(documentImage, 'aashrey_ngo_docs');
        }

        const application = existing
            ? await NgoApplicationModel.findByIdAndUpdate(
                existing._id,
                { orgName, phone, registrationNo, address, mission: mission || '', email: email || req.user.email, documentImage: docImageUrl || existing.documentImage, status: 'Pending', rejectReason: '', submittedAt: new Date() },
                { new: true }
              )
            : await NgoApplicationModel.create({
                userId: req.user._id,
                orgName,
                phone,
                registrationNo,
                address,
                mission: mission || '',
                documentImage: docImageUrl,
                email: email || req.user.email,
                status: 'Pending'
              });

        
        await UserModel.findByIdAndUpdate(req.user._id, { ngoStatus: 'pending' });

        res.status(201).json({ success: true, message: 'Application submitted for review', data: application });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Failed to submit application' });
    }
};

module.exports = { getVerificationStatus, uploadDocuments };



