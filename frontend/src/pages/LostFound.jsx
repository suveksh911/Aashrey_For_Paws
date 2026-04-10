import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/axios';
import { FaSearch, FaMapMarkerAlt, FaPhone, FaExclamationCircle, FaCalendar, FaPlus, FaTimes, FaEdit, FaTrash } from 'react-icons/fa';

function LostFound() {
    const [activeTab, setActiveTab] = useState('Lost');
    const [pets, setPets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [editPetId, setEditPetId] = useState(null);
    const [formData, setFormData] = useState({
        name: '', breed: '', type: 'Lost', description: '', location: '', contactInfo: '',
        category: 'Dog', age: 'Unknown', gender: 'Unknown',
        dateReported: new Date().toISOString().split('T')[0]
    });
    const { user, isAuthenticated } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        fetchPets();
    }, [activeTab]);

    const fetchPets = async () => {
        setLoading(true);
        try {
            const res = await api.get('/pets', { params: { type: activeTab } });
            if (res.data.success) {
                setPets(res.data.data);
            }
        } catch {
            toast.error('Failed to load reports. Please check your connection.');
            setPets([]);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => setFormData(prev => ({ ...prev, image: ev.target.result }));
        reader.readAsDataURL(file);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!isAuthenticated) {
            toast.info('Please login to report a pet');
            navigate('/login');
            return;
        }
        if (!formData.location || !formData.contactInfo || !formData.description) {
            toast.error('Please fill all required fields');
            return;
        }
        setSubmitting(true);
        try {
            const petData = {
                name: formData.name || 'Unknown',
                breed: formData.breed || 'Unknown',
                age: formData.age || 'Unknown',
                category: formData.category,
                type: formData.type,
                gender: formData.gender,
                location: formData.location,
                description: formData.description,
                contactInfo: formData.contactInfo,
                healthStatus: 'Unknown',
                status: 'Available',
                image: formData.image || '',
                images: formData.image ? [formData.image] : []
            };
            let res;
            if (editPetId) {
                res = await api.put(`/pets/${editPetId}`, petData);
            } else {
                res = await api.post('/pets', petData);
            }
            if (res.data.success) {
                toast.success(editPetId ? 'Report updated successfully!' : 'Report submitted successfully!');
                setShowForm(false);
                resetForm();
                fetchPets();
            }
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to save report');
        } finally {
            setSubmitting(false);
        }
    };

    const resetForm = () => {
        setFormData({
            name: '', breed: '', type: activeTab, description: '', location: '', contactInfo: '',
            category: 'Dog', age: 'Unknown', gender: 'Unknown',
            dateReported: new Date().toISOString().split('T')[0]
        });
        setEditPetId(null);
    };

    const handleEdit = (pet) => {
        setFormData({
            name: pet.name || '',
            breed: pet.breed || '',
            type: pet.type,
            description: pet.description || '',
            location: pet.location || '',
            contactInfo: pet.contactInfo || '',
            category: pet.category || 'Dog',
            age: pet.age || 'Unknown',
            gender: pet.gender || 'Unknown',
            image: pet.image || pet.images?.[0] || '',
            dateReported: pet.createdAt ? new Date(pet.createdAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
        });
        setEditPetId(pet._id);
        setShowForm(true);
    };

    const handleDelete = async (petId) => {
        if (!window.confirm("Are you sure you want to delete this report? This action cannot be undone.")) return;
        try {
            const res = await api.delete(`/pets/${petId}`);
            if (res.data.success) {
                toast.success("Report deleted successfully");
                fetchPets();
            }
        } catch (err) {
            toast.error("Failed to delete report.");
        }
    };


    const filteredPets = pets.filter(pet => {
        if (!searchQuery) return true;
        const q = searchQuery.toLowerCase();
        return (pet.name?.toLowerCase().includes(q) ||
            pet.breed?.toLowerCase().includes(q) ||
            pet.location?.toLowerCase().includes(q));
    });

    return (
        <div style={{ padding: '2rem', maxWidth: '1100px', margin: '0 auto' }}>
            {/* Header */}
            <div className="lf-hero">
                <h1>Lost & Found Pets</h1>
                <p>Help reunite lost pets with their families. Report a sighting or a lost pet.</p>
                <button className="btn btn-primary lf-report-btn" onClick={() => {
                    if (isAuthenticated) { setShowForm(true); setFormData(prev => ({ ...prev, type: activeTab })); }
                    else { toast.info('Please login to report a pet'); navigate('/login'); }
                }}>
                    <FaPlus /> Report a {activeTab} Pet
                </button>
            </div>

            {/* Tabs */}
            <div className="lf-tabs">
                {['Lost', 'Found'].map(tab => (
                    <button key={tab}
                        className={`lf-tab ${activeTab === tab ? 'active' : ''}`}
                        onClick={() => setActiveTab(tab)}>
                        {tab === 'Lost' ? '🔴' : '🟢'} {tab} Pets
                    </button>
                ))}
            </div>

            {/* Search */}
            <div className="lf-search">
                <FaSearch className="lf-search-icon" />
                <input type="text" placeholder="Search by name, breed, location..."
                    value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
            </div>

            {/* Stats Row */}
            <p style={{ color: '#888', marginBottom: '1.5rem', fontWeight: 500 }}>
                Found <strong style={{ color: 'var(--color-primary)' }}>{filteredPets.length}</strong> {activeTab.toLowerCase()} pet reports
            </p>

            {/* Listings */}
            {loading ? (
                <div className="lf-grid">
                    {[1, 2, 3].map(n => <div key={n} className="lf-skeleton" />)}
                </div>
            ) : filteredPets.length === 0 ? (
                <div className="lf-empty">
                    <FaExclamationCircle size={50} color="#ddd" />
                    <h3>No {activeTab.toLowerCase()} pets reported yet</h3>
                    <p>Be the first to submit a report to help reunite pets with their families.</p>
                </div>
            ) : (
                <div className="lf-grid">
                    {filteredPets.map(pet => (
                        <div key={pet._id} className="lf-card">
                            <div className="lf-card-image">
                                <img src={pet.image || pet.images?.[0] || 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=600&q=80'}
                                    alt={pet.name} onError={e => { e.target.src = 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=600&q=80'; }} />
                                <span className={`lf-type-badge ${pet.type?.toLowerCase()}`}>
                                    {pet.type === 'Lost' ? '🔴 Lost' : '🟢 Found'}
                                </span>
                                {isAuthenticated && user && pet.ownerId && (pet.ownerId._id === user._id || pet.ownerId === user._id) && (
                                    <div className="lf-action-btns">
                                        <button className="lf-icon-btn edit-btn" onClick={(e) => { e.preventDefault(); handleEdit(pet); }} title="Edit Report">
                                            <FaEdit />
                                        </button>
                                        <button className="lf-icon-btn delete-btn" onClick={(e) => { e.preventDefault(); handleDelete(pet._id); }} title="Delete Report">
                                            <FaTrash />
                                        </button>
                                    </div>
                                )}
                            </div>
                            <div className="lf-card-body">
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                                    <h3>{pet.name}</h3>
                                    <span className="lf-category">{pet.category}</span>
                                </div>
                                <p className="lf-breed">{pet.breed} • {pet.gender}</p>
                                <p className="lf-desc">{pet.description}</p>
                                <div className="lf-meta">
                                    <span><FaMapMarkerAlt /> {pet.location}</span>
                                    <span><FaPhone /> {pet.contactInfo}</span>
                                    {pet.createdAt && (
                                        <span><FaCalendar /> {new Date(pet.createdAt).toLocaleDateString()}</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Report Form Modal */}
            {showForm && (
                <div className="modal-overlay">
                    <div className="modal-box">
                        <div className="modal-hdr">
                            <h2>{editPetId ? 'Update' : 'Report a'} {formData.type} Pet</h2>
                            <button className="close-x" onClick={() => { setShowForm(false); resetForm(); }}><FaTimes /></button>
                        </div>
                        <form onSubmit={handleSubmit} className="lf-form">
                            <div className="form-row2">
                                <div className="form-group">
                                    <label>Report Type *</label>
                                    <select name="type" value={formData.type} onChange={handleChange}>
                                        <option value="Lost">Lost</option>
                                        <option value="Found">Found</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Pet Category *</label>
                                    <select name="category" value={formData.category} onChange={handleChange}>
                                        <option>Dog</option><option>Cat</option><option>Bird</option><option>Rabbit</option><option>Other</option>
                                    </select>
                                </div>
                            </div>
                            <div className="form-row2">
                                <div className="form-group">
                                    <label>Pet Name</label>
                                    <input name="name" value={formData.name} onChange={handleChange} placeholder="Or 'Unknown'" />
                                </div>
                                <div className="form-group">
                                    <label>Breed</label>
                                    <input name="breed" value={formData.breed} onChange={handleChange} placeholder="Or 'Unknown'" />
                                </div>
                            </div>
                            <div className="form-row2">
                                <div className="form-group">
                                    <label>Gender</label>
                                    <select name="gender" value={formData.gender} onChange={handleChange}>
                                        <option>Unknown</option><option>Male</option><option>Female</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Date</label>
                                    <input type="date" name="dateReported" value={formData.dateReported} onChange={handleChange} />
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Location *</label>
                                <input name="location" value={formData.location} onChange={handleChange} placeholder="Area, City" required />
                            </div>
                            <div className="form-group">
                                <label>Contact Info *</label>
                                <input name="contactInfo" value={formData.contactInfo} onChange={handleChange} placeholder="Phone or email" required />
                            </div>
                            <div className="form-group">
                                <label>Description *</label>
                                <textarea name="description" value={formData.description} onChange={handleChange} rows="3"
                                    placeholder="Color, markings, collar, behavior, where exactly..." required />
                            </div>
                            <div className="form-group">
                                <label>Photo (optional)</label>
                                <input type="file" accept="image/*" onChange={handleImageChange} />
                                {formData.image && <img src={formData.image} alt="preview" style={{ width: '100%', maxHeight: '140px', objectFit: 'cover', borderRadius: '8px', marginTop: '0.5rem' }} />}
                            </div>
                            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                                <button type="button" className="btn" onClick={() => setShowForm(false)} style={{ background: '#f5f5f5', color: '#333' }}>Cancel</button>
                                <button type="submit" disabled={submitting} className="btn btn-primary">
                                    {submitting ? 'Saving…' : (editPetId ? 'Update Report' : 'Submit Report')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <style>{`
                .lf-hero { background: linear-gradient(rgba(0,0,0,0.6),rgba(0,0,0,0.6)), url('https://images.unsplash.com/photo-1601758124510-52d02ddb7cbd?auto=format&fit=crop&w=1950&q=80'); background-size: cover; background-position: center; color: white; text-align: center; padding: 4rem 2rem; border-radius: var(--radius-lg); margin-bottom: 2rem; }
                .lf-hero h1 { font-size: 2.8rem; margin-bottom: 0.5rem; }
                .lf-hero p { font-size: 1.1rem; opacity: 0.9; margin-bottom: 2rem; }
                .lf-report-btn { display: inline-flex; align-items: center; gap: 0.5rem; font-size: 1rem; }
                .lf-tabs { display: flex; gap: 1rem; margin-bottom: 1.5rem; }
                .lf-tab { padding: 0.65rem 1.5rem; border-radius: var(--radius-full); border: 2px solid #ddd; background: white; font-weight: 700; cursor: pointer; font-size: 1rem; transition: all 0.2s; }
                .lf-tab.active { border-color: var(--color-primary); background: var(--color-primary); color: white; }
                .lf-search { position: relative; margin-bottom: 1.5rem; }
                .lf-search input { width: 100%; padding: 0.75rem 1rem 0.75rem 2.8rem; border: 1px solid #ddd; border-radius: var(--radius-full); font-size: 0.95rem; box-sizing: border-box; }
                .lf-search-icon { position: absolute; left: 1rem; top: 50%; transform: translateY(-50%); color: #aaa; }
                .lf-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 1.5rem; }
                .lf-skeleton { height: 320px; border-radius: var(--radius-md); background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%); background-size: 200%; animation: shimmer 1.5s infinite; }
                @keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
                .lf-empty { text-align: center; padding: 4rem 1rem; color: #aaa; }
                .lf-empty h3 { margin: 1rem 0 0.5rem; color: #888; font-size: 1.3rem; }
                .lf-card { background: white; border-radius: var(--radius-md); overflow: hidden; box-shadow: var(--shadow-sm); border: 1px solid var(--color-border); transition: transform 0.2s; }
                .lf-card:hover { transform: translateY(-4px); box-shadow: var(--shadow-md); }
                .lf-card-image { position: relative; height: 200px; }
                .lf-card-image img { width: 100%; height: 100%; object-fit: cover; }
                .lf-type-badge { position: absolute; top: 0.75rem; left: 0.75rem; padding: 4px 12px; border-radius: var(--radius-full); font-size: 0.78rem; font-weight: 700; background: rgba(255,255,255,0.9); box-shadow: var(--shadow-sm); }
                .lf-action-btns { position: absolute; top: 0.75rem; right: 0.75rem; display: flex; gap: 0.5rem; }
                .lf-icon-btn { background: rgba(255,255,255,0.9); border: none; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer; color: #555; transition: 0.2s; box-shadow: var(--shadow-sm); }
                .lf-icon-btn.edit-btn:hover { color: var(--color-primary); transform: scale(1.1); }
                .lf-icon-btn.delete-btn:hover { color: #e74c3c; transform: scale(1.1); }
                .lf-card-body { padding: 1.25rem; }
                .lf-card-body h3 { margin: 0 0 4px; font-size: 1.2rem; color: var(--color-primary-dark); }
                .lf-breed { color: #888; font-size: 0.85rem; margin: 0 0 0.75rem; }
                .lf-desc { font-size: 0.9rem; color: #555; line-height: 1.5; margin-bottom: 1rem; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
                .lf-meta { display: flex; flex-direction: column; gap: 4px; font-size: 0.82rem; color: #666; }
                .lf-meta span { display: flex; align-items: center; gap: 6px; }
                .lf-category { font-size: 0.78rem; background: #EFEBE9; color: var(--color-primary-dark); padding: 2px 10px; border-radius: 20px; font-weight: 600; }
                .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.6); display: flex; justify-content: center; align-items: center; z-index: 1000; backdrop-filter: blur(2px); }
                .modal-box { background: white; width: 100%; max-width: 600px; border-radius: var(--radius-lg); padding: 2rem; max-height: 90vh; overflow-y: auto; box-shadow: 0 20px 60px rgba(0,0,0,0.3); animation: slideUp 0.3s ease; }
                @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
                .modal-hdr { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
                .modal-hdr h2 { margin: 0; color: var(--color-primary-dark); }
                .close-x { background: none; border: none; font-size: 1.2rem; cursor: pointer; color: #888; }
                .lf-form .form-row2 { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
                .lf-form .form-group { margin-bottom: 1rem; }
                .lf-form label { display: block; font-weight: 600; font-size: 0.88rem; margin-bottom: 0.4rem; color: #555; }
                .lf-form input, .lf-form select, .lf-form textarea { width: 100%; padding: 0.6rem 0.8rem; border: 1px solid #ddd; border-radius: var(--radius-sm); font-size: 0.95rem; box-sizing: border-box; }
                .lf-form input:focus, .lf-form select:focus, .lf-form textarea:focus { outline: 2px solid var(--color-primary); border-color: transparent; }
            `}</style>
        </div>
    );
}

export default LostFound;
