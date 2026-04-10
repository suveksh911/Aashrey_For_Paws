import React from 'react';
import './Skeleton.css';

const Skeleton = ({ type = 'text', count = 1, style = {} }) => {
    const skeletons = Array(count).fill(0);

    return (
        <>
            {skeletons.map((_, index) => (
                <div
                    key={index}
                    className={`skeleton skeleton-${type}`}
                    style={style}
                ></div>
            ))}
        </>
    );
};

export default Skeleton;
