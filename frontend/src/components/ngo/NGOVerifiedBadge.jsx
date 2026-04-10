import React from 'react';
import { FaShieldAlt } from 'react-icons/fa';

const NGOVerifiedBadge = ({ isVerified, compact = false }) => {
    if (!isVerified) return null;

    if (compact) {
        return (
            <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                background: 'linear-gradient(135deg, #1565C0, #1da1f2)',
                color: 'white',
                fontWeight: '600',
                fontSize: '0.72rem',
                padding: '3px 8px',
                borderRadius: '12px',
                letterSpacing: '0.3px',
                verticalAlign: 'middle',
            }} title="Trusted & Verified NGO">
                <FaShieldAlt size={10} /> Verified NGO
            </span>
        );
    }

    return (
        <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            background: 'linear-gradient(135deg, #1565C0, #1da1f2)',
            color: 'white',
            fontWeight: '600',
            fontSize: '0.82rem',
            padding: '5px 12px',
            borderRadius: '20px',
            marginBottom: '8px',
            boxShadow: '0 2px 6px rgba(29,161,242,0.35)',
            letterSpacing: '0.3px',
        }} title="This NGO is trusted and verified by Aashrey For Paws">
            <FaShieldAlt size={12} /> Trusted &amp; Verified NGO
        </div>
    );
};

export default NGOVerifiedBadge;
