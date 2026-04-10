import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import api from '../services/axios';
import {
    FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt, FaEdit, FaSave,
    FaHeart, FaClipboardList, FaHistory, FaPaw, FaShieldAlt, FaCamera, FaQuoteLeft
} from 'react-icons/fa';
import NGOProfilePage, { OwnerProfilePage, AdminProfilePage } from './RoleProfiles';

// ── Smart Role Router ─────────────────────────────────────────────────────────
const UserProfile = () => {
    const { user } = useAuth();
    const role = user?.role;

    if (role === 'NGO') return <NGOProfilePage />;
    if (role === 'Owner') return <OwnerProfilePage />;
    if (role === 'Admin') return <AdminProfilePage />;
    // Default: Adopter / User
    return <AdopterProfile />;
};

// ── Adopter / User Profile ────────────────────────────────────────────────────
const AdopterProfile = React.forwardRef(({ isTab = false, externalEditing = false, onEditingComplete }, ref) => {
    const { user, refreshUser } = useAuth();
    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => {
        if (externalEditing) setIsEditing(true);
        else if (isTab && isEditing && !externalEditing) setIsEditing(false);
    }, [externalEditing, isTab]);
    const [profileImage, setProfileImage] = useState(null);
    const fileInputRef = useRef(null);
    const [profileData, setProfileData] = useState({
        name: user?.name || 'User',
        email: user?.email || '',
        phone: '',
        address: '',
        bio: ''
    });
    const [favorites, setFavorites] = useState([]);
    const [requestCount, setRequestCount] = useState(0);
    const [historyCount, setHistoryCount] = useState(0);
    const [vaccinations, setVaccinations] = useState([]);


    useEffect(() => {
        if (!user) return;
        fetchProfile();
        fetchStats();
    }, [user]);

    const fetchProfile = async () => {
        try {
            const res = await api.get('/users/me');
            if (res.data.success) {
                const u = res.data.data;
                setProfileData({
                    name: u.name || '',
                    email: u.email || '',
                    phone: u.phone || '',
                    address: u.address || '',
                    bio: u.bio || ''
                });
                if (u.profileImage) setProfileImage(u.profileImage);
            }
        } catch {
            // Fallback to auth context if API fails
            setProfileData(prev => ({ ...prev, name: user?.name || 'User', email: user?.email || '' }));
        }
    };

    const fetchStats = async () => {
        try {
            const [reqRes] = await Promise.allSettled([
                api.get('/adoptions/my')
            ]);
            if (reqRes.status === 'fulfilled' && reqRes.value.data.success) {
                const reqs = reqRes.value.data.data;
                setRequestCount(reqs.length);
                setHistoryCount(reqs.filter(r => ['Approved', 'Adopted'].includes(r.status)).length);
            }
        } catch { /* stats are optional */ }
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        if (file.size > 3 * 1024 * 1024) {
            toast.error('Image must be under 3 MB');
            return;
        }
        const reader = new FileReader();
        reader.onload = async (ev) => {
            const dataUrl = ev.target.result;
            setProfileImage(dataUrl);
            try {
                await api.patch('/users/me', { profileImage: dataUrl });
                toast.success('Profile picture updated!');
                if (refreshUser) refreshUser();
            } catch (error) {
                toast.error(error.response?.data?.message || 'Failed to save profile picture');
            }
        };
        reader.readAsDataURL(file);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setProfileData(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = async () => {
        try {
            await api.patch('/users/me', {
                name: profileData.name,
                email: profileData.email,
                phone: profileData.phone,
                address: profileData.address,
                bio: profileData.bio
            });
            toast.success('Profile updated successfully!');
            setIsEditing(false);
            if (refreshUser) await refreshUser();
            if (onEditingComplete) onEditingComplete();
        } catch {
            toast.error('Failed to save profile. Please try again.');
        }
    };

    React.useImperativeHandle(ref, () => ({
        handleSave
    }));

    return (
        <div className="up-container">

            {/* Header Banner */}
            {!isTab && (
                <div className="up-banner">
                    {/* Clickable Avatar */}
                    <div className="up-avatar">
                        {profileImage
                            ? <img src={profileImage} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
                            : <FaUser size={46} />
                        }
                        <div 
                            className="up-avatar-camera" 
                            onClick={(e) => { e.stopPropagation(); fileInputRef.current.click(); }}
                            title="Update Photo"
                            style={{ cursor: 'pointer' }}
                        >
                            <FaCamera size={14} />
                        </div>
                    </div>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        style={{ display: 'none' }}
                    />
                    <h1>{profileData.name}</h1>
                    <span className="up-role">{user?.role || 'Adopter'}</span>
                    <div className="up-quick-stats">
                        <div className="up-qs"><strong>{requestCount}</strong><span>Applications</span></div>
                        <div className="up-qs-divider" />
                        <div className="up-qs"><strong>{historyCount}</strong><span>Adopted</span></div>
                        <div className="up-qs-divider" />
                        <div className="up-qs"><strong>{favorites.length}</strong><span>Saved</span></div>
                    </div>
                </div>
            )}

            {/* Quick links - Hide if in tab */}
            {!isTab && (
                <div className="up-links-row">
                    <Link to="/user" className="up-quick-link">
                        <FaClipboardList /> My Dashboard
                    </Link>
                    <Link to="/adoption-history" className="up-quick-link">
                        <FaHistory /> Adoption History
                    </Link>
                    <Link to="/adoption-status" className="up-quick-link">
                        <FaShieldAlt /> Track Status
                    </Link>
                    <Link to="/pet-find" className="up-quick-link">
                        <FaPaw /> Find Pets
                    </Link>
                </div>
            )}

            {/* Main content */}
            <div className={`up-content ${isTab ? 'up-tab-mode' : ''}`}>


                
                {isTab && vaccinations.length > 0 && vaccinations.some(v => v.daysLeft < 30) && (
                    <div className="up-health-alert">
                        <FaShieldAlt /> <strong>Health Reminder:</strong> You have upcoming vaccinations to track.
                    </div>
                )}

                {/* Single Edit Button for entire profile - Hide if externally managed or isTab */}
                {!externalEditing && !isTab && (
                    !isEditing ? (
                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '-0.5rem' }}>
                            <button className="up-edit-btn" onClick={() => setIsEditing(true)}><FaEdit /> Edit Profile</button>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginBottom: '-0.5rem' }}>
                            <button className="up-cancel-btn" onClick={() => setIsEditing(false)}>Cancel</button>
                            <button className="up-save-btn" onClick={handleSave}><FaSave /> Save Changes</button>
                        </div>
                    )
                )}

                {/* About Me */}
                <div className="up-card up-featured-card">
                    <div className="up-card-header">
                        <h2><FaUser /> About</h2>
                    </div>
                    <div className="up-featured-content">
                        {isEditing ? (
                            <textarea name="bio" value={profileData.bio} onChange={handleChange} rows={5} className="up-bio-input premium-textarea" placeholder="Tell the community about your journey with animals..." />
                        ) : (
                            <div className="up-bio-display">
                                <p className="up-bio-text text-premium">{profileData.bio || <span style={{ color: '#bbb', fontStyle: 'italic' }}>Share your passion for animals and your pet journey here.</span>}</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Personal Information */}
                <div className="up-card">
                    <div className="up-card-header">
                        <h2>Personal Information</h2>
                    </div>

                    <div className="up-info-grid">
                        {[
                            { icon: <FaUser />, label: 'Full Name', name: 'name', type: 'text' },
                            { icon: <FaEnvelope />, label: 'Email Address', name: 'email', type: 'email' },
                            { icon: <FaPhone />, label: 'Phone Number', name: 'phone', type: 'tel', placeholder: '+977 98XXXXXXXX' },
                            { icon: <FaMapMarkerAlt />, label: 'Address', name: 'address', type: 'text', placeholder: 'City, District' },
                        ].map(field => (
                            <div key={field.name} className="up-info-item">
                                <label>{field.icon} {field.label}</label>
                                {isEditing ? (
                                    <input
                                        name={field.name}
                                        type={field.type}
                                        value={profileData[field.name]}
                                        onChange={handleChange}
                                        placeholder={field.placeholder || field.label}
                                    />
                                ) : (
                                <p className="truncate max-w-[200px]" title={profileData[field.name]}>
                                    {profileData[field.name] || <span style={{ color: '#bbb', fontStyle: 'italic' }}>Not set</span>}
                                </p>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Saved Pets */}
                {favorites.length > 0 && (
                    <div className="up-card">
                        <div className="up-card-header">
                            <h2><FaHeart style={{ color: '#e91e63' }} /> Saved Pets</h2>
                            <Link to="/user" className="up-view-all">View All →</Link>
                        </div>
                        <div className="up-favs-grid">
                            {favorites.slice(0, 4).map(pet => (
                                <Link key={pet._id} to={`/pet/${pet._id}`} className="up-fav-card">
                                    <img src={pet.image || pet.images?.[0] || 'https://via.placeholder.com/140x100?text=Pet'} alt={pet.name} />
                                    <div className="up-fav-info">
                                        <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{pet.name}</div>
                                        <div style={{ color: '#888', fontSize: '0.78rem' }}>{pet.breed}</div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            <style>{`
                .up-container { max-width: 860px; margin: 0 auto; padding: 0 0 2rem; }
                .up-tab-mode { gap: 1rem; }
                .up-tab-mode .up-card { box-shadow: none; border: 1px solid #eee; padding: 1.2rem; }
                
                /* Premium Featured Card */
                .up-featured-card {
                    background: linear-gradient(to right, #ffffff, #fdfdfd);
                    position: relative;
                    overflow: hidden;
                }
                .up-bio-display { position: relative; padding: 0.2rem 0; }
                .text-premium { line-height: 1.8; color: #444; font-size: 1.05rem; white-space: pre-wrap; }
                .premium-textarea { border: 1px solid #e0e0e0; border-radius: 12px; padding: 1rem; line-height: 1.6; }
                
                .up-tab-header {
                    display: flex; align-items: center; gap: 1.5rem;
                    background: white; padding: 1.5rem; border-radius: 20px;
                    border: 1px solid #f0f0f0; margin-bottom: 1rem;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.03);
                }
                .up-tab-avatar-group { cursor: pointer; }
                .up-tab-avatar {
                    width: 72px; height: 72px; background: #efebe9;
                    border-radius: 20px; display: flex; align-items: center; justify-content: center;
                    position: relative; border: 3px solid #5d4037; overflow: visible;
                }
                .up-tab-avatar img { width: 100%; height: 100%; object-fit: cover; border-radius: 17px; }
                .up-tab-avatar-camera {
                    position: absolute; -bottom: 8px; -right: 8px;
                    background: #5d4037; color: white;
                    width: 24px; height: 24px; border-radius: 50%;
                    display: flex; align-items: center; justify-content: center;
                    border: 2px solid white; shadow: 0 2px 5px rgba(0,0,0,0.2);
                }
                .up-tab-title h3 { margin: 0; font-size: 1.4rem; color: #333; font-weight: 800; letter-spacing: -0.5px; }
                .up-tab-badge { 
                    margin-top: 5px; font-size: 0.75rem; color: #5d4037; font-weight: 800; 
                    background: #fff8f6; padding: 3px 10px; border-radius: 15px; border: 1px solid #efebe9;
                    display: inline-block; text-transform: uppercase; letter-spacing: 0.5px;
                }
                .up-health-alert {
                    display: flex; align-items: center; gap: 0.8rem; background: #fff4e5;
                    color: #663c00; padding: 1rem 1.25rem; border-radius: 15px;
                    margin-bottom: 1.5rem; border: 1px solid #ffe2b7; font-size: 0.9rem;
                }
                .up-health-alert strong { font-weight: 800; }

                .up-banner {
                    background: linear-gradient(135deg, #5d4037 0%, #8d6e63 100%);
                    color: white;
                    text-align: center;
                    padding: 3rem 1.5rem 2rem;
                    border-radius: 14px;
                    margin-bottom: 1.5rem;
                }
                .up-avatar {
                    width: 90px; height: 90px;
                    background: rgba(255,255,255,0.2);
                    border-radius: 50%; display: flex;
                    align-items: center; justify-content: center;
                    margin: 0 auto 1rem;
                    border: 3px solid rgba(255,255,255,0.4);
                    position: relative; overflow: visible;
                }
                .up-avatar-clickable { cursor: pointer; }
                .up-avatar-clickable:hover { border-color: white; }
                .up-avatar-camera {
                    position: absolute; bottom: 2px; right: 2px;
                    background: #5d4037; color: white;
                    width: 26px; height: 26px; border-radius: 50%;
                    display: flex; align-items: center; justify-content: center;
                    border: 2px solid white; box-shadow: 0 1px 4px rgba(0,0,0,0.3);
                }
                .up-banner h1 { margin: 0 0 0.4rem; font-size: 1.8rem; }
                .up-role {
                    background: rgba(255,255,255,0.2);
                    padding: 0.25rem 1rem; border-radius: 20px;
                    font-size: 0.9rem; display: inline-block; margin-bottom: 1.5rem;
                }
                .up-quick-stats {
                    display: flex; justify-content: center;
                    align-items: center; gap: 1.5rem; flex-wrap: wrap;
                }
                .up-qs { display: flex; flex-direction: column; align-items: center; }
                .up-qs strong { font-size: 1.6rem; font-weight: 800; }
                .up-qs span { font-size: 0.8rem; opacity: 0.8; }
                .up-qs-divider { width: 1px; height: 40px; background: rgba(255,255,255,0.3); }

                .up-links-row {
                    display: flex; gap: 0.75rem; flex-wrap: wrap;
                    margin-bottom: 1.5rem;
                }
                .up-quick-link {
                    display: inline-flex; align-items: center; gap: 0.4rem;
                    background: white; border: 1px solid #e0e0e0;
                    color: #5d4037; padding: 0.6rem 1rem;
                    border-radius: 8px; text-decoration: none;
                    font-size: 0.9rem; font-weight: 600;
                    box-shadow: 0 1px 4px rgba(0,0,0,0.05);
                    transition: all 0.2s;
                }
                .up-quick-link:hover { background: #5d4037; color: white; }

                .up-content { display: flex; flex-direction: column; gap: 1.5rem; }
                .up-card {
                    background: white;
                    padding: 1.8rem;
                    border-radius: 12px;
                    box-shadow: 0 2px 10px rgba(0,0,0,0.06);
                }
                .up-card-header {
                    display: flex; justify-content: space-between;
                    align-items: center; margin-bottom: 1.5rem;
                    padding-bottom: 1rem;
                    border-bottom: 1px solid #f0f0f0;
                }
                .up-card-header h2 {
                    margin: 0; font-size: 1.15rem;
                    display: flex; align-items: center; gap: 0.4rem;
                }
                .up-edit-btn {
                    display: flex; align-items: center; gap: 0.4rem;
                    background: none; border: 1px solid #5d4037;
                    color: #5d4037; padding: 0.45rem 1rem;
                    border-radius: 6px; cursor: pointer; font-size: 0.88rem;
                    font-weight: 600; transition: all 0.2s;
                }
                .up-edit-btn:hover { background: #5d4037; color: white; }
                .up-info-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
                    gap: 1.5rem;
                }
                .up-info-item label {
                    display: flex; align-items: center; gap: 0.4rem;
                    color: #888; font-size: 0.85rem; margin-bottom: 0.4rem;
                }
                .up-info-item p {
                    font-size: 1.05rem; font-weight: 500; margin: 0;
                    color: #222;
                }
                .up-info-item input {
                    width: 100%; padding: 0.55rem 0.8rem;
                    border: 1px solid #ddd; border-radius: 6px; font-size: 1rem;
                    box-sizing: border-box;
                }
                .up-info-item input:focus { outline: 2px solid #5d4037; }
                .up-bio-text { line-height: 1.6; color: #444; margin: 0; }
                .up-bio-input {
                    width: 100%; padding: 0.65rem 0.9rem;
                    border: 1px solid #ddd; border-radius: 8px; font-size: 0.95rem;
                    box-sizing: border-box; resize: vertical;
                }
                .up-save-btn {
                    display: inline-flex; align-items: center; gap: 0.4rem;
                    background: #5d4037; color: white; border: none;
                    padding: 0.6rem 1.4rem; border-radius: 8px; cursor: pointer; font-weight: 600;
                }
                .up-cancel-btn {
                    background: #f5f5f5; color: #555; border: 1px solid #ddd;
                    padding: 0.6rem 1.2rem; border-radius: 8px; cursor: pointer;
                }
                .up-view-all {
                    color: #5d4037; text-decoration: none; font-weight: 600; font-size: 0.9rem;
                }
                .up-favs-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
                    gap: 1rem;
                }
                .up-fav-card {
                    border-radius: 8px; overflow: hidden; text-decoration: none;
                    border: 1px solid #eee; transition: box-shadow 0.2s;
                }
                .up-fav-card:hover { box-shadow: 0 4px 14px rgba(0,0,0,0.1); }
                .up-fav-card img {
                    width: 100%; height: 110px; object-fit: cover; display: block;
                }
                .up-fav-info { padding: 0.6rem; background: white; }
                @media (max-width: 600px) {
                    .up-links-row { overflow-x: auto; flex-wrap: nowrap; }
                    .up-info-grid { grid-template-columns: 1fr; }
                }
            `}</style>
        </div>
    );
});

export { AdopterProfile };
export default UserProfile;
