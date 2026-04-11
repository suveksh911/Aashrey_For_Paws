import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/axios';
import { FaCheckCircle, FaHourglassHalf, FaTimesCircle, FaPaw, FaSpinner } from 'react-icons/fa';

const AdoptionStatusTracker = () => {
    const { user } = useAuth();
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchRequests();
    }, []);

    const fetchRequests = async () => {
        setLoading(true);
        setError('');
        try {
            const res = await api.get('/adoptions/mine');
            setRequests(res.data.data || []);
        } catch (err) {
            setError('Failed to load your adoption requests. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const getStatusStep = (status) => {
        switch (status?.toLowerCase()) {
            case 'pending': return 1;
            case 'approved': return 3;
            case 'rejected': return 0;
            default: return 1;
        }
    };

    if (loading) return (
        <div className="empty-tracker">
            <FaSpinner className="spin-icon" size={36} color="#8D6E63" />
            <p>Loading your requests...</p>
        </div>
    );

    if (error) return (
        <div className="empty-tracker" style={{ color: '#dc3545' }}>
            <p>{error}</p>
            <button onClick={fetchRequests} style={{ marginTop: '1rem', padding: '8px 16px', border: '1px solid #dc3545', borderRadius: '8px', background: 'none', color: '#dc3545', cursor: 'pointer' }}>
                Retry
            </button>
        </div>
    );

    if (requests.length === 0) return (
        <div className="empty-tracker">
            <FaPaw size={48} color="#ddd" />
            <p>You haven't submitted any adoption requests yet.</p>
        </div>
    );

    return (
        <div className="adoption-tracker-container">
            <h2>Track Your Adoption Requests</h2>
            <div className="requests-list">
                {requests.map(request => {
                    const step = getStatusStep(request.status);
                    const isRejected = request.status === 'Rejected';
                    const isApproved = request.status === 'Approved';

                    return (
                        <div key={request._id} className="request-card">
                            <div className="request-header">
                                <h3>Adoption Request for: <span>{request.petName}</span></h3>
                                <span className="date-badge">
                                    {new Date(request.date || request.createdAt).toLocaleDateString()}
                                </span>
                            </div>

                            <div className="status-timeline">
                                {isRejected ? (
                                    <div className="status-rejected">
                                        <FaTimesCircle className="icon" />
                                        <span>Application Rejected</span>
                                        <p className="rejection-reason">Your request was not approved this time. Please try again or contact the owner/NGO.</p>
                                    </div>
                                ) : (
                                    <>
                                        <div className={`timeline-step ${step >= 1 ? 'active' : ''}`}>
                                            <div className="step-icon"><FaHourglassHalf /></div>
                                            <div className="step-label">Pending Review</div>
                                        </div>
                                        <div className={`timeline-line ${step >= 2 ? 'active-line' : ''}`}></div>
                                        <div className={`timeline-step ${step >= 2 ? 'active' : ''}`}>
                                            <div className="step-icon">📋</div>
                                            <div className="step-label">Under Review</div>
                                        </div>
                                        <div className={`timeline-line ${step >= 3 ? 'active-line' : ''}`}></div>
                                        <div className={`timeline-step ${step >= 3 ? 'active' : ''}`}>
                                            <div className="step-icon"><FaCheckCircle /></div>
                                            <div className="step-label">Approved</div>
                                        </div>
                                    </>
                                )}
                            </div>

                            {isApproved && (
                                <div style={{ marginTop: '1rem', background: '#d4edda', borderRadius: '8px', padding: '10px', textAlign: 'center', color: '#155724', fontSize: '0.95rem', fontWeight: '500' }}>
                                    🎉 Congratulations! Your adoption request was approved. Please contact the owner/NGO to proceed.
                                </div>
                            )}

                            <div className="request-meta" style={{ marginTop: '0.75rem', fontSize: '0.85rem', color: '#888', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                                {request.phone && <span>📞 {request.phone}</span>}
                                {request.reason && <span>💬 Reason: {request.reason}</span>}
                                <span style={{
                                    marginLeft: 'auto',
                                    padding: '2px 10px',
                                    borderRadius: '12px',
                                    fontWeight: '600',
                                    fontSize: '0.8rem',
                                    background: request.status === 'Approved' ? '#d4edda' : request.status === 'Rejected' ? '#f8d7da' : '#fff3cd',
                                    color: request.status === 'Approved' ? '#155724' : request.status === 'Rejected' ? '#721c24' : '#856404'
                                }}>
                                    {request.status}
                                </span>
                            </div>
                        </div>
                    );
                })}
            </div>

            <style>{`
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                .spin-icon { animation: spin 1s linear infinite; }
                .adoption-tracker-container { padding: 1rem; }
                .request-card {
                    background: white; border-radius: 12px; padding: 1.5rem;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.06); margin-bottom: 1.5rem;
                    border: 1px solid #eee;
                }
                .request-header {
                    display: flex; justify-content: space-between; align-items: center;
                    margin-bottom: 1.5rem; border-bottom: 1px solid #f0f0f0; padding-bottom: 10px;
                }
                .request-header h3 { margin: 0; font-size: 1.1rem; color: #555; }
                .request-header h3 span { color: var(--color-primary); font-weight: bold; }
                .date-badge { font-size: 0.85rem; color: #999; }
                .status-timeline {
                    display: flex; align-items: center; justify-content: center; padding: 1rem 0;
                }
                .timeline-step {
                    display: flex; flex-direction: column; align-items: center; gap: 5px;
                    opacity: 0.35; transition: opacity 0.3s;
                }
                .timeline-step.active { opacity: 1; }
                .step-icon {
                    width: 44px; height: 44px; border-radius: 50%; background: #eee;
                    display: flex; align-items: center; justify-content: center;
                    font-weight: bold; color: #666; transition: all 0.3s;
                }
                .timeline-step.active .step-icon {
                    background: var(--color-primary, #8D6E63); color: white;
                    box-shadow: 0 3px 8px rgba(0,0,0,0.2);
                }
                .step-label { font-size: 0.8rem; font-weight: 500; text-align: center; }
                .timeline-line {
                    height: 3px; background: #eee; flex-grow: 1; margin: 0 8px; margin-bottom: 20px;
                    transition: background 0.3s;
                }
                .timeline-line.active-line { background: var(--color-primary, #8D6E63); }
                .status-rejected { text-align: center; color: #dc3545; }
                .status-rejected .icon { font-size: 2.5rem; margin-bottom: 0.5rem; }
                .rejection-reason { font-size: 0.9rem; color: #666; margin-top: 5px; }
                .empty-tracker { text-align: center; padding: 3rem; color: #999; }
            `}</style>
        </div>
    );
};

export default AdoptionStatusTracker;
