import React, { useState } from 'react';

const PetFilter = ({ onFilterChange }) => {
    const [filters, setFilters] = useState({
        type: '',
        breed: '',
        age: '',
        gender: '',
        location: ''
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        const newFilters = { ...filters, [name]: value };
        setFilters(newFilters);
        onFilterChange(newFilters);
    };

    return (
        <div className="pet-filter" style={{
            backgroundColor: '#fff',
            padding: '20px',
            borderRadius: '8px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            marginBottom: '2rem'
        }}>
            <h3 style={{ marginBottom: '15px' }}>Filter Pets</h3>
            <div className="filter-grid">
                <div className="filter-group">
                    <label>Breed</label>
                    <input
                        type="text"
                        name="breed"
                        placeholder="e.g. Labrador"
                        value={filters.breed}
                        onChange={handleChange}
                    />
                </div>
                <div className="filter-group">
                    <label>Type</label>
                    <select name="type" value={filters.type} onChange={handleChange}>
                        <option value="">Any</option>
                        <option value="Dog">Dog</option>
                        <option value="Cat">Cat</option>
                        <option value="Bird">Bird</option>
                        <option value="Other">Other</option>
                    </select>
                </div>
                <div className="filter-group">
                    <label>Age</label>
                    <select name="age" value={filters.age} onChange={handleChange}>
                        <option value="">Any</option>
                        <option value="Puppy">Puppy/Kitten</option>
                        <option value="Young">Young</option>
                        <option value="Adult">Adult</option>
                        <option value="Senior">Senior</option>
                    </select>
                </div>
                <div className="filter-group">
                    <label>Gender</label>
                    <select name="gender" value={filters.gender} onChange={handleChange}>
                        <option value="">Any</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                    </select>
                </div>
                <div className="filter-group">
                    <label>Location</label>
                    <input
                        type="text"
                        name="location"
                        placeholder="e.g. Kathmandu"
                        value={filters.location}
                        onChange={handleChange}
                    />
                </div>
            </div>
            <style>{`
                .filter-grid {
                    display: grid;
                    grid-template-columns: 1fr;
                    gap: 15px;
                }
                @media (min-width: 600px) {
                    .filter-grid {
                        grid-template-columns: repeat(2, 1fr);
                    }
                }
                @media (min-width: 900px) {
                    .filter-grid {
                        grid-template-columns: repeat(4, 1fr);
                    }
                }
                .filter-group {
                    display: flex;
                    flex-direction: column;
                }
                .filter-group label {
                    font-size: 0.9rem;
                    margin-bottom: 5px;
                    font-weight: bold;
                    color: #5d4037;
                }
                .filter-group input, .filter-group select {
                    padding: 8px;
                    border: 1px solid #ccc;
                    border-radius: 4px;
                    font-size: 1rem;
                }
            `}</style>
        </div>
    );
};

export default PetFilter;
