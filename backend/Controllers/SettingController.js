const Setting = require('../models/Setting');

// GET /api/settings — Public, returns platform contact info
exports.getSettings = async (req, res) => {
    try {
        const settings = await Setting.getSingleton();
        res.json({ success: true, data: settings });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Failed to load settings' });
    }
};

// PUT /api/settings — Admin only, update platform contact info
exports.updateSettings = async (req, res) => {
    try {
        const { platformAddress, platformPhone, platformEmail } = req.body;
        const settings = await Setting.getSingleton();

        if (platformAddress !== undefined) settings.platformAddress = platformAddress;
        if (platformPhone !== undefined) settings.platformPhone = platformPhone;
        if (platformEmail !== undefined) settings.platformEmail = platformEmail;
        settings.updatedAt = Date.now();

        await settings.save();
        res.json({ success: true, data: settings, message: 'Platform settings updated successfully' });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Failed to update settings' });
    }
};
