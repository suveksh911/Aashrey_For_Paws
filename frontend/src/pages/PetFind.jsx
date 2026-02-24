import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/axios';
import { toast } from 'react-toastify';
import { FaSearch, FaMapMarkerAlt, FaPaw, FaMap, FaCheckCircle, FaTimesCircle, FaExclamationTriangle, FaBuilding, FaUser, FaStore } from 'react-icons/fa';
import AdvancedSearch from '../components/AdvancedSearch';
import MapComponent from '../components/MapComponent';
import Skeleton from '../components/Skeleton';

const MOCK_PETS = [
    {
        _id: 'm1',
        name: 'Buddy',
        type: 'Dog',
        breed: 'Golden Retriever',
        age: '2 years',
        gender: 'Male',
        location: 'Kathmandu',
        image: 'https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=600&q=80',
        adoptionStatus: 'Available',
        vaccinated: true,
        healthStatus: 'Healthy',
        urgent: false,
        personalities: ['Friendly', 'Playful', 'Energetic'],
        postedBy: { type: 'NGO', name: 'Paws & Love Nepal' }
    },
    {
        _id: 'm2',
        name: 'Misty',
        type: 'Cat',
        breed: 'Persian',
        age: '1 year',
        gender: 'Female',
        location: 'Dharan-18',
        image: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=600&q=80',
        adoptionStatus: 'Available',
        vaccinated: true,
        healthStatus: 'Healthy',
        urgent: false,
        personalities: ['Calm', 'Cuddly', 'Shy'],
        postedBy: { type: 'Owner', name: 'Sita Sharma' }
    },
    {
        _id: 'm3',
        name: 'Rocky',
        type: 'Dog',
        breed: 'German Shepherd',
        age: '3 years',
        gender: 'Male',
        location: 'Bhanuchowk, Dharan',
        image: 'https://images.unsplash.com/photo-1589941013453-ec89f33b5e95?auto=format&fit=crop&w=600&q=80',
        adoptionStatus: 'Available',
        vaccinated: false,
        healthStatus: 'Needs Care',
        urgent: true,
        personalities: ['Loyal', 'Protective', 'Intelligent'],
        postedBy: { type: 'NGO', name: 'Animal Aid Nepal' }
    },
    {
        _id: 'm4',
        name: 'Luna',
        type: 'Cat',
        breed: 'Siamese',
        age: '6 months',
        gender: 'Female',
        location: 'Itahari-17',
        image: 'https://images.unsplash.com/photo-1513245543132-31f507417b26?auto=format&fit=crop&w=600&q=80',
        adoptionStatus: 'Adopted',
        vaccinated: true,
        healthStatus: 'Healthy',
        urgent: false,
        personalities: ['Vocal', 'Affectionate', 'Social'],
        postedBy: { type: 'Owner', name: 'Ram Thapa' }
    },
    {
        _id: 'm5',
        name: 'Coco',
        type: 'Dog',
        breed: 'Labrador',
        age: '5 months',
        gender: 'Female',
        location: 'Kathmandu',
        image: 'https://images.unsplash.com/photo-1537151625747-768eb6cf92b2?auto=format&fit=crop&w=600&q=80',
        adoptionStatus: 'Available',
        vaccinated: true,
        healthStatus: 'Healthy',
        urgent: true,
        personalities: ['Playful', 'Friendly', 'Gentle'],
        postedBy: { type: 'Shop', name: 'Furry Friends Pet Store' }
    },
    {
        _id: 'm6',
        name: 'Max',
        type: 'Dog',
        breed: 'Husky',
        age: '1.5 years',
        gender: 'Male',
        location: 'Lalitpur',
        image: 'https://images.unsplash.com/photo-1605568427561-40dd23c2acea?auto=format&fit=crop&w=600&q=80',
        adoptionStatus: 'Available',
        vaccinated: false,
        healthStatus: 'Healthy',
        urgent: false,
        personalities: ['Energetic', 'Independent', 'Adventurous'],
        postedBy: { type: 'NGO', name: 'Himalayan Animal Rescue' }
    }
];

// Poster badge config
const POSTER_CONFIG = {
    NGO: { icon: <FaBuilding size={11} />, label: 'NGO', bg: '#e8f0fe', color: '#1a56db' },
    Owner: { icon: <FaUser size={11} />, label: 'Individual', bg: '#f0fdf4', color: '#15803d' },
    Shop: { icon: <FaStore size={11} />, label: 'Pet Shop', bg: '#fff7ed', color: '#c2410c' },
};

