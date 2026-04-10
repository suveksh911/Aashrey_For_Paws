const axios = require('axios');
const config = require('../config/config');

/**
 * Initiates a Khalti payment.
 * @param {Object} data - The payment initiation data.
 * @returns {Promise<Object>} - The response from the Khalti API.
 */
const PayViaKhalti = async (data) => {
    if (!data) throw new Error("Payment data is required.");
    if (!data.amount) throw new Error("Payment amount is required.");
    if (!data.return_url || !data.website_url)
        throw new Error("Return URL and website URL are required.");
    if (!data.purchase_order_id) throw new Error("Purchase Order ID is required.");
    if (!data.purchase_order_name) throw new Error("Purchase Order Name is required.");

    try {
        const response = await axios.post(
            config.khalti.apiUrl,
            data,
            {
                headers: {
                    Authorization: `Key ${config.khalti.secretKey}`,
                    'Content-Type': 'application/json'
                },
            }
        );
        return response.data;
    } catch (error) {
        console.error("Khalti Initiation Error:", error.response?.data || error.message);
        throw error.response?.data || error;
    }
};

/**
 * Verifies a Khalti payment.
 * @param {string} pidx - The payment index to verify.
 * @returns {Promise<Object>} - The verification response from Khalti.
 */
const VerifyKhaltiPayment = async (pidx) => {
    try {
        const response = await axios.post(
            config.khalti.verifyUrl,
            { pidx },
            {
                headers: {
                    Authorization: `Key ${config.khalti.secretKey}`,
                    'Content-Type': 'application/json'
                },
            }
        );
        return response.data;
    } catch (error) {
        console.error("Khalti Verification Error:", error.response?.data || error.message);
        throw error.response?.data || error;
    }
};

module.exports = { PayViaKhalti, VerifyKhaltiPayment };


