import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/axios';
import { FaCheckCircle, FaHourglassHalf, FaTimesCircle, FaPaw } from 'react-icons/fa';

const AdoptionStatusTracker = () => {
    const { user } = useAuth();
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchRequests();
    }, []);

    const fetchRequests = async () => {
        try {
            // Mocking data for now if API not ready
            const localRequests = JSON.parse(localStorage.getItem('adoptionRequests')) || [];

            // In a real scenario, filter by user ID (assuming user.name or user.id is stored)
            const userRequests = localRequests.filter(r => r.userId === user?.name);

            setRequests(userRequests);
            // api call: const res = await api.get('/adoption/my-requests');
        } catch (error) {
            console.error("Error fetching requests", error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusStep = (status) => {
        switch (status?.toLowerCase()) {
            case 'pending': return 1;
            case 'approved': return 3; // 3 steps: Pending -> Processing -> Approved
            case 'rejected': return 0;
            default: return 1;
        }
    };

    if (loading) return <div>Loading status...</div>;
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

                    return (
                        <div key={request.id} className="request-card">
                            <div className="request-header">
                                <h3>Adoption Request for: <span>{request.petName}</span></h3>
                                <span className="date-badge">{request.date}</span>
                            </div>

                            <div className="status-timeline">
                                {isRejected ? (
                                    <div className="status-rejected">
                                        <FaTimesCircle className="icon" />
                                        <span>Application Rejected</span>
                                        <p className="rejection-reason">Reason: Does not meet criteria for this pet.</p>
                                    </div>
                                ) : (
                                    <>
                                        <div className={`timeline-step ${step >= 1 ? 'active' : ''}`}>
                                            <div className="step-icon"><FaHourglassHalf /></div>
                                            <div className="step-label">Pending Review</div>
                                        </div>
                                        <div className="timeline-line"></div>
                                        <div className={`timeline-step ${step >= 2 ? 'active' : ''}`}>
                                            <div className="step-icon">2</div>
                                            <div className="step-label">Interview</div>
                                        </div>
                                        <div className="timeline-line"></div>
                                        <div className={`timeline-step ${step >= 3 ? 'active' : ''}`}>
                                            <div className="step-icon"><FaCheckCircle /></div>
                                            <div className="step-label">Approved</div>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            <style>{`
                .adoption-tracker-container {
                    padding: 1rem;
                }
                .request-card {
                    background: white;
                    border-radius: 8px;
                    padding: 1.5rem;
                    box-shadow: 0 2px 5px rgba(0,0,0,0.05);
                    margin-bottom: 1.5rem;
                    border: 1px solid #eee;
                }
                .request-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 1.5rem;
                    border-bottom: 1px solid #f0f0f0;
                    padding-bottom: 10px;
                }
                .request-header h3 {
                    margin: 0;
                    font-size: 1.1rem;
                    color: var(--color-text-secondary);
                }
                .request-header h3 span {
                    color: var(--color-primary);
                    font-weight: bold;
                }
                .date-badge {
                    font-size: 0.85rem;
                    color: #999;
                }
                .status-timeline {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 1rem 0;
                }
                .timeline-step {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 5px;
                    opacity: 0.5;
                    position: relative;
                    z-index: 1;
                }
                .timeline-step.active {
                    opacity: 1;
                }
                .step-icon {
                    width: 40px;
                    height: 40px;
                    border-radius: 50%;
                    background: #eee;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: bold;
                    color: #666;
                    transition: all 0.3s;
                }
                .timeline-step.active .step-icon {
                    background: var(--color-primary);
                    color: white;
                    box-shadow: 0 2px 5px rgba(0,0,0,0.2);
                }
                .step-label {
                    font-size: 0.85rem;
                    font-weight: 500;
                }
                .timeline-line {
                    height: 2px;
                    background: #eee;
                    flex-grow: 1;
                    margin: 0 10px;
                    margin-bottom: 20px; /* Align with dots */
                }
                .status-rejected {
                    text-align: center;
                    color: #dc3545;
                }
                .status-rejected .icon {
                    font-size: 2rem;
                    margin-bottom: 0.5rem;
                }
                .rejection-reason {
                    font-size: 0.9rem;
                    color: #666;
                    margin-top: 5px;
                }
                .empty-tracker {
                    text-align: center;
                    padding: 3rem;
                    color: #999;
                }
            `}</style>
        </div>
    );
};

export default AdoptionStatusTracker;