function PosterBadge({ postedBy }) {
    if (!postedBy) return null;
    const cfg = POSTER_CONFIG[postedBy.type] || POSTER_CONFIG.Owner;
    return (
        <span style={{
            display: 'inline-flex', alignItems: 'center', gap: '4px',
            background: cfg.bg, color: cfg.color,
            fontSize: '0.72rem', fontWeight: 700,
            padding: '2px 8px', borderRadius: '20px',
            border: `1px solid ${cfg.color}30`
        }}>
            {cfg.icon} {cfg.label}
        </span>
    );
}

function PetFind() {
    const [pets, setPets] = useState([]);
    const [filteredPets, setFilteredPets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showMap, setShowMap] = useState(false);
    const [filters, setFilters] = useState({
        type: '', breed: '', age: '', gender: '', location: '', search: '', posterType: ''
    });

    useEffect(() => { fetchPets(); }, []);
    useEffect(() => { applyFilters(); }, [filters, pets]);

    const fetchPets = async () => {
        try {
            const response = await api.get('/pets');
            if (response.data.success && response.data.data.length > 0) {
                setPets(response.data.data);
                setFilteredPets(response.data.data);
            } else {
                setPets(MOCK_PETS);
                setFilteredPets(MOCK_PETS);
            }
        } catch {
            const localPets = JSON.parse(localStorage.getItem('ngoPets')) || [];
            const all = [...MOCK_PETS, ...localPets];
            setPets(all);
            setFilteredPets(all);
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    const applyFilters = () => {
        let result = pets;
        if (filters.search) {
            const s = filters.search.toLowerCase();
            result = result.filter(p =>
                p.name.toLowerCase().includes(s) ||
                p.breed.toLowerCase().includes(s) ||
                p.location.toLowerCase().includes(s)
            );
        }
        if (filters.type) result = result.filter(p => p.type === filters.type);
        if (filters.gender) result = result.filter(p => p.gender === filters.gender);
        if (filters.location) result = result.filter(p => p.location.toLowerCase().includes(filters.location.toLowerCase()));
        if (filters.age) result = result.filter(p => p.age.includes(filters.age));
        if (filters.posterType) result = result.filter(p => p.postedBy?.type === filters.posterType);
        setFilteredPets(result);
    };

    return (
        <div className="container" style={{ padding: '2rem' }}>
            {/* Hero Header */}
            <div className="pet-find-header">
                <h1>Find a Friend 🐾</h1>
                <p>Browse pets available for adoption near you.</p>
                <button
                    onClick={() => setShowMap(!showMap)}
                    style={{ marginTop: '1rem', padding: '10px 20px', borderRadius: '20px', border: 'none', background: 'white', color: '#5d4037', fontWeight: 'bold', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '8px' }}
                >
                    <FaMap /> {showMap ? 'Show List' : 'Show Map View'}
                </button>
            </div>

            {/* Search + Filter bar */}
            <div className="search-filter-bar">
                <div className="search-input">
                    <FaSearch className="icon" />
                    <input
                        type="text"
                        name="search"
                        placeholder="Search by name, breed, location..."
                        value={filters.search}
                        onChange={handleFilterChange}
                    />
                </div>
                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                    <select name="type" value={filters.type} onChange={handleFilterChange} className="filter-select">
                        <option value="">All Types</option>
                        <option value="Dog">🐶 Dog</option>
                        <option value="Cat">🐱 Cat</option>
                        <option value="Bird">🐦 Bird</option>
                        <option value="Rabbit">🐰 Rabbit</option>
                    </select>
                    <select name="gender" value={filters.gender} onChange={handleFilterChange} className="filter-select">
                        <option value="">All Genders</option>
                        <option value="Male">♂ Male</option>
                        <option value="Female">♀ Female</option>
                    </select>
                    <select name="posterType" value={filters.posterType} onChange={handleFilterChange} className="filter-select">
                        <option value="">All Posters</option>
                        <option value="NGO">🏢 NGO</option>
                        <option value="Owner">🏠 Individual</option>
                        <option value="Shop">🛒 Pet Shop</option>
                    </select>
                </div>
            </div>

            <AdvancedSearch onFilterChange={(newFilters) => setFilters(prev => ({ ...prev, ...newFilters }))} />

            {showMap ? (
                <div style={{ marginTop: '2rem' }}>
                    <MapComponent pets={filteredPets} />
                </div>
            ) : (
                <>
                    {loading ? (
                        <div className="pet-grid">
                            {[1, 2, 3, 4, 5, 6].map(n => (
                                <div key={n} className="pet-card">
                                    <Skeleton type="thumbnail" style={{ height: '200px' }} />
                                    <div className="pet-info">
                                        <Skeleton type="title" style={{ width: '70%' }} />
                                        <Skeleton type="text" style={{ width: '40%', marginBottom: '1rem' }} />
                                        <Skeleton type="text" style={{ width: '100%' }} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : filteredPets.length === 0 ? (
                        <div className="empty-state">
                            <FaPaw size={50} color="#ccc" />
                            <h3>No pets found matching your criteria.</h3>
                            <p>Try clearing some filters.</p>
                        </div>
                    ) : (
                        <div className="pet-grid">
                            {filteredPets.map(pet => (
                                <div key={pet._id} className="pet-card">
                                    {/* Image + Overlays */}
                                    <div className="pet-image">
                                        <img
                                            src={pet.image || pet.images?.[0] || 'https://via.placeholder.com/300x200?text=No+Image'}
                                            alt={pet.name}
                                        />
                                        <span className={`status-badge ${pet.adoptionStatus.toLowerCase()}`}>
                                            {pet.adoptionStatus}
                                        </span>
                                        {pet.urgent && (
                                            <div className="urgent-ribbon">
                                                <FaExclamationTriangle size={10} /> Urgent!
                                            </div>
                                        )}
                                    </div>

                                    {/* Card Body */}
                                    <div className="pet-info">
                                        {/* Name + Poster badge row */}
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
                                            <h3 style={{ margin: 0 }}>{pet.name}</h3>
                                            <PosterBadge postedBy={pet.postedBy} />
                                        </div>

                                        {/* Posted by name */}
                                        {pet.postedBy && (
                                            <p style={{ fontSize: '0.78rem', color: '#888', margin: '0 0 6px' }}>
                                                by {pet.postedBy.name}
                                            </p>
                                        )}

                                        {/* Breed · Age · Gender */}
                                        <p className="breed">
                                            {pet.breed} &bull; {pet.age} &bull; {pet.gender === 'Male' ? '♂' : '♀'} {pet.gender}
                                        </p>

                                        {/* Location */}
                                        <div className="location">
                                            <FaMapMarkerAlt /> {pet.location}
                                        </div>

                                        {/* Vaccination + Health chips */}
                                        <div className="chip-row">
                                            {pet.vaccinated ? (
                                                <span className="chip chip-green"><FaCheckCircle size={10} /> Vaccinated</span>
                                            ) : (
                                                <span className="chip chip-grey"><FaTimesCircle size={10} /> Not Vaccinated</span>
                                            )}
                                            <span className={`chip ${pet.healthStatus === 'Healthy' ? 'chip-blue' : 'chip-orange'}`}>
                                                {pet.healthStatus === 'Healthy' ? '💚' : '🩺'} {pet.healthStatus}
                                            </span>
                                        </div>

                                        {/* Personality pills */}
                                        {pet.personalities && (
                                            <div className="personality-row">
                                                {pet.personalities.slice(0, 3).map(tag => (
                                                    <span key={tag} className="personality-pill">{tag}</span>
                                                ))}
                                            </div>
                                        )}

                                        <Link to={`/pet/${pet._id}`} className="btn-details">View Details →</Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </>
            )}

            <style>{`
                .pet-find-header {
                    text-align: center;
                    margin-bottom: 2rem;
                    background: linear-gradient(rgba(0,0,0,0.48), rgba(0,0,0,0.48)),
                        url('https://images.unsplash.com/photo-1450778869180-41d0601e046e?auto=format&fit=crop&w=1950&q=80');
                    background-size: cover;
                    background-position: center;
                    color: white;
                    padding: 4rem 1rem;
                    border-radius: var(--radius-md);
                }
                .pet-find-header h1 { font-size: 3rem; margin-bottom: 0.5rem; color: white; }
                .pet-find-header p  { font-size: 1.2rem; opacity: 0.9; }

                .search-filter-bar {
                    background: var(--color-surface);
                    padding: 1.25rem 1.5rem;
                    border-radius: var(--radius-md);
                    box-shadow: var(--shadow-sm);
                    margin-bottom: 1.5rem;
                    display: flex;
                    flex-wrap: wrap;
                    gap: 1rem;
                    align-items: center;
                    justify-content: space-between;
                }
                .search-input { position: relative; flex: 1; min-width: 220px; }
                .search-input input {
                    width: 100%;
                    padding: 0.7rem 1rem 0.7rem 2.4rem;
                    border: 1px solid var(--color-border);
                    border-radius: var(--radius-full);
                    font-size: 0.95rem;
                }
                .search-input .icon {
                    position: absolute; left: 0.85rem; top: 50%;
                    transform: translateY(-50%); color: var(--color-text-light);
                }
                .filter-select {
                    padding: 0.65rem 0.9rem;
                    border: 1px solid var(--color-border);
                    border-radius: var(--radius-md);
                    background: white;
                    font-size: 0.88rem;
                    cursor: pointer;
                }

                .pet-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(290px, 1fr));
                    gap: 1.75rem;
                }
                .pet-card {
                    background: var(--color-surface);
                    border-radius: var(--radius-lg);
                    overflow: hidden;
                    box-shadow: var(--shadow-md);
                    transition: transform 0.22s, box-shadow 0.22s;
                }
                .pet-card:hover { transform: translateY(-6px); box-shadow: var(--shadow-lg); }

                .pet-image { height: 210px; width: 100%; position: relative; }
                .pet-image img { width: 100%; height: 100%; object-fit: cover; }

                .status-badge {
                    position: absolute; top: 0.8rem; right: 0.8rem;
                    background: rgba(255,255,255,0.92);
                    padding: 3px 10px; border-radius: var(--radius-full);
                    font-size: 0.75rem; font-weight: 700; text-transform: uppercase;
                }
                .status-badge.available { color: #16a34a; }
                .status-badge.adopted   { color: #dc2626; }

                .urgent-ribbon {
                    position: absolute; top: 0.8rem; left: 0;
                    background: #dc2626; color: white;
                    font-size: 0.72rem; font-weight: 700;
                    padding: 3px 10px 3px 8px;
                    border-radius: 0 20px 20px 0;
                    display: flex; align-items: center; gap: 4px;
                }

                .pet-info { padding: 1.2rem 1.25rem 1.35rem; }
                .pet-info h3 { font-size: 1.15rem; color: var(--color-primary-dark); }
                .pet-info .breed { color: var(--color-text-light); font-size: 0.85rem; margin: 4px 0 8px; }
                .pet-info .location {
                    display: flex; align-items: center; gap: 5px;
                    color: var(--color-text-secondary); font-size: 0.85rem; margin-bottom: 10px;
                }

                /* Chips */
                .chip-row { display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 10px; }
                .chip {
                    display: inline-flex; align-items: center; gap: 4px;
                    font-size: 0.72rem; font-weight: 600;
                    padding: 3px 9px; border-radius: 20px;
                }
                .chip-green  { background: #dcfce7; color: #15803d; }
                .chip-grey   { background: #f3f4f6; color: #6b7280; }
                .chip-blue   { background: #dbeafe; color: #1e40af; }
                .chip-orange { background: #fff7ed; color: #c2410c; }

                /* Personality pills */
                .personality-row { display: flex; gap: 5px; flex-wrap: wrap; margin-bottom: 14px; }
                .personality-pill {
                    background: #fdf4eb; color: #92400e;
                    font-size: 0.7rem; font-weight: 600;
                    padding: 2px 9px; border-radius: 20px;
                    border: 1px solid #f0d9be;
                }

                .btn-details {
                    display: block; text-align: center;
                    background: var(--color-primary); color: white;
                    padding: 0.65rem; border-radius: var(--radius-md);
                    text-decoration: none; font-weight: 600;
                    transition: background 0.2s;
                }
                .btn-details:hover { background: var(--color-primary-dark); }

                .empty-state { text-align: center; padding: 4rem 1rem; color: #aaa; }
                .empty-state h3 { margin: 1rem 0 0.5rem; color: #888; }

                @media (max-width: 600px) {
                    .search-filter-bar { flex-direction: column; }
                    .pet-grid { grid-template-columns: 1fr; }
                }
            `}</style>
        </div>
    );
}

export default PetFind;
