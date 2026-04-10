const cloudinary = require('cloudinary').v2;
const config = require('../config/config');

cloudinary.config({
    cloud_name: config.cloudinary.cloudName,
    api_key: config.cloudinary.apiKey,
    api_secret: config.cloudinary.apiSecret
});

const uploadBase64Image = async (base64Image, folder = 'aashrey_for_paws') => {
    try {
        if (!base64Image || !base64Image.startsWith('data:image')) {
            return base64Image;
        }

        const result = await cloudinary.uploader.upload(base64Image, {
            folder: folder,
            resource_type: "auto"
        });

        return result.secure_url;
    } catch (error) {
        console.error('Cloudinary upload error:', error);
        throw new Error('Image upload failed');
    }
};

module.exports = { uploadBase64Image };


