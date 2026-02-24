import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
    FaHeart, FaClipboardList, FaHistory, FaPaw, FaSearch,
    FaUser, FaTimes, FaEye, FaStar, FaCheckCircle, FaClock,
    FaTimesCircle, FaEdit, FaTrash, FaPlus, FaListAlt
} from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';

// ─── Adopter Dashboard ───────────────────────────────────────────────────────
function AdopterDashboard({ user }) {
    const [activeTab, setActiveTab] = useState('overview');
    const [requests, setRequests] = useState([]);
    const [favorites, setFavorites] = useState([]);
    const [history, setHistory] = useState([]);

    useEffect(() => { loadData(); }, [user]);

    const loadData = () => {
        const localRequests = JSON.parse(localStorage.getItem('adoptionRequests')) || [];
        const myRequests = localRequests.filter(r => r.userId === user?.name);
        if (myRequests.length === 0) {
            myRequests.push({ id: 'demo1', petName: 'Buddy (Demo)', status: 'Pending', date: '2024-10-25', reason: 'Love dogs and want a companion.' });
        }
        setRequests(myRequests);
        setFavorites(JSON.parse(localStorage.getItem('userFavorites')) || []);
        const approved = localRequests.filter(r => r.userId === user?.name && ['Approved', 'Adopted'].includes(r.status));
        if (approved.length === 0) approved.push({ id: 'hist1', petName: 'Bella (Demo)', date: '2023-05-15', status: 'Adopted', image: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=400' });
        setHistory(approved);
    };

    const cancelRequest = (requestId) => {
        if (!window.confirm('Cancel this adoption request?')) return;
        const all = JSON.parse(localStorage.getItem('adoptionRequests')) || [];
        localStorage.setItem('adoptionRequests', JSON.stringify(all.filter(r => r.id !== requestId)));
        loadData();
        toast.info('Adoption request cancelled');
    };

    const removeFavorite = (petId) => {
        const updated = favorites.filter(f => f._id !== petId);
        setFavorites(updated);
        localStorage.setItem('userFavorites', JSON.stringify(updated));
        toast.info('Removed from favorites');
    };

    const pending = requests.filter(r => r.status === 'Pending').length;
    const approved = requests.filter(r => r.status === 'Approved').length;

    const tabBtn = (tab, icon, label, badge) => (
        <button
            onClick={() => setActiveTab(tab)}
            style={{
                padding: '10px 18px', border: 'none', background: 'transparent',
                borderBottom: activeTab === tab ? '3px solid #5d4037' : '3px solid transparent',
                fontWeight: activeTab === tab ? 700 : 400,
                color: activeTab === tab ? '#5d4037' : '#666',
                cursor: 'pointer', fontSize: '0.9rem',
                display: 'flex', alignItems: 'center', gap: '6px',
                whiteSpace: 'nowrap'
            }}
        >
            {icon} {label}
            {badge > 0 && <span style={{ background: '#dc3545', color: '#fff', borderRadius: '50%', fontSize: '0.7rem', padding: '2px 6px' }}>{badge}</span>}
        </button>
    );

    const statusStyle = (s) => s === 'Approved'
        ? { bg: '#D4EDDA', color: '#155724', icon: <FaCheckCircle /> }
        : s === 'Rejected'
            ? { bg: '#F8D7DA', color: '#721C24', icon: <FaTimesCircle /> }
            : { bg: '#FFF3CD', color: '#856404', icon: <FaClock /> };

    return (
        <div style={{ padding: '2rem', maxWidth: '1100px', margin: '0 auto' }}>

            {/* Hero */}
            <div className="a-hero">
                <div>
                    <h1 style={{ margin: '0 0 0.4rem', fontSize: '1.8rem' }}>🐾 Welcome, {user?.name}!</h1>
                    <p style={{ margin: 0, opacity: 0.85 }}>Track your adoptions, manage favorites, and find your perfect companion.</p>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                    <Link to="/pet-find" className="a-hero-btn primary"><FaSearch /> Find Pets</Link>
                    <Link to="/profile" className="a-hero-btn secondary"><FaUser /> My Profile</Link>
                </div>
            </div>

            {/* Stats */}
            <div className="a-stats">
                {[
                    { icon: <FaClipboardList />, num: requests.length, label: 'Applications', color: '#5d4037' },
                    { icon: <FaClock />, num: pending, label: 'Pending', color: '#FF9800' },
                    { icon: <FaCheckCircle />, num: approved, label: 'Approved', color: '#4CAF50' },
                    { icon: <FaHeart />, num: favorites.length, label: 'Saved Pets', color: '#e91e63' },
                    { icon: <FaHistory />, num: history.length, label: 'Adopted', color: '#3F51B5' },
                ].map((s, i) => (
                    <div key={i} className="a-stat-card">
                        <div style={{ fontSize: '1.6rem', color: s.color }}>{s.icon}</div>
                        <div>
                            <div style={{ fontSize: '1.8rem', fontWeight: 800 }}>{s.num}</div>
                            <div style={{ fontSize: '0.8rem', color: '#888' }}>{s.label}</div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', borderBottom: '2px solid #eee', marginBottom: '1.5rem', overflowX: 'auto' }}>
                {tabBtn('overview', <FaPaw />, 'Overview')}
                {tabBtn('requests', <FaClipboardList />, 'My Requests', pending)}
                {tabBtn('favorites', <FaHeart />, 'Saved Pets')}
                {tabBtn('history', <FaHistory />, 'History')}
            </div>

            {/* Tab panels */}
            <div style={{ background: '#fff', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>

                {/* === OVERVIEW === */}
                {activeTab === 'overview' && (
                    <div className="ov-grid">
                        {/* Recent requests */}
                        <div className="ov-panel">
                            <div className="ov-panel-header">
                                <h3><FaClipboardList /> Recent Applications</h3>
                                <button className="ov-more" onClick={() => setActiveTab('requests')}>View All →</button>
                            </div>
                            {requests.slice(0, 4).map(req => {
                                const s = statusStyle(req.status);
                                return (
                                    <div key={req.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.6rem 0', borderBottom: '1px solid #f3f3f3' }}>
                                        <div>
                                            <div style={{ fontWeight: 600 }}>{req.petName}</div>
                                            <div style={{ fontSize: '0.78rem', color: '#aaa' }}>{req.date}</div>
                                        </div>
                                        <span style={{ background: s.bg, color: s.color, padding: '3px 10px', borderRadius: '20px', fontSize: '0.78rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            {s.icon} {req.status}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Saved pets */}
                        <div className="ov-panel">
                            <div className="ov-panel-header">
                                <h3><FaHeart /> Saved Pets</h3>
                                <button className="ov-more" onClick={() => setActiveTab('favorites')}>View All →</button>
                            </div>
                            {favorites.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: '1.5rem', color: '#aaa' }}>
                                    <p>No saved pets yet.</p>
                                    <Link to="/pet-find" style={{ color: '#5d4037', fontWeight: 600, textDecoration: 'none' }}>Browse Pets →</Link>
                                </div>
                            ) : (
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginTop: '0.5rem' }}>
                                    {favorites.slice(0, 4).map(pet => (
                                        <Link to={`/pet/${pet._id}`} key={pet._id} style={{ borderRadius: '8px', overflow: 'hidden', textDecoration: 'none', position: 'relative', display: 'block' }}>
                                            <img src={pet.image || pet.images?.[0]} alt={pet.name} style={{ width: '100%', height: '70px', objectFit: 'cover', display: 'block' }} />
                                            <div style={{ background: 'rgba(0,0,0,0.6)', color: '#fff', fontSize: '0.75rem', padding: '3px 6px', textAlign: 'center' }}>{pet.name}</div>
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Quick links */}
                        <div className="ov-panel">
                            <h3 style={{ margin: '0 0 1rem', fontSize: '1rem' }}>🚀 Quick Actions</h3>
                            {[
                                ['/pet-find', <FaSearch />, 'Browse Available Pets'],
                                ['/adoption-status', <FaClipboardList />, 'Track Adoption Status'],
                                ['/adoption-history', <FaHistory />, 'View Adoption History'],
                                ['/community', <FaStar />, 'Community Forum'],
                                ['/profile', <FaUser />, 'Edit My Profile'],
                            ].map(([to, icon, label]) => (
                                <Link key={to} to={to} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.6rem 0.8rem', borderRadius: '8px', textDecoration: 'none', color: '#333', fontSize: '0.9rem', marginBottom: '0.4rem', transition: 'background 0.2s' }}
                                    onMouseEnter={e => e.currentTarget.style.background = '#EFEBE9'}
                                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                >
                                    <span style={{ color: '#5d4037' }}>{icon}</span> {label}
                                </Link>
                            ))}
                        </div>
                    </div>
                )}

                {/* === MY REQUESTS === */}
                {activeTab === 'requests' && (
                    <div>
                        {requests.length === 0 ? (
                            <div className="a-empty"><FaClipboardList size={50} color="#ccc" /><h3>No applications yet</h3><p>Find a pet and submit an adoption request.</p><Link to="/pet-find" className="a-cta"><FaSearch /> Find Pets</Link></div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {requests.map(req => {
                                    const s = statusStyle(req.status);
                                    return (
                                        <div key={req.id} style={{ background: '#fafafa', padding: '1.2rem', borderRadius: '10px', borderLeft: '4px solid #5d4037' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                                <div>
                                                    <div style={{ fontWeight: 700, fontSize: '1.05rem' }}>{req.petName}</div>
                                                    <div style={{ fontSize: '0.83rem', color: '#888' }}>Submitted: {req.date}</div>
                                                </div>
                                                <span style={{ background: s.bg, color: s.color, padding: '4px 12px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px', height: 'fit-content' }}>
                                                    {s.icon} {req.status}
                                                </span>
                                            </div>
                                            {req.reason && <p style={{ margin: '0 0 0.5rem', fontSize: '0.9rem', color: '#555' }}><strong>Reason:</strong> {req.reason}</p>}
                                            {req.status === 'Approved' && <div style={{ background: '#D4EDDA', color: '#155724', padding: '0.7rem 1rem', borderRadius: '8px', fontSize: '0.88rem', marginTop: '0.5rem' }}>🎉 Approved! Contact the owner to complete adoption.</div>}
                                            {req.status === 'Rejected' && <div style={{ background: '#F8D7DA', color: '#721C24', padding: '0.7rem 1rem', borderRadius: '8px', fontSize: '0.88rem', marginTop: '0.5rem' }}>Request not approved. Keep exploring!</div>}
                                            {req.status === 'Pending' && (
                                                <div style={{ marginTop: '0.75rem' }}>
                                                    <button onClick={() => cancelRequest(req.id)} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: '#FFEBEE', color: '#C62828', border: 'none', padding: '6px 14px', borderRadius: '6px', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem' }}>
                                                        <FaTimes /> Cancel Request
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}

                {/* === SAVED PETS === */}
                {activeTab === 'favorites' && (
                    <div>
                        {favorites.length === 0 ? (
                            <div className="a-empty"><FaHeart size={50} color="#ccc" /><h3>No saved pets</h3><p>Click ❤️ on a pet's page to save it here.</p><Link to="/pet-find" className="a-cta"><FaSearch /> Explore Pets</Link></div>
                        ) : (
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(210px,1fr))', gap: '1.2rem' }}>
                                {favorites.map(pet => (
                                    <div key={pet._id} style={{ border: '1px solid #eee', borderRadius: '10px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                                        <div style={{ position: 'relative' }}>
                                            <img src={pet.image || pet.images?.[0] || 'https://via.placeholder.com/300x160?text=Pet'} alt={pet.name} style={{ width: '100%', height: '160px', objectFit: 'cover', display: 'block' }} />
                                            <span style={{ position: 'absolute', top: '8px', right: '8px', background: pet.adoptionStatus === 'Adopted' ? '#9E9E9E' : '#4CAF50', color: '#fff', padding: '3px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700 }}>{pet.adoptionStatus || 'Available'}</span>
                                        </div>
                                        <div style={{ padding: '0.9rem' }}>
                                            <div style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '0.2rem' }}>{pet.name}</div>
                                            <div style={{ fontSize: '0.83rem', color: '#666' }}>{pet.breed} • {pet.age}</div>
                                            <div style={{ fontSize: '0.78rem', color: '#aaa', marginTop: '0.2rem' }}>📍 {pet.location}</div>
                                            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.8rem', alignItems: 'center' }}>
                                                <Link to={`/pet/${pet._id}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', background: '#E3F2FD', color: '#1565C0', padding: '5px 10px', borderRadius: '6px', textDecoration: 'none', fontSize: '0.82rem', fontWeight: 600 }}><FaEye /> View</Link>
                                                <Link to={`/adopt/${pet._id}`} state={{ petName: pet.name }} style={{ flex: 1, background: '#5d4037', color: '#fff', padding: '5px 10px', borderRadius: '6px', textDecoration: 'none', fontSize: '0.82rem', fontWeight: 600, textAlign: 'center' }}>Adopt</Link>
                                                <button onClick={() => removeFavorite(pet._id)} style={{ background: '#FFEBEE', color: '#C62828', border: 'none', padding: '5px 8px', borderRadius: '6px', cursor: 'pointer' }}><FaTimes /></button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* === HISTORY === */}
                {activeTab === 'history' && (
                    <div>
                        {history.length === 0 ? (
                            <div className="a-empty"><FaHistory size={50} color="#ccc" /><h3>No adoption history yet</h3><p>Your successfully adopted pets will appear here.</p></div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {history.map(item => (
                                    <div key={item.id} style={{ display: 'flex', gap: '1.2rem', background: '#fafafa', borderRadius: '10px', overflow: 'hidden', border: '1px solid #eee', alignItems: 'center' }}>
                                        <img src={item.image || 'https://via.placeholder.com/160x120?text=Pet'} alt={item.petName} style={{ width: '160px', height: '120px', objectFit: 'cover', flexShrink: 0 }} />
                                        <div style={{ padding: '1rem 1rem 1rem 0' }}>
                                            <div style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: '0.3rem' }}>{item.petName}</div>
                                            <div style={{ fontSize: '0.88rem', color: '#888', marginBottom: '0.6rem' }}>Adopted on: {item.date}</div>
                                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: '#D4EDDA', color: '#155724', padding: '4px 12px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 600 }}>
                                                <FaCheckCircle /> Successfully Adopted
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>

            <style>{`
                .a-hero {
                    background: linear-gradient(135deg, #5d4037 0%, #8d6e63 100%);
                    color: white; padding: 2rem; border-radius: 14px;
                    display: flex; justify-content: space-between;
                    align-items: center; flex-wrap: wrap; gap: 1rem;
                    margin-bottom: 2rem;
                }
                .a-hero-btn {
                    display: inline-flex; align-items: center; gap: 0.4rem;
                    padding: 0.65rem 1.2rem; border-radius: 8px;
                    font-weight: 600; text-decoration: none; font-size: 0.9rem;
                }
                .a-hero-btn.primary { background: white; color: #5d4037; }
                .a-hero-btn.secondary { background: rgba(255,255,255,0.2); color: white; border: 1px solid rgba(255,255,255,0.4); }
                .a-stats {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
                    gap: 1rem; margin-bottom: 2rem;
                }
                .a-stat-card {
                    background: white; padding: 1.2rem; border-radius: 10px;
                    display: flex; align-items: center; gap: 1rem;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.07);
                }
                .ov-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
                    gap: 1.5rem;
                }
                .ov-panel {
                    background: #fafafa; border-radius: 10px; padding: 1.2rem; border: 1px solid #eee;
                }
                .ov-panel-header {
                    display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem;
                }
                .ov-panel-header h3 {
                    margin: 0; font-size: 1rem; display: flex; align-items: center; gap: 0.4rem;
                }
                .ov-more { background: none; border: none; color: #5d4037; font-size: 0.85rem; cursor: pointer; font-weight: 600; }
                .a-empty { text-align: center; padding: 3rem 2rem; color: #aaa; }
                .a-empty h3 { margin: 1rem 0 0.4rem; color: #888; }
                .a-empty p { margin: 0 0 1.2rem; }
                .a-cta {
                    display: inline-flex; align-items: center; gap: 0.4rem;
                    background: #5d4037; color: white; padding: 0.65rem 1.4rem;
                    border-radius: 8px; text-decoration: none; font-weight: 600;
                }
                @media (max-width: 600px) {
                    .a-hero { flex-direction: column; }
                    .a-stats { grid-template-columns: repeat(2, 1fr); }
                }
            `}</style>
        </div>
    );
}

// ─── Owner Dashboard ─────────────────────────────────────────────────────────
function OwnerDashboard({ user }) {
    const [activeTab, setActiveTab] = useState('listings');
    const [myListings, setMyListings] = useState([]);
    const [incomingRequests, setIncomingRequests] = useState([]);
    const [profile, setProfile] = useState({ name: user?.name || '', phone: '', address: '', bio: '' });
    const [editingProfile, setEditingProfile] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        loadOwnerData();
        const savedProfile = JSON.parse(localStorage.getItem('ownerProfile')) || {};
        setProfile({ name: user?.name || '', phone: '', address: '', bio: '', ...savedProfile });
    }, [user]);

    const loadOwnerData = () => {
        const allPets = JSON.parse(localStorage.getItem('ngoPets')) || [];
        const mine = allPets.filter(p => p.ownerId === user?.name);
        setMyListings(mine);
        const allReqs = JSON.parse(localStorage.getItem('adoptionRequests')) || [];
        const myPetIds = mine.map(p => p._id);
        setIncomingRequests(allReqs.filter(r => myPetIds.includes(r.petId)));
    };

    const handleDelete = (petId) => {
        if (!window.confirm('Delete this listing permanently?')) return;
        const allPets = JSON.parse(localStorage.getItem('ngoPets')) || [];
        const updated = allPets.filter(p => p._id !== petId);
        localStorage.setItem('ngoPets', JSON.stringify(updated));
        setMyListings(updated.filter(p => p.ownerId === user?.name));
        toast.success('Listing removed');
    };

    const handleToggleStatus = (petId, currentStatus) => {
        const newStatus = currentStatus === 'Adopted' ? 'Available' : 'Adopted';
        const allPets = JSON.parse(localStorage.getItem('ngoPets')) || [];
        const updated = allPets.map(p => p._id === petId ? { ...p, adoptionStatus: newStatus } : p);
        localStorage.setItem('ngoPets', JSON.stringify(updated));
        setMyListings(updated.filter(p => p.ownerId === user?.name));
        toast.success(`Pet marked as ${newStatus}`);
    };

    const handleRequestAction = (requestId, action) => {
        const allRequests = JSON.parse(localStorage.getItem('adoptionRequests')) || [];
        const updated = allRequests.map(r =>
            r.id === requestId ? { ...r, status: action === 'approve' ? 'Approved' : 'Rejected' } : r
        );
        localStorage.setItem('adoptionRequests', JSON.stringify(updated));
        const myPets = myListings.map(p => p._id);
        setIncomingRequests(updated.filter(r => myPets.includes(r.petId)));
        toast.success(`Request ${action === 'approve' ? 'approved' : 'rejected'}!`);
    };

    const available = myListings.filter(p => p.adoptionStatus === 'Available').length;
    const adopted = myListings.filter(p => p.adoptionStatus === 'Adopted').length;
    const pendingReqs = incomingRequests.filter(r => r.status === 'Pending').length;

    const tabStyle = (tab) => ({
        padding: '10px 20px', border: 'none',
        borderBottom: activeTab === tab ? '3px solid #5d4037' : '3px solid transparent',
        background: 'transparent', fontWeight: activeTab === tab ? 'bold' : 'normal',
        color: activeTab === tab ? '#5d4037' : '#666', cursor: 'pointer',
        fontSize: '0.95rem', transition: 'all 0.2s', display: 'flex',
        alignItems: 'center', gap: '6px', whiteSpace: 'nowrap'
    });

    const statusBadge = (status) => {
        const map = { Available: '#28a745', Adopted: '#6c757d', Pending: '#ffc107' };
        return <span style={{ background: map[status] || '#eee', color: status === 'Pending' ? '#333' : '#fff', padding: '3px 10px', borderRadius: '20px', fontSize: '0.78rem', fontWeight: 700 }}>{status}</span>;
    };

    return (
        <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>

            {/* Header */}
            <div className="owner-hero">
                <div>
                    <h1>🏠 Owner Dashboard</h1>
                    <p>Welcome back, <strong>{user?.name}</strong>! Manage your listed pets and adoption requests.</p>
                </div>
                <Link to="/add-pet" className="btn-add-pet"><FaPlus /> List a New Pet</Link>
            </div>

            {/* Stats */}
            <div className="stats-row">
                {[
                    { icon: <FaListAlt />, label: 'Total Listings', val: myListings.length, cls: 'blue' },
                    { icon: <FaPaw />, label: 'Available', val: available, cls: 'green' },
                    { icon: <FaCheckCircle />, label: 'Adopted', val: adopted, cls: 'gray' },
                    { icon: <FaClipboardList />, label: 'Pending Requests', val: pendingReqs, cls: 'orange' },
                ].map((s, i) => (
                    <div key={i} className={`stat-card ${s.cls}`}>
                        <div className="stat-icon">{s.icon}</div>
                        <div><div className="stat-num">{s.val}</div><div className="stat-lbl">{s.label}</div></div>
                    </div>
                ))}
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', borderBottom: '2px solid #eee', marginBottom: '1.5rem', overflowX: 'auto' }}>
                <button style={tabStyle('listings')} onClick={() => setActiveTab('listings')}><FaListAlt /> My Listings {myListings.length > 0 && <span className="tab-num">{myListings.length}</span>}</button>
                <button style={tabStyle('requests')} onClick={() => setActiveTab('requests')}><FaClipboardList /> Adoption Requests {pendingReqs > 0 && <span className="tab-num" style={{ background: '#dc3545' }}>{pendingReqs}</span>}</button>
                <button style={tabStyle('profile')} onClick={() => setActiveTab('profile')}><FaUser /> My Profile</button>
            </div>

            {/* MY LISTINGS */}
            {activeTab === 'listings' && (
                <div>
                    {myListings.length === 0 ? (
                        <div className="empty-state">
                            <FaPaw size={60} color="#ccc" />
                            <h3>No pets listed yet</h3>
                            <p>Start by listing your first pet for adoption.</p>
                            <Link to="/add-pet" className="btn-add-pet"><FaPlus /> List a Pet</Link>
                        </div>
                    ) : (
                        <div className="listings-grid">
                            {myListings.map(pet => (
                                <div key={pet._id} className="listing-card">
                                    <div className="listing-img">
                                        <img src={pet.image || pet.images?.[0] || 'https://via.placeholder.com/300x180?text=No+Image'} alt={pet.name} />
                                        {statusBadge(pet.adoptionStatus || 'Available')}
                                    </div>
                                    <div className="listing-body">
                                        <h4>{pet.name}</h4>
                                        <p style={{ color: '#888', fontSize: '0.85rem', margin: '0 0 0.4rem' }}>{pet.breed} • {pet.age}</p>
                                        <div className="listing-actions">
                                            <Link to={`/pet/${pet._id}`} className="action-btn view"><FaEye /> View</Link>
                                            <Link to={`/edit-pet/${pet._id}`} className="action-btn edit"><FaEdit /> Edit</Link>
                                            <button onClick={() => handleToggleStatus(pet._id, pet.adoptionStatus)} className={`action-btn ${pet.adoptionStatus === 'Adopted' ? 'undo-adopted' : 'mark-adopted'}`}>
                                                {pet.adoptionStatus === 'Adopted' ? '↩ Available' : '✓ Adopted'}
                                            </button>
                                            <button onClick={() => handleDelete(pet._id)} className="action-btn delete"><FaTrash /></button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* ADOPTION REQUESTS */}
            {activeTab === 'requests' && (
                <div>
                    {incomingRequests.length === 0 ? (
                        <div className="empty-state">
                            <FaClipboardList size={60} color="#ccc" />
                            <h3>No adoption requests yet</h3>
                            <p>Adoption requests from people interested in your pets will appear here.</p>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {incomingRequests.map(req => (
                                <div key={req.id} className="req-card">
                                    <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                        <div>
                                            <div style={{ fontWeight: 700, fontSize: '1rem' }}>
                                                🐾 {req.petName}
                                                <span style={{ fontWeight: 400, color: '#888', fontSize: '0.85rem', marginLeft: '0.5rem' }}>— by {req.applicantName || req.fullName || req.userId}</span>
                                            </div>
                                            <div style={{ fontSize: '0.8rem', color: '#aaa' }}>Submitted: {req.date}</div>
                                        </div>
                                        <span className={`status-badge ${req.status?.toLowerCase()}`}>{req.status}</span>
                                    </div>
                                    {req.reason && <p style={{ fontSize: '0.88rem', color: '#555', margin: '0 0 0.5rem' }}><strong>Reason:</strong> {req.reason}</p>}
                                    {req.phone && <p style={{ fontSize: '0.85rem', color: '#555', margin: '0 0 0.5rem' }}>📞 {req.phone}</p>}
                                    {req.status === 'Pending' && (
                                        <div className="req-actions">
                                            <button onClick={() => handleRequestAction(req.id, 'approve')} className="btn-approve"><FaCheckCircle /> Approve</button>
                                            <button onClick={() => handleRequestAction(req.id, 'reject')} className="btn-reject"><FaTimes /> Reject</button>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* PROFILE */}
            {activeTab === 'profile' && (
                <div className="profile-section">
                    <div className="profile-avatar"><FaUser size={60} color="#5d4037" /></div>
                    {!editingProfile ? (
                        <>
                            <h2>{profile.name}</h2>
                            <p className="role-badge">🏷️ Pet Owner</p>
                            <div className="profile-details">
                                {profile.phone && <p>📞 <strong>Phone:</strong> {profile.phone}</p>}
                                {profile.address && <p>📍 <strong>Address:</strong> {profile.address}</p>}
                                {profile.bio && <p>📝 <strong>Bio:</strong> {profile.bio}</p>}
                                {!profile.phone && !profile.address && !profile.bio && <p style={{ color: '#aaa' }}>No details added yet. Click Edit to add your info.</p>}
                            </div>
                            <div className="profile-stats">
                                <div className="p-stat"><strong>{myListings.length}</strong><span>Pets Listed</span></div>
                                <div className="p-stat"><strong>{adopted}</strong><span>Adopted</span></div>
                                <div className="p-stat"><strong>{incomingRequests.length}</strong><span>Requests</span></div>
                            </div>
                            <button className="btn-edit-profile" onClick={() => setEditingProfile(true)}><FaEdit /> Edit Profile</button>
                        </>
                    ) : (
                        <form className="profile-form" onSubmit={e => { e.preventDefault(); localStorage.setItem('ownerProfile', JSON.stringify(profile)); setEditingProfile(false); toast.success('Profile updated!'); }}>
                            <h2>Edit Profile</h2>
                            {[['name', 'Full Name', 'text'], ['phone', 'Phone Number', 'tel'], ['address', 'Address', 'text']].map(([field, label, type]) => (
                                <div className="pf-group" key={field}>
                                    <label>{label}</label>
                                    <input type={type} value={profile[field]} onChange={e => setProfile(p => ({ ...p, [field]: e.target.value }))} placeholder={label} />
                                </div>
                            ))}
                            <div className="pf-group">
                                <label>Bio</label>
                                <textarea rows={3} value={profile.bio} onChange={e => setProfile(p => ({ ...p, bio: e.target.value }))} placeholder="Tell adopters about yourself..." />
                            </div>
                            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                                <button type="submit" className="btn-edit-profile">Save Changes</button>
                                <button type="button" className="btn-cancel-profile" onClick={() => setEditingProfile(false)}>Cancel</button>
                            </div>
                        </form>
                    )}
                    <div className="profile-tip"><strong>Tip:</strong> Keep your contact info updated so NGOs and adopters can reach you easily!</div>
                </div>
            )}

            <style>{`
                .owner-hero {
                    background: linear-gradient(135deg, #4e342e 0%, #8d6e63 100%);
                    color: white; padding: 2rem; border-radius: 14px;
                    display: flex; justify-content: space-between; align-items: center;
                    flex-wrap: wrap; gap: 1rem; margin-bottom: 2rem;
                }
                .owner-hero h1 { margin: 0 0 0.3rem; }
                .owner-hero p { margin: 0; opacity: 0.85; }
                .btn-add-pet {
                    display: inline-flex; align-items: center; gap: 0.4rem;
                    background: white; color: #5d4037; padding: 0.65rem 1.2rem;
                    border-radius: 8px; text-decoration: none; font-weight: 700;
                }
                .stats-row {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
                    gap: 1rem; margin-bottom: 2rem;
                }
                .stat-card {
                    background: white; padding: 1.2rem; border-radius: 10px;
                    display: flex; align-items: center; gap: 1rem;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.07);
                }
                .stat-card.blue .stat-icon { color: #1565C0; }
                .stat-card.green .stat-icon { color: #2E7D32; }
                .stat-card.gray .stat-icon { color: #5d4037; }
                .stat-card.orange .stat-icon { color: #E65100; }
                .stat-icon { font-size: 1.6rem; }
                .stat-num { font-size: 1.8rem; font-weight: 800; }
                .stat-lbl { font-size: 0.8rem; color: #888; }
                .tab-num {
                    background: #5d4037; color: white; border-radius: 20px;
                    font-size: 0.7rem; padding: 2px 7px;
                }
                .listings-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
                    gap: 1.2rem;
                }
                .listing-card {
                    background: white; border-radius: 12px; overflow: hidden;
                    box-shadow: 0 2px 10px rgba(0,0,0,0.07); border: 1px solid #f0f0f0;
                    transition: transform 0.2s;
                }
                .listing-card:hover { transform: translateY(-3px); }
                .listing-img { position: relative; }
                .listing-img img { width: 100%; height: 170px; object-fit: cover; display: block; }
                .listing-img span { position: absolute; top: 8px; right: 8px; }
                .listing-body { padding: 1rem; }
                .listing-body h4 { margin: 0 0 0.2rem; font-size: 1.05rem; }
                .listing-actions { display: flex; gap: 0.4rem; flex-wrap: wrap; margin-top: 0.7rem; }
                .action-btn {
                    display: inline-flex; align-items: center; gap: 0.3rem;
                    padding: 5px 10px; border-radius: 6px; font-size: 0.8rem;
                    font-weight: 600; cursor: pointer; border: none; text-decoration: none;
                }
                .action-btn.view { background: #E3F2FD; color: #1565C0; }
                .action-btn.edit { background: #FFF8E1; color: #F57F17; }
                .action-btn.mark-adopted { background: #E8F5E9; color: #2E7D32; }
                .action-btn.undo-adopted { background: #EDE7F6; color: #4527A0; }
                .action-btn.delete { background: #FFEBEE; color: #C62828; }
                .req-card {
                    background: #fafafa; padding: 1.2rem; border-radius: 10px;
                    border-left: 4px solid #5d4037;
                }
                .status-badge {
                    display: inline-block; padding: 4px 12px; border-radius: 20px;
                    font-size: 0.8rem; font-weight: bold;
                }
                .status-badge.pending { background: #FFF3CD; color: #856404; }
                .status-badge.approved { background: #D4EDDA; color: #155724; }
                .status-badge.rejected { background: #F8D7DA; color: #721C24; }
                .req-actions { display: flex; gap: 0.75rem; margin-top: 0.75rem; }
                .btn-approve {
                    background: #28a745; color: white; border: none;
                    padding: 8px 16px; border-radius: 6px; cursor: pointer;
                    font-weight: 600; display: flex; align-items: center; gap: 0.4rem;
                }
                .btn-reject {
                    background: #dc3545; color: white; border: none;
                    padding: 8px 16px; border-radius: 6px; cursor: pointer;
                    font-weight: 600; display: flex; align-items: center; gap: 0.4rem;
                }
                .profile-section { text-align: center; padding: 2rem; }
                .profile-avatar {
                    width: 100px; height: 100px; border-radius: 50%;
                    background: #EFEBE9; display: flex; align-items: center;
                    justify-content: center; margin: 0 auto 1rem;
                }
                .profile-section h2 { font-size: 1.8rem; margin: 0 0 0.5rem; }
                .role-badge { background: #EFEBE9; display: inline-block; padding: 4px 16px; border-radius: 20px; font-weight: 600; color: #5d4037; }
                .profile-details { margin: 1rem auto; max-width: 400px; text-align: left; }
                .profile-details p { margin: 0.4rem 0; font-size: 0.95rem; }
                .profile-stats { display: flex; justify-content: center; gap: 3rem; margin: 2rem 0; flex-wrap: wrap; }
                .p-stat { display: flex; flex-direction: column; align-items: center; }
                .p-stat strong { font-size: 2rem; color: #5d4037; }
                .p-stat span { font-size: 0.9rem; color: #888; }
                .btn-edit-profile {
                    display: inline-flex; align-items: center; gap: 0.4rem;
                    background: #5d4037; color: white; border: none;
                    padding: 0.6rem 1.4rem; border-radius: 8px; cursor: pointer;
                    font-weight: 600; margin-top: 1rem; font-size: 0.9rem;
                }
                .btn-cancel-profile {
                    background: #f5f5f5; color: #555; border: 1px solid #ddd;
                    padding: 0.6rem 1.4rem; border-radius: 8px; cursor: pointer;
                }
                .profile-form { max-width: 480px; margin: 0 auto; text-align: left; }
                .profile-form h2 { margin-bottom: 1.5rem; }
                .pf-group { margin-bottom: 1rem; }
                .pf-group label { display: block; font-weight: 600; margin-bottom: 0.4rem; font-size: 0.9rem; color: #555; }
                .pf-group input, .pf-group textarea { width: 100%; padding: 0.7rem 1rem; border: 1px solid #ddd; border-radius: 8px; font-size: 0.95rem; box-sizing: border-box; }
                .pf-group input:focus, .pf-group textarea:focus { outline: 2px solid #5d4037; }
                .profile-tip { background: #FFF8E1; padding: 1rem; border-radius: 8px; border-left: 4px solid #FF9800; text-align: left; max-width: 500px; margin: 2rem auto 0; }
                .empty-state { text-align: center; padding: 4rem 2rem; color: #aaa; }
                .empty-state h3 { margin: 1rem 0 0.5rem; color: #888; }
                .empty-state p { margin: 0 0 1.5rem; }
            `}</style>
        </div>
    );
}

// ─── Main Export ─────────────────────────────────────────────────────────────
function UserDashboard() {
    const { user } = useAuth();
    if (user?.role === 'Owner') return <OwnerDashboard user={user} />;
    return <AdopterDashboard user={user} />;
}

export default UserDashboard;
