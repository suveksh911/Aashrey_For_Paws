import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { FaEdit, FaTrash, FaUserCircle } from 'react-icons/fa';
import StarRating from '../components/common/StarRating';
import api from '../services/axios';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';

function Contact() {
    const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
    const [submitting, setSubmitting] = useState(false);
    const { user } = useAuth();
    const { settings } = useSettings();

    useEffect(() => {
        if (user) {
            setFormData(prev => ({ ...prev, name: user.name || '', email: user.email || '' }));
        }
    }, [user]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await api.post('/contact', formData);
            toast.success('Message sent successfully! We will get back to you soon. 🐾');
            setFormData({ name: '', email: '', subject: '', message: '' });
        } catch {
            toast.error('Failed to send message. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="contact-page container">
            <h1 className="page-title">Contact Us</h1>
            <div className="contact-wrapper">
                <div className="contact-info">
                    <h2>Get in Touch</h2>
                    <p>Whether you're looking to adopt, need to verify your NGO, or have a general inquiry, our team is here to assist you.</p>
                    <div className="info-item">
                        <span className="icon">📍</span>
                        <p>{settings.platformAddress || 'Address not configured yet'}</p>
                    </div>
                    <div className="info-item">
                        <span className="icon">📞</span>
                        <p>{settings.platformPhone || 'Phone not configured yet'}</p>
                    </div>
                    <div className="info-item">
                        <span className="icon">✉️</span>
                        <p>{settings.platformEmail || 'Email not configured yet'}</p>
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
                            <label>Subject / Reason for Contact</label>
                            <select name="subject" value={formData.subject} onChange={handleChange} required>
                                <option value="" disabled>Select a reason...</option>
                                <option value="Adoption Inquiry">🐾 Adoption Inquiry</option>
                                <option value="Rescue Request">🚨 Rescue Request</option>
                                <option value="NGO Verification">🏢 NGO Verification</option>
                                <option value="Donation Issue">💰 Donation Issue</option>
                                <option value="General Question">💬 General Question</option>
                                <option value="Other">📋 Other</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Message</label>
                            <textarea name="message" value={formData.message} onChange={handleChange} required placeholder="How can we help?" rows="5"></textarea>
                        </div>
                        <button type="submit" className="btn btn-primary" disabled={submitting}>
                            {submitting ? 'Sending…' : 'Send Message'}
                        </button>
                    </form>
                </div>
            </div>

            <FeedbackSection />

        </div>
    );
}


function FeedbackSection() {
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    const [allFeedback, setAllFeedback] = useState([]);
    const [editingId, setEditingId] = useState(null);
    const { user, isAuthenticated } = useAuth(); // Import from context

    useEffect(() => {
        fetchFeedback();
    }, []);

    const fetchFeedback = async () => {
        try {
            const res = await api.get('/feedback');
            if (res.data.success) {
                setAllFeedback(res.data.data);
            }
        } catch (err) {
            console.error("Failed to load feedback", err);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (rating === 0) { toast.warn("Please select a star rating!"); return; }
        if (!isAuthenticated) { toast.warn("Please login to submit feedback!"); return; }

        try {
            if (editingId) {
                const res = await api.put(`/feedback/${editingId}`, { rating, comment });
                if (res.data.success) {
                    toast.success("Feedback updated!");
                    setEditingId(null);
                    fetchFeedback();
                }
            } else {
                const res = await api.post('/feedback', { rating, comment });
                if (res.data.success) {
                    toast.success("Thank you for your feedback! 🐾");
                    fetchFeedback();
                }
            }
            setRating(0);
            setComment('');
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to submit feedback.");
        }
    };

    const handleEdit = (fb) => {
        setRating(fb.rating);
        setComment(fb.comment);
        setEditingId(fb._id);
        document.querySelector('.feedback-section')?.scrollIntoView({ behavior: 'smooth' });
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Delete this review?")) return;
        try {
            await api.delete(`/feedback/${id}`);
            toast.info("Review deleted.");
            fetchFeedback();
            if (editingId === id) { setEditingId(null); setRating(0); setComment(''); }
        } catch (err) {
            toast.error("Failed to delete review.");
        }
    };

    return (
        <div className="feedback-section">
            <h2>⭐ Rate Your Experience</h2>
            <p style={{ color: '#888', marginBottom: '1.5rem', fontSize: '0.95rem' }}>
                Share your experience with Aashrey For Paws to help us improve.
            </p>

            <form onSubmit={handleSubmit} className="feedback-form">
                <div className="star-container">
                    <StarRating rating={rating} setRating={setRating} />
                </div>
                <textarea
                    placeholder={isAuthenticated ? "Tell us what you think..." : "Please login to leave feedback..."}
                    rows="3"
                    value={comment}
                    disabled={!isAuthenticated}
                    onChange={(e) => setComment(e.target.value)}
                    style={{ width: '100%', marginBottom: '1rem', padding: '1rem', border: '1px solid #ddd', borderRadius: '8px', fontFamily: 'inherit', resize: 'vertical', boxSizing: 'border-box' }}
                />
                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                    <button type="submit" className="btn btn-primary" disabled={!isAuthenticated}>
                        {editingId ? '✏️ Update Feedback' : '📝 Submit Feedback'}
                    </button>
                    {editingId && (
                        <button type="button" className="btn" onClick={() => { setEditingId(null); setRating(0); setComment(''); }}
                            style={{ background: '#eee', color: '#555' }}>
                            Cancel
                        </button>
                    )}
                </div>
            </form>

            <div className="fb-reviews-list">
                <h3>Recent Reviews ({allFeedback.length})</h3>
                {allFeedback.length === 0 ? (
                    <p style={{ color: '#bbb', fontStyle: 'italic' }}>No reviews yet — be the first! 🐾</p>
                ) : (
                    allFeedback.map((fb) => (
                        <div key={fb._id} className="fb-review-card">
                            <div className="fb-review-top">
                                <div className="fb-user-info">
                                    <FaUserCircle size={28} color="#c8a98a" />
                                    <div>
                                        <span className="fb-username">{fb.userName || 'Anonymous'}</span>
                                        <span className="fb-date">{new Date(fb.createdAt).toLocaleDateString()}</span>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                    <StarRating rating={fb.rating} editable={false} />
                                    {/* Only the author or admin sees Edit / Delete */}
                                    {(fb.userId === user?._id || user?.role === 'Admin') && (
                                        <div className="review-actions">
                                            {fb.userId === user?._id && <button onClick={() => handleEdit(fb)} className="icon-btn edit-btn" title="Edit"><FaEdit /></button>}
                                            <button onClick={() => handleDelete(fb._id)} className="icon-btn delete-btn" title="Delete"><FaTrash /></button>
                                        </div>
                                    )}
                                </div>
                            </div>
                            {fb.comment && <p className="fb-comment">"{fb.comment}"</p>}
                        </div>
                    ))
                )}
            </div>

        </div>
    );
}

export default Contact;
