import React from 'react';

const PetStatusBadge = ({ status }) => {
    let color = '#6c757d'; // Default secondary
    let bg = '#e2e3e5';
    let text = 'Unknown';

    switch (status?.toLowerCase()) {
        case 'available':
            color = '#28a745';
            bg = '#d4edda';
            text = 'Available for Adoption';
            break;
        case 'adopted':
            color = '#007bff';
            bg = '#cce5ff';
            text = 'Adopted';
            break;
        case 'pending':
            color = '#ffc107';
            bg = '#fff3cd';
            text = 'Pending Approval';
            break;
        case 'fostered':
            color = '#17a2b8';
            bg = '#d1ecf1';
            text = 'Currently Fostered';
            break;
        default:
            text = status;
    }

    const style = {
        backgroundColor: bg,
        color: color,
        padding: '5px 10px',
        borderRadius: '20px',
        fontSize: '0.85rem',
        fontWeight: '600',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '5px'
    };

    return (
        <span style={style}>
            • {text}
        </span>
    );
};

export default PetStatusBadge;
