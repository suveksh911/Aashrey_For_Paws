import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { FaPaw, FaMapMarkerAlt, FaPhone, FaEnvelope, FaSearch, FaPlus, FaTimes, FaFilter, FaCamera } from 'react-icons/fa';

// Seed / demo posts so the board isn't empty
const DEMO_POSTS = [
    {
        id: 'demo1',
        userName: 'Priya Sharma',
        contact: '9841-123456',
        email: 'priya@example.com',
        petType: 'Dog',
        breed: 'Golden Retriever',
        agePreference: 'Puppy (0–1 yr)',
        gender: 'Any',
        location: 'Kathmandu',
        description: 'Looking for a friendly Golden Retriever puppy for my family. We have a spacious apartment with a garden. First-time pet owners but very committed.',
        image: 'https://images.unsplash.com/photo-1558788353-f76d92427f16?auto=format&fit=crop&w=600&q=80',
        postedAt: '2026-02-18T10:30:00.000Z',
        urgent: false,
    },
    {
        id: 'demo2',
        userName: 'Rajan Thapa',
        contact: '9851-654321',
        email: 'rajan@example.com',
        petType: 'Cat',
        breed: 'Any',
        agePreference: 'Adult (1–5 yrs)',
        gender: 'Female',
        location: 'Lalitpur',
        description: 'My elderly mother loves cats and would like a calm, gentle female cat as a companion. We can provide a loving home with lots of care.',
        image: 'https://images.unsplash.com/photo-1529778873920-4da4926a72c2?auto=format&fit=crop&w=600&q=80',
        postedAt: '2026-02-19T08:00:00.000Z',
        urgent: false,
    },
    {
        id: 'demo3',
        userName: 'Sita Rai',
        contact: '9808-987654',
        email: 'sita@example.com',
        petType: 'Dog',
        breed: 'Local Mix / Street Dog',
        agePreference: 'Any',
        gender: 'Any',
        location: 'Dharan',
        description: 'We rescued a street dog last year and had a wonderful experience. Looking to adopt another local mix dog. Open to any age or gender.',
        image: 'https://images.unsplash.com/photo-1601979031925-424e53b6caaa?auto=format&fit=crop&w=600&q=80',
        postedAt: '2026-02-20T14:00:00.000Z',
        urgent: true,
    },
];

const PET_TYPES = ['Dog', 'Cat', 'Bird', 'Rabbit', 'Other'];
const AGE_PREFS = ['Any', 'Puppy / Kitten (0–1 yr)', 'Young (1–3 yrs)', 'Adult (3–7 yrs)', 'Senior (7+ yrs)'];

function timeAgo(dateStr) {
    const diff = Math.floor((Date.now() - new Date(dateStr)) / 1000);
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
}

