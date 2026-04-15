const config = {
    // Server settings
    port: process.env.PORT,
    nodeEnv: process.env.NODE_ENV || 'development',
    frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
    // Database
    mongoUri: process.env.MONGO_URI,
    // Authentication
    jwtSecret: process.env.JWT_SECRET,
    jwtExpire: process.env.JWT_EXPIRE || '7d',
    // Cloudinary for image uploads
    cloudinary: {
        cloudName: process.env.CLOUDINARY_CLOUD_NAME,
        apiKey: process.env.CLOUDINARY_API_KEY,
        apiSecret: process.env.CLOUDINARY_API_SECRET
    },
    // Email service
    email: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
        smtpEmail: process.env.SMTP_EMAIL,
        smtpPass: process.env.SMTP_PASSWORD,
        smtpService: process.env.SMTP_SERVICE || 'gmail'
    },
    // Khalti Payment Gateway
    khalti: {
        apiUrl: process.env.KHALTI_API_URL || 'https://a.khalti.com/api/v2/epayment/initiate/',
        verifyUrl: process.env.KHALTI_VERIFY_URL || 'https://a.khalti.com/api/v2/epayment/lookup/',
        secretKey: process.env.KHALTI_SECRET_KEY,
        publicKey: process.env.KHALTI_PUBLIC_KEY
    },
    // Admin Credentials
    admin: {
        email: process.env.ADMIN_EMAIL,
        password: process.env.ADMIN_PASSWORD
    }
};

const criticalKeys = ['MONGO_URI', 'JWT_SECRET', 'PORT'];
criticalKeys.forEach(key => {
    if (!process.env[key]) {
        console.warn(`WARNING: Missing critical environment variable: ${key}`);
    }
});

module.exports = config;