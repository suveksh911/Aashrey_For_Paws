const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: false, // In case of guest donations
    },
    purpose: {
        type: String,
        enum: ["Donation", "PetPurchase", "CampaignContribution"],
        required: true,
    },
    // Reference to the item being paid for (NGO ID or Pet ID)
    referenceId: {
        type: String, // Kept as String to accommodate both standard ObjectIds and custom hardcoded IDs
        required: false,
    },
    amount: {
        type: Number,
        required: [true, "Amount is required."],
    },
    method: {
        type: String,
        required: [true, "Payment method is required"],
        enum: ["Khalti", "Cash", "Bank"],
        default: "Khalti",
    },
    status: {
        type: String,
        default: "pending",
        enum: ["pending", "completed", "failed"],
    },
    transactionId: { // Khalti pidx
        type: String,
    },
    khaltiResponse: {
        type: Object, // Store lookup response for debugging/audit
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
}); 

const Payment = mongoose.model("Payment", paymentSchema);
module.exports = Payment;