function AdoptionBoard() {
    const { user, isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const fileInputRef = useRef(null);

    const [posts, setPosts] = useState([]);
    const [filteredPosts, setFilteredPosts] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterType, setFilterType] = useState('');
    const [imagePreview, setImagePreview] = useState(null);

    const [form, setForm] = useState({
        petType: 'Dog',
        breed: '',
        agePreference: 'Any',
        gender: 'Any',
        location: '',
        contact: '',
        email: '',
        description: '',
        urgent: false,
        image: '',
    });

    /* ── Load posts ─────────────────────────────── */
    useEffect(() => {
        const saved = JSON.parse(localStorage.getItem('adoptionBoardPosts') || '[]');
        const all = [...saved, ...DEMO_POSTS];
        setPosts(all);
        setFilteredPosts(all);
    }, []);

    /* ── Filter / search ────────────────────────── */
    useEffect(() => {
        let result = posts;
        if (filterType) result = result.filter(p => p.petType === filterType);
        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            result = result.filter(p =>
                p.breed.toLowerCase().includes(q) ||
                p.location.toLowerCase().includes(q) ||
                p.userName.toLowerCase().includes(q) ||
                p.description.toLowerCase().includes(q)
            );
        }
        setFilteredPosts(result);
    }, [posts, filterType, searchQuery]);

    /* ── Image upload → base64 ──────────────── */
    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onloadend = () => {
            setImagePreview(reader.result);
            setForm(prev => ({ ...prev, image: reader.result }));
        };
        reader.readAsDataURL(file);
    };

    const removeImage = () => {
        setImagePreview(null);
        setForm(prev => ({ ...prev, image: '' }));
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    /* ── Submit new post ────────────────────────── */
    const handleSubmit = (e) => {
        e.preventDefault();
        if (!form.location || !form.contact || !form.description) {
            return toast.error('Please fill in all required fields.');
        }
        const newPost = {
            id: Date.now().toString(),
            userName: user.name,
            email: form.email || '',
            ...form,
            postedAt: new Date().toISOString(),
        };
        const saved = JSON.parse(localStorage.getItem('adoptionBoardPosts') || '[]');
        const updated = [newPost, ...saved];
        localStorage.setItem('adoptionBoardPosts', JSON.stringify(updated));
        setPosts([newPost, ...DEMO_POSTS, ...saved]);
        toast.success('Your request has been posted! 🐾');
        setShowForm(false);
        setImagePreview(null);
        setForm({ petType: 'Dog', breed: '', agePreference: 'Any', gender: 'Any', location: '', contact: '', email: '', description: '', urgent: false, image: '' });
    };

    return (
        <div className="board-page container">
            {/* ── HERO ── */}
            <div className="board-hero">
                <h1>Adoption Request Board</h1>
                <p>Tell the community what pet you're looking to adopt. NGOs &amp; owners can reach out to you directly.</p>
                <button
                    className="btn-post-new"
                    onClick={() => {
                        if (!isAuthenticated) { toast.info('Please login to post a request'); navigate('/login'); }
                        else setShowForm(v => !v);
                    }}
                >
                    {showForm ? <><FaTimes /> Cancel</> : <><FaPlus /> Post a Request</>}
                </button>
            </div>

            {/* ── POST FORM ── */}
            {showForm && (
                <div className="post-form-card">
                    <h2>🐾 I'm Looking to Adopt…</h2>
                    <form onSubmit={handleSubmit}>
                        <div className="form-grid">
                            <div className="form-group">
                                <label>Pet Type *</label>
                                <select value={form.petType} onChange={e => setForm({ ...form, petType: e.target.value })}>
                                    {PET_TYPES.map(t => <option key={t}>{t}</option>)}
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Preferred Breed <span>(or "Any")</span></label>
                                <input type="text" placeholder="e.g. Labrador, Persian, Any" value={form.breed} onChange={e => setForm({ ...form, breed: e.target.value })} />
                            </div>
                            <div className="form-group">
                                <label>Age Preference</label>
                                <select value={form.agePreference} onChange={e => setForm({ ...form, agePreference: e.target.value })}>
                                    {AGE_PREFS.map(a => <option key={a}>{a}</option>)}
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Gender Preference</label>
                                <select value={form.gender} onChange={e => setForm({ ...form, gender: e.target.value })}>
                                    <option>Any</option>
                                    <option>Male</option>
                                    <option>Female</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Your Location *</label>
                                <input type="text" placeholder="e.g. Kathmandu, Lalitpur" value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} required />
                            </div>
                            <div className="form-group">
                                <label>Contact Number *</label>
                                <input type="text" placeholder="98XX-XXXXXX" value={form.contact} onChange={e => setForm({ ...form, contact: e.target.value })} required />
                            </div>
                            <div className="form-group">
                                <label>Email <span>(optional)</span></label>
                                <input type="email" placeholder="your@email.com" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
                            </div>
                            <div className="form-group checkbox-group">
                                <input type="checkbox" id="urgent" checked={form.urgent} onChange={e => setForm({ ...form, urgent: e.target.checked })} />
                                <label htmlFor="urgent">🚨 Mark as Urgent</label>
                            </div>
                        </div>

                        {/* ── Photo Upload ── */}
                        <div className="form-group full-width" style={{ marginBottom: '1rem' }}>
                            <label>📷 Upload a Photo <span>(optional — helps NGOs/owners know what you're looking for)</span></label>
                            {imagePreview ? (
                                <div className="img-preview-wrap">
                                    <img src={imagePreview} alt="preview" className="img-preview" />
                                    <button type="button" className="remove-img-btn" onClick={removeImage}>
                                        <FaTimes /> Remove
                                    </button>
                                </div>
                            ) : (
                                <label className="img-upload-label" onClick={() => fileInputRef.current?.click()}>
                                    <FaCamera size={28} color="#8D6E63" />
                                    <span>Click to upload a reference photo</span>
                                    <small>e.g. the breed you're looking for</small>
                                </label>
                            )}
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                onChange={handleImageChange}
                                style={{ display: 'none' }}
                            />
                        </div>
                        <div className="form-group full-width">
                            <label>Tell us more about your situation *</label>
                            <textarea
                                rows={4}
                                placeholder="Why do you want to adopt? What kind of environment can you offer? Any special requirements?"
                                value={form.description}
                                onChange={e => setForm({ ...form, description: e.target.value })}
                                required
                            />
                        </div>
                        <button type="submit" className="btn btn-primary" style={{ marginTop: '1rem', width: '100%', padding: '0.85rem' }}>
                            Submit Request
                        </button>
                    </form>
                </div>
            )}

            {/* ── FILTERS ── */}
            <div className="board-filters">
                <div className="search-wrap">
                    <FaSearch className="s-icon" />
                    <input
                        type="text"
                        placeholder="Search by breed, location, name…"
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                    />
                </div>
                <div className="type-filters">
                    <FaFilter style={{ color: '#5d4037' }} />
                    <button className={!filterType ? 'f-btn active' : 'f-btn'} onClick={() => setFilterType('')}>All</button>
                    {PET_TYPES.map(t => (
                        <button key={t} className={filterType === t ? 'f-btn active' : 'f-btn'} onClick={() => setFilterType(t)}>{t}</button>
                    ))}
                </div>
            </div>

            {/* ── STATS BAR ── */}
            <p className="results-count">{filteredPosts.length} request{filteredPosts.length !== 1 ? 's' : ''} found</p>

            {/* ── POSTS GRID ── */}
            {filteredPosts.length === 0 ? (
                <div className="empty-board">
                    <FaPaw size={50} color="#ccc" />
                    <h3>No requests match your search.</h3>
                    <p>Try clearing your filters or be the first to post!</p>
                </div>
            ) : (
                <div className="board-grid">
                    {filteredPosts.map(post => (
                        <div key={post.id} className={`board-card ${post.urgent ? 'urgent' : ''}`}>
                            {post.urgent && <span className="urgent-tag">🚨 Urgent</span>}

                            {/* ── Card image ── */}
                            {post.image && (
                                <div className="card-img-wrap">
                                    <img src={post.image} alt={post.breed || post.petType} className="card-img" />
                                    <span className="card-img-badge">{post.petType}</span>
                                </div>
                            )}

                            <div className="card-top">
                                <div className="avatar">{post.userName.charAt(0).toUpperCase()}</div>
                                <div>
                                    <strong className="user-name">{post.userName}</strong>
                                    <p className="post-time">{timeAgo(post.postedAt)}</p>
                                </div>
                            </div>

                            <div className="pet-want">
                                {!post.image && <span className="pet-type-badge">{post.petType}</span>}
                                <h3>{post.breed || 'Any breed'}</h3>
                            </div>

                            <div className="meta-tags">
                                <span>🎂 {post.agePreference}</span>
                                <span>{post.gender === 'Any' ? '⚥ Any gender' : post.gender === 'Male' ? '♂ Male' : '♀ Female'}</span>
                                <span><FaMapMarkerAlt /> {post.location}</span>
                            </div>

                            <p className="desc-text">{post.description}</p>

                            <div className="contact-actions">
                                <a href={`tel:${post.contact}`} className="btn-contact phone">
                                    <FaPhone /> {post.contact}
                                </a>
                                {post.email && (
                                    <a href={`mailto:${post.email}`} className="btn-contact email">
                                        <FaEnvelope /> Email
                                    </a>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <style>{`
                .board-page { padding: 2rem; }

                .board-hero {
                    background: linear-gradient(135deg, rgba(93,64,55,0.92), rgba(62,39,35,0.95)),
                        url('https://images.unsplash.com/photo-1450778869180-41d0601e046e?auto=format&fit=crop&w=1950&q=80');
                    background-size: cover; background-position: center;
                    border-radius: 16px; padding: 4rem 2rem;
                    text-align: center; color: white; margin-bottom: 2rem;
                }
                .board-hero h1 { font-size: 2.6rem; margin-bottom: 0.75rem; color: white; }
                .board-hero p  { font-size: 1.1rem; opacity: 0.9; margin-bottom: 1.5rem; }
                .btn-post-new {
                    display: inline-flex; align-items: center; gap: 8px;
                    background: #FFAB91; color: #3E2723;
                    border: none; border-radius: 50px; padding: 0.75rem 2rem;
                    font-size: 1rem; font-weight: 700; cursor: pointer;
                    transition: all 0.2s;
                }
                .btn-post-new:hover { background: #FF8A65; transform: translateY(-2px); }

                /* ── FORM ── */
                .post-form-card {
                    background: white; border-radius: 16px; padding: 2rem;
                    box-shadow: 0 8px 30px rgba(93,64,55,0.12);
                    border: 1px solid #efebe9; margin-bottom: 2.5rem;
                }
                .post-form-card h2 { margin-bottom: 1.5rem; color: #3E2723; }
                .form-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
                    gap: 1.2rem; margin-bottom: 1.2rem;
                }
                .form-group label { display: block; margin-bottom: 6px; font-size: 0.88rem; font-weight: 600; color: #5d4037; }
                .form-group label span { font-weight: 400; color: #999; }
                .form-group input, .form-group select, .form-group textarea {
                    width: 100%; padding: 0.7rem 0.9rem;
                    border: 1.5px solid #e0d5d0; border-radius: 8px;
                    font-size: 0.95rem; transition: border 0.2s;
                    box-sizing: border-box;
                }
                .form-group input:focus, .form-group select:focus, .form-group textarea:focus {
                    outline: none; border-color: #8D6E63;
                }
                .form-group.full-width { grid-column: 1 / -1; }
                .checkbox-group { display: flex; align-items: center; gap: 10px; padding-top: 0.5rem; }
                .checkbox-group input { width: auto; }
                .checkbox-group label { margin: 0; font-size: 0.95rem; }

                /* ── FILTERS ── */
                .board-filters {
                    display: flex; flex-wrap: wrap; gap: 1rem; align-items: center;
                    background: white; padding: 1.2rem 1.5rem;
                    border-radius: 12px; margin-bottom: 1.5rem;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.06);
                }
                .search-wrap {
                    position: relative; flex: 1; min-width: 220px;
                }
                .search-wrap .s-icon {
                    position: absolute; left: 12px; top: 50%;
                    transform: translateY(-50%); color: #9e9e9e;
                }
                .search-wrap input {
                    width: 100%; padding: 0.7rem 1rem 0.7rem 2.4rem;
                    border: 1.5px solid #e0d5d0; border-radius: 50px; font-size: 0.95rem;
                    box-sizing: border-box;
                }
                .search-wrap input:focus { outline: none; border-color: #8D6E63; }
                .type-filters { display: flex; gap: 0.5rem; flex-wrap: wrap; align-items: center; }
                .f-btn {
                    padding: 0.45rem 1rem; border-radius: 50px;
                    border: 1.5px solid #d7ccc8; background: white;
                    color: #5d4037; font-size: 0.88rem; font-weight: 600;
                    cursor: pointer; transition: all 0.2s;
                }
                .f-btn:hover { border-color: #8D6E63; }
                .f-btn.active { background: #5d4037; color: white; border-color: #5d4037; }

                .results-count { color: #888; font-size: 0.9rem; margin-bottom: 1.5rem; }

                /* ── EMPTY STATE ── */
                .empty-board { text-align: center; padding: 4rem; color: #bbb; }
                .empty-board h3 { margin-top: 1rem; color: #888; }

                /* ── GRID ── */
                .board-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
                    gap: 1.5rem;
                }
                .board-card {
                    background: white; border-radius: 14px; padding: 0;
                    box-shadow: 0 2px 12px rgba(0,0,0,0.07);
                    border: 1.5px solid #f0ebe7;
                    transition: transform 0.2s, box-shadow 0.2s;
                    position: relative; overflow: hidden;
                }
                .board-card:hover { transform: translateY(-4px); box-shadow: 0 8px 24px rgba(93,64,55,0.12); }
                .board-card.urgent { border-color: #ff8a65; background: #fff8f6; }

                /* card inner padding now applied to children that aren't the image */
                .card-top, .pet-want, .meta-tags, .desc-text, .contact-actions, .urgent-tag {
                    padding-left: 1.5rem; padding-right: 1.5rem;
                }
                .card-top { padding-top: 1.2rem; }
                .contact-actions { padding-bottom: 1.4rem; }

                .urgent-tag {
                    display: block; background: #ff8a65; color: white;
                    font-size: 0.74rem; font-weight: 700; padding: 4px 0;
                    text-align: center; letter-spacing: 0.4px;
                }

                /* ── Card image ── */
                .card-img-wrap {
                    position: relative; width: 100%; height: 180px; overflow: hidden;
                }
                .card-img {
                    width: 100%; height: 100%; object-fit: cover;
                    transition: transform 0.4s;
                }
                .board-card:hover .card-img { transform: scale(1.04); }
                .card-img-badge {
                    position: absolute; top: 10px; left: 10px;
                    background: rgba(93,64,55,0.85); color: white;
                    font-size: 0.72rem; font-weight: 700; padding: 3px 10px;
                    border-radius: 50px; text-transform: uppercase; letter-spacing: 0.5px;
                    backdrop-filter: blur(4px);
                }

                .card-top { display: flex; align-items: center; gap: 12px; margin-bottom: 1rem; }
                .avatar {
                    width: 42px; height: 42px; border-radius: 50%;
                    background: linear-gradient(135deg, #8D6E63, #5d4037);
                    color: white; display: flex; align-items: center; justify-content: center;
                    font-size: 1.1rem; font-weight: 700; flex-shrink: 0;
                }
                .user-name { font-size: 0.95rem; color: #3E2723; }
                .post-time { font-size: 0.78rem; color: #aaa; margin: 0; }

                .pet-want { margin-bottom: 0.75rem; }
                .pet-type-badge {
                    display: inline-block; background: #efebe9; color: #5d4037;
                    font-size: 0.75rem; font-weight: 700; padding: 2px 10px;
                    border-radius: 50px; margin-bottom: 4px; text-transform: uppercase; letter-spacing: 0.5px;
                }
                .pet-want h3 { margin: 0; font-size: 1.15rem; color: #3E2723; }

                .meta-tags { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 0.85rem; }
                .meta-tags span {
                    display: inline-flex; align-items: center; gap: 4px;
                    background: #f5f5f5; color: #555; font-size: 0.8rem;
                    padding: 3px 10px; border-radius: 50px;
                }

                .desc-text { font-size: 0.9rem; color: #666; line-height: 1.55; margin-bottom: 1.2rem; }

                .contact-actions { display: flex; gap: 0.75rem; flex-wrap: wrap; }
                .btn-contact {
                    display: inline-flex; align-items: center; gap: 6px;
                    padding: 0.5rem 1rem; border-radius: 50px; font-size: 0.85rem;
                    font-weight: 600; text-decoration: none; transition: all 0.2s;
                }
                .btn-contact.phone { background: #5d4037; color: white; }
                .btn-contact.phone:hover { background: #3E2723; }
                .btn-contact.email { border: 1.5px solid #5d4037; color: #5d4037; }
                .btn-contact.email:hover { background: #5d4037; color: white; }

                /* ── Image upload UI ── */
                .img-upload-label {
                    display: flex; flex-direction: column; align-items: center;
                    gap: 6px; border: 2px dashed #d7ccc8; border-radius: 10px;
                    padding: 1.5rem; cursor: pointer; text-align: center;
                    background: #fdf8f6; transition: border-color 0.2s;
                }
                .img-upload-label:hover { border-color: #8D6E63; }
                .img-upload-label span { font-size: 0.9rem; color: #6D4C41; font-weight: 500; }
                .img-upload-label small { color: #9e9e9e; font-size: 0.8rem; }

                .img-preview-wrap {
                    position: relative; display: inline-block; margin-top: 0.5rem;
                }
                .img-preview {
                    max-height: 180px; max-width: 100%; border-radius: 10px;
                    object-fit: cover; display: block;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
                }
                .remove-img-btn {
                    display: inline-flex; align-items: center; gap: 4px;
                    margin-top: 0.5rem; background: #f44336; color: white;
                    border: none; border-radius: 50px; padding: 4px 12px;
                    font-size: 0.8rem; cursor: pointer;
                }

                @media(max-width: 600px) {
                    .board-hero h1 { font-size: 1.8rem; }
                    .form-grid { grid-template-columns: 1fr; }
                }
            `}</style>
        </div>
    );
}

export default AdoptionBoard;
