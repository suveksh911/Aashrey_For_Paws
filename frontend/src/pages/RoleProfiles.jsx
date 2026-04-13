import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import {
    FaBuilding, FaEnvelope, FaPhone, FaMapMarkerAlt, FaEdit, FaSave,
    FaCamera, FaGlobe, FaFileAlt, FaPlus, FaPaw, FaUsers, FaCheckCircle, FaQuoteLeft, FaBullseye
} from 'react-icons/fa';
import api from '../services/axios';
import LocationPicker from './LocationPicker'; // Integrated without UI changes

const NGOProfilePage = React.forwardRef(({ isTab = false, externalEditing = false, onEditingComplete }, ref) => {
    const { user, refreshUser } = useAuth();
    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => {
        if (externalEditing) setIsEditing(true);
    }, [externalEditing]);

    const [profileImage, setProfileImage] = useState(null);
    const [initialData, setInitialData] = useState(null);
    const fileInputRef = useRef(null);
    const [data, setData] = useState({
        orgName: user?.name || 'My NGO',
        email: user?.email || '',
        phone: '',
        address: '',
        website: '',
        registrationNo: '',
        description: '',
        mission: '',
        lat: '',
        lng: '',
        ngoStatus: 'pending',
        isVerified: false,
    });

    useEffect(() => {
        if (!user) return;
        const fetchProfile = async () => {
            try {
                const res = await api.get('/users/me');
                if (res.data.success) {
                    const u = res.data.data;
                    const fetchedData = {
                        orgName: u.orgName || u.name || 'My NGO',
                        email: u.email || '',
                        phone: u.phone || '',
                        address: u.address || '',
                        website: u.website || '',
                        registrationNo: u.registrationNo || '',
                        description: u.bio || '',
                        mission: u.mission || '',
                        lat: u.lat || '',
                        lng: u.lng || '',
                        ngoStatus: u.ngoStatus || 'pending',
                        isVerified: u.isVerified || false
                    };
                    setData(fetchedData);
                    setInitialData(fetchedData);
                    if (u.profileImage) setProfileImage(u.profileImage);
                }
            } catch {
                setData(prev => ({ ...prev, orgName: user?.name || 'My NGO', email: user?.email || '' }));
            }
        };
        fetchProfile();
    }, [user]);

    const [stats, setStats] = useState({ pets: 0, requests: 0 });
    useEffect(() => {
        const fetchStats = async () => {
            try {
                const [petsRes, reqRes] = await Promise.all([
                    api.get('/pets/my-pets').catch(() => ({ data: { data: [] } })),
                    api.get('/adoptions/incoming').catch(() => ({ data: { data: [] } }))
                ]);
                setStats({ pets: petsRes.data?.data?.length || 0, requests: reqRes.data?.data?.length || 0 });
            } catch {}
        };
        fetchStats();
    }, []);

    const handleChange = e => setData(prev => ({ ...prev, [e.target.name]: e.target.value }));

    const handleLocationChange = (coords) => {
        setData(prev => ({ 
            ...prev, 
            lat: coords[0].toString(), 
            lng: coords[1].toString() 
        }));
    };

    const handleSave = async () => {
        let isUnchanged = false;
        if (initialData) {
            isUnchanged = Object.keys(data).every(key => 
                String(data[key] || '') === String(initialData[key] || '')
            );
        } else {
            isUnchanged = (
                data.orgName === (user?.orgName || user?.name || 'My NGO') &&
                data.email === (user?.email || '') &&
                data.phone === (user?.phone || '') &&
                data.address === (user?.address || '') &&
                data.website === (user?.website || '') &&
                data.registrationNo === (user?.registrationNo || '') &&
                data.description === (user?.bio || '') &&
                data.mission === (user?.mission || '') &&
                String(data.lat || '') === String(user?.lat || '') &&
                String(data.lng || '') === String(user?.lng || '')
            );
        }

        if (isUnchanged) {
            setIsEditing(false);
            if (onEditingComplete) onEditingComplete();
            toast.info('No changes were made');
            return;
        }

        try {
            await api.patch('/users/me', {
                name: data.orgName,
                orgName: data.orgName,
                email: data.email,
                phone: data.phone,
                address: data.address,
                bio: data.description,
                website: data.website,
                registrationNo: data.registrationNo,
                mission: data.mission,
                lat: data.lat ? Number(data.lat) : undefined,
                lng: data.lng ? Number(data.lng) : undefined
            });
            setIsEditing(false);
            if (onEditingComplete) onEditingComplete();
            
            try {
                if (refreshUser) await refreshUser();
            } catch (err) {
                console.warn("Background user refresh failed after save", err);
            }
            
            toast.success('NGO profile updated!');
        } catch (err) {
            console.error("Profile update error:", err);
            toast.error('Failed to update profile');
        }
    };

    React.useImperativeHandle(ref, () => ({
        handleSave
    }));

    const handleImageUpload = e => {
        const file = e.target.files[0];
        if (!file) return;
        if (file.size > 3 * 1024 * 1024) { toast.error('Image must be under 3 MB'); return; }
        const reader = new FileReader();
        reader.onload = async ev => {
            const dataUrl = ev.target.result;
            setProfileImage(dataUrl);
            try {
                await api.patch('/users/me', { profileImage: dataUrl });
                toast.success('Logo updated!');
            } catch {
                toast.error('Failed to update logo');
            }
        };
        reader.readAsDataURL(file);
    };

    const fields = [
        { icon: <FaBuilding />, label: 'Organisation Name', name: 'orgName', type: 'text' },
        { icon: <FaEnvelope />, label: 'Email', name: 'email', type: 'email' },
        { icon: <FaPhone />, label: 'Phone', name: 'phone', type: 'tel', placeholder: '+977 98XXXXXXXX' },
        { icon: <FaMapMarkerAlt />, label: 'Address', name: 'address', type: 'text', placeholder: 'City, District' },
        { icon: <FaMapMarkerAlt />, label: 'Map Latitude', name: 'lat', type: 'number', placeholder: 'e.g. 27.7172' },
        { icon: <FaMapMarkerAlt />, label: 'Map Longitude', name: 'lng', type: 'number', placeholder: 'e.g. 85.3240' },
        { icon: <FaGlobe />, label: 'Website', name: 'website', type: 'url', placeholder: 'https://...' },
        { icon: <FaFileAlt />, label: 'Registration No.', name: 'registrationNo', type: 'text', placeholder: 'Govt. reg. number' },
    ];

    return (
        <div className="rp-container">
            {!isTab && (
                <div className="rp-banner rp-ngo-banner">
                    <div className="rp-avatar-wrap" onClick={() => fileInputRef.current.click()} title="Click to change photo">
                        {profileImage
                            ? <img src={profileImage} alt="NGO Logo" className="rp-avatar-img" />
                            : <FaBuilding style={{ fontSize: '3rem' }} />
                        }
                        <div className="rp-cam-badge"><FaCamera size={13} /></div>
                    </div>
                    <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} />
                    <h1>{data.orgName}</h1>
                    <span className="rp-role-chip">
                        {data.ngoStatus === 'verified' ? '🏢 Verified NGO • Portal' : '🏢 NGO • Verification Pending'}
                    </span>
                </div>
            )}

            {!externalEditing && !isTab && (
                !isEditing ? (
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '0.5rem' }}>
                        <button className="rp-edit-btn" onClick={() => setIsEditing(true)}><FaEdit /> Edit Profile</button>
                    </div>
                ) : (
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginBottom: '0.5rem' }}>
                        <button className="rp-cancel-btn" onClick={() => { setIsEditing(false); if (onEditingComplete) onEditingComplete(); }}>Cancel</button>
                        <button className="rp-save-btn" onClick={handleSave}><FaSave /> Save Changes</button>
                    </div>
                )
            )}

            <div className="rp-card">
                <div className="rp-card-header">
                    <h2>Organisation Details</h2>
                </div>
                <div className="rp-grid">
                    {fields.map(f => (
                        <div key={f.name} className="rp-field">
                            <label>{f.icon} {f.label}</label>
                            {isEditing && f.name !== 'email'
                                ? <input name={f.name} type={f.type} value={data[f.name]} onChange={handleChange} placeholder={f.placeholder || f.label} />
                                : (
                                    f.type === 'url' && data[f.name] ? (
                                        <a href={data[f.name]} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline block truncate max-w-[200px]" title={data[f.name]}>
                                            {data[f.name].replace(/^https?:\/\/(www\.)?/, '').length > 25 
                                                ? data[f.name].replace(/^https?:\/\/(www\.)?/, '').substring(0, 22) + '...' 
                                                : data[f.name].replace(/^https?:\/\/(www\.)?/, '')}
                                        </a>
                                    ) : (
                                        <p className="truncate max-w-[200px]" title={data[f.name]}>{data[f.name] || <span className="rp-empty">Not set</span>}</p>
                                    )
                                )
                            }
                        </div>
                    ))}
                </div>

                {isEditing && (
                    <div style={{ marginTop: '1.5rem', borderTop: '1px solid #f0f0f0', paddingTop: '1.5rem' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#888', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
                            <FaMapMarkerAlt /> Select Location on Map
                        </label>
                        <LocationPicker 
                            position={data.lat && data.lng ? [parseFloat(data.lat), parseFloat(data.lng)] : null} 
                            setPosition={handleLocationChange} 
                        />
                        <p style={{ fontSize: '0.7rem', color: '#999', marginTop: '0.5rem' }}>
                            Click on the map above to automatically update your Latitude and Longitude fields.
                        </p>
                    </div>
                )}
            </div>

            {!isTab && (
                <div className="rp-links">
                    <Link to="/ngo" className="rp-link">🐾 My Listings</Link>
                    <Link to="/add-pet" className="rp-link">➕ Add Pet</Link>
                    <Link to="/campaigns" className="rp-link">📣 Campaigns</Link>
                    <Link to="/contact" className="rp-link">📩 Contact</Link>
                </div>
            )}

            <div className="rp-card rp-unified-profile">
                <div className="rp-card-header">
                    <h2><FaBuilding style={{ color: '#5d4037', opacity: 0.8 }} /> About</h2>
                </div>
                <div className="rp-unified-content">
                    <div className="rp-narrative-section">
                        {isEditing
                            ? <textarea name="description" value={data.description} onChange={handleChange} rows={8} className="rp-textarea premium-textarea" placeholder="Describe your organisation..." />
                            : <p className="rp-about-text text-premium-dark" style={{ marginBottom: 0 }}>{data.description || <span className="rp-empty">No description provided.</span>}</p>
                        }
                    </div>
                    {!isEditing && user?.createdAt && (
                        <div className="rp-footer-info mt-8">
                            <span className="since-tag">EST. {new Date(user.createdAt).getFullYear()}</span>
                        </div>
                    )}
                </div>
            </div>

            <RpStyles accent="#1a56db" bannerGradient="linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)" />
        </div>
    );
});

