import React, { useState, useEffect } from 'react';
import api from '../services/axios';
import { toast } from 'react-toastify';

const NGOAdoptionRequests = () => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
       
        const storedRequests = JSON.parse(localStorage.getItem('adoptionRequests')) || [];

 
        if (storedRequests.length === 0) {
            const demoRequests = [
                { id: 1709232000000, petName: 'Buddy (Demo)', userId: 'John Doe', applicant: 'John Doe', status: 'Pending', date: '2023-10-25', petId: 'm1' },
            ];
            
            setRequests(demoRequests);
        } else {
            setRequests(storedRequests);
        }
        setLoading(false);
    }, []);

    const handleStatusChange = (id, newStatus) => {
       
        const updatedRequests = requests.map(req =>
            req.id === id ? { ...req, status: newStatus } : req
        );
        setRequests(updatedRequests);

        
        const lsRequests = JSON.parse(localStorage.getItem('adoptionRequests')) || [];
        const updatedLsRequests = lsRequests.map(req =>
            req.id === id ? { ...req, status: newStatus } : req
        );

        localStorage.setItem('adoptionRequests', JSON.stringify(updatedLsRequests));

        toast.success(`Request ${newStatus}`);
    };

    if (loading) return <div>Loading requests...</div>;

    return (
        <div className="ngo-adoption-requests">
            <h3>Adoption Requests</h3>
            {requests.length === 0 ? (
                <p>No new requests.</p>
            ) : (
                <div className="request-list" style={{ display: 'grid', gap: '1rem' }}>
                    {requests.map(req => (
                        <div key={req.id} style={{ border: '1px solid #ddd', padding: '15px', borderRadius: '8px', backgroundColor: '#fff' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                                <strong>Pet: {req.petName}</strong>
                                <span className={`status-badge ${req.status.toLowerCase()}`}>{req.status}</span>
                            </div>
                            <p>Applicant: {req.applicant}</p>
                            <p>Date: {req.date}</p>

                            {req.status === 'Pending' && (
                                <div style={{ marginTop: '10px', display: 'flex', gap: '10px' }}>
                                    <button onClick={() => handleStatusChange(req.id, 'Approved')} style={{ flex: 1, padding: '8px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Approve</button>
                                    <button onClick={() => handleStatusChange(req.id, 'Rejected')} style={{ flex: 1, padding: '8px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Reject</button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
            <style>{`
                .status-badge {
                    padding: 4px 8px;
                    border-radius: 12px;
                    font-size: 0.85rem;
                }
                .status-badge.pending { background: #fff3cd; color: #856404; }
                .status-badge.approved { background: #d4edda; color: #155724; }
                .status-badge.rejected { background: #f8d7da; color: #721c24; }
            `}</style>
        </div>
    );
};

export default NGOAdoptionRequests;
