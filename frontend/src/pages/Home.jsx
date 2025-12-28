import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

function Home() {
    const [loggedInUser, setLoggedInUser] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        setLoggedInUser(localStorage.getItem('loggedInUser'));
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('loggedInUser');
        toast.success("Logged out successfully");
        setLoggedInUser('');
        setTimeout(() => {
            navigate('/login');
        }, 1000);
    }

    return (
        <div className="home-page">
            <header className="hero-section">
                <div className="container hero-container">
                    <div className="hero-content">
                        <h1>Welcome to Aashrey For Paws</h1>
                        <p className="hero-subtitle">Adopt, Don't Shop. Find your new best friend today.</p>
                        <div className="hero-actions">
                            {loggedInUser ? (
                                <div className="user-welcome">
                                    <p>Welcome back, <strong>{loggedInUser}</strong>!</p>
                                    <button onClick={handleLogout} className="btn btn-outline">Logout</button>
                                </div>
                            ) : (
                                <div className="auth-buttons">
                                    <button onClick={() => navigate('/login')} className="btn btn-primary">Login</button>
                                    <button onClick={() => navigate('/signup')} className="btn btn-outline">Signup</button>
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="hero-image">
                        <img src="https://images.unsplash.com/photo-1543466835-00a7907e9de1?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" alt="Cute Dog" />
                    </div>
                </div>
            </header>

            <section className="features-section container">
                <h2>Why Choose Adoption?</h2>
                <div className="features-grid">
                    <div className="feature-card">
                        <div className="icon">🏠</div>
                        <h3>Save a Life</h3>
                        <p>Giving a rescue animal a second chance at life is a rewarding experience.</p>
                    </div>
                    <div className="feature-card">
                        <div className="icon">❤️</div>
                        <h3>Unconditional Love</h3>
                        <p>Rescue pets are often the most loving and loyal companions.</p>
                    </div>
                    <div className="feature-card">
                        <div className="icon">🛡️</div>
                        <h3>Fight Puppy Mills</h3>
                        <p>Adoption reduces the demand for commercial breeding facilities.</p>
                    </div>
                </div>
            </section>

            <style>{`
                .home-page {
                    padding-bottom: 4rem;
                }
                .hero-section {
                    background: linear-gradient(to right, #FDFBF7, #EFEBE9);
                    padding: 4rem 0;
                    margin-bottom: 4rem;
                }
                .hero-container {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 2rem;
                }
                .hero-content {
                    flex: 1;
                }
                .hero-content h1 {
                    font-size: 3rem;
                    color: var(--color-primary-dark);
                    margin-bottom: 1rem;
                    line-height: 1.1;
                }
                .hero-subtitle {
                    font-size: 1.2rem;
                    color: var(--color-text-light);
                    margin-bottom: 2rem;
                }
                .hero-actions {
                    display: flex;
                    gap: 1rem;
                }
                .user-welcome {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                }
                .auth-buttons {
                    display: flex;
                    gap: 1rem;
                }
                .hero-image {
                    flex: 1;
                    display: flex;
                    justify-content: center;
                }
                .hero-image img {
                    max-width: 100%;
                    border-radius: var(--radius-lg);
                    box-shadow: var(--shadow-lg);
                }
                
                .features-section h2 {
                    text-align: center;
                    font-size: 2rem;
                    color: var(--color-primary-dark);
                    margin-bottom: 3rem;
                }
                .features-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
                    gap: 2rem;
                }
                .feature-card {
                    background: var(--color-surface);
                    padding: 2rem;
                    border-radius: var(--radius-md);
                    box-shadow: var(--shadow-md);
                    text-align: center;
                    transition: transform 0.3s ease;
                }
                .feature-card:hover {
                    transform: translateY(-5px);
                }
                .feature-card .icon {
                    font-size: 3rem;
                    margin-bottom: 1rem;
                }
                .feature-card h3 {
                    color: var(--color-primary);
                    margin-bottom: 0.5rem;
                }

                @media (max-width: 768px) {
                    .hero-container {
                        flex-direction: column-reverse;
                        text-align: center;
                    }
                    .hero-actions {
                        justify-content: center;
                    }
                    .hero-content h1 {
                        font-size: 2.5rem;
                    }
                }
            `}</style>
        </div>
    );
}

export default Home;
