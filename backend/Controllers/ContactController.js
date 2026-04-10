const ContactModel = require('../models/Contact');
const { createNotification } = require('./NotificationController');
const { sendEmail } = require('../utils/mail');
const jwt = require('jsonwebtoken');
const config = require('../config/config');

const submitContact = async (req, res) => {
    try {
        const body = req.body;

        
        const authHeader = req.headers['authorization'];
        if (authHeader) {
            try {
                const token = authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : authHeader;
                const decoded = jwt.verify(token, config.jwtSecret);
                body.userId = decoded._id;
            } catch (err) { }
        }

        const newContact = new ContactModel(body);
        await newContact.save();
        res.status(201).json({ success: true, message: "Message sent successfully" });
    } catch (err) {
        res.status(500).json({ success: false, message: "Failed to send message" });
    }
}

const replyToContact = async (req, res) => {
    try {
        const { id } = req.params;
        const { message } = req.body;
        const adminId = req.user._id;

        const contact = await ContactModel.findById(id);
        if (!contact) return res.status(404).json({ success: false, message: "Message not found" });

        contact.replies.push({ adminId, message });
        contact.isReplied = true;
        await contact.save();

        
        if (contact.userId) {
            await createNotification(
                contact.userId,
                'info',
                `Admin replied to your message: "${contact.subject || 'General inquiry'}"`,
                '/user?tab=messages' 
            );
        }

        
        try {
            const subject = `Re: ${contact.subject || 'Inquiry'} - Aashrey For Paws`;
            const html = `
                <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6; max-width: 600px; margin: 0 auto; border: 1px solid #eee; border-top: 4px solid #5d4037; padding: 20px;">
                    <h2 style="color: #5d4037;">Response from Aashrey For Paws</h2>
                    <p>Hello <strong>${contact.name}</strong>,</p>
                    <p>The Admin has responded to your inquiry:</p>
                    <div style="background: #f9f9f9; padding: 15px; border-radius: 8px; font-style: italic; margin-bottom: 20px; border-left: 3px solid #ccc;">
                        "${message}"
                    </div>
                    <p>If you have further questions, please feel free to reach out again.</p>
                    <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
                    <p style="font-size: 12px; color: #888;">This is an automated response. Please do not reply directly to this email.</p>
                </div>
            `;
            await sendEmail(contact.email, subject, html);
        } catch (mailErr) {
            console.error("Failed to send reply email:", mailErr);
        }

        res.status(200).json({ success: true, message: "Reply sent successfully", data: contact });
    } catch (err) {
        res.status(500).json({ success: false, message: "Failed to send reply" });
    }
}

const getMyContacts = async (req, res) => {
    try {
        const userId = req.user._id;
        const email = req.user.email;
       
        const messages = await ContactModel.find({ 
            $or: [ { userId }, { email } ] 
        }).sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: messages });
    } catch (err) {
        res.status(500).json({ success: false, message: "Failed to fetch your messages" });
    }
}

const getContacts = async (req, res) => {
    try {
        const messages = await ContactModel.find().sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: messages });
    } catch (err) {
        res.status(500).json({ success: false, message: "Failed to fetch messages" });
    }
}

const deleteContact = async (req, res) => {
    try {
        const { id } = req.params;
        const deleted = await ContactModel.findByIdAndDelete(id);
        if (!deleted) return res.status(404).json({ success: false, message: "Message not found" });
        res.status(200).json({ success: true, message: "Message deleted successfully" });
    } catch (err) {
        res.status(500).json({ success: false, message: "Failed to delete message" });
    }
}

module.exports = {
    submitContact,
    getContacts,
    getMyContacts,
    replyToContact,
    deleteContact
}



