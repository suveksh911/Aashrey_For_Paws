import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
    FaGlobe, FaPhone, FaMapMarkerAlt, FaEnvelope, FaPen,
    FaStar, FaCheckCircle, FaPaw, FaUserCircle, FaBuilding,
    FaIdCard, FaCalendarAlt, FaHeart, FaShieldAlt, FaArrowLeft, FaTrash
} from 'react-icons/fa';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import api from '../services/axios';

const NGODetails = () => {
    const { id } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();

    const [profile, setProfile] = useState(null);
    const [pets, setPets] = useState([]);
    const [reviews, setReviews] = useState([]);
    const [avgRating, setAvgRating] = useState(0);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);

    // rating form state
    const [rating, setRating] = useState(0);
    const [hover, setHover] = useState(0);
    const [comment, setComment] = useState('');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => { fetchAll(); }, [id]);

    const fetchAll = async () => {
        setLoading(true);
        try {
            const [profileRes, reviewRes] = await Promise.all([
                api.get(`/users/${id}`).catch(() => null),
                api.get(`/reviews/ngo/${id}`).catch(() => ({ data: { data: [] } })),
            ]);

            if (profileRes?.data?.success) {
                setProfile(profileRes.data.data);
            } else {
                toast.error('User profile not found');
                setProfile(null);
            }

            const r = reviewRes?.data?.data || [];
            setReviews(r);
            if (r.length > 0) setAvgRating(r.reduce((s, x) => s + x.rating, 0) / r.length);

            // Fetch pets listed by this user
            const petRes = await api.get(`/pets?postedBy=${id}`).catch(() => null);
            if (petRes?.data?.success) setPets(petRes.data.data.slice(0, 6));
        } catch {
            toast.error('Failed to load profile');
        } finally {
            setLoading(false);
        }
    };

    const handleReviewSubmit = async (e) => {
        e.preventDefault();
        if (rating === 0) { toast.error('Please select a star rating'); return; }
        setSubmitting(true);
        try {
            await api.post('/reviews', { ngoId: id, rating, comment });
            toast.success('Review submitted! 🌟');
            setRating(0); setComment(''); setShowForm(false);
            fetchAll();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to submit review');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeleteReview = async (reviewId) => {
        if (!window.confirm('Are you sure you want to delete your review?')) return;
        try {
            await api.delete(`/reviews/${reviewId}`);
            toast.info('Review deleted');
            fetchAll();
        } catch (err) {
            toast.error('Failed to delete review');
        }
    };

    const handleEditInitial = (r) => {
        setRating(r.rating);
        setComment(r.comment || '');
        setShowForm(true);
        window.scrollTo({ top: document.querySelector('form')?.offsetTop - 100 || 400, behavior: 'smooth' });
    };

    if (loading) return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <FaPaw style={{ fontSize: '36px', color: '#8D6E63', animation: 'bounce 1s infinite' }} />
        </div>
    );

    if (!profile) return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem', color: '#6b7280' }}>
            <p>User not found.</p>
            <Link to="/pet-find" style={{ color: '#8D6E63', textDecoration: 'underline' }}>Browse Pets</Link>
        </div>
    );

    const isNGO = profile.role === 'NGO';
    const displayName = isNGO ? (profile.orgName || profile.name) : profile.name;
    const isVerified = profile.isVerified || profile.ngoStatus === 'verified';
    const initials = displayName?.charAt(0)?.toUpperCase() || '?';
    const memberSince = new Date(profile.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

    const listingTag = (type) => {
        const styles = {
            Sale: { bg: '#fff7ed', color: '#c2410c', label: '🛒 For Sale' },
            Rehoming: { bg: '#eff6ff', color: '#1d4ed8', label: '🔄 Rehoming' },
        };
        const s = styles[type] || { bg: '#f0fdf4', color: '#15803d', label: '🏠 Adoption' };
        return <span style={{ background: s.bg, color: s.color, fontSize: '0.7rem', fontWeight: 700, padding: '2px 8px', borderRadius: '20px' }}>{s.label}</span>;
    };

    return (
        <div style={{ minHeight: '100vh', background: '#f8fafc', paddingTop: '2rem', paddingBottom: '3rem' }}>
            <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '0 1rem' }}>

                {/* Back Button */}
                <button 
                    onClick={() => navigate(-1)}
                    style={{
                        display: 'flex', alignItems: 'center', gap: '8px',
                        background: 'none', border: 'none', color: '#5D4037',
                        fontWeight: 600, fontSize: '0.95rem', cursor: 'pointer',
                        marginBottom: '1.2rem', padding: '0.5rem 0',
                        opacity: 0.9, transition: 'opacity 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
                    onMouseLeave={(e) => e.currentTarget.style.opacity = '0.9'}
                >
                    <FaArrowLeft /> Back
                </button>

                {/* ── Hero Card ── */}
                <div style={{ background: '#fff', borderRadius: '20px', overflow: 'hidden', border: '1px solid #f0f0f0', boxShadow: '0 4px 20px rgba(0,0,0,0.06)', marginBottom: '1.5rem' }}>
                    {/* Banner */}
                    <div style={{ height: '200px', background: isNGO ? 'linear-gradient(135deg, #8D6E63 0%, #5D4037 50%, #3E2723 100%)' : 'linear-gradient(135deg, #5D4037 0%, #8D6E63 100%)', position: 'relative' }}>
                        <div style={{ position: 'absolute', bottom: '-40px', left: '2rem' }}>
                            {profile.profileImage ? (
                                <img src={profile.profileImage} alt={displayName}
                                    style={{ width: '100px', height: '100px', borderRadius: '20px', objectFit: 'cover', border: '4px solid #fff', boxShadow: '0 4px 15px rgba(0,0,0,0.15)' }} />
                            ) : (
                                <div style={{ width: '100px', height: '100px', borderRadius: '20px', background: 'linear-gradient(135deg, #FFAB91, #FF8A65)', border: '4px solid #fff', boxShadow: '0 4px 15px rgba(0,0,0,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem', fontWeight: 800, color: '#fff' }}>
                                    {initials}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Profile Info */}
                    <div style={{ padding: '3.5rem 2rem 2rem' }}>
                        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
                            <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                                    <h1 style={{ margin: 0, fontSize: '1.8rem', fontWeight: 800, color: '#3E2723' }}>{displayName}</h1>
                                    {isVerified && (
                                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.72rem', fontWeight: 700, background: '#eff6ff', color: '#1d4ed8', padding: '3px 10px', borderRadius: '20px', border: '1px solid #bfdbfe' }}>
                                            <FaCheckCircle size={10} /> Verified {isNGO ? 'NGO' : 'User'}
                                        </span>
                                    )}
                                    <span style={{ fontSize: '0.72rem', fontWeight: 700, background: isNGO ? '#ede9fe' : '#f0fdf4', color: isNGO ? '#7c3aed' : '#15803d', padding: '3px 10px', borderRadius: '20px', border: `1px solid ${isNGO ? '#c4b5fd' : '#bbf7d0'}` }}>
                                        {isNGO ? <><FaBuilding size={9} /> NGO</> : <><FaUserCircle size={9} /> {profile.role}</>}
                                    </span>
                                </div>

                                {/* Star summary */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px' }}>
                                    <div style={{ display: 'flex' }}>
                                        {[1, 2, 3, 4, 5].map(s => (
                                            <FaStar key={s} size={14} color={s <= Math.round(profile.avgRating || 0) ? '#ffc107' : '#e4e5e9'} />
                                        ))}
                                    </div>
                                    <span style={{ fontSize: '0.88rem', fontWeight: 700, color: '#374151' }}>{profile.avgRating?.toFixed(1) || '0.0'}</span>
                                    <span style={{ fontSize: '0.78rem', color: '#9ca3af' }}>({profile.reviewCount || 0} reviews)</span>
                                </div>

                                {/* Bio */}
                                {profile.bio && (
                                    <p style={{ margin: '10px 0 0', fontSize: '0.92rem', color: '#4b5563', lineHeight: 1.6, maxWidth: '600px' }}>{profile.bio}</p>
                                )}
                            </div>

                            {isNGO && (
                                <Link to={`/donate?ngoId=${profile._id}`}
                                    style={{ background: 'linear-gradient(135deg, #8D6E63, #5D4037)', color: '#fff', padding: '10px 24px', borderRadius: '12px', fontSize: '0.9rem', fontWeight: 700, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '8px', transition: 'transform 0.2s', boxShadow: '0 4px 12px rgba(93,64,55,0.3)' }}>
                                    <FaHeart size={14} /> Donate
                                </Link>
                            )}
                        </div>

                        {/* Contact Details Grid */}
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginTop: '1.2rem', paddingTop: '1.2rem', borderTop: '1px solid #f3f4f6' }}>
                            {profile.address && (
                                <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: '#6b7280' }}>
                                    <FaMapMarkerAlt color="#8D6E63" /> {profile.address}
                                </span>
                            )}
                            {profile.phone && (
                                <a href={`tel:${profile.phone}`} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: '#6b7280', textDecoration: 'none' }}>
                                    <FaPhone color="#8D6E63" /> {profile.phone}
                                </a>
                            )}
                            {profile.email && (
                                <a href={`mailto:${profile.email}`} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: '#6b7280', textDecoration: 'none' }}>
                                    <FaEnvelope color="#8D6E63" /> {profile.email}
                                </a>
                            )}
                            {profile.website && (
                                <a href={profile.website} target="_blank" rel="noopener noreferrer" 
                                   style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: '#6b7280', textDecoration: 'none', maxWidth: '180px' }}
                                   title={profile.website}>
                                    <FaGlobe color="#8D6E63" /> 
                                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                        {profile.website.replace(/^https?:\/\/(www\.)?/, '')}
                                    </span>
                                </a>
                            )}
                            <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: '#9ca3af' }}>
                                <FaCalendarAlt size={12} /> Member since {memberSince}
                            </span>
                        </div>

                        {/* NGO-specific extra info */}
                        {isNGO && profile.registrationNo && (
                            <div style={{ marginTop: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', color: '#9ca3af' }}>
                                <FaIdCard size={12} /> Reg. No: {profile.registrationNo}
                            </div>
                        )}
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem' }}>
                    {/* Desktop: 2-column layout */}
                    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>

                        {/* ── Left: Reviews ── */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {true && (
                                <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #f0f0f0', padding: '1.5rem', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                        <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: '#5D4037' }}>Reviews & Ratings</h2>
                                        {user ? (
                                            <button onClick={() => setShowForm(s => !s)}
                                                style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', fontWeight: 600, border: '1px solid #8D6E63', color: '#8D6E63', background: 'none', padding: '6px 14px', borderRadius: '10px', cursor: 'pointer' }}>
                                                <FaPen size={11} /> {showForm ? 'Cancel' : 'Write Review'}
                                            </button>
                                        ) : (
                                            <Link to="/login" style={{ fontSize: '0.82rem', color: '#8D6E63', textDecoration: 'underline' }}>Login to rate</Link>
                                        )}
                                    </div>

                                    {/* Inline review form */}
                                    {showForm && (
                                        <form onSubmit={handleReviewSubmit} style={{ background: '#fdf8f6', borderRadius: '12px', padding: '1rem', marginBottom: '1rem', border: '1px solid #f0e8e5' }}>
                                            <p style={{ fontSize: '0.85rem', fontWeight: 600, color: '#374151', marginBottom: '8px' }}>Your Rating</p>
                                            <div style={{ display: 'flex', gap: '6px', marginBottom: '10px' }}>
                                                {[1, 2, 3, 4, 5].map(s => (
                                                    <button type="button" key={s} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                                                        onMouseEnter={() => setHover(s)}
                                                        onMouseLeave={() => setHover(0)}
                                                        onClick={() => setRating(s)}>
                                                        <FaStar size={28} color={s <= (hover || rating) ? '#ffc107' : '#e4e5e9'} style={{ transition: 'color 0.15s' }} />
                                                    </button>
                                                ))}
                                            </div>
                                            <textarea
                                                value={comment} onChange={e => setComment(e.target.value)}
                                                placeholder="Share your experience (optional)..."
                                                rows={3}
                                                style={{ width: '100%', border: '1px solid #e5e7eb', borderRadius: '10px', padding: '8px 12px', fontSize: '0.88rem', resize: 'none', outline: 'none', marginBottom: '10px', fontFamily: 'inherit' }}
                                            />
                                            <button type="submit" disabled={submitting}
                                                style={{ background: '#8D6E63', color: '#fff', padding: '8px 20px', borderRadius: '10px', fontSize: '0.85rem', fontWeight: 700, border: 'none', cursor: 'pointer', opacity: submitting ? 0.6 : 1 }}>
                                                {submitting ? 'Submitting…' : '⭐ Submit Review'}
                                            </button>
                                        </form>
                                    )}

                                    {/* Review list */}
                                    {reviews.length === 0 ? (
                                        <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#9ca3af', fontSize: '0.88rem' }}>
                                            No reviews yet. Be the first to rate {isNGO ? 'this NGO' : 'this user'}! ⭐
                                        </div>
                                    ) : (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                            {reviews.map((r, i) => (
                                                <div key={i} style={{ display: 'flex', gap: '12px', borderBottom: i < reviews.length - 1 ? '1px solid #f3f4f6' : 'none', paddingBottom: '10px' }}>
                                                    <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#fdf4eb', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                                        <FaUserCircle size={20} color="#8D6E63" />
                                                    </div>
                                                    <div style={{ flex: 1 }}>
                                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '4px' }}>
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                                <span style={{ fontWeight: 600, fontSize: '0.88rem', color: '#374151' }}>
                                                                    {r.user?.name || r.userName || 'Anonymous'}
                                                                </span>
                                                                {user?._id === r.userId && (
                                                                    <div style={{ display: 'flex', gap: '8px', marginLeft: '4px' }}>
                                                                        <button onClick={() => handleEditInitial(r)} title="Edit review"
                                                                            style={{ background: 'none', border: 'none', color: '#8D6E63', cursor: 'pointer', padding: 0, opacity: 0.7 }}>
                                                                            <FaPen size={10} />
                                                                        </button>
                                                                        <button onClick={() => handleDeleteReview(r._id)} title="Delete review"
                                                                            style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: 0, opacity: 0.7 }}>
                                                                            <FaTrash size={10} />
                                                                        </button>
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <div style={{ display: 'flex' }}>
                                                                {[1, 2, 3, 4, 5].map(s => (
                                                                    <FaStar key={s} size={11} color={s <= r.rating ? '#ffc107' : '#e4e5e9'} />
                                                                ))}
                                                            </div>
                                                        </div>
                                                        {r.comment && <p style={{ fontSize: '0.85rem', color: '#6b7280', margin: '4px 0 0' }}>{r.comment}</p>}
                                                        <p style={{ fontSize: '0.72rem', color: '#cbd5e1', margin: '4px 0 0' }}>{new Date(r.createdAt || r.date).toLocaleDateString()}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* About section - always show below reviews for context */}
                            <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #f0f0f0', padding: '1.5rem', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                                <h2 style={{ margin: '0 0 1rem', fontSize: '1.1rem', fontWeight: 700, color: '#5D4037' }}>About {profile.name}</h2>
                                {profile.bio ? (
                                    <p style={{ fontSize: '0.92rem', color: '#4b5563', lineHeight: 1.6, margin: 0 }}>{profile.bio}</p>
                                ) : (
                                    <p style={{ fontSize: '0.88rem', color: '#9ca3af', fontStyle: 'italic', margin: 0 }}>This user hasn't added a bio yet.</p>
                                )}
                                <div style={{ marginTop: '1rem', padding: '0.75rem', background: '#f8fafc', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <FaShieldAlt size={16} color="#8D6E63" />
                                    <span style={{ fontSize: '0.82rem', color: '#6b7280' }}>
                                        {profile.role === 'NGO' ? 'Verified Animal Welfare Organization.' : profile.role === 'Owner' ? 'Pet owner listing animals on the platform.' : 'Active member of the Aashrey For Paws community.'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* ── Right: Pets ── */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #f0f0f0', padding: '1.5rem', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                                <h3 style={{ margin: '0 0 1rem', fontWeight: 700, color: '#5D4037' }}>
                                    {isNGO ? 'Available Pets' : 'Listed Pets'}
                                </h3>
                                {pets.length === 0 ? (
                                    <p style={{ fontSize: '0.85rem', color: '#9ca3af', fontStyle: 'italic' }}>No pets listed yet.</p>
                                ) : (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                        {pets.map(p => (
                                            <Link key={p._id} to={`/pet/${p._id}`}
                                                style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px', borderRadius: '10px', textDecoration: 'none', color: 'inherit', transition: 'background 0.15s' }}
                                                onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                                                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                                                <img
                                                    src={p.image || p.images?.[0] || 'https://placehold.co/600x400/5d4037/FFF?text=Image+Unavailable'}
                                                    alt={p.name}
                                                    style={{ width: '44px', height: '44px', borderRadius: '10px', objectFit: 'cover', flexShrink: 0 }}
                                                />
                                                <div style={{ flex: 1, minWidth: 0 }}>
                                                    <p style={{ margin: 0, fontWeight: 600, fontSize: '0.88rem', color: '#374151', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.name}</p>
                                                    <p style={{ margin: 0, fontSize: '0.75rem', color: '#9ca3af', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.breed}</p>
                                                </div>
                                                {listingTag(p.listingType)}
                                            </Link>
                                        ))}
                                    </div>
                                )}
                                <Link to="/pet-find" style={{ marginTop: '0.75rem', display: 'block', textAlign: 'center', fontSize: '0.78rem', color: '#8D6E63', fontWeight: 600, textDecoration: 'none' }}>
                                    Browse All Pets →
                                </Link>
                            </div>

                            {/* Quick Contact Card */}
                            <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #f0f0f0', padding: '1.5rem', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                                <h3 style={{ margin: '0 0 1rem', fontWeight: 700, color: '#5D4037' }}>Contact</h3>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    {profile.email && (
                                        <a href={`mailto:${profile.email}`} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: '#374151', textDecoration: 'none', padding: '8px 10px', borderRadius: '8px', background: '#f9fafb', transition: 'background 0.15s' }}
                                            onMouseEnter={e => e.currentTarget.style.background = '#f0f0f0'}
                                            onMouseLeave={e => e.currentTarget.style.background = '#f9fafb'}>
                                            <FaEnvelope size={14} color="#8D6E63" /> {profile.email}
                                        </a>
                                    )}
                                    {profile.phone && (
                                        <a href={`tel:${profile.phone}`} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: '#374151', textDecoration: 'none', padding: '8px 10px', borderRadius: '8px', background: '#f9fafb', transition: 'background 0.15s' }}
                                            onMouseEnter={e => e.currentTarget.style.background = '#f0f0f0'}
                                            onMouseLeave={e => e.currentTarget.style.background = '#f9fafb'}>
                                            <FaPhone size={14} color="#8D6E63" /> {profile.phone}
                                        </a>
                                    )}
                                    {!profile.email && !profile.phone && (
                                        <p style={{ margin: 0, fontSize: '0.85rem', color: '#9ca3af', fontStyle: 'italic' }}>No contact info available.</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes bounce {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-10px); }
                }
                @media (max-width: 768px) {
                    div[style*="grid-template-columns: 2fr 1fr"] {
                        grid-template-columns: 1fr !important;
                    }
                }
            `}</style>
        </div>
    );
};

export default NGODetails;
