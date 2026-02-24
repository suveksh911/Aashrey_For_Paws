import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import {
    FaBuilding, FaEnvelope, FaPhone, FaMapMarkerAlt, FaEdit, FaSave,
    FaCamera, FaGlobe, FaFileAlt, FaPlus, FaPaw, FaUsers, FaCheckCircle
} from 'react-icons/fa';

const NGOProfilePage = () => {
    const { user } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [profileImage, setProfileImage] = useState(null);
    const fileInputRef = useRef(null);
    const [data, setData] = useState({
        orgName: user?.name || 'My NGO',
        email: user?.email || '',
        phone: '',
        address: '',
        website: '',
        regNumber: '',
        description: 'We are dedicated to rescuing and rehoming animals in need.',
        mission: '',
    });

    useEffect(() => {
        const saved = JSON.parse(localStorage.getItem('ngoProfileData')) || {};
        setData(prev => ({ ...prev, ...saved, orgName: user?.name || saved.orgName || 'My NGO' }));
        const img = localStorage.getItem('ngoProfileImage');
        if (img) setProfileImage(img);
    }, [user]);

    const handleChange = e => setData(prev => ({ ...prev, [e.target.name]: e.target.value }));

    const handleSave = () => {
        localStorage.setItem('ngoProfileData', JSON.stringify(data));
        setIsEditing(false);
        toast.success('NGO profile updated!');
    };

    const handleImageUpload = e => {
        const file = e.target.files[0];
        if (!file) return;
        if (file.size > 3 * 1024 * 1024) { toast.error('Image must be under 3 MB'); return; }
        const reader = new FileReader();
        reader.onload = ev => {
            setProfileImage(ev.target.result);
            localStorage.setItem('ngoProfileImage', ev.target.result);
            toast.success('Logo updated!');
        };
        reader.readAsDataURL(file);
    };

    // Stats
    const pets = JSON.parse(localStorage.getItem('ngoPets')) || [];
    const requests = (JSON.parse(localStorage.getItem('adoptionRequests')) || []).length;

    const fields = [
        { icon: <FaBuilding />, label: 'Organisation Name', name: 'orgName', type: 'text' },
        { icon: <FaEnvelope />, label: 'Email', name: 'email', type: 'email' },
        { icon: <FaPhone />, label: 'Phone', name: 'phone', type: 'tel', placeholder: '+977 98XXXXXXXX' },
        { icon: <FaMapMarkerAlt />, label: 'Address', name: 'address', type: 'text', placeholder: 'City, District' },
        { icon: <FaGlobe />, label: 'Website', name: 'website', type: 'url', placeholder: 'https://...' },
        { icon: <FaFileAlt />, label: 'Registration No.', name: 'regNumber', type: 'text', placeholder: 'Govt. reg. number' },
    ];

    return (
        <div className="rp-container">
            {/* Banner */}
            <div className="rp-banner rp-ngo-banner">
                <div className="rp-avatar-wrap" onClick={() => fileInputRef.current.click()} title="Click to change logo">
                    {profileImage
                        ? <img src={profileImage} alt="Logo" className="rp-avatar-img" />
                        : <FaBuilding size={48} color="rgba(255,255,255,0.9)" />
                    }
                    <div className="rp-cam-badge"><FaCamera size={13} /></div>
                </div>
                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} />
                <h1>{data.orgName}</h1>
                <span className="rp-role-chip">🏢 NGO</span>
                {data.regNumber && <p style={{ opacity: 0.8, fontSize: '0.85rem', marginTop: '0.3rem' }}>Reg. #{data.regNumber}</p>}
                <div className="rp-stats-row">
                    <div className="rp-stat"><strong>{pets.length}</strong><span>Pets Listed</span></div>
                    <div className="rp-stat-div" />
                    <div className="rp-stat"><strong>{requests}</strong><span>Applications</span></div>
                    <div className="rp-stat-div" />
                    <div className="rp-stat"><FaCheckCircle color="#4ade80" /><span>Verified NGO</span></div>
                </div>
            </div>

            {/* Quick links */}
            <div className="rp-links">
                <Link to="/ngo" className="rp-link">🐾 My Listings</Link>
                <Link to="/add-pet" className="rp-link">➕ Add Pet</Link>
                <Link to="/campaigns" className="rp-link">📣 Campaigns</Link>
                <Link to="/contact" className="rp-link">📩 Contact</Link>
            </div>

            {/* Info Card */}
            <div className="rp-card">
                <div className="rp-card-header">
                    <h2>Organisation Details</h2>
                    <button className="rp-edit-btn" onClick={() => isEditing ? handleSave() : setIsEditing(true)}>
                        {isEditing ? <><FaSave /> Save</> : <><FaEdit /> Edit</>}
                    </button>
                </div>
                <div className="rp-grid">
                    {fields.map(f => (
                        <div key={f.name} className="rp-field">
                            <label>{f.icon} {f.label}</label>
                            {isEditing
                                ? <input name={f.name} type={f.type} value={data[f.name]} onChange={handleChange} placeholder={f.placeholder || f.label} />
                                : <p>{data[f.name] || <span className="rp-empty">Not set</span>}</p>
                            }
                        </div>
                    ))}
                </div>
            </div>

            {/* Mission card */}
            <div className="rp-card">
                <div className="rp-card-header">
                    <h2>About & Mission</h2>
                    {!isEditing && <button className="rp-edit-btn" onClick={() => setIsEditing(true)}><FaEdit /> Edit</button>}
                </div>
                {isEditing
                    ? <textarea name="description" value={data.description} onChange={handleChange} rows={3} className="rp-textarea" placeholder="Describe your organisation..." />
                    : <p className="rp-bio">{data.description || <span className="rp-empty">No description yet.</span>}</p>
                }
                {isEditing && (
                    <div className="rp-action-row">
                        <button className="rp-save-btn" onClick={handleSave}><FaSave /> Save Changes</button>
                        <button className="rp-cancel-btn" onClick={() => setIsEditing(false)}>Cancel</button>
                    </div>
                )}
            </div>

            <RpStyles accent="#1a56db" bannerGradient="linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)" />
        </div>
    );
};

