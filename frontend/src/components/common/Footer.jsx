import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaPaw, FaHeart, FaFacebook, FaInstagram, FaTwitter } from 'react-icons/fa';

export default function Footer() {
    const location = useLocation();
    
    // Hide footer on dashboard and full-screen routes
    const hiddenRoutes = ['/admin', '/ngo', '/user', '/owner', '/adopter'];
    if (hiddenRoutes.some(route => location.pathname.startsWith(route))) {
        return null;
    }

    return (
        <footer className="footer-container">
            <div className="footer-content">
                
                {/* Brand & Socials */}
                <div className="footer-brand">
                    <div className="footer-logo">
                        <span style={{ fontSize: '1.5rem', marginRight: '8px' }}>🐾</span>
                        <span className="font-black text-xl">Aashrey For Paws</span>
                    </div>
                    <p className="footer-desc">
                        Connecting loving homes with pets in need. Every adoption saves a life and brings joy to a family.
                    </p>
                    <div className="social-icons">
                        <a href="#"><FaFacebook /></a>
                        <a href="#"><FaTwitter /></a>
                        <a href="#"><FaInstagram /></a>
                    </div>
                </div>
                
                {/* Quick Links */}
                <div className="footer-links">
                    <h4>Quick Links</h4>
                    <ul>
                        <li><Link to="/">Home</Link></li>
                        <li><Link to="/pet-find">Adopt a Pet</Link></li>
                        <li><Link to="/donate">Donate</Link></li>
                        <li><Link to="/community">Community</Link></li>
                        <li><Link to="/contact">Contact Us</Link></li>
                    </ul>
                </div>
                
                {/* Contact Info */}
                <div className="footer-contact">
                    <h4>Contact Us</h4>
                    <ul className="contact-list">
                        <li><span className="c-icon">📍</span> <span>123 Animal Shelter Road, Kathmandu</span></li>
                        <li><span className="c-icon">📞</span> <span>+977 1234567890</span></li>
                        <li><span className="c-icon">✉️</span> <span>info@aashreyforpaws.org</span></li>
                    </ul>
                </div>

            </div>

            <div className="footer-bottom-wrapper">
                <div className="footer-bottom">
                    <p>&copy; {new Date().getFullYear()} Aashrey For Paws. All rights reserved.</p>
                    <p style={{ display: 'flex', alignItems: 'center' }}>Made with <FaHeart className="heart-icon" /> for animals</p>
                </div>
            </div>

            <style>{`
                .footer-container {
                    background-color: #5d4037; /* Dark brown from image */
                    color: #fff;
                    padding: 4rem 2rem 1.5rem;
                    font-family: 'Inter', sans-serif;
                }
                .footer-content {
                    max-width: 1200px;
                    margin: 0 auto;
                    display: grid;
                    grid-template-columns: 2fr 1fr 1.5fr;
                    gap: 3rem;
                    margin-bottom: 3rem;
                }
                
                /* Brand Section */
                .footer-brand {
                    display: flex;
                    flex-direction: column;
                    gap: 1.2rem;
                }
                .footer-logo {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    color: #fff;
                }
                .paw-icon {
                    color: #5b4685; /* Purple paw shade from logo */
                    filter: brightness(1.5);
                }
                .footer-desc {
                    color: #d7ccc8;
                    line-height: 1.6;
                    font-size: 0.95rem;
                    max-width: 320px;
                }
                .social-icons {
                    display: flex;
                    gap: 0.8rem;
                    margin-top: 0.5rem;
                }
                .social-icons a {
                    color: #fff;
                    background: rgba(255, 255, 255, 0.1);
                    width: 36px;
                    height: 36px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border-radius: 50%;
                    font-size: 1.1rem;
                    transition: background 0.2s, transform 0.2s;
                }
                .social-icons a:hover {
                    background: rgba(255, 255, 255, 0.2);
                    transform: translateY(-2px);
                }

                /* Links Section */
                .footer-links h4, .footer-contact h4 {
                    font-size: 1.15rem;
                    font-weight: 600;
                    margin-bottom: 1.5rem;
                    color: #ffccbc; /* Light peach heading from image */
                }
                .footer-links ul {
                    list-style: none;
                    padding: 0;
                    margin: 0;
                    display: flex;
                    flex-direction: column;
                    gap: 1rem;
                }
                .footer-links a {
                    color: #d7ccc8;
                    text-decoration: none;
                    transition: color 0.2s;
                    font-size: 0.95rem;
                }
                .footer-links a:hover {
                    color: #fff;
                }

                /* Contact Section */
                .contact-list {
                    list-style: none;
                    padding: 0;
                    margin: 0;
                    display: flex;
                    flex-direction: column;
                    gap: 1.2rem;
                }
                .contact-list li {
                    display: flex;
                    gap: 12px;
                    color: #d7ccc8;
                    font-size: 0.95rem;
                    align-items: flex-start;
                }
                .c-icon {
                    color: #ffab91;
                    margin-top: 3px;
                    font-size: 1.1rem;
                }

                /* Bottom Section */
                .footer-bottom-wrapper {
                    background-color: rgba(0, 0, 0, 0.15); /* Darker strip at bottom */
                    margin: 0 -2rem -1.5rem; /* Stretch out of container padding */
                    padding: 1.5rem 2rem;
                }
                .footer-bottom {
                    max-width: 1200px;
                    margin: 0 auto;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    color: #a1887f;
                    font-size: 0.85rem;
                }
                
                .heart-icon {
                    color: #ff8a65;
                    display: inline;
                    margin: 0 4px;
                }

                @media (max-width: 768px) {
                    .footer-content {
                        grid-template-columns: 1fr;
                        gap: 2.5rem;
                    }
                    .footer-bottom {
                        flex-direction: column;
                        gap: 1rem;
                        text-align: center;
                    }
                }
            `}</style>
        </footer>
    );
}