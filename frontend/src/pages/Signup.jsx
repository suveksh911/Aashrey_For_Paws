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
                            <label htmlFor='role'>I want to be a...</label>
                            <select
                                onChange={handleChange}
                                name='role'
                                value={signupInfo.role}
                            >
                                <option value="Adopter">Pet Adopter</option>
                                <option value="Owner">Pet Owner</option>
                                <option value="NGO">NGO Organization</option>
                            </select>
                        </div>

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
