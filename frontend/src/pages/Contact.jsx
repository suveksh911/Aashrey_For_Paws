import React, { useState } from 'react';
import { toast } from 'react-toastify';
import StarRating from '../components/StarRating';


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
                    <h2>Send us a Message</h2>
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

            <FeedbackSection />

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
                    margin: 0 auto 4rem;
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
                .contact-form h2 {
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

                /* Feedback Section */
                 .feedback-section {
                    max-width: 800px;
                    margin: 0 auto;
                    background: #fff;
                    padding: 2rem;
                    border-radius: var(--radius-lg);
                    box-shadow: var(--shadow-md);
                    text-align: center;
                }
                .feedback-section h2 { margin-bottom: 1rem; color: var(--color-primary-dark); }
                .star-container { display: flex; justify-content: center; margin-bottom: 1rem; }
                .feedback-form textarea { width: 100%; margin-bottom: 1rem; padding: 1rem; border: 1px solid #ddd; border-radius: 8px; }

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



function FeedbackSection() {
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (rating === 0) {
            toast.warn("Please select a rating!");
            return;
        }

        const newFeedback = {
            id: Date.now(),
            rating,
            comment,
            date: new Date().toLocaleDateString()
        };

        const existingFeedback = JSON.parse(localStorage.getItem('siteFeedback')) || [];
        localStorage.setItem('siteFeedback', JSON.stringify([newFeedback, ...existingFeedback]));

        toast.success("Thank you for your feedback!");
        setRating(0);
        setComment('');
    };

    return (
        <div className="feedback-section">
            <h2>Rate Your Experience</h2>
            <p>We value your feedback to help us improve Aashrey For Paws.</p>
            <form onSubmit={handleSubmit} className="feedback-form">
                <div className="star-container">
                    <StarRating rating={rating} setRating={setRating} />
                </div>
                <textarea
                    placeholder="Tell us what you think..."
                    rows="3"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                ></textarea>
                <button type="submit" className="btn btn-primary">Submit Feedback</button>
            </form>
        </div>
    );
}

export default Contact;
