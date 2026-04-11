import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../services/axios';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import './Auth.css';

function ResetPassword() {
    const location = useLocation();
    const navigate = useNavigate();
    
    // Get email from previous step (ForgotPassword state)
    const [email, setEmail] = useState(location.state?.email || '');
    const [otp, setOtp] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!email || !otp || !password || !confirmPassword) {
            return toast.error('All fields are required');
        }
        if (password !== confirmPassword) {
            return toast.error('Passwords do not match');
        }
        if (otp.length !== 6) {
            return toast.error('OTP must be 6 digits');
        }

        setLoading(true);
        try {
            const response = await api.post('/auth/reset-password', { 
                email, 
                otp, 
                newPassword: password 
            });
            
            if (response.data.success) {
                toast.success('Password reset successfully! Please login.');
                navigate('/login');
            } else {
                toast.error(response.data.message || 'Failed to reset password.');
            }
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || 'Invalid or expired OTP code.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-wrapper">
            <div className="auth-image-side">
                <div className="auth-image-text">
                    <h2>Verification Required</h2>
                    <p>Enter the 6-digit code sent to your inbox.</p>
                </div>
            </div>

            <div className="auth-form-side">
                <div className="auth-box">
                    <div className="auth-header">
                        <h1>Reset Password</h1>
                        <p>Complete the verification to recover your account.</p>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div className="input-group">
                            <label htmlFor='email'>Verify Email</label>
                            <input
                                type='email'
                                name='email'
                                placeholder='name@example.com'
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>

                        <div className="input-group">
                            <label htmlFor='otp'>Recovery OTP (6-digits)</label>
                            <input
                                type='text'
                                name='otp'
                                maxLength="6"
                                placeholder='123456'
                                value={otp}
                                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                            />
                        </div>

                        <div className="input-group">
                            <label htmlFor='password'>New Password</label>
                            <div className="password-input-wrapper">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    name='password'
                                    placeholder='••••••••'
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                                <div 
                                    className="password-toggle-icon"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                                </div>
                            </div>
                        </div>
                        
                        <div className="input-group">
                            <label htmlFor='confirmPassword'>Confirm New Password</label>
                            <div className="password-input-wrapper">
                                <input
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    name='confirmPassword'
                                    placeholder='••••••••'
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                />
                                <div 
                                    className="password-toggle-icon"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                >
                                    {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                                </div>
                            </div>
                        </div>

                        <button type='submit' className='btn btn-primary btn-auth' disabled={loading}>
                            {loading ? 'Processing...' : 'Change Password'}
                        </button>

                        <div className="auth-footer">
                            <Link to="/login">Cancel and Go to Login</Link>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default ResetPassword;
