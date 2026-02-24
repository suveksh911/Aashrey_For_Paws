import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../services/axios';
import { toast } from 'react-toastify';
import { FaMapMarkerAlt, FaHeartbeat, FaInfoCircle, FaHeart, FaRegHeart, FaEdit, FaTrash, FaCheckCircle, FaTimesCircle, FaBuilding, FaUser, FaStore, FaExclamationTriangle, FaEnvelope } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import PetHealthRecord from '../components/PetHealthRecord';
import PetStatusBadge from '../components/PetStatusBadge';
import NGOVerifiedBadge from '../components/NGOVerifiedBadge';

const POSTER_CONFIG = {
    NGO: { icon: <FaBuilding size={13} />, label: 'NGO', bg: '#e8f0fe', color: '#1a56db' },
    Owner: { icon: <FaUser size={13} />, label: 'Individual', bg: '#f0fdf4', color: '#15803d' },
    Shop: { icon: <FaStore size={13} />, label: 'Pet Shop', bg: '#fff7ed', color: '#c2410c' },
};

function PetDetails() {
    const { id } = useParams();
    const [pet, setPet] = useState(null);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();
    const navigate = useNavigate();

    const [isFavorite, setIsFavorite] = useState(false);

    // Check if pet is already a favorite on load
    useEffect(() => {
        const savedFavorites = JSON.parse(localStorage.getItem('userFavorites')) || [];
        setIsFavorite(savedFavorites.some(p => p._id === id));
    }, [id]);

    useEffect(() => {
        fetchPetDetails();
    }, [id]);


    const MOCK_PETS = [
        { _id: 'm1', name: 'Buddy', type: 'Dog', breed: 'Golden Retriever', age: '2 years', gender: 'Male', location: 'Kathmandu', image: 'https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=600&q=80', adoptionStatus: 'Available', vaccinated: true, healthStatus: 'Healthy', urgent: false, personalities: ['Friendly', 'Playful', 'Energetic'], postedBy: { type: 'NGO', name: 'Paws & Love Nepal' }, description: 'Friendly and energetic Golden Retriever looking for a loving home.' },
        { _id: 'm2', name: 'Misty', type: 'Cat', breed: 'Persian', age: '1 year', gender: 'Female', location: 'Dharan-18', image: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=600&q=80', adoptionStatus: 'Available', vaccinated: true, healthStatus: 'Healthy', urgent: false, personalities: ['Calm', 'Cuddly', 'Shy'], postedBy: { type: 'Owner', name: 'Sita Sharma' }, description: 'Calm and fluffy Persian cat.' },
        { _id: 'm3', name: 'Rocky', type: 'Dog', breed: 'German Shepherd', age: '3 years', gender: 'Male', location: 'Bhanuchowk, Dharan', image: 'https://images.unsplash.com/photo-1589941013453-ec89f33b5e95?auto=format&fit=crop&w=600&q=80', adoptionStatus: 'Available', vaccinated: false, healthStatus: 'Needs Care', urgent: true, personalities: ['Loyal', 'Protective', 'Intelligent'], postedBy: { type: 'NGO', name: 'Animal Aid Nepal' }, description: 'Loyal German Shepherd, great guard dog.' },
        { _id: 'm4', name: 'Luna', type: 'Cat', breed: 'Siamese', age: '6 months', gender: 'Female', location: 'Itahari-17', image: 'https://images.unsplash.com/photo-1513245543132-31f507417b26?auto=format&fit=crop&w=600&q=80', adoptionStatus: 'Adopted', vaccinated: true, healthStatus: 'Healthy', urgent: false, personalities: ['Vocal', 'Affectionate', 'Social'], postedBy: { type: 'Owner', name: 'Ram Thapa' }, description: 'Playful Siamese kitten.' },
        { _id: 'm5', name: 'Coco', type: 'Dog', breed: 'Labrador', age: '5 months', gender: 'Female', location: 'Kathmandu', image: 'https://images.unsplash.com/photo-1537151625747-768eb6cf92b2?auto=format&fit=crop&w=600&q=80', adoptionStatus: 'Available', vaccinated: true, healthStatus: 'Healthy', urgent: true, personalities: ['Playful', 'Friendly', 'Gentle'], postedBy: { type: 'Shop', name: 'Furry Friends Pet Store' }, description: 'Cute Labrador puppy.' },
        { _id: 'm6', name: 'Max', type: 'Dog', breed: 'Husky', age: '1.5 years', gender: 'Male', location: 'Lalitpur', image: 'https://images.unsplash.com/photo-1605568427561-40dd23c2acea?auto=format&fit=crop&w=600&q=80', adoptionStatus: 'Available', vaccinated: false, healthStatus: 'Healthy', urgent: false, personalities: ['Energetic', 'Independent'], postedBy: { type: 'NGO', name: 'Himalayan Animal Rescue' }, description: 'Energetic Husky who loves to run.' },
    ];

    const fetchPetDetails = async () => {
        try {
            const response = await api.get(`/pets/${id}`);
            if (response.data.success) {
                setPet(response.data.data);
                setIsFavorite(false);
            }
        } catch (error) {
            console.log("API failed, trying mock/local data...");


            let foundPet = MOCK_PETS.find(p => p._id === id);


            if (!foundPet) {
                const localPets = JSON.parse(localStorage.getItem('ngoPets')) || [];
                foundPet = localPets.find(p => p._id === id);
            }

            if (foundPet) {
                setPet(foundPet);
                setIsFavorite(false);
            } else {
                toast.error('Failed to load pet details');
            }
        } finally {
            setLoading(false);
        }
    };

    const toggleFavorite = () => {
        if (!user) {
            toast.info("Please login to add to favorites");
            return;
        }
        const savedFavorites = JSON.parse(localStorage.getItem('userFavorites')) || [];
        if (isFavorite) {
            const updated = savedFavorites.filter(p => p._id !== pet._id);
            localStorage.setItem('userFavorites', JSON.stringify(updated));
            setIsFavorite(false);
            toast.info("Removed from favorites");
        } else {
            localStorage.setItem('userFavorites', JSON.stringify([...savedFavorites, pet]));
            setIsFavorite(true);
            toast.success("Added to favorites!");
        }
    };

    const handleAdminEdit = () => {
        navigate(`/edit-pet/${pet._id}`);
    };

    const handleAdminDelete = () => {
        if (!window.confirm(`Are you sure you want to remove ${pet.name} from listings?`)) return;
        const allPets = JSON.parse(localStorage.getItem('ngoPets')) || [];
        const updated = allPets.filter(p => p._id !== pet._id);
        localStorage.setItem('ngoPets', JSON.stringify(updated));
        toast.success(`${pet.name} removed from listings.`);
        navigate('/pet-find');
    };

    if (loading) return <div className="container center-content">Loading...</div>;
    if (!pet) return <div className="container center-content">Pet not found</div>;

    return (
        <div className="container" style={{ padding: '2rem' }}>
            <div className="pet-details-card">
                <div className="pet-image-large">
                    <img src={pet.image || pet.images?.[0] || 'https://via.placeholder.com/600x400?text=No+Image'} alt={pet.name} />
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
                        <div className="detail-item" style={{ gridColumn: '1 / -1' }}>
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
                        return (
                            <div style={{ background: cfg.bg, border: `1px solid ${cfg.color}30`, borderRadius: '10px', padding: '0.85rem 1rem', marginBottom: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <span style={{ color: cfg.color, fontSize: '1.3rem' }}>{cfg.icon}</span>
                                    <div>
                                        <p style={{ margin: 0, fontSize: '0.75rem', color: '#888' }}>Posted by</p>
                                        <p style={{ margin: 0, fontWeight: 700, color: cfg.color }}>{pet.postedBy.name}</p>
                                        <span style={{ fontSize: '0.72rem', background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.color}50`, borderRadius: '20px', padding: '1px 8px', fontWeight: 700 }}>{cfg.label}</span>
                                    </div>
                                </div>
                                <Link to="/contact" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: cfg.color, color: 'white', padding: '7px 14px', borderRadius: '8px', textDecoration: 'none', fontSize: '0.82rem', fontWeight: 600 }}>
                                    <FaEnvelope size={12} /> Contact
                                </Link>
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
                        <h3><FaInfoCircle /> About {pet.name}</h3>
                        <p>{pet.description || 'No description provided.'}</p>
                    </div>

                    <div className="actions">
                        {!user ? (
                            <div className="auth-prompt">
                                <p>Please <Link to="/login">login</Link> to adopt {pet.name}.</p>
                            </div>
                        ) : ['Admin', 'NGO', 'Owner'].includes(user.role) ? (
                            <div className="admin-actions" style={{ display: 'flex', gap: '1rem' }}>
                                <button className="btn btn-secondary" onClick={handleAdminEdit} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <FaEdit /> Edit Pet
                                </button>
                                <button className="btn btn-danger" onClick={handleAdminDelete} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#dc3545', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer' }}>
                                    <FaTrash /> Delete Pet
                                </button>
                            </div>
                        ) : (
                            <Link to={`/adopt/${pet._id}`} state={{ petName: pet.name }} className="btn btn-primary btn-lg">
                                Adopt {pet.name}
                            </Link>
                        )}
                    </div>
                </div>
            </div>

            <PetHealthRecord petId={pet._id} />

            <style>{`
                .pet-details-card {
                    display: grid;
                    grid-template-columns: 1fr;
                    gap: 2rem;
                    background: var(--color-surface);
                    border-radius: var(--radius-lg);
                    box-shadow: var(--shadow-lg);
                    overflow: hidden;
                }
                @media (min-width: 768px) {
                    .pet-details-card {
                        grid-template-columns: 1fr 1fr;
                    }
                }
                .pet-image-large img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                    min-height: 400px;
                }
                .pet-info-large {
                    padding: 2rem;
                    display: flex;
                    flex-direction: column;
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
                }
                .description h3 {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    margin-bottom: 0.5rem;
                }
                .btn-lg {
                    width: 100%;
                    padding: 1rem;
                    font-size: 1.2rem;
                    text-align: center;
                }
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
