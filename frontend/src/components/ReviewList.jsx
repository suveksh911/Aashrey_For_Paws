import React from 'react';
import StarRating from './StarRating';
import { FaUserCircle } from 'react-icons/fa';

const ReviewList = ({ reviews }) => {
    if (!reviews || reviews.length === 0) {
        return <div className="no-reviews">No reviews yet. Be the first to rate!</div>;
    }

    return (
        <div className="review-list">
            {reviews.map((review, index) => (
                <div key={index} className="review-card">
                    <div className="review-header">
                        <div className="reviewer-info">
                            <FaUserCircle size={32} color="#ccc" />
                            <div>
                                <span className="reviewer-name">{review.user || 'Anonymous'}</span>
                                <span className="review-date">{new Date(review.date).toLocaleDateString()}</span>
                            </div>
                        </div>
                        <StarRating rating={review.rating} size={16} />
                    </div>
                    {review.comment && <p className="review-comment">{review.comment}</p>}
                </div>
            ))}

            <style>{`
                .review-list {
                    display: flex;
                    flex-direction: column;
                    gap: 1rem;
                }
                .review-card {
                    background: #f9f9f9;
                    padding: 1rem;
                    border-radius: 8px;
                    border: 1px solid #eee;
                }
                .review-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 0.5rem;
                }
                .reviewer-info {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }
                .reviewer-name {
                    font-weight: 600;
                    display: block;
                    font-size: 0.95rem;
                }
                .review-date {
                    font-size: 0.8rem;
                    color: #888;
                }
                .review-comment {
                    margin: 0;
                    color: #555;
                    font-size: 0.95rem;
                    line-height: 1.4;
                }
                .no-reviews {
                    text-align: center;
                    color: #888;
                    padding: 2rem;
                    background: #f9f9f9;
                    border-radius: 8px;
                    font-style: italic;
                }
            `}</style>
        </div>
    );
};

export default ReviewList;
