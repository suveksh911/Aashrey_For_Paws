const Joi = require('joi');

const registerSchema = Joi.object({
    name: Joi.string().trim().min(2).max(50).required().messages({
        'string.empty': 'Name is required',
        'string.min': 'Name must be at least 2 characters long'
    }),
    email: Joi.string().trim().email().required().messages({
        'string.email': 'Please provide a valid email address',
        'string.empty': 'Email is required'
    }),
    password: Joi.string().min(6).required().messages({
        'string.min': 'Password must be at least 6 characters long',
        'string.empty': 'Password is required'
    }),
    confirmPassword: Joi.string().valid(Joi.ref('password')).required().messages({
        'any.only': 'Passwords do not match'
    }),
    role: Joi.string().valid('user', 'seller', 'NGO', 'Adopter', 'Owner').default('user'),
    phone: Joi.string().allow('', null),
    address: Joi.string().allow('', null),
    orgName: Joi.string().allow('', null),
    registrationNo: Joi.string().allow('', null),
    website: Joi.string().allow('', null).uri().optional(),
    mission: Joi.string().allow('', null)
});

const loginSchema = Joi.object({
    email: Joi.string().trim().email().required().messages({
        'string.email': 'Valid email is required',
        'string.empty': 'Email is required'
    }),
    password: Joi.string().required().messages({
        'string.empty': 'Password is required'
    })
});

const forgotPasswordSchema = Joi.object({
    email: Joi.string().trim().email().required()
});

const resetPasswordSchema = Joi.object({
    email: Joi.string().trim().email().required(),
    otp: Joi.string().length(6).required(),
    newPassword: Joi.string().min(6).required()
});

const verifyOTPSchema = Joi.object({
    email: Joi.string().trim().email().required(),
    otp: Joi.string().length(6).required()
});

module.exports = {
    registerSchema,
    loginSchema,
    forgotPasswordSchema,
    resetPasswordSchema,
    verifyOTPSchema
};
