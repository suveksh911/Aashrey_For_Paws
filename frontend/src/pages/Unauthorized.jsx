import React from 'react';
import { Link } from 'react-router-dom';

const Unauthorized = () => {
    return (
        <div className="container" style={{ textAlign: 'center', marginTop: '100px' }}>
            <h1>403 - Access Denied</h1>
            <p>You do not have permission to view this page.</p>
            <Link to="/" className="btn btn-primary" style={{ marginTop: '20px', display: 'inline-block' }}>
                Go to Home
            </Link>
        </div>
    );
};

export default Unauthorized;
