import React, { useState } from 'react';
import { FaStar } from 'react-icons/fa';
import { toast } from 'react-toastify';

const RatingSubmission = ({ onSubmit, onClose, ngoName, userName }) => {
    const [rating, setRating] = useState(0);
    const [hover, setHover] = useState(0);
    const [comment, setComment] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (rating === 0) {
            toast.error("Please select a star rating");
            return;
        }

        setSubmitting(true);
        // Simulate API call
        setTimeout(() => {
            const reviewData = {
                rating,
                comment,
                date: new Date().toISOString(),
                user: userName || localStorage.getItem('loggedInUser') || 'Anonymous'
            };
            onSubmit(reviewData);
            setSubmitting(false);
            onClose();
            toast.success("Review submitted successfully!");
        }, 1000);
    };

    return (
        <div className="rating-modal-overlay">
            <div className="rating-modal">
                <div className="modal-header">
                    <h3>Rate {ngoName}</h3>
                    <button className="close-btn" onClick={onClose}>&times;</button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="star-input-container">
                        {[...Array(5)].map((star, i) => {
                            const ratingValue = i + 1;
                            return (
                                <label key={i}>
                                    <input
                                        type="radio"
                                        name="rating"
                                        value={ratingValue}
                                        onClick={() => setRating(ratingValue)}
                                    />
                                    <FaStar
                                        className="star-icon"
                                        color={ratingValue <= (hover || rating) ? "#ffc107" : "#e4e5e9"}
                                        size={30}
                                        onMouseEnter={() => setHover(ratingValue)}
                                        onMouseLeave={() => setHover(0)}
                                    />
                                </label>
                            );
                        })}
                    </div>
                    <div className="rating-text">
                        {rating > 0 ? `${rating} Star${rating > 1 ? 's' : ''}` : 'Select a rating'}
                    </div>

                    <div className="form-group">
                        <label>Share your experience (Optional)</label>
                        <textarea
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            placeholder="How was your experience with this NGO?"
                            rows="4"
                        ></textarea>
                    </div>

                    <button type="submit" className="btn-submit" disabled={submitting}>
                        {submitting ? 'Submitting...' : 'Submit Review'}
                    </button>
                </form>
            </div>

            <style>{`
                .rating-modal-overlay {
                    position: fixed;
                    top: 0; left: 0; right: 0; bottom: 0;
                    background: rgba(0,0,0,0.6);
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    z-index: 1100;
                }
                .rating-modal {
                    background: white;
                    padding: 2rem;
                    border-radius: 12px;
                    width: 90%;
                    max-width: 450px;
                    box-shadow: 0 5px 15px rgba(0,0,0,0.2);
                }
                .modal-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 1.5rem;
                }
                .modal-header h3 { margin: 0; color: #333; }
                .close-btn {
                    background: none;
                    border: none;
                    font-size: 1.5rem;
                    cursor: pointer;
                    color: #666;
                }
                .star-input-container {
                    display: flex;
                    justify-content: center;
                    gap: 10px;
                    margin-bottom: 0.5rem;
                }
                .star-input-container input { display: none; }
                .star-icon { cursor: pointer; transition: color 0.2s; }
                .rating-text {
                    text-align: center;
                    font-weight: bold;
                    color: #5d4037;
                    margin-bottom: 1.5rem;
                }
                .form-group label {
                    display: block;
                    margin-bottom: 0.5rem;
                    font-weight: 500;
                    color: #555;
                }
                .form-group textarea {
                    width: 100%;
                    padding: 0.8rem;
                    border: 1px solid #ddd;
                    border-radius: 6px;
                    resize: vertical;
                    font-family: inherit;
                }
                .btn-submit {
                    width: 100%;
                    padding: 10px;
                    background: #28a745;
                    color: white;
                    border: none;
                    border-radius: 6px;
                    font-weight: bold;
                    margin-top: 1rem;
                    cursor: pointer;
                    transition: background 0.2s;
                }
                .btn-submit:hover { background: #218838; }
                .btn-submit:disabled { background: #94d3a2; cursor: not-allowed; }
            `}</style>
        </div>
    );
};

export default RatingSubmission;
