import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { FaCheck, FaTimes, FaEye } from 'react-icons/fa';
// Added this line:
import api from '../../services/axios'; 

const AdoptionRequestsManager = () => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedRequest, setSelectedRequest] = useState(null);

    useEffect(() => {
        fetchRequests();
    }, []);

    const fetchRequests = async () => {
        setLoading(true);
        try {
           
            const res = await api.get('/adoptions/incoming');
            setRequests(res.data.data || []);
        } catch (error) {
            console.error("Fetch Error:", error);
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
            console.error("Action Error:", error);
            toast.error(`Failed to ${action} request`);
        }
    };

    if (loading) {
        return <div className="loading-state">Loading requests...</div>;
    }

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
                                    <td>{req.userName || req.fullName || "Unknown User"}</td>
                                    <td>{req.createdAt ? new Date(req.createdAt).toLocaleDateString() : 'N/A'}</td>
                                    <td><span className={`status-badge ${req.status?.toLowerCase()}`}>{req.status}</span></td>
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

            {/* Modal for Details */}
            {selectedRequest && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h4>Request Details</h4>
                            <button className="close-btn" onClick={() => setSelectedRequest(null)}>&times;</button>
                        </div>
                        <div className="modal-body">
                            <p><strong>Pet:</strong> {selectedRequest.petName}</p>
                            <p><strong>Applicant:</strong> {selectedRequest.userName || selectedRequest.fullName}</p>
                            <p><strong>Email:</strong> {selectedRequest.email || "N/A"}</p>
                            <p><strong>Phone:</strong> {selectedRequest.phone || "N/A"}</p>
                            <p><strong>Address:</strong> {selectedRequest.address || "N/A"}</p>
                            <p><strong>Other Pets:</strong> {selectedRequest.haveOtherPets || "No"}</p>
                            <p><strong>Reason:</strong></p>
                            <div className="reason-box">{selectedRequest.reason || "No reason provided."}</div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-secondary" onClick={() => setSelectedRequest(null)}>Close</button>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                .requests-manager { background: white; padding: 1.5rem; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
                .custom-table { width: 100%; border-collapse: collapse; margin-top: 1rem; }
                .custom-table th, .custom-table td { padding: 12px; text-align: left; border-bottom: 1px solid #eee; }
                .custom-table th { background: #f9f9f9; font-weight: 600; }
                .status-badge { padding: 4px 8px; border-radius: 4px; font-size: 0.8rem; font-weight: bold; }
                .status-badge.pending { background: #ffc107; color: black; }
                .status-badge.approved { background: #28a745; color: white; }
                .status-badge.rejected { background: #dc3545; color: white; }
                
                .action-buttons { display: flex; gap: 12px; }
                .btn-icon { border: none; background: none; cursor: pointer; font-size: 1.1rem; }
                .btn-icon.view { color: #17a2b8; }
                .btn-icon.approve { color: #28a745; }
                .btn-icon.reject { color: #dc3545; }

                .modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.6); display: flex; justify-content: center; align-items: center; z-index: 1000; }
                .modal-content { background: white; padding: 2rem; border-radius: 12px; width: 90%; max-width: 500px; max-height: 80vh; overflow-y: auto; }
                .modal-header { display: flex; justify-content: space-between; margin-bottom: 1.5rem; }
                .close-btn { background: none; border: none; font-size: 1.5rem; cursor: pointer; }
                .reason-box { background: #f4f4f4; padding: 12px; border-radius: 6px; margin-top: 8px; line-height: 1.5; }
                .modal-footer { margin-top: 2rem; text-align: right; }
                .btn-secondary { background: #6c757d; color: white; padding: 8px 16px; border-radius: 4px; border: none; cursor: pointer; }
            `}</style>
        </div>
    );
};

export default AdoptionRequestsManager;
