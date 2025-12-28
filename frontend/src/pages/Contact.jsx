import React, { useState } from 'react';
import { toast } from 'react-toastify';

function Contact() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        message: ''
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('http://localhost:5000/contact', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            const result = await response.json();
            if (result.success) {
                toast.success('Message sent successfully!');
                setFormData({ name: '', email: '', message: '' });
            } else {
                toast.error(result.message);
            }
        } catch (err) {
            toast.error('Failed to send message');
        }
    };

    return (
        <div className="contact-page container">
            <h1 className="page-title">Contact Us</h1>
            <div className="contact-wrapper">
                <div className="contact-info">
                    <h2>Get in Touch</h2>
                    <p>Have questions about adoption? Want to volunteer? We'd love to hear from you.</p>
                    <div className="info-item">
                        <span className="icon">📍</span>
                        <p>123 Animal Shelter Road, Kathmandu, Nepal</p>
                    </div>
                    <div className="info-item">
                        <span className="icon">📞</span>
                        <p>+977 1234567890</p>
                    </div>
                    <div className="info-item">
                        <span className="icon">✉️</span>
                        <p>info@aashreyforpaws.org</p>
                    </div>
                </div>
                <div className="contact-form">
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label>Name</label>
                            <input type="text" name="name" value={formData.name} onChange={handleChange} required placeholder="Your Name" />
                        </div>
                        <div className="form-group">
                            <label>Email</label>
                            <input type="email" name="email" value={formData.email} onChange={handleChange} required placeholder="Your Email" />
                        </div>
                        <div className="form-group">
                            <label>Message</label>
                            <textarea name="message" value={formData.message} onChange={handleChange} required placeholder="How can we help?" rows="5"></textarea>
                        </div>
                        <button type="submit" className="btn btn-primary">Send Message</button>
                    </form>
                </div>
            </div>
            <style>{`
                .contact-page {
                    padding: 4rem 1rem;
                }
                .page-title {
                    text-align: center;
                    color: var(--color-primary-dark);
                    margin-bottom: 3rem;
                    font-size: 2.5rem;
                }
                .contact-wrapper {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 4rem;
                    max-width: 1000px;
                    margin: 0 auto;
                }
                .contact-info {
                    padding: 2rem;
                    background: var(--color-surface);
                    border-radius: var(--radius-lg);
                    box-shadow: var(--shadow-sm);
                }
                .contact-info h2 {
                    color: var(--color-primary);
                    margin-bottom: 1rem;
                }
                .contact-info p {
                    margin-bottom: 2rem;
                    color: var(--color-text-light);
                }
                .info-item {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    margin-bottom: 1rem;
                }
                .info-item .icon {
                    font-size: 1.5rem;
                }
                
                .contact-form form {
                    display: flex;
                    flex-direction: column;
                    gap: 1.5rem;
                }
                .form-group label {
                    display: block;
                    margin-bottom: 0.5rem;
                    font-weight: 500;
                }
                .form-group input, .form-group textarea {
                    width: 100%;
                    padding: 0.75rem;
                    border: 1px solid var(--color-border);
                    border-radius: var(--radius-sm);
                    font-family: inherit;
                }
                .form-group input:focus, .form-group textarea:focus {
                    outline: 2px solid var(--color-primary);
                }

                @media (max-width: 768px) {
                    .contact-wrapper {
                        grid-template-columns: 1fr;
                        gap: 2rem;
                    }
                }
            `}</style>
        </div>
    );
}

export default Contact;
