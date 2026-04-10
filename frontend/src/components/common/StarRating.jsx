import React, { useState } from 'react';
import { FaStar, FaStarHalfAlt, FaRegStar } from 'react-icons/fa';

const StarRating = ({ rating, setRating, size = 20, color = "#ffc107", editable }) => {
    const [hovered, setHovered] = useState(0);

    // Interactive mode: when setRating is provided
    const isInteractive = typeof setRating === 'function';
    const display = hovered || rating;

    if (isInteractive) {
        return (
            <div className="star-rating" style={{ display: 'flex', gap: '4px', cursor: 'pointer' }}>
                {[1, 2, 3, 4, 5].map(i => (
                    <FaStar
                        key={i}
                        size={size + 4}
                        color={i <= display ? '#ffc107' : '#e4e5e9'}
                        onMouseEnter={() => setHovered(i)}
                        onMouseLeave={() => setHovered(0)}
                        onClick={() => setRating(i)}
                        style={{ transition: 'color 0.15s, transform 0.15s', transform: i <= display ? 'scale(1.15)' : 'scale(1)' }}
                    />
                ))}
            </div>
        );
    }

    // Read-only display mode (with half-star support)
    const stars = [];
    for (let i = 1; i <= 5; i++) {
        if (rating >= i) {
            stars.push(<FaStar key={i} size={size} color={color} />);
        } else if (rating >= i - 0.5) {
            stars.push(<FaStarHalfAlt key={i} size={size} color={color} />);
        } else {
            stars.push(<FaRegStar key={i} size={size} color="#e4e5e9" />);
        }
    }

    return (
        <div className="star-rating" style={{ display: 'flex', gap: '2px' }}>
            {stars}
        </div>
    );
};

export default StarRating;
