import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaCheckCircle, FaHourglassHalf, FaTimesCircle, FaFileUpload } from 'react-icons/fa';

const VerificationStatus = () => {
    const [status, setStatus] = useState('Pending'); // Default for demo
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Simulate fetching status
        setTimeout(() => {
            const user = JSON.parse(localStorage.getItem('user')) || {};
            setStatus(user.verificationStatus || 'Unverified');
            setLoading(false);
        }, 500);
    }, []);

    const renderStatusContent = () => {
        switch (status) {
            case 'Verified':
                return (
                    <div className="status-content success">
                        <FaCheckCircle size={80} color="#28a745" />
                        <h2>Verified</h2>
                        <p>Congratulations! Your organization has been verified. You now have the "Verified" badge on your profile.</p>
                        <Link to="/ngo" className="btn btn-primary mt-3">Go to Dashboard</Link>
                    </div>
                );
            case 'Pending':
                return (
                    <div className="status-content pending">
                        <FaHourglassHalf size={80} color="#ffc107" />
                        <h2>Verification Pending</h2>
                        <p>Your documents have been submitted and are currently under review by our admin team. This usually takes 24-48 hours.</p>
                        <Link to="/ngo" className="btn btn-outline-primary mt-3">Back to Dashboard</Link>
                    </div>
                );
            case 'Rejected':
                return (
                    <div className="status-content error">
                        <FaTimesCircle size={80} color="#dc3545" />
                        <h2>Verification Failed</h2>
                        <p>Unfortunately, your verification was rejected. Please check your email for details or try uploading valid documents again.</p>
                        <Link to="/ngo-verification" className="btn btn-primary mt-3">Re-upload Documents</Link>
                    </div>
                );
            default: // Unverified
                return (
                    <div className="status-content neutral">
                        <FaFileUpload size={80} color="#6c757d" />
                        <h2>Not Verified Yet</h2>
                        <p>You haven't submitted your documents for verification yet. Verify your NGO to build trust.</p>
                        <Link to="/ngo-verification" className="btn btn-primary mt-3">Start Verification</Link>
                    </div>
                );
        }
    };

    if (loading) return <div className="container p-4 text-center">Loading status...</div>;

    return (
        <div className="container" style={{ padding: '4rem 2rem', maxWidth: '600px', textAlign: 'center' }}>
            <div className="status-card">
                {renderStatusContent()}
            </div>

            <style>{`
                .status-card {
                    background: white;
                    padding: 3rem 2rem;
                    border-radius: 12px;
                    box-shadow: 0 5px 15px rgba(0,0,0,0.1);
                }
                .status-content h2 {
                    margin: 1.5rem 0 1rem;
                    font-size: 2rem;
                    color: #333;
                }
                .status-content p {
                    color: #666;
                    font-size: 1.1rem;
                    line-height: 1.6;
                }
                .status-content.success h2 { color: #28a745; }
                .status-content.pending h2 { color: #856404; }
                .status-content.error h2 { color: #dc3545; }
            `}</style>
        </div>
    );
};

export default VerificationStatus;
