import React, { useEffect, useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../services/axios';
import './Auth.css';

function VerifyEmail() {
    const [status, setStatus] = useState('verifying'); // verifying, success, error
    const [message, setMessage] = useState('Verifying your email address...');
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');
    const navigate = useNavigate();

    useEffect(() => {
        if (!token) {
            setStatus('error');
            setMessage('Invalid verification link.');
            return;
        }

        const verify = async () => {
            try {
                const response = await api.get(`/auth/verify-email?token=${token}`);
                if (response.data.success) {
                    setStatus('success');
                    setMessage('Email verified successfully! You can now login.');
                    setTimeout(() => navigate('/login'), 3000);
                } else {
                    setStatus('error');
                    setMessage(response.data.message || 'Verification failed.');
                }
            } catch (error) {
                setStatus('error');
                setMessage(error.response?.data?.message || 'Verification failed. Link might be expired.');
            }
        };

        verify();
    }, [token, navigate]);

    return (
        <div className="auth-wrapper">
            <div className="auth-image-side">
                <div className="auth-image-text">
                    <h2>Email Verification</h2>
                    <p>Just one last step to get started.</p>
                </div>
            </div>

            <div className="auth-form-side">
                <div className="auth-box">
                    <div className="auth-header">
                        <h1>{status === 'verifying' ? 'Verifying...' : status === 'success' ? 'Verified!' : 'Verification Failed'}</h1>
                        <p className={status === 'error' ? 'error-text' : 'success-text'}>{message}</p>
                    </div>

                    <div style={{ textAlign: 'center', marginTop: '2rem' }}>
                        {status === 'verifying' && <div className="spinner"></div>}

                        {status !== 'verifying' && (
                            <Link to="/login" className="btn btn-primary">Go to Login</Link>
                        )}
                    </div>
                </div>
            </div>
            <style>{`
                .spinner {
                    border: 4px solid rgba(0, 0, 0, 0.1);
                    width: 36px;
                    height: 36px;
                    border-radius: 50%;
                    border-left-color: var(--color-primary);
                    animation: spin 1s linear infinite;
                    margin: 0 auto;
                }
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
                .error-text { color: red; }
                .success-text { color: green; }
            `}</style>
        </div>
    );
}

export default VerifyEmail;
