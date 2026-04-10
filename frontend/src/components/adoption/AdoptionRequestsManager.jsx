import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { FaCheck, FaTimes, FaEye } from 'react-icons/fa';

const AdoptionRequestsManager = () => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedRequest, setSelectedRequest] = useState(null); // For modal

    useEffect(() => {
        fetchRequests();
    }, []);

    const fetchRequests = async () => {
        setLoading(true);
        try {
            const res = await api.get('/adoptions/incoming');
            setRequests(res.data.data || []);
        } catch (error) {
            toast.error("Failed to load adoption requests");
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (id, action) => {
        const status = action === 'approve' ? 'Approved' : 'Rejected';
        try {
            await api.patch(`/adoptions/${id}/status`, { status });
            toast.success(`Request ${status}`);
            setRequests(prev => prev.map(req => req._id === id ? { ...req, status } : req));
            setSelectedRequest(null);
        } catch (error) {
            toast.error(`Failed to ${action} request`);
        }
    };

    return (
        <div className="requests-manager">
            <h3>Adoption Requests</h3>

            <div className="table-responsive">
                <table className="custom-table">
                    <thead>
                        <tr>
                            <th>Pet</th>
                            <th>Applicant</th>
                            <th>Date</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {requests.length === 0 ? (
                            <tr><td colSpan="5" className="empty-cell">No requests found.</td></tr>
                        ) : (
                            requests.map(req => (
                                <tr key={req._id}>
                                    <td>{req.petName}</td>
                                    <td>{req.userName || req.fullName}</td>
                                    <td>{req.createdAt ? new Date(req.createdAt).toLocaleDateString() : req.date}</td>
                                    <td><span className={`status-badge ${req.status.toLowerCase()}`}>{req.status}</span></td>
                                    <td>
                                        <div className="action-buttons">
                                            <button className="btn-icon view" onClick={() => setSelectedRequest(req)} title="View Details"><FaEye /></button>
                                            {req.status === 'Pending' && (
                                                <>
                                                    <button className="btn-icon approve" onClick={() => handleAction(req._id, 'approve')} title="Approve"><FaCheck /></button>
                                                    <button className="btn-icon reject" onClick={() => handleAction(req._id, 'reject')} title="Reject"><FaTimes /></button>
                                                </>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Modal */}
            {selectedRequest && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h4>Request Details</h4>
                            <button onClick={() => setSelectedRequest(null)}>&times;</button>
                        </div>
                        <div className="modal-body">
                            <p><strong>Pet:</strong> {selectedRequest.petName}</p>
                            <p><strong>Applicant:</strong> {selectedRequest.fullName}</p>
                            <p><strong>Email:</strong> {selectedRequest.email}</p>
                            <p><strong>Phone:</strong> {selectedRequest.phone}</p>
                            <p><strong>Address:</strong> {selectedRequest.address}</p>
                            <p><strong>Other Pets:</strong> {selectedRequest.haveOtherPets}</p>
                            <p><strong>Reason:</strong></p>
                            <div className="reason-box">{selectedRequest.reason}</div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-secondary" onClick={() => setSelectedRequest(null)}>Close</button>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                .requests-manager {
                    background: white;
                    padding: 1.5rem;
                    border-radius: 8px;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                }
                .custom-table {
                    width: 100%;
                    border-collapse: collapse;
                    margin-top: 1rem;
                }
                .custom-table th, .custom-table td {
                    padding: 12px;
                    text-align: left;
                    border-bottom: 1px solid #eee;
                }
                .custom-table th { background: #f9f9f9; font-weight: 600; }
                .status-badge {
                    padding: 4px 8px;
                    border-radius: 4px;
                    font-size: 0.8rem;
                    font-weight: bold;
                    color: white;
                }
                .status-badge.pending { background: #ffc107; color: black; }
                .status-badge.approved { background: #28a745; }
                .status-badge.rejected { background: #dc3545; }
                
                .action-buttons { display: flex; gap: 8px; }
                .btn-icon { border: none; background: none; cursor: pointer; font-size: 1rem; transition: transform 0.2s; }
                .btn-icon:hover { transform: scale(1.1); }
                .btn-icon.view { color: #17a2b8; }
                .btn-icon.approve { color: #28a745; }
                .btn-icon.reject { color: #dc3545; }

                .modal-overlay {
                    position: fixed; top: 0; left: 0; right: 0; bottom: 0;
                    background: rgba(0,0,0,0.5);
                    display: flex; justify-content: center; align-items: center;
                    z-index: 1000;
                }
                .modal-content {
                    background: white;
                    padding: 2rem;
                    border-radius: 8px;
                    width: 90%;
                    max-width: 500px;
                }
                .modal-header { display: flex; justify-content: space-between; margin-bottom: 1rem; font-size: 1.2rem; font-weight: bold; }
                .reason-box { background: #f9f9f9; padding: 10px; border-radius: 4px; margin-top: 5px; }
                .modal-footer { margin-top: 1.5rem; text-align: right; }
            `}</style>
        </div>
    );
};

export default AdoptionRequestsManager;
