import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/axios';
import { toast } from 'react-toastify';
import { FaSearch, FaMapMarkerAlt, FaPaw, FaCheckCircle, FaTimesCircle, FaExclamationTriangle, FaBuilding, FaUser, FaStore, FaStar, FaFilter } from 'react-icons/fa';
import AdvancedSearch from '../components/pet/AdvancedSearch';
import NGOVerifiedBadge from '../components/ngo/NGOVerifiedBadge';
import Skeleton from '../components/common/Skeleton';


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
    const [showFilters, setShowFilters] = useState(false);
    const [filters, setFilters] = useState({
        category: '', breed: '', age: '', gender: '', location: '', search: '', listingType: ''
    });

    useEffect(() => { fetchPets(); }, []);
    useEffect(() => { applyFilters(); }, [filters, pets]);

    const activeFiltersCount = Object.entries(filters).filter(([k, v]) => k !== 'search' && v && v.trim() !== '').length;

    const fetchPets = async () => {
        setLoading(true);
        try {
            const response = await api.get('/pets');
            if (response.data.success) {
                setPets(response.data.data);
                setFilteredPets(response.data.data);
            } else {
                setPets([]);
                setFilteredPets([]);
            }
        } catch (err) {
            toast.error("Could not connect to server. Please check your internet connection.");
            setPets([]);
            setFilteredPets([]);
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    const applyFilters = () => {
        // Only show pets that are available or pending, and exclude Lost & Found types
        let result = pets.filter(p => !['Adopted', 'Reunited'].includes(p.status) && p.type !== 'Lost' && p.type !== 'Found');
        if (filters.search) {
            const s = filters.search.toLowerCase();
            result = result.filter(p =>
                (p.name || '').toLowerCase().includes(s) ||
                (p.breed || '').toLowerCase().includes(s) ||
                (p.location || '').toLowerCase().includes(s)
            );
        }
        if (filters.category) result = result.filter(p => p.category === filters.category);
        if (filters.listingType) result = result.filter(p => p.listingType === filters.listingType || p.type === filters.listingType);
        if (filters.gender) result = result.filter(p => p.gender === filters.gender);
        if (filters.location) result = result.filter(p => (p.location || '').toLowerCase().includes(filters.location.toLowerCase()));
        
        // Advanced filters
        if (filters.breed) result = result.filter(p => (p.breed || '').toLowerCase().includes(filters.breed.toLowerCase()));
        
        if (filters.age) {
            if (filters.age.includes('Puppy') || filters.age.includes('Kitten')) {
                result = result.filter(p => parseInt(p.age) <= 1 || p.age.toLowerCase().includes('month'));
            } else if (filters.age.includes('Young')) {
                result = result.filter(p => parseInt(p.age) > 1 && parseInt(p.age) <= 3 && !p.age.toLowerCase().includes('month'));
            } else if (filters.age.includes('Adult')) {
                result = result.filter(p => parseInt(p.age) > 3 && parseInt(p.age) <= 8);
            } else if (filters.age.includes('Senior')) {
                result = result.filter(p => parseInt(p.age) > 8);
            }
        }
        
        // Fallback distance calculation.
        // Pending HTML5 geolocation integration for precise distance filtering.
        // For now, distance filter won't aggressively hide pets unless combined with a specific user lat/lng.
        // if (filters.distance) {}

        if (filters.posterType) result = result.filter(p => p.postedBy?.type === filters.posterType);
        if (filters.listingType) result = result.filter(p => (p.listingType || 'Adoption') === filters.listingType);
        setFilteredPets(result);
    };

    return (
        <div className="container" style={{ padding: '2rem' }}>
            {/* Hero Header */}
            <div className="pet-find-header">
                <h1>Find a Friend 🐾</h1>
                <p>Browse pets available for adoption near you.</p>
            </div>

            {/* Unified Control Bar */}
            <div className="unified-control-bar">
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
                <div className="control-actions">
                    <button 
                        className={`control-btn ${showFilters ? 'active' : ''}`}
                        onClick={() => setShowFilters(!showFilters)}
                    >
                        <FaFilter /> Filters {activeFiltersCount > 0 && <span className="badge">{activeFiltersCount}</span>}
                    </button>
                </div>
            </div>

            {/* Advanced Filters Container */}
            {showFilters && (
                <AdvancedSearch onFilterChange={(newFilters) => setFilters(prev => ({ ...prev, ...newFilters }))} hideHeader={true} />
            )}

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
                                            src={pet.image || pet.images?.[0] || 'https://placehold.co/600x400/5d4037/FFF?text=Image+Unavailable'}
                                            alt={pet.name}
                                            onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/600x400/5d4037/FFF?text=Image+Unavailable'; }}
                                        />
                                        <span className={`status-badge ${(pet.status || 'Available').toLowerCase()}`}>
                                            {pet.status || 'Available'}
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
                                            <h3 style={{ margin: 0 }}>
                                                {pet.name} <NGOVerifiedBadge isVerified={pet.ngoVerified} compact />
                                            </h3>
                                            <PosterBadge postedBy={pet.postedBy} />
                                        </div>

                                        {/* Posted by name + Rating */}
                                        {pet.postedBy && (
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                                                <p style={{ fontSize: '0.78rem', color: '#888', margin: 0 }}>
                                                    by <span style={{ fontWeight: 600 }}>{pet.postedBy.name}</span>
                                                </p>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '3px', background: '#fdf4eb', padding: '1px 6px', borderRadius: '4px' }}>
                                                    <FaStar size={9} color="#ffc107" />
                                                    <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#92400e' }}>
                                                        {pet.postedBy.avgRating?.toFixed(1) || '0.0'}
                                                    </span>
                                                    <span style={{ fontSize: '0.65rem', color: '#92400e', opacity: 0.7 }}>
                                                        ({pet.postedBy.reviewCount || 0})
                                                    </span>
                                                </div>
                                            </div>
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
                                            {pet.status === 'Adopted' && (
                                                <span style={{ background: '#dcfce7', color: '#15803d', fontSize: '0.7rem', fontWeight: 700, padding: '2px 8px', borderRadius: '20px', border: '1px solid #22c55e' }}>
                                                    ✅ Adopted
                                                </span>
                                            )}
                                            {pet.listingType === 'Sale' && pet.status !== 'Adopted' && (
                                                <span style={{ background: '#FFF3CD', color: '#856404', fontSize: '0.7rem', fontWeight: 700, padding: '2px 8px', borderRadius: '20px', border: '1px solid #ffc107' }}>
                                                    🛒 For Sale {pet.price ? `· Rs.${pet.price.toLocaleString()}` : ''}
                                                </span>
                                            )}
                                            {pet.quantity > 1 && pet.status !== 'Adopted' && (
                                                <span style={{ background: '#f0fdf4', color: '#15803d', fontSize: '0.7rem', fontWeight: 700, padding: '2px 8px', borderRadius: '20px', border: '1px solid #dcfce7' }}>
                                                    🔢 {pet.quantity} Available
                                                </span>
                                            )}
                                            {pet.listingType === 'Rehoming' && pet.status !== 'Adopted' && (
                                                <span style={{ background: '#cfe2ff', color: '#0a58ca', fontSize: '0.7rem', fontWeight: 700, padding: '2px 8px', borderRadius: '20px', border: '1px solid #b6d4fe' }}>
                                                    🔄 Rehoming
                                                </span>
                                            )}
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

                .unified-control-bar {
                    background: white;
                    padding: 0.85rem 1.25rem;
                    border-radius: 16px;
                    box-shadow: 0 4px 15px rgba(0,0,0,0.06);
                    margin-bottom: 2rem;
                    display: flex;
                    flex-wrap: wrap;
                    gap: 1rem;
                    align-items: center;
                    justify-content: space-between;
                    border: 1px solid rgba(0,0,0,0.04);
                }
                .search-input { position: relative; flex: 1; min-width: 250px; }
                .search-input input {
                    width: 100%;
                    padding: 0.75rem 1rem 0.75rem 2.8rem;
                    border: 1.5px solid #e5e7eb;
                    border-radius: 12px;
                    font-size: 0.95rem;
                    box-sizing: border-box;
                    background: #f9fafb;
                    transition: all 0.2s;
                }
                .search-input input:focus {
                    outline: none;
                    border-color: #8D6E63;
                    background: white;
                    box-shadow: 0 0 0 3px rgba(141, 110, 99, 0.1);
                }
                .search-input .icon {
                    position: absolute; left: 1rem; top: 50%;
                    transform: translateY(-50%); color: #9ca3af;
                }
                .control-actions {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                }
                .control-btn {
                    display: inline-flex;
                    align-items: center;
                    gap: 8px;
                    background: #fff;
                    border: 1.5px solid #e5e7eb;
                    padding: 0.75rem 1.25rem;
                    border-radius: 12px;
                    font-size: 0.9rem;
                    font-weight: 700;
                    color: #4b5563;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                .control-btn:hover {
                    border-color: #d1d5db;
                    background: #f9fafb;
                    color: #111827;
                }
                .control-btn.active {
                    background: #8D6E63;
                    color: white;
                    border-color: #8D6E63;
                }
                .control-btn .badge {
                    background: #5D4037;
                    color: white;
                    border-radius: 50%;
                    width: 20px;
                    height: 20px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 0.7rem;
                    margin-left: 2px;
                }
                .control-btn.active .badge {
                    background: white;
                    color: #8D6E63;
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
                    transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275), box-shadow 0.3s ease;
                }
                .pet-card:hover { transform: translateY(-8px); box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04); }

                .pet-image { height: 210px; width: 100%; position: relative; overflow: hidden; }
                .pet-image img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.5s ease; }
                .pet-card:hover .pet-image img { transform: scale(1.08); }

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

                @media (max-width: 768px) {
                    .unified-control-bar { flex-direction: column; align-items: stretch; }
                    .control-actions { width: 100%; justify-content: stretch; }
                    .control-btn { flex: 1; justify-content: center; }
                    .pet-grid { grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); }
                }
            `}</style>
        </div>
    );
}

export default PetFind;
