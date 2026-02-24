import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaHistory, FaPaw } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';

const AdoptionHistory = () => {
    const { user } = useAuth();
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchHistory();
    }, []);

    const fetchHistory = () => {
        // Mock data logic
        const allRequests = JSON.parse(localStorage.getItem('adoptionRequests')) || [];
        // Filter for this user and status is 'Approved' or 'Adopted'
        const userHistory = allRequests.filter(req =>
            req.userId === user?.name &&
            ['Approved', 'Adopted'].includes(req.status)
        );

        // Add some mock history if empty for demo
        if (userHistory.length === 0) {
            userHistory.push({
                id: 'hist1',
                petName: 'Bella (Past)',
                date: '2022-05-15',
                status: 'Adopted',
                image: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1'
            });
        }

        setHistory(userHistory);
        setLoading(false);
    };

    if (loading) return <div className="container p-4">Loading history...</div>;

    return (
        <div className="container" style={{ padding: '2rem', maxWidth: '1000px' }}>
            <h1 className="mb-4"><FaHistory /> Adoption History</h1>

            {history.length === 0 ? (
                <div className="empty-state text-center p-5 bg-light rounded">
                    <FaPaw size={50} color="#ccc" />
                    <p className="mt-3">You haven't adopted any pets yet.</p>
                    <Link to="/pet-find" className="btn btn-primary mt-2">Find a Companion</Link>
                </div>
            ) : (
                <div className="history-list">
                    {history.map(item => (
                        <div key={item.id} className="history-card">
                            <div className="history-img">
                                <img src={item.image || 'https://via.placeholder.com/150'} alt={item.petName} />
                            </div>
                            <div className="history-info">
                                <h3>{item.petName}</h3>
                                <p className="date">Adopted on: {item.date}</p>
                                <span className="status-badge success">Successfully Adopted</span>
                                <div className="mt-3">
                                    <button className="btn btn-outline-primary btn-sm">View Certificate</button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <style>{`
                .history-list {
                    display: grid;
                    gap: 1.5rem;
                }
                .history-card {
                    display: flex;
                    background: white;
                    border-radius: 12px;
                    overflow: hidden;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.05);
                    border: 1px solid #eee;
                    transition: transform 0.2s;
                }
                .history-card:hover {
                    transform: translateY(-2px);
                }
                .history-img {
                    width: 200px;
                    background: #f0f0f0;
                }
                .history-img img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }
                .history-info {
                    padding: 1.5rem;
                    flex: 1;
                }
                .history-info h3 {
                    margin: 0 0 0.5rem 0;
                    color: var(--color-text-dark);
                }
                .date {
                    color: #666;
                    font-size: 0.9rem;
                    margin-bottom: 0.5rem;
                }
                .status-badge {
                    display: inline-block;
                    padding: 4px 10px;
                    border-radius: 20px;
                    font-size: 0.8rem;
                    font-weight: 600;
                }
                .status-badge.success {
                    background: #e6f9ed;
                    color: #28a745;
                }
                @media (max-width: 600px) {
                    .history-card { flex-direction: column; }
                    .history-img { width: 100%; height: 200px; }
                }
            `}</style>
        </div>
    );
};

export default AdoptionHistory;
