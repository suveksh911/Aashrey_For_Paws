import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

function Login() {
    const [loginInfo, setLoginInfo] = useState({
        email: '',
        password: ''
    });
    const [rememberMe, setRememberMe] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        const savedEmail = localStorage.getItem('rememberedEmail');
        if (savedEmail) {
            setLoginInfo(prev => ({ ...prev, email: savedEmail }));
            setRememberMe(true);
        }
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setLoginInfo((prev) => ({ ...prev, [name]: value }));
    };

    const handleRememberMe = (e) => {
        setRememberMe(e.target.checked);
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        const { email, password } = loginInfo;
        if (!email || !password) {
            return toast.error('Email and password are required');
        }
        
        const result = await login(email, password);
        
        if (result.success) {
            if (rememberMe) {
                localStorage.setItem('rememberedEmail', email);
            } else {
                localStorage.removeItem('rememberedEmail');
            }

            
            setTimeout(() => {
                if (result.role === 'Admin') navigate('/admin');
                else if (result.role === 'NGO') navigate('/ngo');
                else navigate('/user');
            }, 500);
        }
    };

    return (
        <div className="auth-wrapper">
            <div className="auth-image-side">
                <div className="auth-image-text">
                    <h2>Welcome Back!</h2>
                    <p>Log in to continue your journey of finding a furry friend.</p>
                </div>
            </div>
            
            <div className="auth-form-side">
                <div className="auth-box">
                    <div className="auth-header">
                        <h1>Login</h1>
                        <p>Enter your details to access your account</p>
                    </div>

                    <form onSubmit={handleLogin}>
                        <div className="input-group">
                            <label htmlFor='email'>Email Address</label>
                            <input
                                onChange={handleChange}
                                type='email'
                                name='email'
                                placeholder='name@example.com'
                                value={loginInfo.email}
                            />
                        </div>
                        <div className="input-group">
                            <label htmlFor='password'>Password</label>
                            <input
                                onChange={handleChange}
                                type='password'
                                name='password'
                                placeholder='••••••••'
                                value={loginInfo.password}
                            />
                        </div>
                        
                        <div className="auth-options">
                            <label className="remember-me">
                                <input
                                    type="checkbox"
                                    checked={rememberMe}
                                    onChange={handleRememberMe}
                                />
                                Remember Me
                            </label>
                            <Link to="/forgot-password" onClick={(e) => { e.preventDefault(); toast.info("Forgot Password feature coming soon!"); }} className="forgot-link">
                                Forgot Password?
                            </Link>
                        </div>

                        <button type='submit' className='btn btn-primary btn-auth'>Sign In</button>
                        
                        <div className="auth-footer">
                            Don't have an account? <Link to="/signup">Sign Up</Link>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default Login;