/* ─────────────────────────── Owner Profile ─────────────────────────── */
export const OwnerProfilePage = () => {
    const { user } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [profileImage, setProfileImage] = useState(null);
    const fileInputRef = useRef(null);
    const [data, setData] = useState({
        name: user?.name || '',
        email: user?.email || '',
        phone: '',
        address: '',
        bio: 'I am a responsible pet owner who loves animals.',
        petType: '',
        experience: '',
    });

    useEffect(() => {
        const saved = JSON.parse(localStorage.getItem('ownerProfileData')) || {};
        setData(prev => ({ ...prev, ...saved, name: user?.name || saved.name || '' }));
        const img = localStorage.getItem('ownerProfileImage');
        if (img) setProfileImage(img);
    }, [user]);

    const handleChange = e => setData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    const handleSave = () => { localStorage.setItem('ownerProfileData', JSON.stringify(data)); setIsEditing(false); toast.success('Profile updated!'); };
    const handleImageUpload = e => {
        const file = e.target.files[0];
        if (!file) return;
        if (file.size > 3 * 1024 * 1024) { toast.error('Max 3 MB'); return; }
        const reader = new FileReader();
        reader.onload = ev => { setProfileImage(ev.target.result); localStorage.setItem('ownerProfileImage', ev.target.result); toast.success('Photo updated!'); };
        reader.readAsDataURL(file);
    };

    const pets = JSON.parse(localStorage.getItem('ngoPets')) || [];
    const myPets = pets.filter(p => p.ownerName === user?.name);

    const fields = [
        { icon: <FaEnvelope />, label: 'Email', name: 'email', type: 'email' },
        { icon: <FaPhone />, label: 'Phone', name: 'phone', type: 'tel', placeholder: '+977 98XXXXXXXX' },
        { icon: <FaMapMarkerAlt />, label: 'Location', name: 'address', type: 'text', placeholder: 'City, District' },
        { icon: <FaPaw />, label: 'Pet Type Preference', name: 'petType', type: 'text', placeholder: 'e.g. Dogs, Cats' },
        { icon: <FaUsers />, label: 'Experience', name: 'experience', type: 'text', placeholder: 'e.g. 5 years with dogs' },
    ];

    return (
        <div className="rp-container">
            <div className="rp-banner rp-owner-banner">
                <div className="rp-avatar-wrap" onClick={() => fileInputRef.current.click()} title="Click to change photo">
                    {profileImage
                        ? <img src={profileImage} alt="Profile" className="rp-avatar-img" />
                        : <FaUsers size={46} color="rgba(255,255,255,0.9)" />
                    }
                    <div className="rp-cam-badge"><FaCamera size={13} /></div>
                </div>
                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} />
                <h1>{data.name}</h1>
                <span className="rp-role-chip">🏠 Pet Owner</span>
                <div className="rp-stats-row">
                    <div className="rp-stat"><strong>{myPets.length}</strong><span>Pets Listed</span></div>
                    <div className="rp-stat-div" />
                    <div className="rp-stat"><FaCheckCircle color="#4ade80" /><span>Verified Owner</span></div>
                </div>
            </div>

            <div className="rp-links">
                <Link to="/pet-find" className="rp-link">🐾 Browse Pets</Link>
                <Link to="/add-pet" className="rp-link">➕ List a Pet</Link>
                <Link to="/adoption-board" className="rp-link">📋 Adoption Board</Link>
            </div>

            <div className="rp-card">
                <div className="rp-card-header">
                    <h2>Personal Details</h2>
                    <button className="rp-edit-btn" onClick={() => isEditing ? handleSave() : setIsEditing(true)}>
                        {isEditing ? <><FaSave /> Save</> : <><FaEdit /> Edit</>}
                    </button>
                </div>
                <div className="rp-grid">
                    {fields.map(f => (
                        <div key={f.name} className="rp-field">
                            <label>{f.icon} {f.label}</label>
                            {isEditing
                                ? <input name={f.name} type={f.type} value={data[f.name]} onChange={handleChange} placeholder={f.placeholder || f.label} />
                                : <p>{data[f.name] || <span className="rp-empty">Not set</span>}</p>
                            }
                        </div>
                    ))}
                </div>
            </div>

            <div className="rp-card">
                <div className="rp-card-header">
                    <h2>About Me</h2>
                    {!isEditing && <button className="rp-edit-btn" onClick={() => setIsEditing(true)}><FaEdit /> Edit</button>}
                </div>
                {isEditing
                    ? <textarea name="bio" value={data.bio} onChange={handleChange} rows={3} className="rp-textarea" placeholder="Tell adopters about yourself..." />
                    : <p className="rp-bio">{data.bio || <span className="rp-empty">No bio yet.</span>}</p>
                }
                {isEditing && (
                    <div className="rp-action-row">
                        <button className="rp-save-btn" onClick={handleSave}><FaSave /> Save Changes</button>
                        <button className="rp-cancel-btn" onClick={() => setIsEditing(false)}>Cancel</button>
                    </div>
                )}
            </div>

            <RpStyles accent="#15803d" bannerGradient="linear-gradient(135deg, #14532d 0%, #16a34a 100%)" />
        </div>
    );
};

