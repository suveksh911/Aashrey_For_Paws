import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';

function Home() {

    const navigate = useNavigate();
    const { user, logout } = useAuth();

    useEffect(() => {
        // Automatically redirect Admin to the Admin Dashboard
        if (user && user.role === 'Admin') {
            navigate('/admin', { replace: true });
        }
    }, [user, navigate]);



    return (
        <div className="home-page">
            <header className="hero-section">
                <div className="hero-background-shapes">
                    <div className="shape shape-1"></div>
                    <div className="shape shape-2"></div>
                </div>
                <div className="container hero-container">
                    <div className="hero-content">
                        
                        <h1>Welcome to <span className="highlight">Aashrey For Paws</span></h1>
                        <p className="hero-description">
                            A complete platform designed to simplify and improve the way people adopt, buy and care for pets. 
                            Whether you are looking to adopt a pet in need of a loving home or responsibly purchase one, 
                            our system connects you with trusted NGOs and verified pet owners through a secure and easy to use interface. 
                            With the belief “Adopt, Don’t Shop” at its core while still supporting ethical buying.Our platform ensures transparency, 
                            proper pet information and smooth communication throughout the process.
                        </p>
                        <div className="hero-actions">
                            <button onClick={() => navigate('/pet-find')} className="btn btn-primary btn-lg">
                                Explore Pets
                            </button>
                            <button onClick={() => navigate('/signup')} className="btn btn-outline btn-lg">
                                Join Community
                            </button>
                        </div>
                    </div>
                    <div className="hero-image-wrapper">
                        <div className="hero-image-inner">
                            <img src="https://images.unsplash.com/photo-1543466835-00a7907e9de1?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" alt="Cute Dog" />
                            <div className="image-experience-badge">
                                <strong>1 Years</strong>
                                <span>Experience</span>
                            </div>
                        </div>
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
                    background-color: #FDFBF7;
                }
                .hero-section {
                    position: relative;
                    padding: 6rem 0;
                    margin-bottom: 4rem;
                    overflow: hidden;
                    background: linear-gradient(135deg, #FDFBF7 0%, #F5F1EE 100%);
                }

                /* Decorative Shapes */
                .hero-background-shapes {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    overflow: hidden;
                    z-index: 0;
                    pointer-events: none;
                }
                .shape {
                    position: absolute;
                    border-radius: 50%;
                    filter: blur(80px);
                    opacity: 0.4;
                }
                .shape-1 {
                    top: -10%;
                    left: -5%;
                    width: 400px;
                    height: 400px;
                    background: var(--color-accent);
                }
                .shape-2 {
                    bottom: 5%;
                    right: 5%;
                    width: 300px;
                    height: 300px;
                    background: var(--color-primary);
                    opacity: 0.15;
                }

                .hero-container {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 4rem;
                    position: relative;
                    z-index: 1;
                }
                .hero-content {
                    flex: 1.2;
                }
                .hero-badge {
                    display: inline-block;
                    background: rgba(141, 110, 99, 0.1);
                    color: var(--color-primary-dark);
                    padding: 8px 16px;
                    border-radius: 30px;
                    font-size: 0.85rem;
                    font-weight: 700;
                    margin-bottom: 1.5rem;
                    border: 1px solid rgba(141, 110, 99, 0.2);
                }
                .hero-content h1 {
                    font-size: 3.8rem;
                    font-weight: 800;
                    color: var(--color-text);
                    margin-bottom: 1.5rem;
                    line-height: 1.1;
                    letter-spacing: -2px;
                }
                .hero-content .highlight {
                    color: var(--color-primary);
                    display: block;
                }
                .hero-description {
                    font-size: 1.05rem;
                    line-height: 1.8;
                    color: var(--color-text-light);
                    margin-bottom: 2.5rem;
                    max-width: 600px;
                }
                .hero-actions {
                    display: flex;
                    gap: 1.25rem;
                }
                .btn-lg {
                    padding: 16px 32px;
                    font-size: 1.05rem;
                    border-radius: 14px;
                }

                /* Image Section */
                .hero-image-wrapper {
                    flex: 0.8;
                    position: relative;
                }
                .hero-image-inner {
                    position: relative;
                    padding: 15px;
                    background: white;
                    border-radius: 30px;
                    box-shadow: 0 20px 50px rgba(93, 64, 55, 0.15);
                    transform: rotate(2deg);
                }
                .hero-image-inner img {
                    width: 100%;
                    height: auto;
                    border-radius: 20px;
                    display: block;
                }
                .image-experience-badge {
                    position: absolute;
                    bottom: -20px;
                    left: -20px;
                    background: white;
                    padding: 15px 25px;
                    border-radius: 20px;
                    box-shadow: 0 10px 30px rgba(0,0,0,0.1);
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    transform: rotate(-2deg);
                }
                .image-experience-badge strong {
                    font-size: 1.5rem;
                    color: var(--color-primary);
                    line-height: 1;
                }
                .image-experience-badge span {
                    font-size: 0.75rem;
                    font-weight: 700;
                    color: #999;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                }

                .features-section {
                    padding-top: 2rem;
                }
                .features-section h2 {
                    text-align: center;
                    font-size: 2.5rem;
                    font-weight: 800;
                    color: var(--color-primary-dark);
                    margin-bottom: 4rem;
                }
                .features-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
                    gap: 2.5rem;
                }
                .feature-card {
                    background: white;
                    padding: 3rem 2rem;
                    border-radius: 24px;
                    box-shadow: 0 4px 20px rgba(93, 64, 55, 0.04);
                    text-align: center;
                    transition: all 0.4s ease;
                    border: 1px solid #F5F1EE;
                }
                .feature-card:hover {
                    transform: translateY(-10px);
                    box-shadow: 0 20px 40px rgba(93, 64, 55, 0.1);
                    border-color: var(--color-primary);
                }
                .feature-card .icon {
                    font-size: 3.5rem;
                    margin-bottom: 1.5rem;
                    display: block;
                }
                .feature-card h3 {
                    font-size: 1.5rem;
                    font-weight: 700;
                    color: var(--color-text);
                    margin-bottom: 1rem;
                }
                .feature-card p {
                    color: var(--color-text-light);
                    line-height: 1.6;
                }

                @media (max-width: 1024px) {
                    .hero-container {
                        gap: 2rem;
                    }
                    .hero-content h1 {
                        font-size: 3rem;
                    }
                }

                @media (max-width: 768px) {
                    .hero-section {
                        padding: 4rem 0;
                    }
                    .hero-container {
                        flex-direction: column;
                        text-align: center;
                    }
                    .hero-actions {
                        justify-content: center;
                    }
                    .hero-description {
                        margin-left: auto;
                        margin-right: auto;
                    }
                    .hero-image-wrapper {
                        margin-top: 3rem;
                        width: 80%;
                    }
                    .hero-content h1 {
                        font-size: 2.8rem;
                    }
                }
            `}</style>
        </div>
    );
}

export default Home;
