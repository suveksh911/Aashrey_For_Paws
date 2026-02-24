import React, { useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../services/axios';
import './Auth.css';

function ResetPassword() {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!password || !confirmPassword) {
            return toast.error('All fields are required');
        }
        if (password !== confirmPassword) {
            return toast.error('Passwords do not match');
        }

        setLoading(true);
        try {
            const response = await api.post('/auth/reset-password', { token, password });
            if (response.data.success) {
                toast.success('Password reset successfully! Please login.');
                navigate('/login');
            } else {
                toast.error(response.data.message || 'Failed to reset password.');
            }
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || 'Something went wrong. Link might be expired.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-wrapper">
            <div className="auth-image-side">
                <div className="auth-image-text">
                    <h2>New Beginning</h2>
                    <p>Secure your account with a new password.</p>
                </div>
            </div>

            <div className="auth-form-side">
                <div className="auth-box">
                    <div className="auth-header">
                        <h1>Reset Password</h1>
                        <p>Create a strong new password.</p>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div className="input-group">
                            <label htmlFor='password'>New Password</label>
                            <input
                                type='password'
                                name='password'
                                placeholder='••••••••'
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                        <div className="input-group">
                            <label htmlFor='confirmPassword'>Confirm Password</label>
                            <input
                                type='password'
                                name='confirmPassword'
                                placeholder='••••••••'
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                            />
                        </div>

                        <button type='submit' className='btn btn-primary btn-auth' disabled={loading}>
                            {loading ? 'Resetting...' : 'Reset Password'}
                        </button>

                        <div className="auth-footer">
                            <Link to="/login">Back to Login</Link>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default ResetPassword;
