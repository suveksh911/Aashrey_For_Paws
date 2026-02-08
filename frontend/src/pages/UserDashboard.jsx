import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/axios';
import { toast } from 'react-toastify';
import { FaHeart, FaPaw, FaClipboardList } from 'react-icons/fa';

function UserDashboard() {
    const [requests, setRequests] = useState([]);
    const [favorites, setFavorites] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchUserData();
    }, []);

    const fetchUserData = async () => {
        try {
           
            const localRequests = JSON.parse(localStorage.getItem('adoptionRequests')) || [];

            
            const mockRequests = [
                { id: 'mock1', petName: 'Buddy (Demo)', status: 'Pending', date: '2023-10-25', reason: 'Love dogs' }
            ];

            
            const allRequests = [...localRequests, ...mockRequests];

            
            allRequests.sort((a, b) => new Date(b.id) - new Date(a.id)); 

            const mockFavorites = [
                { _id: '101', name: 'Buddy', image: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1', breed: 'Golden Retriever' },
                { _id: '105', name: 'Luna', image: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba', breed: 'Siamese' }
            ];

            setRequests(allRequests);
            setFavorites(mockFavorites);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching user data", error);
            
            setLoading(false);
        }
    };

    const removeFavorite = (petId) => {
        setFavorites(favorites.filter(fav => fav._id !== petId));
        toast.info("Removed from favorites");
    
    };

    if (loading) return <div className="container" style={{ padding: '2rem' }}>Loading Dashboard...</div>;

    return (
        <div className="container" style={{ padding: '2rem', maxWidth: '1200px' }}>
            <h1>User Dashboard</h1>

            <div className="dashboard-grid">
                <div className="section">
                    <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <FaClipboardList /> My Adoption Requests
                    </h2>
                    {requests.length === 0 ? (
                        <p>You haven't made any adoption requests yet. <Link to="/pet-find">Find a pet!</Link></p>
                    ) : (
                        <div className="requests-list">
                            {requests.map(req => (
                                <div key={req.id} className="request-card">
                                    <div className="req-header">
                                        <h3>{req.petName}</h3>
                                        <span className={`status ${req.status.toLowerCase()}`}>{req.status}</span>
                                    </div>
                                    <p><strong>Submitted on:</strong> {req.date}</p>
                                    <p><strong>Reason:</strong> {req.reason}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="section">
                    <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <FaHeart className="text-danger" /> Favorite Pets
                    </h2>
                    {favorites.length === 0 ? (
                        <p>No favorites yet. Go explore!</p>
                    ) : (
                        <div className="favorites-grid">
                            {favorites.map(pet => (
                                <div key={pet._id} className="fav-card">
                                    <img src={pet.image} alt={pet.name} />
                                    <div className="fav-info">
                                        <h4>{pet.name}</h4>
                                        <p>{pet.breed}</p>
                                        <div className="fav-actions">
                                            <Link to={`/pet/${pet._id}`} className="btn-link">View</Link>
                                            <button onClick={() => removeFavorite(pet._id)} className="btn-remove">Remove</button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <style>{`
                .dashboard-grid {
                    display: grid;
                    grid-template-columns: 1fr;
                    gap: 2rem;
                    margin-top: 2rem;
                }
                @media (min-width: 768px) {
                    .dashboard-grid {
                        grid-template-columns: 1fr 1fr;
                    }
                }
                .section {
                    background: #fff;
                    padding: 1.5rem;
                    border-radius: 8px;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                }
                .requests-list {
                    display: grid;
                    gap: 1rem;
                    margin-top: 1rem;
                }
                .request-card {
                    background: #f8f9fa;
                    padding: 1rem;
                    border-radius: 6px;
                    border-left: 4px solid #5d4037;
                }
                .req-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 0.5rem;
                }
                .status {
                    padding: 0.25rem 0.75rem;
                    border-radius: 12px;
                    font-size: 0.85rem;
                    font-weight: bold;
                }
                .status.pending { background: #ffc107; color: #856404; }
                .status.approved { background: #28a745; color: white; }
                .status.rejected { background: #dc3545; color: white; }

                .favorites-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
                    gap: 1rem;
                    margin-top: 1rem;
                }
                .fav-card {
                    border: 1px solid #eee;
                    border-radius: 8px;
                    overflow: hidden;
                }
                .fav-card img {
                    width: 100%;
                    height: 120px;
                    object-fit: cover;
                }
                .fav-info {
                    padding: 0.8rem;
                }
                .fav-info h4 { margin: 0 0 0.2rem 0; font-size: 1rem; }
                .fav-info p { margin: 0 0 0.5rem 0; font-size: 0.85rem; color: #666; }
                .fav-actions {
                    display: flex;
                    justify-content: space-between;
                    font-size: 0.85rem;
                }
                .btn-link { color: #5d4037; text-decoration: none; font-weight: bold; }
                .btn-remove { background: none; border: none; color: #dc3545; cursor: pointer; padding: 0; }
            `}</style>
        </div>
    );
}

export default UserDashboard;
