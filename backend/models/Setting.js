const mongoose = require('mongoose');

const SettingSchema = new mongoose.Schema({
    platformAddress: { type: String, default: '' },
    platformPhone: { type: String, default: '' },
    platformEmail: { type: String, default: '' },
    updatedAt: { type: Date, default: Date.now }
});

// Enforce singleton pattern — only one settings document allowed
SettingSchema.statics.getSingleton = async function () {
    let settings = await this.findOne();
    if (!settings) {
        settings = await this.create({
            platformAddress: '',
            platformPhone: '',
            platformEmail: ''
        });
    }
    return settings;
};

module.exports = mongoose.model('Setting', SettingSchema);
