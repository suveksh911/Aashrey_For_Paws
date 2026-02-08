import React, { useState } from 'react';
import { FaStar } from 'react-icons/fa';

const StarRating = ({ rating, setRating, editable = true }) => {
    const [hover, setHover] = useState(null);

    return (
        <div style={{ display: 'flex', gap: '5px' }}>
            {[...Array(5)].map((star, index) => {
                const ratingValue = index + 1;

                return (
                    <label key={index} style={{ cursor: editable ? 'pointer' : 'default' }}>
                        <input
                            type="radio"
                            name="rating"
                            value={ratingValue}
                            onClick={() => editable && setRating(ratingValue)}
                            style={{ display: 'none' }}
                        />
                        <FaStar
                            className="star"
                            color={ratingValue <= (hover || rating) ? "#ffc107" : "#e4e5e9"}
                            size={25}
                            onMouseEnter={() => editable && setHover(ratingValue)}
                            onMouseLeave={() => editable && setHover(null)}
                        />
                    </label>
                );
            })}
        </div>
    );
};

export default StarRating;
