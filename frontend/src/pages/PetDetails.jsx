import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../services/axios';
import { toast } from 'react-toastify';
import { FaMapMarkerAlt, FaHeartbeat, FaInfoCircle, FaHeart, FaRegHeart } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import PetHealthRecords from '../components/PetHealthRecords';

function PetDetails() {
    const { id } = useParams();
    const [pet, setPet] = useState(null);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();
    const navigate = useNavigate();

    const [isFavorite, setIsFavorite] = useState(false);

    useEffect(() => {
        fetchPetDetails();
    }, [id]);

  
    const MOCK_PETS = [
        { _id: 'm1', name: 'Buddy', type: 'Dog', breed: 'Golden Retriever', age: '2 years', gender: 'Male', location: 'Kathmandu', image: 'https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=600&q=80', adoptionStatus: 'Available', description: 'Friendly and energetic Golden Retriever looking for a loving home.' },
        { _id: 'm2', name: 'Misty', type: 'Cat', breed: 'Persian', age: '1 year', gender: 'Female', location: 'Dharan-18', image: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=600&q=80', adoptionStatus: 'Available', description: 'Calm and fluffy Persian cat.' },
        { _id: 'm3', name: 'Rocky', type: 'Dog', breed: 'German Shepherd', age: '3 years', gender: 'Male', location: 'Bhanuchowk,dharan', image: 'https://images.unsplash.com/photo-1589941013453-ec89f33b5e95?auto=format&fit=crop&w=600&q=80', adoptionStatus: 'Available', description: 'Loyal German Shepherd, great guard dog.' },
        { _id: 'm4', name: 'Luna', type: 'Cat', breed: 'Siamese', age: '6 months', gender: 'Female', location: 'Itahari-17', image: 'https://images.unsplash.com/photo-1513245543132-31f507417b26?auto=format&fit=crop&w=600&q=80', adoptionStatus: 'Adopted', description: 'Playful Siamese kitten.' },
        { _id: 'm5', name: 'Coco', type: 'Dog', breed: 'Labrador', age: '5 months', gender: 'Female', location: 'Kathmandu', image: 'data:image/jpeg;base64,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', adoptionStatus: 'Available', description: 'Cute Labrador puppy.' },
        { _id: 'm6', name: 'Max', type: 'Dog', breed: 'Husky', age: '1.5 years', gender: 'Male', location: 'Lalitpur', image: 'data:image/jpeg;base64,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', adoptionStatus: 'Available', description: 'Energetic Husky who loves to run.' }
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
        setIsFavorite(!isFavorite);
        if (!isFavorite) {
            toast.success("Added to favorites");
        } else {
            toast.info("Removed from favorites");
        }
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
                        <h1>{pet.name}</h1>
                        <button onClick={toggleFavorite} style={{ background: 'none', border: 'none', cursor: 'pointer' }} title={isFavorite ? "Remove from Favorites" : "Add to Favorites"}>
                            {isFavorite ? <FaHeart color="#dc3545" size={32} /> : <FaRegHeart color="#5d4037" size={32} />}
                        </button>
                    </div>
                    <div className="badges">
                        <span className={`badge ${pet.adoptionStatus.toLowerCase()}`}>{pet.adoptionStatus}</span>
                        <span className="badge type">{pet.type}</span>
                    </div>

                    <p className="location"><FaMapMarkerAlt /> {pet.location}</p>

                    <div className="details-grid">
                        <div className="detail-item">
                            <strong>Breed:</strong> {pet.breed}
                        </div>
                        <div className="detail-item">
                            <strong>Age:</strong> {pet.age}
                        </div>
                        <div className="detail-item">
                            <strong>Gender:</strong> {pet.gender}
                        </div>
                        <div className="detail-item">
                            <strong><FaHeartbeat /> Health:</strong> {pet.healthStatus}
                        </div>
                    </div>

                    <div className="description">
                        <h3><FaInfoCircle /> About {pet.name}</h3>
                        <p>{pet.description || "No description provided."}</p>
                    </div>

                    <div className="actions">
                        {!user ? (
                            <div className="auth-prompt">
                                <p>Please <Link to="/login">login</Link> to adopt {pet.name}.</p>
                            </div>
                        ) : ['Admin', 'NGO'].includes(user.role) ? (
                            <div className="admin-actions">
                                <button className="btn btn-secondary" onClick={() => toast.info('Edit functionality coming soon')}>Edit Pet</button>
                                <button className="btn btn-danger" onClick={() => toast.info('Delete functionality coming soon')} style={{ marginLeft: '10px' }}>Delete Pet</button>
                            </div>
                        ) : (
                            <Link to={`/adopt/${pet._id}`} state={{ petName: pet.name }} className="btn btn-primary btn-lg">
                                Adopt {pet.name}
                            </Link>
                        )}
                    </div>
                </div>
            </div>

            <PetHealthRecords pet={pet} />

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
