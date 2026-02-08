import React from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { FaCheckCircle } from 'react-icons/fa';

const PaymentSuccess = () => {
    const [searchParams] = useSearchParams();
    const pidx = searchParams.get('pidx');
    const amount = searchParams.get('amount') || "Donation";

    return (
        <div className="container" style={{ padding: '4rem 2rem', textAlign: 'center' }}>
            <FaCheckCircle size={80} color="#28a745" style={{ marginBottom: '2rem' }} />
            <h1>Payment Successful!</h1>
            <p style={{ fontSize: '1.2rem', color: '#666' }}>
                Thank you for your generous contribution.<br />
                Your payment (ID: {pidx}) has been processed successfully.
            </p>
            <div style={{ marginTop: '2rem' }}>
                <Link to="/" className="btn btn-primary" style={{ textDecoration: 'none', marginRight: '1rem' }}>Return Home</Link>
                <Link to="/donate" className="btn btn-outline" style={{ textDecoration: 'none', border: '1px solid #5d4037', color: '#5d4037', padding: '10px 20px', borderRadius: '4px' }}>Donate Again</Link>
            </div>
        </div>
    );
};

export default PaymentSuccess;
