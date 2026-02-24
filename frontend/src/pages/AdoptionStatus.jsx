import React from 'react';
import AdoptionStatusTracker from '../components/AdoptionStatusTracker';

const AdoptionStatus = () => {
    return (
        <div className="container" style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
            <h1 className="text-center mb-4">Adoption Status</h1>
            <AdoptionStatusTracker />
        </div>
    );
};

export default AdoptionStatus;
