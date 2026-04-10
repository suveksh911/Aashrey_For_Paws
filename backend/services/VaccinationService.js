const VaccinationModel = require('../models/Vaccination');
const config = require('../config/config');
const nodemailer = require('nodemailer');

const VACCINE_INTERVALS = {
    'rabies': 12,
    'dhpp': 12,
    'bordetella': 6,
    'leptospirosis': 12,
    'canine influenza': 12,
    'fvrcp': 12,
    'felv': 12,
    'parvovirus': 12,
    'distemper': 12,
    'hepatitis': 12,
    'parainfluenza': 12,
    'kennel cough': 6,
    'lyme disease': 12,
    'booster': 6,
};

/**
 * Calculates the next vaccination date based on vaccine type
 * @param {Date} baseDate - Date the current vaccine was given
 * @param {string} vaccineName - Name of the vaccine
 * @returns {Date} Calculated next due date
 */
const calculateNextDueDate = (baseDate, vaccineName) => {
    const nameLower = vaccineName.toLowerCase();
    let addMonths = 12; // default 1 year

    for (const [key, months] of Object.entries(VACCINE_INTERVALS)) {
        if (nameLower.includes(key)) {
            addMonths = months;
            break;
        }
    }

    const nextDate = new Date(baseDate);
    nextDate.setMonth(nextDate.getMonth() + addMonths);
    return nextDate;
};

/**
 * Creates email transporter based on app configuration
 */
const createTransporter = () => nodemailer.createTransport({
    service: config.email.smtpService || 'gmail',
    auth: {
        user: config.email.user,
        pass: config.email.pass,
    },
});

/**
 * Determines the urgency level of a vaccination based on days remaining
 */
const determineUrgencyLevel = (daysLeft, threshold) => {
    if (daysLeft < 0) return 'Overdue';
    if (daysLeft === 0) return 'Today';
    if (daysLeft <= threshold) return 'Soon';
    return 'None';
};

/**
 * Email template for vaccination reminders
 */
const getReminderEmailHtml = (userName, dueReminders, pendingCount) => {
    const itemsHtml = dueReminders.map(item => {
        const { v, daysLeft, currentLevel } = item;
        let timeMsg = currentLevel === 'Today' ? "today" : `in ${daysLeft} day${daysLeft > 1 ? 's' : ''}`;
        if (currentLevel === 'Overdue') timeMsg = `${Math.abs(daysLeft)} days ago`;
        
        return `<li style="margin-bottom: 8px;">
            <strong>${v.petName}</strong> — ${v.vaccineName} <b>(${timeMsg})</b>
            <br/><span style="color: #5D4037;">Due: ${new Date(v.nextVaccinationDate).toLocaleDateString()}</span>
        </li>`;
    }).join('');

    return `
        <div style="font-family: Arial, sans-serif; max-width: 520px; margin: 0 auto; padding: 32px; background: #FDF8F6; border-radius: 12px; border: 1px solid #E8DDD9;">
            <div style="text-align: center; margin-bottom: 24px;">
                <h2 style="color: #5D4037; margin: 0;">🐾 Aashrey For Paws</h2>
            </div>
            <h3 style="color: #dc3545;">⚠️ Vaccination Reminder</h3>
            <p style="color: #555;">Hello <strong>${userName}</strong>,</p>
            <p style="color: #555;">The following vaccinations are due soon:</p>
            <ul style="color: #555; line-height: 1.8;">
                ${itemsHtml}
            </ul>
            <p style="color: #555;">Please visit your vet as soon as possible to keep your pets healthy.</p>
            <hr style="border: none; border-top: 1px solid #E8DDD9; margin: 24px 0;">
            <p style="color: #aaa; font-size: 0.8rem; text-align: center;">Aashrey For Paws · Keeping your pets healthy</p>
        </div>
    `;
};

module.exports = {
    calculateNextDueDate,
    createTransporter,
    determineUrgencyLevel,
    getReminderEmailHtml
};
