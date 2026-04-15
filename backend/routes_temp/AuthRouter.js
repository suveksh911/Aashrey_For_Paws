const router = require('express').Router();
const { register, login, forgotPassword, resetPassword, verifyOTP } = require('../controllers/AuthController');
const validate = require('../middlewares/validate');
const { 
    registerSchema, 
    loginSchema, 
    forgotPasswordSchema, 
    resetPasswordSchema, 
    verifyOTPSchema 
} = require('../validators/AuthValidator');


router.post('/login', validate(loginSchema), login);
router.post('/signup', validate(registerSchema), register);
router.post('/forgot-password', validate(forgotPasswordSchema), forgotPassword);
router.post('/reset-password', validate(resetPasswordSchema), resetPassword);
router.post('/verify-otp', validate(verifyOTPSchema), verifyOTP);

module.exports = router;
