const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const config = require('../config/config');
const { sendEmail } = require('../utils/mail');

/**
 * Generates a JWT token for a user
 * @param {Object} user - User document
 * @returns {string} token
 */
const generateToken = (user) => {
    return jwt.sign(
        { _id: user._id, name: user.name, email: user.email, role: user.role },
        config.jwtSecret,
        { expiresIn: config.jwtExpire }
    );
};

/**
 * Generates a 6-digit OTP code
 * @returns {string} 6-digit OTP
 */
const generateOTP = () => {
    return crypto.randomInt(100000, 999999).toString();
};

/**
 * Maps frontend roles (user/seller) to backend roles (Adopter/NGO)
 * @param {string} role - Input role from frontend
 * @returns {object} { backendRole, ngoStatus }
 */
const mapRoleToBackend = (role) => {
    let backendRole = role;
    if (role === 'user') backendRole = 'Adopter';
    if (role === 'seller') backendRole = 'NGO';

    let ngoStatus = 'none';
    if (backendRole === 'NGO') {
        ngoStatus = 'pending';
    }

    return { backendRole, ngoStatus };
};

/**
 * Sends a registration verification OTP email
 */
const sendOTPEmail = async (email, otp, name) => {
    const subject = "Email Verification - OTP";
    const html = `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h2>Welcome ${name}!</h2>
        <p>Thank you for registering. Please verify your email address.</p>
        <div style="background-color: #f4f4f4; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <h1 style="color: #333; text-align: center; letter-spacing: 5px;">${otp}</h1>
        </div>
        <p>This OTP will expire in 10 minutes.</p>
        <p>If you did not request this, please ignore this email.</p>
        <p>Best regards,<br>The Aashrey Team</p>
      </div>
    `;
    await sendEmail(email, subject, html);
};

/**
 * Sends a password reset OTP email
 */
const sendResetEmail = async (email, otp, name) => {
    const subject = "Password Reset OTP - Aashrey For Paws";
    const html = `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2>Reset Your Password</h2>
          <p>Hello ${name}, you requested to reset your password.</p>
          <p>Please use this OTP code to proceed:</p>
          <div style="background-color: #fce4ec; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h1 style="color: #880e4f; text-align: center; letter-spacing: 5px;">${otp}</h1>
          </div>
          <p>This code expires in 10 minutes.</p>
          <p>If you did not request this, please ignore this email.</p>
        </div>
    `;
    await sendEmail(email, subject, html);
};

module.exports = {
    generateToken,
    generateOTP,
    mapRoleToBackend,
    sendOTPEmail,
    sendResetEmail
};
