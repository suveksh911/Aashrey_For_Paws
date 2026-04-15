const User = require('../models/User');
const authService = require('../services/AuthService');
const { notifyAdmins } = require('./NotificationController');


const register = async (req, res) => {
  try {
    const { name, email, password, role, phone, address } = req.body;

    const { backendRole, ngoStatus } = authService.mapRoleToBackend(role);

    const userExists = await User.findOne({ email });
    if (userExists) {
        return res.status(400).json({ success: false, message: "User already exists" });
    }

    const user = await User.create({
        name,
        email,
        password, 
        role: backendRole,
        phone: phone || '',
        address: address || '',
        orgName: req.body.orgName || '',
        registrationNo: req.body.registrationNo || '',
        website: req.body.website || '',
        mission: req.body.mission || '',
        ngoStatus,
        isVerified: false
    });

    res.status(201).json({
      success: true,
      message: "Registration successful. You can now log in.",
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
      },
    });

    
    if (backendRole === 'NGO') {
        await notifyAdmins(
            'warning',
            `🏢 New NGO Verification Request: "${req.body.orgName || user.name}"`,
            '/admin?tab=ngo-verify'
        );
    } else {
        await notifyAdmins(
            'info',
            `👤 New User Registered: ${user.name} (${backendRole})`,
            '/admin?tab=users'
        );
    }
  } catch (error) {
    console.error('Registration Error:', error);
    res.status(500).json({
      success: false,
      message: "An internal server error occurred during registration",
      error: error.message,
    });
  }
};


const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const user = await User.findOne({ email }).select("+otp +otpExpires");

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    if (new Date() > user.otpExpires) {
      return res.status(400).json({ success: false, message: "This OTP has expired" });
    }

    if (String(user.otp).trim() !== String(otp).trim()) {
      return res.status(400).json({ success: false, message: "Invalid OTP code" });
    }

    user.isVerified = true;
    user.otp = undefined; 
    user.otpExpires = undefined;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Verification successful!",
    });
  } catch (error) {
    console.error('OTP Verification Error:', error);
    res.status(500).json({ success: false, message: "Server error during verification" });
  }
};


const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ success: false, message: "No user found with that email address" });
    }

    const otp = authService.generateOTP();
    user.otp = otp;
    user.otpExpires = new Date(Date.now() + 10 * 60 * 1000); 
    await user.save();

    await authService.sendResetEmail(email, otp, user.name);

    res.status(200).json({
      success: true,
      message: "A reset OTP has been sent to your email address.",
    });
  } catch (error) {
    console.error('Forgot Password Error:', error);
    res.status(500).json({ success: false, message: "Error sending reset email" });
  }
};


const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    const user = await User.findOne({ email }).select("+otp +otpExpires");

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    if (!user.otp || String(user.otp).trim() !== String(otp).trim() || new Date() > user.otpExpires) {
      return res.status(400).json({ success: false, message: "Invalid or expired OTP" });
    }

    user.password = newPassword;
    user.otp = undefined;
    user.otpExpires = undefined;
    user.isVerified = true;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Password reset successful! You can now log in.",
    });
  } catch (error) {
    console.error('Reset Password Error:', error);
    res.status(500).json({ success: false, message: "Server error during password reset" });
  }
};


const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select("+password");

    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ success: false, message: "Invalid email or password" });
    }

    const token = authService.generateToken(user);

    res.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token,
      },
    });
  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ success: false, message: "Server error during login" });
  }
};


const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching profile" });
  }
};


const updateProfile = async (req, res) => {
  try {
    const updatedUser = await User.findByIdAndUpdate(req.user._id, req.body, { new: true }).select('-password');
    res.status(200).json({ success: true, message: "Profile updated", data: updatedUser });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error updating profile" });
  }
};

module.exports = {
  register,
  login,
  forgotPassword,
  resetPassword,
  verifyOTP,
  getProfile,
  updateProfile,
};