/* ─────────────────────────── Owner Profile ─────────────────────────── */
export const OwnerProfilePage = React.forwardRef(({ isTab = false, externalEditing = false, onEditingComplete }, ref) => {
    const { user, refreshUser } = useAuth();
    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => {
        if (externalEditing) setIsEditing(true);
        else if (isTab && isEditing && !externalEditing) setIsEditing(false);
    }, [externalEditing, isTab]);

    const [profileImage, setProfileImage] = useState(null);
    const [initialData, setInitialData] = useState(null);
    const fileInputRef = useRef(null);
    const [data, setData] = useState({
        name: user?.name || '',
        email: user?.email || '',
        phone: '',
        address: '',
        bio: '',
        petType: '',
        experience: '',
        isVerified: false,
    });

    useEffect(() => {
        if (!user) return;
        const fetchProfile = async () => {
            try {
                const res = await api.get('/users/me');
                if (res.data.success) {
                    const u = res.data.data;
                    const fetchedData = {
                        name: u.name || '',
                        email: u.email || '',
                        phone: u.phone || '',
                        address: u.address || '',
                        bio: u.bio || '',
                        petType: u.petType || '',
                        experience: u.experience || '',
                        isVerified: u.isVerified || false
                    };
                    setData(fetchedData);
                    setInitialData(fetchedData);
                    if (u.profileImage) setProfileImage(u.profileImage);
                }
            } catch {
                setData(prev => ({ ...prev, name: user?.name || '', email: user?.email || '' }));
            }
        };
        fetchProfile();
    }, [user]);

    const handleChange = e => setData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    const handleSave = async () => {
        let isUnchanged = false;
        if (initialData) {
            isUnchanged = Object.keys(data).every(key => 
                String(data[key] || '') === String(initialData[key] || '')
            );
        } else {
            isUnchanged = (
                data.name === (user?.name || '') &&
                data.email === (user?.email || '') &&
                data.phone === (user?.phone || '') &&
                data.address === (user?.address || '') &&
                data.bio === (user?.bio || '') &&
                data.petType === (user?.petType || '') &&
                data.experience === (user?.experience || '')
            );
        }

        if (isUnchanged) {
            setIsEditing(false);
            if (onEditingComplete) onEditingComplete();
            toast.info('No changes were made');
            return;
        }

        try {
            await api.patch('/users/me', {
                name: data.name,
                email: data.email,
                phone: data.phone,
                address: data.address,
                bio: data.bio,
                petType: data.petType,
                experience: data.experience
            });
            setIsEditing(false);
            if (refreshUser) await refreshUser();
            if (onEditingComplete) onEditingComplete();
            toast.success('Profile updated!');
        } catch {
            toast.error('Failed to update profile');
        }
    };

    React.useImperativeHandle(ref, () => ({
        handleSave
    }));
    const handleImageUpload = e => {
        const file = e.target.files[0];
        if (!file) return;
        if (file.size > 3 * 1024 * 1024) { toast.error('Max 3 MB'); return; }
        const reader = new FileReader();
        reader.onload = async ev => { 
            const dataUrl = ev.target.result;
            setProfileImage(dataUrl); 
            try {
                await api.patch('/users/me', { profileImage: dataUrl });
                toast.success('Photo updated!'); 
            } catch {
                toast.error('Failed to update photo');
            }
        };
        reader.readAsDataURL(file);
    };

    const fields = [
        { icon: <FaEnvelope />, label: 'Email', name: 'email', type: 'email' },
        { icon: <FaPhone />, label: 'Phone', name: 'phone', type: 'tel', placeholder: '+977 98XXXXXXXX' },
        { icon: <FaMapMarkerAlt />, label: 'Location', name: 'address', type: 'text', placeholder: 'City, District' },
        { icon: <FaPaw />, label: 'Pet Type Preference', name: 'petType', type: 'text', placeholder: 'e.g. Dogs, Cats' },
        { icon: <FaUsers />, label: 'Experience', name: 'experience', type: 'text', placeholder: 'e.g. 5 years with dogs' },
    ];

    return (
        <div className="rp-container">
            {!isTab && (
                <div className="rp-banner rp-owner-banner">
                    <div className="rp-avatar-wrap">
                        {profileImage
                            ? <img src={profileImage} alt="Profile" className="rp-avatar-img" />
                            : <FaUsers style={{ fontSize: '3rem' }} />
                        }
                        <div className="rp-cam-badge" onClick={() => fileInputRef.current.click()} title="Update Photo">
                            <FaCamera size={13} />
                        </div>
                    </div>
                    <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} />
                    <h1>{data.name}</h1>
                    <span className="rp-role-chip">{data.isVerified ? '🏡 Verified Owner' : '🏡 Pet Owner Profile'}</span>
                </div>
            )}

            {!externalEditing && !isTab && (
                !isEditing ? (
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '0.5rem' }}>
                        <button className="rp-edit-btn" onClick={() => setIsEditing(true)}><FaEdit /> Edit Profile</button>
                    </div>
                ) : (
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginBottom: '0.5rem' }}>
                        <button className="rp-cancel-btn" onClick={() => setIsEditing(false)}>Cancel</button>
                        <button className="rp-save-btn" onClick={handleSave}><FaSave /> Save Changes</button>
                    </div>
                )
            )}

            <div className="rp-card rp-featured-about">
                <div className="rp-card-header"><h2><FaUsers /> About</h2></div>
                <div className="rp-featured-content">
                    {isEditing
                        ? <textarea name="bio" value={data.bio} onChange={handleChange} rows={5} className="rp-textarea premium-textarea" />
                        : <p className="rp-bio text-premium">{data.bio || <span className="rp-empty">Share your pet story and experience here.</span>}</p>
                    }
                </div>
            </div>

            <div className="rp-card">
                <div className="rp-card-header"><h2>Personal Details</h2></div>
                <div className="rp-grid">
                    {fields.map(f => (
                        <div key={f.name} className="rp-field">
                            <label>{f.icon} {f.label}</label>
                            {isEditing && f.name !== 'email'
                                ? <input name={f.name} type={f.type} value={data[f.name]} onChange={handleChange} />
                                : <p className="truncate max-w-[200px]">{data[f.name] || <span className="rp-empty">Not set</span>}</p>
                            }
                        </div>
                    ))}
                </div>
            </div>
            <RpStyles accent="#15803d" bannerGradient="linear-gradient(135deg, #14532d 0%, #16a34a 100%)" />
        </div>
    );
});

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

    return (
        <div className="rp-container">
            <div className="rp-banner rp-admin-banner">
                <div className="rp-avatar-wrap">
                    {profileImage
                        ? <img src={profileImage} alt="Admin" className="rp-avatar-img" />
                        : <span style={{ fontSize: '3rem' }}>🛡️</span>
                    }
                    <div className="rp-cam-badge" onClick={() => fileInputRef.current.click()} title="Update Photo">
                        <FaCamera size={13} />
                    </div>
                </div>
                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} />
                <h1>{user?.name || 'Admin User'}</h1>
                <span className="rp-role-chip">🛡️ Administrator</span>
            </div>

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
            .rp-container { max-width: 860px; margin: 0 auto; padding: 0 0 3rem; }
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
                position: relative;
            }
            .rp-avatar-img { width: 100%; height: 100%; object-fit: cover; border-radius: 50%; }
            .rp-cam-badge {
                position: absolute; bottom: 2px; right: 2px;
                background: ${accent || '#5d4037'}; color: white;
                width: 26px; height: 26px; border-radius: 50%;
                display: flex; align-items: center; justify-content: center;
                border: 2px solid white; box-shadow: 0 1px 4px rgba(0,0,0,0.35);
            }
            .rp-card { background: white; padding: 1.8rem; border-radius: 12px; box-shadow: 0 2px 10px rgba(0,0,0,0.06); margin-bottom: 1.5rem; }
            .rp-card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; padding-bottom: 1rem; border-bottom: 1px solid #f0f0f0; }
            .rp-card-header h2 { margin: 0; font-size: 1.1rem; display: flex; align-items: center; gap: 0.4rem; }
            .rp-edit-btn {
                display: flex; align-items: center; gap: 0.4rem;
                background: none; border: 1px solid ${accent || '#5d4037'}; color: ${accent || '#5d4037'};
                padding: 0.4rem 1rem; border-radius: 6px; cursor: pointer; font-size: 0.88rem; font-weight: 600;
            }
            .rp-edit-btn:hover { background: ${accent || '#5d4037'}; color: white; }
            .rp-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 1.5rem; }
            .rp-field label { display: flex; align-items: center; gap: 0.4rem; color: #888; font-size: 0.85rem; margin-bottom: 0.35rem; }
            .rp-field p { margin: 0; font-size: 1.02rem; font-weight: 500; color: #222; }
            .rp-field input { width: 100%; padding: 0.55rem 0.8rem; border: 1px solid #ddd; border-radius: 6px; font-size: 0.97rem; }
            .rp-textarea { width: 100%; padding: 0.8rem 1rem; border: 1px solid #ddd; border-radius: 12px; font-size: 1rem; resize: vertical; }
            .rp-save-btn { display: inline-flex; align-items: center; gap: 0.4rem; background: ${accent || '#5d4037'}; color: white; border: none; padding: 0.6rem 1.4rem; border-radius: 8px; cursor: pointer; font-weight: 600; }
            .rp-cancel-btn { background: #f5f5f5; color: #555; border: 1px solid #ddd; padding: 0.6rem 1.2rem; border-radius: 8px; cursor: pointer; }
            .rp-role-chip { text-transform: uppercase; letter-spacing: 1px; font-weight: 700; font-size: 0.75rem; }
            .rp-links { display: flex; gap: 0.75rem; margin-bottom: 1.5rem; justify-content: center; }
            .rp-link { text-decoration: none; color: ${accent || '#5d4037'}; font-weight: 700; font-size: 0.9rem; }
        `}</style>
    );
}

export default NGOProfilePage;
