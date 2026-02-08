import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { FaEdit, FaTrash } from 'react-icons/fa';
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
    const [allFeedback, setAllFeedback] = useState([]);
    const [editingId, setEditingId] = useState(null);

    useEffect(() => {
        let storedFeedback = [];
        try {
            const item = localStorage.getItem('siteFeedback');
            if (item) {
                storedFeedback = JSON.parse(item);
            }
        } catch (e) {
            console.error("Failed to parse feedback", e);
            localStorage.removeItem('siteFeedback'); // Clear corrupt data
        }

        if (!Array.isArray(storedFeedback) || storedFeedback.length === 0) {
            const mockFeedback = [
                { id: 1, rating: 5, comment: "Amazing platform! Found my best friend here.", date: "2023-10-15" },
                { id: 2, rating: 4, comment: "Great initiative, but could use more filter options.", date: "2023-11-02" }
            ];
            setAllFeedback(mockFeedback);
        } else {
            setAllFeedback(storedFeedback);
        }
    }, []);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (rating === 0) {
            toast.warn("Please select a rating!");
            return;
        }

        let existingFeedback = [];
        try {
            const item = localStorage.getItem('siteFeedback');
            if (item) {
                existingFeedback = JSON.parse(item);
            }
        } catch (e) {
            existingFeedback = [];
        }
        if (!Array.isArray(existingFeedback)) existingFeedback = [];

        if (editingId) {
            // Update existing
            const updatedFeedback = existingFeedback.map(fb =>
                fb.id === editingId ? { ...fb, rating, comment, date: new Date().toLocaleDateString() + ' (Edited)' } : fb
            );
            localStorage.setItem('siteFeedback', JSON.stringify(updatedFeedback));
            setAllFeedback(updatedFeedback);
            toast.success("Feedback updated!");
            setEditingId(null);
        } else {
            // Add new
            const newFeedback = {
                id: Date.now(),
                rating,
                comment,
                date: new Date().toLocaleDateString()
            };
            const updatedFeedback = [newFeedback, ...existingFeedback];
            localStorage.setItem('siteFeedback', JSON.stringify(updatedFeedback));
            setAllFeedback(updatedFeedback);
            toast.success("Thank you for your feedback!");
        }

        setRating(0);
        setComment('');
    };

    const handleEdit = (feedback) => {
        setRating(feedback.rating);
        setComment(feedback.comment);
        setEditingId(feedback.id);
        window.scrollTo({ top: document.querySelector('.feedback-section').offsetTop, behavior: 'smooth' });
    };

    const handleDelete = (id) => {
        if (window.confirm("Are you sure you want to delete this review?")) {
            const updatedFeedback = allFeedback.filter(fb => fb.id !== id);
            setAllFeedback(updatedFeedback);
            localStorage.setItem('siteFeedback', JSON.stringify(updatedFeedback));
            toast.info("Review deleted.");

            // If deleting the item currently being edited, reset form
            if (editingId === id) {
                setEditingId(null);
                setRating(0);
                setComment('');
            }
        }
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
                <button type="submit" className="btn btn-primary">
                    {editingId ? 'Update Feedback' : 'Submit Feedback'}
                </button>
                {editingId && (
                    <button type="button" className="btn btn-text" onClick={() => {
                        setEditingId(null);
                        setRating(0);
                        setComment('');
                    }} style={{ marginLeft: '1rem', color: '#666' }}>
                        Cancel
                    </button>
                )}
            </form>

            <div className="reviews-list">
                <h3>Recent Reviews</h3>
                {allFeedback.length === 0 ? (
                    <p>No reviews yet. Be the first!</p>
                ) : (
                    allFeedback.map((fb, idx) => (
                        <div key={idx} className="review-card">
                            <div className="review-header">
                                <StarRating rating={fb.rating} editable={false} />
                                <div className="review-meta">
                                    <span className="review-date">{fb.date}</span>
                                    <div className="review-actions">
                                        <button onClick={() => handleEdit(fb)} className="icon-btn edit-btn" title="Edit"><FaEdit /></button>
                                        <button onClick={() => handleDelete(fb.id)} className="icon-btn delete-btn" title="Delete"><FaTrash /></button>
                                    </div>
                                </div>
                            </div>
                            <p className="review-text">"{fb.comment}"</p>
                        </div>
                    ))
                )}
            </div>

            <style>{`
                .reviews-list { margin-top: 3rem; text-align: left; border-top: 1px solid #eee; padding-top: 2rem; }
                .reviews-list h3 { color: var(--color-primary-dark); margin-bottom: 1.5rem; }
                .review-card { background: #f9f9f9; padding: 1rem; border-radius: 8px; margin-bottom: 1rem; }
                .review-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.5rem; }
                .review-meta { display: flex; flex-direction: column; align-items: flex-end; gap: 0.5rem; }
                .review-date { font-size: 0.85rem; color: #888; }
                .review-text { font-style: italic; color: #555; }
                .review-actions { display: flex; gap: 0.5rem; }
                .icon-btn { background: none; border: none; cursor: pointer; padding: 4px; transition: transform 0.2s; }
                .icon-btn:hover { transform: scale(1.1); }
                .edit-btn { color: #2196F3; }
                .delete-btn { color: #F44336; }
            `}</style>
        </div>
    );
}

export default Contact;
