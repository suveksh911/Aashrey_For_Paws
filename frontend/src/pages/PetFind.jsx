import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

function PetFind() {
    const [pets, setPets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('All');
    const navigate = useNavigate();

    useEffect(() => {
        fetchPets();
    }, []);

    const fetchPets = async () => {
        try {
            const response = await fetch('http://localhost:5000/pets?type=Adoption');
            const result = await response.json();
            if (result.success) {
                setPets(result.data);
            }
        } catch (err) {
            console.error("Failed to fetch pets");
        } finally {
            setLoading(false);
        }
    };

    const filteredPets = filter === 'All' ? pets : pets.filter(pet => pet.category === filter);

    return (
        <div className="pet-find-page container">
            <div className="page-header">
                <h1>Find a Friend</h1>
                <p>Browse our available pets and find your perfect match.</p>

                <div className="filter-tabs">
                    {['All', 'Dog', 'Cat', 'Other'].map(type => (
                        <button
                            key={type}
                            className={`filter-btn ${filter === type ? 'active' : ''}`}
                            onClick={() => setFilter(type)}
                        >
                            {type}
                        </button>
                    ))}
                </div>
            </div>

            {loading ? (
                <div className="loading">Loading pets...</div>
            ) : (
                <div className="pets-grid">
                    {filteredPets.length > 0 ? filteredPets.map(pet => (
                        <div className="pet-card" key={pet._id} onClick={() => navigate(`/pet/${pet._id}`)}>
                            <div className="pet-image">
                                <img src={pet.image} alt={pet.name} />
                                <span className="status-tag">{pet.status}</span>
                            </div>
                            <div className="pet-info">
                                <h3>{pet.name}</h3>
                                <p className="pet-breed">{pet.breed} • {pet.age}</p>
                                <p className="pet-location">📍 {pet.location}</p>
                            </div>
                        </div>
                    )) : (
                        <div className="no-pets">No pets found in this category.</div>
                    )}
                </div>
            )}

            <style>{`
                .pet-find-page {
                    padding: 4rem 1rem;
                }
                .page-header {
                    text-align: center;
                    margin-bottom: 3rem;
                }
                .page-header h1 {
                    font-size: 2.5rem;
                    color: var(--color-primary-dark);
                    margin-bottom: 1rem;
                }
                .filter-tabs {
                    display: flex;
                    justify-content: center;
                    gap: 1rem;
                    margin-top: 2rem;
                    flex-wrap: wrap;
                }
                .filter-btn {
                    padding: 0.5rem 1.5rem;
                    border: 2px solid var(--color-primary);
                    border-radius: var(--radius-lg);
                    background: transparent;
                    color: var(--color-primary);
                    font-weight: 600;
                    transition: all 0.3s ease;
                }
                .filter-btn.active, .filter-btn:hover {
                    background: var(--color-primary);
                    color: white;
                }
                
                .pets-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
                    gap: 2rem;
                }
                .pet-card {
                    background: var(--color-surface);
                    border-radius: var(--radius-md);
                    overflow: hidden;
                    box-shadow: var(--shadow-sm);
                    transition: transform 0.3s ease;
                    cursor: pointer;
                    border: 1px solid var(--color-border);
                }
                .pet-card:hover {
                    transform: translateY(-5px);
                    box-shadow: var(--shadow-md);
                }
                .pet-image {
                    height: 250px;
                    overflow: hidden;
                    position: relative;
                }
                .pet-image img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }
                .status-tag {
                    position: absolute;
                    top: 10px;
                    right: 10px;
                    background: rgba(255, 255, 255, 0.9);
                    padding: 4px 8px;
                    border-radius: 4px;
                    font-size: 0.8rem;
                    font-weight: 600;
                    color: var(--color-primary-dark);
                }
                .pet-info {
                    padding: 1.5rem;
                }
                .pet-info h3 {
                    color: var(--color-text);
                    margin-bottom: 0.25rem;
                }
                .pet-breed {
                    color: var(--color-text-light);
                    font-size: 0.9rem;
                    margin-bottom: 0.5rem;
                }
                .pet-location {
                    font-size: 0.85rem;
                    color: var(--color-primary);
                }
                .loading, .no-pets {
                    text-align: center;
                    padding: 3rem;
                    color: var(--color-text-light);
                }
            `}</style>
        </div>
    );
}

export default PetFind;
