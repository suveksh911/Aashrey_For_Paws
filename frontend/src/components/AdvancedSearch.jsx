import React, { useState } from 'react';
import { FaFilter, FaSearch, FaTimes } from 'react-icons/fa';

const AdvancedSearch = ({ onFilterChange }) => {
    const [filters, setFilters] = useState({
        breed: '',
        age: '',
        gender: '',
        distance: 50, // Default 50km
        type: ''
    });

    const [isExpanded, setIsExpanded] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        const newFilters = { ...filters, [name]: value };
        setFilters(newFilters);
        onFilterChange(newFilters);
    };

    const clearFilters = () => {
        const reset = { breed: '', age: '', gender: '', distance: 50, type: '' };
        setFilters(reset);
        onFilterChange(reset);
    };

    const BREEDS = ['Golden Retriever', 'German Shepherd', 'Persian', 'Siamese', 'Labrador', 'Husky', 'Beagle', 'Pug', 'Indie/Mixed'];

    return (
        <div className="advanced-search-container">
            <div className="search-header">
                <h3><FaFilter /> Advanced Filters</h3>
                <button className="toggle-btn" onClick={() => setIsExpanded(!isExpanded)}>
                    {isExpanded ? 'Hide Filters' : 'Show Filters'}
                </button>
            </div>

            {isExpanded && (
                <div className="filters-grid">
                    <div className="filter-group">
                        <label>Pet Type</label>
                        <select name="type" value={filters.type} onChange={handleChange}>
                            <option value="">All Types</option>
                            <option value="Dog">Dog</option>
                            <option value="Cat">Cat</option>
                            <option value="Others">Others</option>
                        </select>
                    </div>

                    <div className="filter-group">
                        <label>Breed</label>
                        <select name="breed" value={filters.breed} onChange={handleChange}>
                            <option value="">Any Breed</option>
                            {BREEDS.map(b => <option key={b} value={b}>{b}</option>)}
                        </select>
                    </div>

                    <div className="filter-group">
                        <label>Gender</label>
                        <select name="gender" value={filters.gender} onChange={handleChange}>
                            <option value="">Any Gender</option>
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                        </select>
                    </div>

                    <div className="filter-group">
                        <label>Age Range</label>
                        <select name="age" value={filters.age} onChange={handleChange}>
                            <option value="">Any Age</option>
                            <option value="Puppy/Kitten">Puppy/Kitten (&lt; 1 year)</option>
                            <option value="Young">Young (1-3 years)</option>
                            <option value="Adult">Adult (3-8 years)</option>
                            <option value="Senior">Senior (8+ years)</option>
                        </select>
                    </div>

                    <div className="filter-group range-group">
                        <label>Distance: {filters.distance} km</label>
                        <input
                            type="range"
                            name="distance"
                            min="5"
                            max="100"
                            step="5"
                            value={filters.distance}
                            onChange={handleChange}
                        />
                        <div className="range-labels">
                            <span>5km</span>
                            <span>100km</span>
                        </div>
                    </div>

                    <div className="filter-actions">
                        <button className="btn-clear" onClick={clearFilters}>
                            <FaTimes /> Clear Filters
                        </button>
                    </div>
                </div>
            )}

            <style>{`
                .advanced-search-container {
                    background: white;
                    padding: 1rem;
                    border-radius: 8px;
                    box-shadow: 0 2px 5px rgba(0,0,0,0.05);
                    margin-bottom: 2rem;
                    border: 1px solid #eee;
                }
                .search-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }
                .search-header h3 {
                    margin: 0;
                    font-size: 1.1rem;
                    color: var(--color-text-dark);
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }
                .toggle-btn {
                    background: none;
                    border: 1px solid #ddd;
                    padding: 5px 12px;
                    border-radius: 20px;
                    cursor: pointer;
                    font-size: 0.9rem;
                }
                .filters-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
                    gap: 1.5rem;
                    margin-top: 1.5rem;
                    padding-top: 1rem;
                    border-top: 1px solid #f0f0f0;
                }
                .filter-group {
                    display: flex;
                    flex-direction: column;
                    gap: 5px;
                }
                .filter-group label {
                    font-size: 0.9rem;
                    font-weight: 600;
                    color: #555;
                }
                .filter-group select {
                    padding: 8px;
                    border: 1px solid #ddd;
                    border-radius: 4px;
                    width: 100%;
                }
                .range-group input {
                    width: 100%;
                }
                .range-labels {
                    display: flex;
                    justify-content: space-between;
                    font-size: 0.75rem;
                    color: #888;
                }
                .filter-actions {
                    display: flex;
                    align-items: flex-end;
                }
                .btn-clear {
                    background: #f8d7da;
                    color: #721c24;
                    border: none;
                    padding: 8px 15px;
                    border-radius: 4px;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    gap: 5px;
                    font-weight: 600;
                    font-size: 0.9rem;
                }
                .btn-clear:hover {
                    background: #f5c6cb;
                }
            `}</style>
        </div>
    );
};

export default AdvancedSearch;
