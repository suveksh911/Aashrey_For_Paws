import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

function Login() {
    const [loginInfo, setLoginInfo] = useState({
        email: '',
        password: ''
    });
    const [rememberMe, setRememberMe] = useState(false);

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
        try {
            const url = `http://localhost:5000/auth/login`;
            const response = await fetch(url, {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(loginInfo)
            });
            const result = await response.json();
            const { success, message, jwtToken, name, error } = result;
            if (success) {
                toast.success(message);
                localStorage.setItem('token', jwtToken);
                localStorage.setItem('loggedInUser', name);

                if (rememberMe) {
                    localStorage.setItem('rememberedEmail', email);
                } else {
                    localStorage.removeItem('rememberedEmail');
                }

                setTimeout(() => {
                    navigate('/home');
                }, 1000)
            } else if (error) {
                const details = error?.details[0].message;
                toast.error(details);
            } else if (!success) {
                toast.error(message);
            }
        } catch (err) {
            toast.error(err.message);
        }
    };

    return (
        <div className='container'>
            <div className='form-container'>
                <h1>Login</h1>
                <form onSubmit={handleLogin}>
                    <div>
                        <label htmlFor='email'>Email</label>
                        <input
                            onChange={handleChange}
                            type='email'
                            name='email'
                            placeholder='Enter your email...'
                            value={loginInfo.email}
                        />
                    </div>
                    <div>
                        <label htmlFor='password'>Password</label>
                        <input
                            onChange={handleChange}
                            type='password'
                            name='password'
                            placeholder='Enter your password...'
                            value={loginInfo.password}
                        />
                    </div>
                    <div className="form-options">
                        <label className="remember-me">
                            <input
                                type="checkbox"
                                checked={rememberMe}
                                onChange={handleRememberMe}
                            />
                            Remember Me
                        </label>
                        <Link to="/forgot-password" onClick={(e) => { e.preventDefault(); toast.info("Forgot Password feature coming soon!"); }}>Forgot Password?</Link>
                    </div>
                    <button type='submit' className='btn btn-primary'>Login</button>
                    <span>Does't have an account? <Link to="/signup">Signup</Link></span>
                </form>
            </div>

            <style>{`
                .form-container {
                    max-width: 400px;
                    margin: 2rem auto;
                    padding: 2rem;
                    background: var(--color-surface);
                    border-radius: var(--radius-lg);
                    box-shadow: var(--shadow-lg);
                    border: 1px solid var(--color-border);
                }
                .form-container h1 {
                    text-align: center;
                    margin-bottom: 1.5rem;
                    color: var(--color-primary-dark);
                }
                .form-container form div {
                    margin-bottom: 1rem;
                }
                .form-container label {
                    display: block;
                    margin-bottom: 0.5rem;
                    color: var(--color-text-light);
                }
                .form-container input[type="text"],
                .form-container input[type="email"],
                .form-container input[type="password"] {
                    width: 100%;
                    padding: 0.75rem;
                    border: 1px solid var(--color-border);
                    border-radius: var(--radius-sm);
                    font-size: 1rem;
                    font-family: var(--font-family-base);
                }
                .form-container input:focus {
                    outline: 2px solid var(--color-primary);
                    border-color: transparent;
                }
                .form-options {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    font-size: 0.9rem;
                    margin-bottom: 1.5rem;
                }
                .remember-me {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    margin-bottom: 0 !important;
                    cursor: pointer;
                }
                .form-container button {
                    width: 100%;
                    padding: 0.75rem;
                    font-size: 1.1rem;
                    margin-bottom: 1rem;
                }
                .form-container span {
                    display: block;
                    text-align: center;
                    font-size: 0.9rem;
                    color: var(--color-text-light);
                }
                .form-container span a {
                    color: var(--color-primary);
                    font-weight: 600;
                }
                .form-container span a:hover {
                    text-decoration: underline;
                }
            `}</style>
        </div>
    );
}

export default Login;
