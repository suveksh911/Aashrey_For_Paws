import React, { useState, useEffect } from 'react';
import api from '../services/axios';
import { toast } from 'react-toastify';
import { FaUsers, FaPaw, FaClipboardList, FaTrash, FaCheck, FaHeart } from 'react-icons/fa';

function AdminDashboard() {
    const [activeTab, setActiveTab] = useState('overview');
    const [stats, setStats] = useState({ users: 0, pets: 0, requests: 0 });
    const [users, setUsers] = useState([]);
    const [pets, setPets] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            // Mock Data for demonstration
            const mockUsers = [
                { _id: '1', name: 'Anu Budhathoki', email: 'anu@example.com', role: 'Adopter', isVerified: true, joined: '2025-10-01' },
                { _id: '2', name: 'Paw Helpers', email: 'contact@pawhelpers.org', role: 'NGO', isVerified: false, joined: '2026-10-05' },
                { _id: '3', name: 'Jane shakya', email: 'jane@example.com', role: 'Owner', isVerified: true, joined: '2025-10-10' },
                { _id: '4', name: 'Kabita Shah', email: 'kabita@example.com', role: 'Adopter', isVerified: true, joined: '2025-10-12' },
                { _id: '5', name: 'Safe Haven', email: 'info@safehaven.org', role: 'NGO', isVerified: true, joined: '2025-10-15' },
            ];
            const mockPets = [
                { _id: '101', name: 'Buddy', type: 'Dog', status: 'Available', owner: 'Paw Helpers', date: '2025-10-06' },
                { _id: '102', name: 'Whiskers', type: 'Cat', status: 'Adopted', owner: 'Aayaush Chaudhary', date: '2026-10-02' },
                { _id: '103', name: 'Rocky', type: 'Dog', status: 'Pending', owner: 'Paw Helpers', date: '2025-10-08' },
                { _id: '104', name: 'Goldie', type: 'Bird', status: 'Available', owner: 'Safe Haven', date: '2025-10-16' },
            ];

            // Calculate Stats
            const adoptionRequests = JSON.parse(localStorage.getItem('adoptionRequests')) || [];
            const pendingRequestsCount = adoptionRequests.filter(req => req.status === 'Pending').length;
            const totalAdoptions = mockPets.filter(p => p.status === 'Adopted').length;

            setUsers(mockUsers);
            setPets(mockPets);
            setStats({
                users: mockUsers.length,
                pets: mockPets.length,
                requests: pendingRequestsCount,
                adoptions: totalAdoptions
            });
            setLoading(false);
        } catch (error) {
            console.error("Error fetching admin data", error);
            toast.error("Failed to load dashboard data");
            setLoading(false);
        }
    };

    const handleDeleteUser = (id) => {
        if (window.confirm("Are you sure you want to delete this user?")) {
            setUsers(users.filter(u => u._id !== id));
            toast.success("User deleted (simulated)");
        }
    };

    const handleVerifyUser = (id) => {
        setUsers(users.map(u => u._id === id ? { ...u, isVerified: true } : u));
        toast.success("User verified (simulated)");
    };

    const handleDeletePet = (id) => {
        if (window.confirm("Are you sure you want to delete this pet?")) {
            setPets(pets.filter(p => p._id !== id));
            toast.success("Pet deleted (simulated)");
        }
    };

    if (loading) return <div className="container" style={{ padding: '2rem' }}>Loading Admin Dashboard...</div>;

    return (
        <div className="container" style={{ padding: '2rem', maxWidth: '1200px' }}>
            <h1>Admin Dashboard</h1>

            <div className="admin-tabs" style={{ display: 'flex', gap: '1rem', margin: '2rem 0', borderBottom: '1px solid #ddd' }}>
                <button
                    className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
                    onClick={() => setActiveTab('overview')}
                >Overview</button>
                <button
                    className={`tab-btn ${activeTab === 'users' ? 'active' : ''}`}
                    onClick={() => setActiveTab('users')}
                >User Management</button>
                <button
                    className={`tab-btn ${activeTab === 'pets' ? 'active' : ''}`}
                    onClick={() => setActiveTab('pets')}
                >Pet Management</button>
            </div>

            {activeTab === 'overview' && (
                <div className="overview-section">
                    <div className="stats-grid">
                        <div className="stat-card blue">
                            <div className="icon"><FaUsers /></div>
                            <div className="info">
                                <h3>Total Users</h3>
                                <p>{stats.users}</p>
                            </div>
                        </div>
                        <div className="stat-card green">
                            <div className="icon"><FaPaw /></div>
                            <div className="info">
                                <h3>Total Pets</h3>
                                <p>{stats.pets}</p>
                            </div>
                        </div>
                        <div className="stat-card orange">
                            <div className="icon"><FaClipboardList /></div>
                            <div className="info">
                                <h3>Pending Requests</h3>
                                <p>{stats.requests}</p>
                            </div>
                        </div>
                        <div className="stat-card purple">
                            <div className="icon"><FaHeart /></div>
                            <div className="info">
                                <h3>Total Adoptions</h3>
                                <p>{stats.adoptions || 0}</p>
                            </div>
                        </div>
                    </div>

                    <div className="recent-activity">
                        <h2>Recent Activity</h2>
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>Action</th>
                                    <th>User/Pet</th>
                                    <th>Date</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>New User Registration</td>
                                    <td>Safe Haven (NGO)</td>
                                    <td>2023-10-15</td>
                                    <td><span className="badge success">Verified</span></td>
                                </tr>
                                <tr>
                                    <td>New Pet Added</td>
                                    <td>Goldie (Bird)</td>
                                    <td>2023-10-16</td>
                                    <td><span className="badge available">Available</span></td>
                                </tr>
                                <tr>
                                    <td>Adoption Request</td>
                                    <td>momo(Dog)</td>
                                    <td>2023-10-14</td>
                                    <td><span className="badge pending">Pending</span></td>
                                </tr>
                                <tr>
                                    <td>New User Registration</td>
                                    <td>Kabita shah (Adopter)</td>
                                    <td>2023-10-12</td>
                                    <td><span className="badge success">Verified</span></td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {activeTab === 'users' && (
                <div className="management-section">
                    <h2>All Users</h2>
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Role</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map(user => (
                                <tr key={user._id}>
                                    <td>{user.name}</td>
                                    <td>{user.email}</td>
                                    <td>{user.role}</td>
                                    <td>
                                        {user.isVerified ?
                                            <span className="badge success">Verified</span> :
                                            <span className="badge warning">Unverified</span>
                                        }
                                    </td>
                                    <td>
                                        {!user.isVerified && (
                                            <button className="btn-icon success" onClick={() => handleVerifyUser(user._id)} title="Verify">
                                                <FaCheck />
                                            </button>
                                        )}
                                        <button className="btn-icon danger" onClick={() => handleDeleteUser(user._id)} title="Delete">
                                            <FaTrash />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {activeTab === 'pets' && (
                <div className="management-section">
                    <h2>All Pets</h2>
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Type</th>
                                <th>Owner</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {pets.map(pet => (
                                <tr key={pet._id}>
                                    <td>{pet.name}</td>
                                    <td>{pet.type}</td>
                                    <td>{pet.owner}</td>
                                    <td><span className={`badge ${pet.status.toLowerCase()}`}>{pet.status}</span></td>
                                    <td>
                                        <button className="btn-icon danger" onClick={() => handleDeletePet(pet._id)} title="Delete">
                                            <FaTrash />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            <style>{`
                .tab-btn {
                    padding: 10px 20px;
                    border: none;
                    background: none;
                    cursor: pointer;
                    font-size: 1rem;
                    border-bottom: 3px solid transparent;
                }
                .tab-btn.active {
                    border-bottom-color: #5d4037;
                    font-weight: bold;
                    color: #5d4037;
                }
                .stats-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                    gap: 1.5rem;
                }
                .stat-card {
                    background: #fff;
                    padding: 1.5rem;
                    border-radius: 8px;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                }
                .stat-card .icon {
                    font-size: 2.5rem;
                    color: #5d4037;
                }
                .stat-card h3 { margin: 0; font-size: 1rem; color: #666; }
                .stat-card p { margin: 0; font-size: 2rem; font-weight: bold; color: #333; }
                
                .admin-table {
                    width: 100%;
                    border-collapse: collapse;
                    background: #fff;
                    border-radius: 8px;
                    overflow: hidden;
                    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
                }
                .admin-table th, .admin-table td {
                    padding: 12px 15px;
                    text-align: left;
                    border-bottom: 1px solid #eee;
                }
                .admin-table th {
                    background-color: #f8f9fa;
                    font-weight: 600;
                }
                .badge {
                    padding: 4px 8px;
                    border-radius: 12px;
                    font-size: 0.8rem;
                }
                .badge.success { background: #d4edda; color: #155724; }
                .badge.warning { background: #fff3cd; color: #856404; }
                .badge.available { background: #d1ecf1; color: #0c5460; }
                .badge.adopted { background: #d4edda; color: #155724; }
                .badge.pending { background: #fff3cd; color: #856404; }
                
                .btn-icon {
                    border: none;
                    background: none;
                    cursor: pointer;
                    padding: 5px;
                    font-size: 1rem;
                    margin-right: 5px;
                }
                .btn-icon.success { color: #28a745; }
                .btn-icon.danger { color: #dc3545; }
            `}</style>
        </div>
    );
}

export default AdminDashboard;
