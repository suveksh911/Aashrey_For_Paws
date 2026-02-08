import React from 'react';
import { Link } from 'react-router-dom';
import { FaTimesCircle } from 'react-icons/fa';

const PaymentFailure = () => {
    return (
        <div className="container" style={{ padding: '4rem 2rem', textAlign: 'center' }}>
            <FaTimesCircle size={80} color="#dc3545" style={{ marginBottom: '2rem' }} />
            <h1>Payment Failed</h1>
            <p style={{ fontSize: '1.2rem', color: '#666' }}>
                We were unable to process your payment.<br />
                Please try again or contact support if the issue persists.
            </p>
            <div style={{ marginTop: '2rem' }}>
                <Link to="/donate" className="btn btn-primary" style={{ textDecoration: 'none' }}>Try Again</Link>
            </div>
        </div>
    );
};

export default PaymentFailure;
