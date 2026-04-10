import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../services/axios';
import { toast } from 'react-toastify';
import { FaMapMarkerAlt, FaHeartbeat, FaInfoCircle, FaHeart, FaRegHeart, FaEdit, FaTrash, FaCheckCircle, FaTimesCircle, FaBuilding, FaUser, FaStore, FaExclamationTriangle, FaEnvelope, FaChevronLeft, FaChevronRight, FaStar } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import PetHealthRecord from '../components/pet/PetHealthRecord';
import PetStatusBadge from '../components/pet/PetStatusBadge';
import NGOVerifiedBadge from '../components/ngo/NGOVerifiedBadge';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icons in Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Shows a static map (read-only) centered on the pet's pinned location
function LocationMap({ lat, lng, locationLabel }) {
    if (!lat || !lng) {
        if (locationLabel) {
            // If we have a location string but no coords, try to show an iframe map of the city
            const query = encodeURIComponent(locationLabel);
            return (
                <div style={{ borderRadius: '12px', overflow: 'hidden', marginBottom: '1.5rem', border: '1px solid #e5e7eb', boxShadow: '0 2px 8px rgba(0,0,0,0.07)' }}>
                    <div style={{ background: '#fdf8f6', borderBottom: '1px solid #EFEBE9', padding: '8px 14px', fontSize: '0.8rem', color: '#5d4037', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <FaMapMarkerAlt color="#8D6E63" /> {locationLabel} (Approximate Location)
                    </div>
                    <div style={{ width: '100%', height: '240px' }}>
                        <iframe
                            width="100%"
                            height="100%"
                            frameBorder="0"
                            scrolling="no"
                            marginHeight="0"
                            marginWidth="0"
                            src={`https://maps.google.com/maps?q=${query}&t=&z=13&ie=UTF8&iwloc=&output=embed`}
                            style={{ border: 0 }}
                            title="Map"
                        ></iframe>
                    </div>
                </div>
            );
        }

        return (
            <div style={{ background: '#f9fafb', border: '1px dashed #d1d5db', borderRadius: '12px', padding: '1rem', textAlign: 'center', fontSize: '0.82rem', color: '#9ca3af', marginBottom: '1.5rem' }}>
                No precise map coordinates for this pet
            </div>
        );
    }
    return (
        <div style={{ borderRadius: '12px', overflow: 'hidden', marginBottom: '1.5rem', border: '1px solid #e5e7eb', boxShadow: '0 2px 8px rgba(0,0,0,0.07)' }}>
            <div style={{ background: '#fdf8f6', borderBottom: '1px solid #EFEBE9', padding: '8px 14px', fontSize: '0.8rem', color: '#5d4037', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                <FaMapMarkerAlt color="#8D6E63" /> {locationLabel}
            </div>
            <div style={{ width: '100%', height: '240px', zIndex: 0 }}>
                <MapContainer center={[lat, lng]} zoom={14} style={{ height: '100%', width: '100%' }}>
                    <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    />
                    <Marker position={[lat, lng]} />
                </MapContainer>
            </div>
        </div>
    );
}

const POSTER_CONFIG = {
    NGO: { icon: <FaBuilding size={13} />, label: 'NGO', bg: '#e8f0fe', color: '#1a56db' },
    Owner: { icon: <FaUser size={13} />, label: 'Individual', bg: '#f0fdf4', color: '#15803d' },
    Shop: { icon: <FaStore size={13} />, label: 'Pet Shop', bg: '#fff7ed', color: '#c2410c' },
};

function PetDetails() {
    const { id } = useParams();
    const [pet, setPet] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeImage, setActiveImage] = useState('');
    const { user } = useAuth();
    const navigate = useNavigate();

    const [isFavorite, setIsFavorite] = useState(false);
    const [showContact, setShowContact] = useState(false);

    // Check if pet is already a favorite on load
    useEffect(() => {
        const favoriteKey = user ? `userFavorites_${user._id}` : 'userFavorites_guest';
        const savedFavorites = JSON.parse(localStorage.getItem(favoriteKey)) || [];
        setIsFavorite(savedFavorites.some(p => p._id === id));
    }, [id]);

    useEffect(() => {
        fetchPetDetails();
    }, [id]);


    const fetchPetDetails = async () => {
        try {
            const response = await api.get(`/pets/${id}`);
            if (response.data.success) {
                const petData = response.data.data;
                setPet(petData);
                setActiveImage(petData.image || petData.images?.[0] || '');
                // Check favorites from localStorage cache
                const favoriteKey = user ? `userFavorites_${user._id}` : 'userFavorites_guest';
                const savedFav = JSON.parse(localStorage.getItem(favoriteKey)) || [];
                setIsFavorite(savedFav.some(p => p._id === id));
            } else {
                toast.error('Pet not found');
            }
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to load pet details');
        } finally {
            setLoading(false);
        }
    };

    const nextImage = () => {
        if (!pet?.images || pet.images.length <= 1) return;
        const currentIndex = pet.images.indexOf(activeImage);
        const nextIdx = (currentIndex + 1) % pet.images.length;
        setActiveImage(pet.images[nextIdx]);
    };

    const prevImage = () => {
        if (!pet?.images || pet.images.length <= 1) return;
        const currentIndex = pet.images.indexOf(activeImage);
        const prevIdx = (currentIndex - 1 + pet.images.length) % pet.images.length;
        setActiveImage(pet.images[prevIdx]);
    };

    const toggleFavorite = () => {
        if (!user) {
            toast.info("Please login to add to favorites");
            return;
        }
        const favoriteKey = user ? `userFavorites_${user._id}` : 'userFavorites_guest';
        const savedFavorites = JSON.parse(localStorage.getItem(favoriteKey)) || [];
        if (isFavorite) {
            const updated = savedFavorites.filter(p => p._id !== pet._id);
            localStorage.setItem(favoriteKey, JSON.stringify(updated));
            setIsFavorite(false);
            toast.info("Removed from favorites");
        } else {
            localStorage.setItem(favoriteKey, JSON.stringify([...savedFavorites, pet]));
            setIsFavorite(true);
            toast.success("Added to favorites!");
        }
    };

    const handleAdminEdit = () => {
        navigate(`/edit-pet/${pet._id}`);
    };

    const handleAdminDelete = async () => {
        if (!window.confirm(`Are you sure you want to remove ${pet.name} from listings?`)) return;
        try {
            await api.delete(`/pets/${pet._id}`);
            toast.success(`${pet.name} removed from listings.`);
            navigate('/pet-find');
        } catch {
            toast.error('Failed to delete pet. Please try again.');
        }
    };

    if (loading) return <div className="container center-content">Loading...</div>;
    if (!pet) return <div className="container center-content">Pet not found</div>;

    return (
        <div className="container" style={{ padding: '2rem' }}>
            <div className="pet-details-card">
                <div className="pet-image-section">
                    <div className="pet-image-main">
                        {pet.images && pet.images.length > 1 && (
                            <>
                                <button className="nav-btn prev" onClick={prevImage} aria-label="Previous image">
                                    <FaChevronLeft />
                                </button>
                                <button className="nav-btn next" onClick={nextImage} aria-label="Next image">
                                    <FaChevronRight />
                                </button>
                            </>
                        )}
                        <img 
                            src={activeImage || 'https://via.placeholder.com/600x400?text=No+Image'} 
                            alt={pet.name} 
                            onError={(e) => { e.target.onerror = null; e.target.src = 'https://via.placeholder.com/600x400?text=No+Image'; }}
                        />
                    </div>
                    {pet.images && pet.images.length > 1 && (
                        <div className="pet-image-gallery">
                            {pet.images.map((img, idx) => (
                                <div 
                                    key={idx} 
                                    className={`gallery-thumb ${activeImage === img ? 'active' : ''}`}
                                    onClick={() => setActiveImage(img)}
                                >
                                    <img src={img} alt={`${pet.name} - ${idx + 1}`} />
                                </div>
                            ))}
                        </div>
                    )}
                </div>
                <div className="pet-info-large">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h1>{pet.name} <NGOVerifiedBadge isVerified={pet.ngoVerified} /></h1>
                        <button onClick={toggleFavorite} style={{ background: 'none', border: 'none', cursor: 'pointer' }} title={isFavorite ? "Remove from Favorites" : "Add to Favorites"}>
                            {isFavorite ? <FaHeart color="#dc3545" size={32} /> : <FaRegHeart color="#5d4037" size={32} />}
                        </button>
                    </div>
                    <div className="badges">
                        <PetStatusBadge status={pet.adoptionStatus} />
                        <span className="badge type">{pet.type}</span>
                    </div>

                    <p className="location"><FaMapMarkerAlt /> {pet.location}</p>

                    <div className="details-grid">
                        <div className="detail-item"><strong>Breed:</strong> {pet.breed}</div>
                        <div className="detail-item"><strong>Age:</strong> {pet.age}</div>
                        <div className="detail-item"><strong>Gender:</strong> {pet.gender === 'Male' ? '♂' : '♀'} {pet.gender}</div>
                        <div className="detail-item"><strong><FaHeartbeat /> Health:</strong> {pet.healthStatus || 'N/A'}</div>
                        <div className="detail-item">
                            <strong>Availability:</strong>{' '}
                            {pet.status === 'Adopted' ? (
                                <span style={{ color: '#dc3545', fontWeight: 700 }}>None left</span>
                            ) : pet.quantity > 1 ? (
                                <span style={{ color: '#15803d', fontWeight: 700 }}>{pet.quantity} available</span>
                            ) : (
                                <span style={{ color: '#c2410c', fontWeight: 700 }}>Last one available!</span>
                            )}
                        </div>
                        <div className="detail-item">
                            <strong>Vaccination:</strong>{' '}
                            {pet.vaccinated
                                ? <span style={{ color: '#15803d', fontWeight: 600 }}><FaCheckCircle style={{ verticalAlign: 'middle' }} /> Vaccinated</span>
                                : <span style={{ color: '#6b7280' }}><FaTimesCircle style={{ verticalAlign: 'middle' }} /> Not Vaccinated</span>
                            }
                        </div>
                    </div>

                    {/* Personality tags */}
                    {pet.personalities && pet.personalities.length > 0 && (
                        <div style={{ marginBottom: '1.25rem' }}>
                            <strong style={{ fontSize: '0.9rem', display: 'block', marginBottom: '6px' }}>🐾 Personality</strong>
                            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                                {pet.personalities.map(tag => (
                                    <span key={tag} style={{ background: '#fdf4eb', color: '#92400e', fontSize: '0.78rem', fontWeight: 600, padding: '3px 12px', borderRadius: '20px', border: '1px solid #f0d9be' }}>{tag}</span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Posted By card */}
                    {pet.postedBy && (() => {
                        const cfg = POSTER_CONFIG[pet.postedBy.type] || POSTER_CONFIG.Owner;
                        const isNGO = pet.postedBy.type === 'NGO';
                        const profileLink = pet.postedBy.id ? `/ngo/${pet.postedBy.id}` : null;
                        return (
                            <div style={{ background: cfg.bg, border: `1px solid ${cfg.color}30`, borderRadius: '10px', padding: '0.85rem 1rem', marginBottom: '1.25rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <span style={{ color: cfg.color, fontSize: '1.3rem' }}>{cfg.icon}</span>
                                        <div>
                                            <p style={{ margin: 0, fontSize: '0.75rem', color: '#888' }}>Posted by</p>
                                            {profileLink ? (
                                                <Link to={profileLink} style={{ margin: 0, fontWeight: 700, color: cfg.color, textDecoration: 'none', cursor: 'pointer' }}
                                                    onMouseEnter={e => e.target.style.textDecoration = 'underline'}
                                                    onMouseLeave={e => e.target.style.textDecoration = 'none'}>
                                                    {pet.postedBy.name}
                                                </Link>
                                            ) : (
                                                <p style={{ margin: 0, fontWeight: 700, color: cfg.color }}>{pet.postedBy.name}</p>
                                            )}
                                            {/* Poster Rating Mini-Summary */}
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                                                <div style={{ display: 'flex' }}>
                                                    {[1, 2, 3, 4, 5].map(s => (
                                                        <FaStar key={s} size={10} color={s <= Math.round(pet.postedBy.avgRating || 0) ? '#ffc107' : '#e4e5e9'} />
                                                    ))}
                                                </div>
                                                <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#6b7280' }}>
                                                    {pet.postedBy.avgRating?.toFixed(1) || '0.0'} 
                                                    <span style={{ fontWeight: 400, marginLeft: '2px' }}>({pet.postedBy.reviewCount || 0})</span>
                                                </span>
                                            </div>
                                            <span style={{ fontSize: '0.72rem', background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.color}50`, borderRadius: '20px', padding: '1px 8px', fontWeight: 700, marginTop: '4px', display: 'inline-block' }}>{cfg.label}</span>
                                        </div>
                                    </div>
                                    <button onClick={() => setShowContact(prev => !prev)} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: cfg.color, color: 'white', padding: '7px 14px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '0.82rem', fontWeight: 600 }}>
                                        <FaEnvelope size={12} /> Contact
                                    </button>
                                </div>

                                {/* Contact Info Dropdown */}
                                {showContact && (
                                    <div style={{ marginTop: '0.75rem', padding: '0.75rem 1rem', background: '#fff', border: '1px solid #e5e7eb', borderRadius: '10px', display: 'flex', flexDirection: 'column', gap: '8px', animation: 'fadeIn 0.2s ease' }}>
                                        {pet.postedBy.email && (
                                            <a href={`mailto:${pet.postedBy.email}`} style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#374151', textDecoration: 'none', fontSize: '0.88rem', fontWeight: 500, padding: '6px 10px', borderRadius: '8px', background: '#f9fafb', transition: 'background 0.2s' }}
                                                onMouseEnter={e => e.currentTarget.style.background = '#f0f0f0'}
                                                onMouseLeave={e => e.currentTarget.style.background = '#f9fafb'}>
                                                <FaEnvelope size={14} color="#8D6E63" /> {pet.postedBy.email}
                                            </a>
                                        )}
                                        {pet.postedBy.phone && (
                                            <a href={`tel:${pet.postedBy.phone}`} style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#374151', textDecoration: 'none', fontSize: '0.88rem', fontWeight: 500, padding: '6px 10px', borderRadius: '8px', background: '#f9fafb', transition: 'background 0.2s' }}
                                                onMouseEnter={e => e.currentTarget.style.background = '#f0f0f0'}
                                                onMouseLeave={e => e.currentTarget.style.background = '#f9fafb'}>
                                                <span style={{ fontSize: '14px' }}>📞</span> {pet.postedBy.phone}
                                            </a>
                                        )}
                                        {!pet.postedBy.email && !pet.postedBy.phone && (
                                            <p style={{ margin: 0, fontSize: '0.85rem', color: '#9ca3af', fontStyle: 'italic' }}>No contact information available for this user.</p>
                                        )}
                                        {pet.postedBy.id && (
                                            <Link to={`/ngo/${pet.postedBy.id}`} style={{ display: 'flex', alignItems: 'center', gap: '8px', color: cfg.color, textDecoration: 'none', fontSize: '0.82rem', fontWeight: 700, padding: '6px 10px', borderRadius: '8px', background: `${cfg.color}10`, marginTop: '2px' }}>
                                                {isNGO ? <FaBuilding size={13} /> : <FaUser size={13} />} View {isNGO ? 'NGO' : ''} Profile →
                                            </Link>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })()}

                    {/* Urgent notice */}
                    {pet.urgent && (
                        <div style={{ background: '#fef3c7', border: '1px solid #f59e0b', borderRadius: '8px', padding: '0.75rem 1rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '8px', color: '#92400e', fontSize: '0.88rem', fontWeight: 600 }}>
                            <FaExclamationTriangle color="#f59e0b" /> Urgent adoption needed — this pet needs a home as soon as possible!
                        </div>
                    )}

                    <div className="description">
                        <h3><FaInfoCircle color="#8D6E63" /> About {pet.name}</h3>
                        <div className="desc-content">
                            {pet.description ? (
                                <p>{pet.description}</p>
                            ) : (
                                <p style={{ color: '#9ca3af', fontStyle: 'italic' }}>No detailed description provided for this pet.</p>
                            )}
                        </div>
                    </div>

                    <div className="actions">
                        {pet.status === 'Adopted' ? (
                            <div style={{ background: '#f8fafc', border: '2px solid #e2e8f0', borderRadius: '15px', padding: '1.5rem', textAlign: 'center' }}>
                                <div style={{ color: '#15803d', fontSize: '1.5rem', fontWeight: 900, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                                    <FaCheckCircle /> ALREADY ADOPTED
                                </div>
                                <p style={{ color: '#64748b', fontSize: '0.9rem', fontWeight: 500 }}>This lucky pet has already found their forever home!</p>
                            </div>
                        ) : !user ? (
                            <div className="auth-prompt">
                                <p>Please <Link to="/login">login</Link> to {pet.listingType === 'Sale' ? 'purchase' : 'adopt'} {pet.name}.</p>
                            </div>
                        ) : (user.role === 'Admin' || user._id === (pet.ownerId?._id || pet.ownerId)) ? (
                            <div className="admin-actions" style={{ display: 'flex', gap: '1rem' }}>
                                <button className="btn btn-secondary" onClick={handleAdminEdit} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <FaEdit /> Edit Pet
                                </button>
                                <button className="btn btn-danger" onClick={handleAdminDelete} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#dc3545', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer' }}>
                                    <FaTrash /> Delete Pet
                                </button>
                            </div>
                        ) : pet.listingType === 'Sale' ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                <div style={{ background: '#fef3c7', border: '1px solid #f59e0b', borderRadius: '10px', padding: '0.75rem 1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ fontWeight: 700, color: '#92400e', fontSize: '0.9rem' }}>🛒 Listed for Sale</span>
                                    <span style={{ fontSize: '1.4rem', fontWeight: 800, color: '#5D4037' }}>Rs. {(pet.price || 0).toLocaleString()}</span>
                                </div>
                                {pet.paymentDetails && (
                                    <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '0.75rem 1rem', fontSize: '0.9rem', color: '#475569' }}>
                                        <strong>Payment Instructions:</strong><br/>
                                        <span style={{ whiteSpace: 'pre-wrap' }}>{pet.paymentDetails}</span>
                                    </div>
                                )}
                                <Link to={`/pet/buy/${pet._id}`} state={{ pet }} className="btn btn-primary btn-lg"
                                    style={{ background: '#7c3aed', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                                    🛒 Buy Now — Rs. {(pet.price || 0).toLocaleString()}
                                </Link>
                            </div>
                        ) : (
                            <Link to={`/adopt/${pet._id}`} state={{ petName: pet.name }} className="btn btn-primary btn-lg">
                                Adopt {pet.name}
                            </Link>
                        )}
                    </div>
                </div>
            </div>

            {/* Location Map */}
            <LocationMap
                lat={pet.lat}
                lng={pet.lng}
                locationLabel={pet.location}
            />

            <PetHealthRecord pet={pet} ownerId={pet.ownerId} />

            <style>{`
                .pet-details-card {
                    display: grid;
                    grid-template-columns: 1fr;
                    gap: 0;
                    background: var(--color-surface);
                    border-radius: var(--radius-lg);
                    box-shadow: 0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1);
                    overflow: hidden;
                    border: 1px solid rgba(0,0,0,0.05);
                }
                @media (min-width: 992px) {
                    .pet-details-card {
                        grid-template-columns: 1.1fr 0.9fr;
                    }
                }
                .pet-image-section {
                    background: #fff;
                    display: flex;
                    flex-direction: column;
                    padding: 1.5rem;
                    border-right: 1px solid #f3f4f6;
                }
                .pet-image-main {
                    aspect-ratio: 4/3;
                    width: 100%;
                    border-radius: 12px;
                    overflow: hidden;
                    background: #f9fafb;
                    box-shadow: inset 0 2px 4px 0 rgba(0, 0, 0, 0.05);
                    margin-bottom: 1rem;
                    position: relative;
                }
                .nav-btn {
                    position: absolute;
                    top: 50%;
                    transform: translateY(-50%);
                    background: rgba(255, 255, 255, 0.15);
                    backdrop-filter: blur(4px);
                    border: 1px solid rgba(255, 255, 255, 0.3);
                    color: white;
                    width: 40px;
                    height: 40px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    z-index: 5;
                    transition: all 0.2s ease;
                    opacity: 0;
                }
                .pet-image-main:hover .nav-btn {
                    opacity: 1;
                }
                .nav-btn:hover {
                    background: rgba(255, 255, 255, 0.4);
                    transform: translateY(-50%) scale(1.1);
                }
                .nav-btn.prev { left: 15px; }
                .nav-btn.next { right: 15px; }
                
                .pet-image-main img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                    transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
                }
                .pet-image-gallery {
                    display: flex;
                    gap: 10px;
                    overflow-x: auto;
                    padding: 4px 2px 8px;
                    scrollbar-width: thin;
                    scrollbar-color: #e5e7eb transparent;
                }
                .pet-image-gallery::-webkit-scrollbar { height: 4px; }
                .pet-image-gallery::-webkit-scrollbar-thumb { background-color: #e5e7eb; border-radius: 4px; }
                
                .gallery-thumb {
                    flex-shrink: 0;
                    width: 70px;
                    height: 70px;
                    border-radius: 10px;
                    overflow: hidden;
                    cursor: pointer;
                    border: 2px solid transparent;
                    transition: all 0.2s ease;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.05);
                }
                .gallery-thumb:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 4px 6px rgba(0,0,0,0.1);
                    border-color: #8D6E6350;
                }
                .gallery-thumb.active {
                    border-color: #8D6E63;
                    transform: scale(0.95);
                    box-shadow: 0 0 0 3px rgba(141, 110, 99, 0.15);
                }
                .gallery-thumb img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }
                .pet-info-large {
                    padding: 2.5rem;
                    display: flex;
                    flex-direction: column;
                    background: #fff;
                }
                .pet-info-large h1 {
                    font-size: 2.5rem;
                    color: var(--color-primary-dark);
                    margin-bottom: 0.5rem;
                }
                .badges {
                    display: flex;
                    gap: 0.5rem;
                    margin-bottom: 1rem;
                }
                .badge {
                    padding: 0.25rem 0.75rem;
                    border-radius: var(--radius-full);
                    font-size: 0.9rem;
                    font-weight: bold;
                    color: white;
                }
                .badge.available { background: #28a745; }
                .badge.adopted { background: #dc3545; }
                .badge.type { background: var(--color-secondary); color: var(--color-text-dark); }

                .location {
                    color: var(--color-text-secondary);
                    font-size: 1.1rem;
                    margin-bottom: 2rem;
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                }
                .details-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 1rem;
                    margin-bottom: 2rem;
                    background: var(--color-background);
                    padding: 1rem;
                    border-radius: var(--radius-md);
                }
                .description {
                    margin-bottom: 2rem;
                    flex-grow: 1;
                    background: #fdfdfd;
                    border: 1px solid #f0f0f0;
                    border-radius: var(--radius-md);
                    padding: 1.5rem;
                    box-shadow: 0 4px 6px rgba(0,0,0,0.02);
                }
                .description h3 {
                    display: flex;
                    align-items: center;
                    gap: 0.6rem;
                    margin-bottom: 1rem;
                    color: #4b5563;
                    font-size: 1.25rem;
                    border-bottom: 1px solid #f3f4f6;
                    padding-bottom: 0.8rem;
                }
                .desc-content p {
                    line-height: 1.7;
                    color: #4b5563;
                    font-size: 1.05rem;
                    margin: 0;
                }
                .btn-lg {
                    width: 100%;
                    padding: 1rem;
                    font-size: 1.2rem;
                    text-align: center;
                    transition: all 0.3s ease;
                }
                .btn-lg:hover { transform: translateY(-2px); box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1); }
                .auth-prompt {
                    background: #fff3cd;
                    padding: 1rem;
                    border-radius: var(--radius-sm);
                    color: #856404;
                    text-align: center;
                }
                .auth-prompt a {
                    color: #856404;
                    font-weight: bold;
                    text-decoration: underline;
                }
            `}</style>
        </div >
    );
}

export default PetDetails;
