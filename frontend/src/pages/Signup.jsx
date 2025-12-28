import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

function Signup() {
    const [signupInfo, setSignupInfo] = useState({
        name: '',
        email: '',
        password: ''
    });

    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setSignupInfo((prev) => ({ ...prev, [name]: value }));
    };

    const handleSignup = async (e) => {
        e.preventDefault();
        const { name, email, password } = signupInfo;
        if (!name || !email || !password) {
            return toast.error('Name, email and password are required');
        }
        try {
            const url = `http://localhost:5000/auth/signup`;
            const response = await fetch(url, {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(signupInfo)
            });
            const result = await response.json();
            const { success, message, error } = result;
            if (success) {
                toast.success(message);
                setTimeout(() => {
                    navigate('/login');
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
                <h1>Signup</h1>
                <form onSubmit={handleSignup}>
                    <div>
                        <label htmlFor='name'>Name</label>
                        <input
                            onChange={handleChange}
                            type='text'
                            name='name'
                            autoFocus
                            placeholder='Enter your name...'
                            value={signupInfo.name}
                        />
                    </div>
                    <div>
                        <label htmlFor='email'>Email</label>
                        <input
                            onChange={handleChange}
                            type='email'
                            name='email'
                            placeholder='Enter your email...'
                            value={signupInfo.email}
                        />
                    </div>
                    <div>
                        <label htmlFor='password'>Password</label>
                        <input
                            onChange={handleChange}
                            type='password'
                            name='password'
                            placeholder='Enter your password...'
                            value={signupInfo.password}
                        />
                    </div>
                    <button type='submit' className='btn btn-primary'>Signup</button>
                    <span>Already have an account? <Link to="/login">Login</Link></span>
                </form>
            </div>
            {/* Styles are shared via App.css/index.css or locally injected in Login, relying on same structure */}
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

export default Signup;
