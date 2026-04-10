const VaccinationModel = require('../models/Vaccination');
const UserModel = require('../models/User');
const vaccinationService = require('../services/VaccinationService');
const notificationService = require('../services/NotificationService');
const config = require('../config/config');

/**
 * Fetch all vaccinations for a specific user
 */
const getMyVaccinations = async (req, res) => {
    try {
        const userId = req.user._id;
        const vaccinations = await VaccinationModel.find({ userId }).sort({ nextVaccinationDate: 1 });
        res.status(200).json({ success: true, data: vaccinations });
    } catch (err) {
        res.status(500).json({ success: false, message: "Failed to fetch vaccinations" });
    }
};

/**
 * Mark a vaccination as completed
 */
const markVaccinationAsCompleted = async (req, res) => {
    try {
        const { id } = req.params;
        const vaccination = await VaccinationModel.findByIdAndUpdate(id, { status: 'Completed' }, { new: true });
        
        if (!vaccination) {
            return res.status(404).json({ success: false, message: "Vaccination record not found" });
        }

        await notificationService.createNotification(
            vaccination.userId,
            'info',
            `Vaccination for ${vaccination.petName} (${vaccination.vaccineName}) marked as completed!`,
            '/user?tab=vaccines'
        );

        res.status(200).json({ success: true, message: "Marked as completed", data: vaccination });
    } catch (err) {
        res.status(500).json({ success: false, message: "Failed to update record" });
    }
};

/**
 * Schedule a new vaccination
 */
const addVaccinationSchedule = async (req, res) => {
    try {
        const { petId, petName, vaccineName, vaccinationDate, executionDate, notes, reminderDays } = req.body;
        const userId = req.user._id;

        const vacDate = new Date(vaccinationDate);
        const nextDate = executionDate ? new Date(executionDate) : vaccinationService.calculateNextDueDate(vacDate, vaccineName);

        const newVaccine = await VaccinationModel.create({
            petId: petId || null,
            petName,
            userId,
            vaccineName,
            vaccinationDate: vacDate,
            nextVaccinationDate: nextDate,
            notes: notes || '',
            status: 'Upcoming',
            reminderDays: reminderDays != null ? parseInt(reminderDays) : 3
        });

        // Background: Send email confirmation
        try {
            const user = await UserModel.findById(userId);
            if (user && user.email && config.email.user) {
                const transporter = vaccinationService.createTransporter();
                const formattedDate = new Date(nextDate).toLocaleDateString(undefined, {
                    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
                });
                await transporter.sendMail({
                    from: `"Aashrey For Paws" <${config.email.user}>`,
                    to: user.email,
                    subject: `Vaccination Scheduled for ${petName} - Aashrey For Paws`,
                    html: `<h3>Vaccination Scheduled!</h3><p>Next due: ${formattedDate}</p>`
                });
            }
        } catch (emailErr) {
            console.warn('Vaccination email failed:', emailErr.message);
        }

        await notificationService.createNotification(
            userId,
            'info',
            `Vaccination scheduled for ${petName} (${vaccineName}). Next due: ${new Date(nextDate).toLocaleDateString()}`,
            '/user?tab=vaccines'
        );

        res.status(201).json({ success: true, message: "Vaccination scheduled", data: newVaccine });
    } catch (err) {
        console.error('addVaccinationSchedule error:', err.message);
        res.status(500).json({ success: false, message: "Failed to schedule vaccination" });
    }
};

/**
 * Check for due vaccinations and create notifications
 */
const checkAndNotify = async (req, res) => {
    try {
        const userId = req.user._id;
        const pending = await VaccinationModel.find({ userId, status: { $ne: 'Completed' } });
        
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const dueReminders = [];
        for (const v of pending) {
            const due = new Date(v.nextVaccinationDate);
            due.setHours(0, 0, 0, 0);
            
            const diffTime = due.getTime() - today.getTime();
            const daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            const threshold = v.reminderDays != null ? v.reminderDays : 3;
            
            const currentLevel = vaccinationService.determineUrgencyLevel(daysLeft, threshold);
            const hierarchy = { 'None': 0, 'Soon': 1, 'Today': 2, 'Overdue': 3 };
            const lastLevel = v.lastNotifiedLevel || 'None';
            
            if (currentLevel !== 'None' && hierarchy[currentLevel] > hierarchy[lastLevel]) {
                dueReminders.push({ v, currentLevel, daysLeft });
            }
        }

        if (dueReminders.length === 0) {
            return res.status(200).json({ success: true, message: "No new reminders", count: 0 });
        }

        // Processing reminders
        for (const item of dueReminders) {
            const { v, currentLevel, daysLeft } = item;
            let timeMsg = currentLevel === 'Today' ? "TODAY" : `in ${daysLeft} days`;
            let alertType = currentLevel === 'Overdue' ? 'critical' : (currentLevel === 'Today' ? 'urgent' : 'alert');
            
            await notificationService.createNotification(
                userId,
                alertType,
                `URGENT: ${v.petName} is due for ${v.vaccineName} ${timeMsg}!`,
                '/user?tab=vaccines'
            );
        }

        // Background: Email notification
        try {
            const user = await UserModel.findById(userId);
            if (user && user.email && config.email.user) {
                const transporter = vaccinationService.createTransporter();
                const html = vaccinationService.getReminderEmailHtml(user.name, dueReminders, pending.length);
                await transporter.sendMail({
                    from: `"Aashrey For Paws" <${config.email.user}>`,
                    to: user.email,
                    subject: `Vaccination Reminder - Due Soon | Aashrey For Paws`,
                    html
                });
            }
        } catch (emailErr) {
            console.warn('Email failed:', emailErr.message);
        }

        const bulkOps = dueReminders.map(item => ({
            updateOne: {
                filter: { _id: item.v._id },
                update: { $set: { lastNotifiedLevel: item.currentLevel, isNotified: true } }
            }
        }));
        await VaccinationModel.bulkWrite(bulkOps);

        res.status(200).json({ success: true, count: dueReminders.length, data: dueReminders.map(i => i.v) });
    } catch (err) {
        res.status(500).json({ success: false, message: "Failed to check reminders" });
    }
};

const editVaccination = async (req, res) => {
    try {
        const { id } = req.params;
        const updated = await VaccinationModel.findOneAndUpdate(
            { _id: id, userId: req.user._id },
            { $set: { ...req.body, isNotified: false } },
            { new: true }
        );
        if (!updated) return res.status(404).json({ success: false, message: "Record not found" });
        res.status(200).json({ success: true, data: updated });
    } catch (err) {
        res.status(500).json({ success: false, message: "Update failed" });
    }
};

const deleteVaccination = async (req, res) => {
    try {
        const deleted = await VaccinationModel.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
        if (!deleted) return res.status(404).json({ success: false, message: "Record not found" });
        res.status(200).json({ success: true, message: "Deleted" });
    } catch (err) {
        res.status(500).json({ success: false, message: "Delete failed" });
    }
};

module.exports = {
    getMyVaccinations,
    markVaccinationAsCompleted,
    addVaccinationSchedule,
    checkAndNotify,
    editVaccination,
    deleteVaccination
};
