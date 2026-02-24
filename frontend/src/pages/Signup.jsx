import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

function Signup() {
    const [signupInfo, setSignupInfo] = useState({
        name: '',
        email: '',
        password: '',
        role: 'Adopter'
    });

    const { signup } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setSignupInfo((prev) => ({ ...prev, [name]: value }));
    };

    const handleSignup = async (e) => {
        e.preventDefault();
        const { name, email, password, role } = signupInfo;
        if (!name || !email || !password || !role) {
            return toast.error('Name, email, password and role are required');
        }

        const result = await signup(signupInfo);

        if (result.success) {
            setTimeout(() => {
                navigate('/login');
            }, 1000)
        }
    };

    return (
        <div className="auth-wrapper">
            <div className="auth-image-side">
                <div className="auth-image-text">
                    <h2>Join Our Community</h2>
                    <p>Create an account to adopt, foster, or help pets find a home.</p>
                </div>
            </div>

            <div className="auth-form-side">
                <div className="auth-box">
                    <div className="auth-header">
                        <h1>Create Account</h1>
                        <p>Join Aashrey For Paws today!</p>
                    </div>

                    <form onSubmit={handleSignup}>
                        <div className="input-group">
                            <label htmlFor='name'>Full Name</label>
                            <input
                                onChange={handleChange}
                                type='text'
                                name='name'
                                autoFocus
                                placeholder='John Doe'
                                value={signupInfo.name}
                            />
                        </div>
                        <div className="input-group">
                            <label htmlFor='email'>Email Address</label>
                            <input
                                onChange={handleChange}
                                type='email'
                                name='email'
                                placeholder='name@example.com'
                                value={signupInfo.email}
                            />
                        </div>
                        <div className="input-group">
                            <label htmlFor='password'>Password</label>
                            <input
                                onChange={handleChange}
                                type='password'
                                name='password'
                                placeholder='••••••••'
                                value={signupInfo.password}
                            />
                        </div>
                        <div className="input-group">
                            <label className="role-label">I want to be a...</label>
                            <div className="role-selection">
                                <div
                                    className={`role-card ${signupInfo.role === 'Adopter' ? 'selected' : ''}`}
                                    onClick={() => setSignupInfo({ ...signupInfo, role: 'Adopter' })}
                                >
                                    <div className="role-icon">🏠</div>
                                    <span>Adopter</span>
                                </div>
                                <div
                                    className={`role-card ${signupInfo.role === 'Owner' ? 'selected' : ''}`}
                                    onClick={() => setSignupInfo({ ...signupInfo, role: 'Owner' })}
                                >
                                    <div className="role-icon">🐾</div>
                                    <span>Owner</span>
                                </div>
                                <div
                                    className={`role-card ${signupInfo.role === 'NGO' ? 'selected' : ''}`}
                                    onClick={() => setSignupInfo({ ...signupInfo, role: 'NGO' })}
                                >
                                    <div className="role-icon">🏥</div>
                                    <span>NGO</span>
                                </div>
                            </div>
                        </div>

                        <style>{`
                            .role-label {
                                display: block;
                                margin-bottom: 0.5rem;
                                font-weight: 500;
                            }
                            .role-selection {
                                display: flex;
                                gap: 10px;
                                margin-bottom: 1rem;
                            }
                            .role-card {
                                flex: 1;
                                border: 1px solid #ddd;
                                border-radius: 8px;
                                padding: 10px;
                                text-align: center;
                                cursor: pointer;
                                transition: all 0.2s;
                                background: #fff;
                            }
                            .role-card:hover {
                                background: #f9f9f9;
                                transform: translateY(-2px);
                            }
                            .role-card.selected {
                                border-color: var(--color-primary);
                                background: #fff8f0; /* Light variant of primary color usually */
                                box-shadow: 0 2px 8px rgba(0,0,0,0.1);
                            }
                            .role-icon {
                                font-size: 1.5rem;
                                margin-bottom: 5px;
                            }
                            .role-card span {
                                font-size: 0.9rem;
                                font-weight: 600;
                            }
                        `}</style>

                        <button type='submit' className='btn btn-primary btn-auth'>Sign Up</button>

                        <div className="auth-footer">
                            Already have an account? <Link to="/login">Log In</Link>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default Signup;
