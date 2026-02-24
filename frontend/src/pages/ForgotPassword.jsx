import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../services/axios';
import './Auth.css';

function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!email) {
            return toast.error('Please enter your email address');
        }

        setLoading(true);
        try {
            const response = await api.post('/auth/forgot-password', { email });
            if (response.data.success) {
                toast.success(response.data.message || 'Password reset link sent to your email.');
            } else {
                toast.error(response.data.message || 'Failed to send reset link.');
            }
        } catch (error) {
            console.error(error);
            // Fallback for Mock/Demo if backend is not running
            if (!error.response) {
                toast.success('Mock: Password reset link sent to your email.');
            } else {
                toast.error(error.response?.data?.message || 'Something went wrong. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-wrapper">
            <div className="auth-image-side">
                <div className="auth-image-text">
                    <h2>Recover Access</h2>
                    <p>Don't worry, it happens to the best of us.</p>
                </div>
            </div>

            <div className="auth-form-side">
                <div className="auth-box">
                    <div className="auth-header">
                        <h1>Forgot Password?</h1>
                        <p>Enter your email to receive a reset link.</p>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div className="input-group">
                            <label htmlFor='email'>Email Address</label>
                            <input
                                type='email'
                                name='email'
                                autoFocus
                                placeholder='name@example.com'
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>

                        <button type='submit' className='btn btn-primary btn-auth' disabled={loading}>
                            {loading ? 'Sending...' : 'Send Reset Link'}
                        </button>

                        <div className="auth-footer">
                            Remember your password? <Link to="/login">Log In</Link>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default ForgotPassword;
