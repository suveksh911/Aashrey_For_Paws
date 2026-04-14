const axios = require('axios');
const Payment = require('../models/Payment');
const PetModel = require('../models/Pet');
const AdoptionModel = require('../models/Adoption');
const User = require('../models/User');
const CampaignModel = require('../models/Campaign');
const { createNotification, notifyAdmins } = require('./NotificationController');
const config = require('../config/config');

const initiatePayment = async (req, res) => {
    try {
        const { amount, purpose, referenceId, itemName, returnUrl } = req.body;
        if (!amount || !purpose || !referenceId) {
            return res.status(400).json({ success: false, message: "Amount, purpose, and referenceId required" });
        }

        const khaltiSecretKey = config.khalti.secretKey;
        if (!khaltiSecretKey) {
            return res.status(500).json({ success: false, message: "Khalti secret key not configured." });
        }

        const numericAmount = Math.round(parseFloat(String(amount).replace(/,/g, '')));
        if (isNaN(numericAmount) || numericAmount < 10) {
            return res.status(400).json({ success: false, message: "Invalid amount. Minimum amount is Rs. 10" });
        }

        
        const newPayment = await Payment.create({
            userId: req.user ? req.user._id : null,
            purpose: purpose,
            referenceId: referenceId,
            amount: numericAmount,
            status: 'pending',
            method: 'Khalti'
        });

        const callbackUrl = returnUrl || `${config.frontendUrl}/khalti-callback`;
        
        
        const payload = {
            "return_url": callbackUrl,
            "website_url": config.frontendUrl || 'http://localhost:5173',
            "amount": numericAmount * 100, 
            "purchase_order_id": newPayment._id.toString(),
            "purchase_order_name": `${purpose} - ${itemName || 'Pet'}`.substring(0, 100),
            "customer_info": {
                "name": (req.user?.name || "Customer").substring(0, 50),
                "email": req.user?.email || "guest@example.com",
                "phone": (req.user?.phone || "9800000000").replace(/\D/g, '').substring(0, 10)
            }
        };

        
        const response = await axios.post(
            config.khalti.apiUrl, 
            payload,
            { headers: { 'Authorization': `Key ${khaltiSecretKey}` } }
        );

        
        newPayment.transactionId = response.data.pidx;
        await newPayment.save();

        res.status(200).json({ success: true, payment_url: response.data.payment_url, pidx: response.data.pidx });
    } catch (err) {
        console.error("Khalti Init Full Error:", err?.response?.data || err);
        const errorMsg = err?.response?.data?.detail || err?.response?.data?.message || 'Failed to initiate Khalti payment. Check server logs.';
        res.status(500).json({ success: false, message: errorMsg });
    }
};