/* ─────────────────────────── Admin Profile ─────────────────────────── */
export const AdminProfilePage = () => {
    const { user } = useAuth();
    const [profileImage, setProfileImage] = useState(null);
    const fileInputRef = useRef(null);

    useEffect(() => {
        const img = localStorage.getItem('adminProfileImage');
        if (img) setProfileImage(img);
    }, []);

    const handleImageUpload = e => {
        const file = e.target.files[0];
        if (!file) return;
        if (file.size > 3 * 1024 * 1024) { toast.error('Max 3 MB'); return; }
        const reader = new FileReader();
        reader.onload = ev => { setProfileImage(ev.target.result); localStorage.setItem('adminProfileImage', ev.target.result); toast.success('Photo updated!'); };
        reader.readAsDataURL(file);
    };

    const allUsers = (JSON.parse(localStorage.getItem('users')) || []).length;
    const allPets = (JSON.parse(localStorage.getItem('ngoPets')) || []).length;
    const allReqs = (JSON.parse(localStorage.getItem('adoptionRequests')) || []).length;
    const feedbacks = (JSON.parse(localStorage.getItem('platformFeedback')) || []).length;

    const stats = [
        { label: 'Registered Users', val: allUsers },
        { label: 'Pets Listed', val: allPets },
        { label: 'Adoption Requests', val: allReqs },
        { label: 'Feedback Count', val: feedbacks },
    ];

    return (
        <div className="rp-container">
            <div className="rp-banner rp-admin-banner">
                <div className="rp-avatar-wrap" onClick={() => fileInputRef.current.click()} title="Click to change photo">
                    {profileImage
                        ? <img src={profileImage} alt="Admin" className="rp-avatar-img" />
                        : <span style={{ fontSize: '3rem' }}>🛡️</span>
                    }
                    <div className="rp-cam-badge"><FaCamera size={13} /></div>
                </div>
                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} />
                <h1>{user?.name || 'Admin User'}</h1>
                <span className="rp-role-chip">🛡️ Administrator</span>
            </div>

            <div className="rp-links">
                <Link to="/admin" className="rp-link">⚙️ Admin Dashboard</Link>
                <Link to="/contact" className="rp-link">📩 Contact</Link>
            </div>

            {/* Platform Stats */}
            <div className="rp-card">
                <div className="rp-card-header"><h2>📊 Platform Statistics</h2></div>
                <div className="rp-stats-grid">
                    {stats.map(s => (
                        <div key={s.label} className="rp-stat-card">
                            <strong>{s.val}</strong>
                            <span>{s.label}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Account info */}
            <div className="rp-card">
                <div className="rp-card-header"><h2>Account</h2></div>
                <div className="rp-grid">
                    <div className="rp-field">
                        <label><FaEnvelope /> Email</label>
                        <p>{user?.email || 'admin@aashrey.com'}</p>
                    </div>
                    <div className="rp-field">
                        <label>🔐 Role</label>
                        <p style={{ fontWeight: 700, color: '#dc2626' }}>Administrator</p>
                    </div>
                </div>
            </div>

            <RpStyles accent="#dc2626" bannerGradient="linear-gradient(135deg, #7f1d1d 0%, #dc2626 100%)" />
        </div>
    );
};

/* ─────────────────────────── Shared Styles ─────────────────────────── */
function RpStyles({ accent, bannerGradient }) {
    return (
        <style>{`
            .rp-container { max-width: 860px; margin: 2rem auto; padding: 0 1rem 3rem; }
            .rp-banner {
                ${bannerGradient ? `background: ${bannerGradient};` : ''}
                color: white; text-align: center;
                padding: 3rem 1.5rem 2rem; border-radius: 14px; margin-bottom: 1.5rem;
            }
            .rp-banner h1 { margin: 0 0 0.4rem; font-size: 1.9rem; color:white; }
            .rp-role-chip {
                background: rgba(255,255,255,0.2); padding: 0.25rem 1rem;
                border-radius: 20px; font-size: 0.88rem; display: inline-block; margin-bottom: 1.25rem;
            }
            .rp-avatar-wrap {
                width: 96px; height: 96px; margin: 0 auto 1rem;
                background: rgba(255,255,255,0.2); border-radius: 50%;
                display: flex; align-items: center; justify-content: center;
                border: 3px solid rgba(255,255,255,0.45); cursor: pointer;
                position: relative; overflow: visible;
                transition: border-color 0.2s;
            }
            .rp-avatar-wrap:hover { border-color: white; }
            .rp-avatar-img { width: 100%; height: 100%; object-fit: cover; border-radius: 50%; }
            .rp-cam-badge {
                position: absolute; bottom: 2px; right: 2px;
                background: ${accent || '#5d4037'}; color: white;
                width: 26px; height: 26px; border-radius: 50%;
                display: flex; align-items: center; justify-content: center;
                border: 2px solid white; box-shadow: 0 1px 4px rgba(0,0,0,0.35);
            }
            .rp-stats-row { display: flex; justify-content: center; align-items: center; gap: 1.5rem; flex-wrap: wrap; margin-top: 0.5rem; }
            .rp-stat { display: flex; flex-direction: column; align-items: center; gap: 2px; }
            .rp-stat strong { font-size: 1.6rem; font-weight: 800; }
            .rp-stat span { font-size: 0.8rem; opacity: 0.85; }
            .rp-stat-div { width: 1px; height: 38px; background: rgba(255,255,255,0.3); }

            .rp-links { display: flex; gap: 0.75rem; flex-wrap: wrap; margin-bottom: 1.5rem; }
            .rp-link {
                display: inline-flex; align-items: center; gap: 0.35rem;
                background: white; border: 1px solid #e0e0e0; color: ${accent || '#5d4037'};
                padding: 0.55rem 1rem; border-radius: 8px; text-decoration: none;
                font-size: 0.9rem; font-weight: 600; box-shadow: 0 1px 4px rgba(0,0,0,0.05);
                transition: all 0.2s;
            }
            .rp-link:hover { background: ${accent || '#5d4037'}; color: white; }

            .rp-card { background: white; padding: 1.8rem; border-radius: 12px; box-shadow: 0 2px 10px rgba(0,0,0,0.06); margin-bottom: 1.5rem; }
            .rp-card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; padding-bottom: 1rem; border-bottom: 1px solid #f0f0f0; }
            .rp-card-header h2 { margin: 0; font-size: 1.1rem; display: flex; align-items: center; gap: 0.4rem; }
            .rp-edit-btn {
                display: flex; align-items: center; gap: 0.4rem;
                background: none; border: 1px solid ${accent || '#5d4037'}; color: ${accent || '#5d4037'};
                padding: 0.4rem 1rem; border-radius: 6px; cursor: pointer; font-size: 0.88rem; font-weight: 600; transition: all 0.2s;
            }
            .rp-edit-btn:hover { background: ${accent || '#5d4037'}; color: white; }

            .rp-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 1.5rem; }
            .rp-field label { display: flex; align-items: center; gap: 0.4rem; color: #888; font-size: 0.85rem; margin-bottom: 0.35rem; }
            .rp-field p { margin: 0; font-size: 1.02rem; font-weight: 500; color: #222; }
            .rp-field input { width: 100%; padding: 0.55rem 0.8rem; border: 1px solid #ddd; border-radius: 6px; font-size: 0.97rem; box-sizing: border-box; }
            .rp-field input:focus { outline: 2px solid ${accent || '#5d4037'}; }
            .rp-empty { color: #bbb; font-style: italic; font-weight: 400; }

            .rp-bio { line-height: 1.65; color: #444; margin: 0; }
            .rp-textarea { width: 100%; padding: 0.65rem 0.9rem; border: 1px solid #ddd; border-radius: 8px; font-size: 0.95rem; box-sizing: border-box; resize: vertical; }
            .rp-action-row { display: flex; gap: 0.75rem; margin-top: 1rem; }
            .rp-save-btn { display: inline-flex; align-items: center; gap: 0.4rem; background: ${accent || '#5d4037'}; color: white; border: none; padding: 0.6rem 1.4rem; border-radius: 8px; cursor: pointer; font-weight: 600; }
            .rp-cancel-btn { background: #f5f5f5; color: #555; border: 1px solid #ddd; padding: 0.6rem 1.2rem; border-radius: 8px; cursor: pointer; }

            .rp-stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 1rem; }
            .rp-stat-card { background: #f8fafc; border-radius: 10px; padding: 1.25rem; text-align: center; border: 1px solid #e5e7eb; }
            .rp-stat-card strong { display: block; font-size: 2rem; font-weight: 800; color: ${accent || '#5d4037'}; }
            .rp-stat-card span { font-size: 0.82rem; color: #666; }

            @media (max-width: 600px) {
                .rp-links { overflow-x: auto; flex-wrap: nowrap; }
                .rp-grid { grid-template-columns: 1fr; }
            }
        `}</style>
    );
}

export default NGOProfilePage;
