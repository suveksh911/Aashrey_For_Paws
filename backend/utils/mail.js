const nodemailer = require("nodemailer");
const config = require('../config/config');

const getTransporter = () => {
    return nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 587,
        secure: false,
        family: 4,
        auth: {
            user: config.email.smtpEmail,
            pass: config.email.smtpPass,
        },
        tls: {
            rejectUnauthorized: false
        }
    });
};

const sendEmail = async (to, subject, html) => {
    try {
        const transporter = getTransporter();
        const mailOptions = {
            from: config.email.smtpEmail,
            to,
            subject,
            html
        };
        const info = await transporter.sendMail(mailOptions);
        return info;
    } catch (err) {
        console.error("Email sending failed:", err);
        throw err;
    }
};

module.exports = { getTransporter, sendEmail };