const verifyKhaltiPayment = async (req, res) => {
    try {
        const { pidx } = req.body;
        if (!pidx) return res.status(400).json({ success: false, message: "pidx is required" });

        const khaltiSecretKey = config.khalti.secretKey;
        if (!khaltiSecretKey) {
            return res.status(500).json({ success: false, message: "Khalti secret key not configured" });
        }

        
        const response = await axios.post(
            config.khalti.verifyUrl,
            { pidx },
            { headers: { 'Authorization': `Key ${khaltiSecretKey}` } }
        );
        
       
        const paymentRecord = await Payment.findOne({ transactionId: pidx });

        if (response.data.status === 'Completed') {
            // ATOMIC UPDATE to prevent race condition from parallel Khalti webhook & redirect pings
            const updatedRecord = await Payment.findOneAndUpdate(
                { transactionId: pidx, status: { $ne: 'completed' } },
                { $set: { status: 'completed', khaltiResponse: response.data } },
                { new: true }
            );

            if (updatedRecord) {
                const isPurchase = updatedRecord.purpose === 'PetPurchase';
                const isDonation = updatedRecord.purpose === 'Donation';
                const isCampaign = updatedRecord.purpose === 'CampaignContribution';

                if (isPurchase) {
                    try {
                        const petId = updatedRecord.referenceId;
                        const userId = updatedRecord.userId;

                        if (petId && userId) {
                            const pet = await PetModel.findById(petId);
                            const buyer = await User.findById(userId);

                            if (pet && buyer) {
                                const existing = await AdoptionModel.findOne({ petId: pet._id, userId: buyer._id, reason: 'Purchased via Khalti' });
                                
                                if (!existing) {
                                    const finalOwnerId = pet.ownerId || pet.postedBy?.id || buyer._id; 

                                    await AdoptionModel.create({
                                        petId: pet._id,
                                        petName: pet.name,
                                        userId: buyer._id,
                                        userName: buyer.name,
                                        ownerId: finalOwnerId,
                                        status: 'Adopted',
                                        reason: 'Purchased via Khalti',
                                        phone: buyer.phone || 'N/A',
                                        date: new Date()
                                    });

                                    if (pet.status !== 'Adopted') {
                                        const newQty = Math.max(0, (pet.quantity || 1) - 1);
                                        const updates = { quantity: newQty };
                                        if (newQty === 0) updates.status = 'Adopted';
                                        await PetModel.findByIdAndUpdate(pet._id, updates);
                                    }

                                    await createNotification(
                                        buyer._id,
                                        'success',
                                        `🛒 Purchase Successful! ${pet.name} is now in your adoption history.`,
                                        `/user?tab=history`
                                    );

                                    if (finalOwnerId.toString() !== buyer._id.toString()) {
                                        await createNotification(
                                            finalOwnerId,
                                            'info',
                                            `💰 Payment Received: ${buyer.name} bought ${pet.name}.`,
                                            `/user?tab=incoming`
                                        );
                                    }

                                    // Notify Admins
                                    await notifyAdmins(
                                        'success',
                                        `💰 Pet Purchased: ${buyer.name} bought "${pet.name}" for Rs. ${updatedRecord.amount}.`,
                                        `/admin?tab=overview`
                                    );
                                }
                            }
                        }
                    } catch (syncErr) {
                        console.error("CRITICAL SYNC ERROR:", syncErr);
                    }
                } else if (isDonation) {
                    try {
                        const ngoId = updatedRecord.referenceId;
                        const userId = updatedRecord.userId;

                        if (ngoId) {
                            const mongoose = require('mongoose');
                            if (mongoose.Types.ObjectId.isValid(ngoId)) {
                                const recipientNgo = await User.findById(ngoId);
                                if (recipientNgo) {
                                    await createNotification(
                                        recipientNgo._id,
                                        'info',
                                        `💖 New Donation: ${req.user?.name || 'A supporter'} donated Rs. ${updatedRecord.amount} to your cause.`,
                                        `/ngo?tab=donations`
                                    );
                                }
                            }

                            if (userId) {
                                await createNotification(
                                    userId,
                                    'success',
                                    `🙏 Thank you! Your donation of Rs. ${updatedRecord.amount} was successful.`,
                                    `/user?tab=history`
                                );
                            }

                            // Notify Admins
                            if (recipientNgo) {
                                await notifyAdmins(
                                    'success',
                                    `💖 New Donation: Rs. ${updatedRecord.amount} donated to ${recipientNgo.name} by ${req.user?.name || 'A supporter'}.`,
                                    `/admin?tab=reports`
                                );
                            }
                        }
                    } catch (donationErr) {
                        console.error("DONATION NOTIFICATION ERROR:", donationErr);
                    }
                } else if (isCampaign) {
                    try {
                        const campaignId = updatedRecord.referenceId;
                        if (campaignId) {
                            const campaign = await CampaignModel.findById(campaignId);
                            if (campaign) {
                                campaign.raisedAmount = (campaign.raisedAmount || 0) + updatedRecord.amount;
                                if (campaign.raisedAmount >= campaign.targetAmount) {
                                    campaign.status = 'Completed';
                                }
                                await campaign.save();

                                if (campaign.ngoId) {
                                    await createNotification(
                                        campaign.ngoId,
                                        'info',
                                        `💰 Campaign Contribution: ${req.user?.name || 'A supporter'} donated Rs. ${updatedRecord.amount} to "${campaign.title}".`,
                                        `/ngo?tab=campaigns`
                                    );
                                }

                                if (updatedRecord.userId) {
                                    await createNotification(
                                        updatedRecord.userId,
                                        'success',
                                        `🙏 Thank you! Your contribution of Rs. ${updatedRecord.amount} to "${campaign.title}" was successful.`,
                                        `/campaigns`
                                    );
                                }

                                // Notify Admins
                                await notifyAdmins(
                                    'success',
                                    `📢 Campaign Boost: Rs. ${updatedRecord.amount} contributed to "${campaign.title}" (${campaign.ngoName}).`,
                                    `/admin?tab=reports`
                                );
                            }
                        }
                    } catch (campaignErr) {
                        console.error("CAMPAIGN CONTRIBUTION ERROR:", campaignErr);
                    }
                }
            }
            return res.status(200).json({ success: true, message: "Payment verified successfully", data: response.data, paymentRecord });
        } else {
             if (paymentRecord) {
                paymentRecord.status = response.data.status === 'Failed' ? 'failed' : 'pending';
                paymentRecord.khaltiResponse = response.data;
                await paymentRecord.save();
            }
            return res.status(400).json({ success: false, message: `Payment status is ${response.data.status}`, data: response.data });
        }
    } catch (err) {
        console.error("Payment verification error:", err?.response?.data || err.message);
        res.status(500).json({ success: false, message: "Payment verification failed" });
    }
};

module.exports = {
    initiatePayment,
    verifyKhaltiPayment
};



