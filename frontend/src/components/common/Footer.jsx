import React, { useState } from 'react';
import { FaFilter, FaTimes } from 'react-icons/fa';

const AdvancedSearch = ({ onFilterChange }) => {
    const [filters, setFilters] = useState({
        type: '',
        breed: '',
        gender: '',
        age: '',
        listingType: '',
        location: ''
    });

    const [isExpanded, setIsExpanded] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        const newFilters = { ...filters, [name]: value };
        setFilters(newFilters);
        onFilterChange(newFilters);
    };

    const clearFilters = () => {
        const reset = { type: '', breed: '', gender: '', age: '', listingType: '', location: '' };
        setFilters(reset);
        onFilterChange(reset);
    };

    const hasActiveFilters = Object.values(filters).some(v => v !== '');
    const activeCount = Object.values(filters).filter(v => v !== '').length;

    return (
        <div className="adv-filter-container">
            <div className="adv-filter-header">
                <div className="adv-filter-title">
                    <FaFilter size={13} />
                    <span>Filters</span>
                    {hasActiveFilters && (
                        <span className="adv-filter-count">{activeCount}</span>
                    )}
                </div>
                <button className="adv-toggle-btn" onClick={() => setIsExpanded(!isExpanded)}>
                    {isExpanded ? 'Hide' : 'Show Filters'}
                </button>
            </div>

            {isExpanded && (
                <div className="adv-filter-body">
                    <div className="adv-filter-grid">
                        {/* Pet Type */}
                        <div className="adv-filter-group">
                            <label>Pet Type</label>
                            <select name="type" value={filters.type} onChange={handleChange}>
                                <option value="">All Types</option>
                                <option value="Dog">🐕 Dog</option>
                                <option value="Cat">🐈 Cat</option>
                                <option value="Others">🐾 Others</option>
                            </select>
                        </div>

                        {/* Breed - Back to Select for "Category Narrowing" */}
                        <div className="adv-filter-group">
                            <label>Breed Type</label>
                            <select name="breed" value={filters.breed} onChange={handleChange}>
                                <option value="">Any Breed</option>
                                <option value="Golden Retriever">Golden Retriever</option>
                                <option value="German Shepherd">German Shepherd</option>
                                <option value="Labrador">Labrador</option>
                                <option value="Pug">Pug</option>
                                <option value="Husky">Husky</option>
                                <option value="Persian">Persian Cat</option>
                                <option value="Siamese">Siamese Cat</option>
                                <option value="Indie/Mixed">Indie / Mixed</option>
                            </select>
                        </div>

                        {/* Gender */}
                        <div className="adv-filter-group">
                            <label>Gender</label>
                            <select name="gender" value={filters.gender} onChange={handleChange}>
                                <option value="">Any Gender</option>
                                <option value="Male">♂ Male</option>
                                <option value="Female">♀ Female</option>
                            </select>
                        </div>

                        {/* Age Range - Back to Selection for true filtering */}
                        <div className="adv-filter-group">
                            <label>Age Range</label>
                            <select name="age" value={filters.age} onChange={handleChange}>
                                <option value="">Any Age</option>
                                <option value="Puppy/Kitten">Puppy/Kitten (0-1 yr)</option>
                                <option value="Young">Young (1-3 yrs)</option>
                                <option value="Adult">Adult (3-7 yrs)</option>
                                <option value="Senior">Senior (7+ yrs)</option>
                            </select>
                        </div>

                        {/* Listing Type */}
                        <div className="adv-filter-group">
                            <label>Listing Type</label>
                            <select name="listingType" value={filters.listingType} onChange={handleChange}>
                                <option value="">All Listings</option>
                                <option value="Adoption">🏠 Adoption (Free)</option>
                                <option value="Sale">🛒 For Sale</option>
                                <option value="Rehoming">🔄 Rehoming</option>
                            </select>
                        </div>

                        {/* Location - Back to City Selection */}
                        <div className="adv-filter-group">
                            <label>Region</label>
                            <select name="location" value={filters.location} onChange={handleChange}>
                                <option value="">All Regions</option>
                                <option value="Kathmandu">Kathmandu</option>
                                <option value="Lalitpur">Lalitpur</option>
                                <option value="Pokhara">Pokhara</option>
                                <option value="Biratnagar">Biratnagar</option>
                                <option value="Dharan">Dharan</option>
                                <option value="Itahari">Itahari</option>
                                <option value="Chitwan">Chitwan</option>
                                <option value="Butwal">Butwal</option>
                            </select>
                        </div>
                    </div>

                    {/* Clear */}
                    {hasActiveFilters && (
                        <div className="adv-filter-actions">
                            <button className="adv-clear-btn" onClick={clearFilters}>
                                <FaTimes size={11} /> Clear All Filters
                            </button>
                        </div>
                    )}
                </div>
            )}

            <style>{`
                .adv-filter-container {
                    background: white;
                    border-radius: 16px;
                    border: 1px solid #f0f0f0;
                    margin-bottom: 2rem;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.04);
                    overflow: hidden;
                }
                .adv-filter-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 1rem 1.5rem;
                }
                .adv-filter-title {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    font-size: 0.95rem;
                    font-weight: 700;
                    color: #3E2723;
                }
                .adv-filter-count {
                    background: #5D4037;
                    color: white;
                    font-size: 0.7rem;
                    font-weight: 800;
                    width: 20px;
                    height: 20px;
                    border-radius: 50%;
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                }
                .adv-toggle-btn {
                    background: none;
                    border: 1.5px solid #e0e0e0;
                    padding: 6px 16px;
                    border-radius: 20px;
                    cursor: pointer;
                    font-size: 0.82rem;
                    font-weight: 600;
                    color: #5D4037;
                    transition: all 0.2s;
                }
                .adv-toggle-btn:hover {
                    background: #5D4037;
                    color: white;
                    border-color: #5D4037;
                }
                .adv-filter-body {
                    padding: 0 1.5rem 1.5rem;
                    border-top: 1px solid #f5f5f5;
                }
                .adv-filter-grid {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 1.25rem;
                    padding-top: 1.25rem;
                }
                .adv-filter-group {
                    display: flex;
                    flex-direction: column;
                    gap: 6px;
                }
                .adv-filter-group label {
                    font-size: 0.78rem;
                    font-weight: 700;
                    color: #888;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }
                .adv-filter-group select, .adv-filter-group input {
                    padding: 10px 12px;
                    border: 1.5px solid #e8e8e8;
                    border-radius: 10px;
                    font-size: 0.9rem;
                    font-weight: 500;
                    color: #333;
                    background: #fafafa;
                    cursor: text;
                    transition: border-color 0.2s, box-shadow 0.2s;
                    width: 100%;
                    box-sizing: border-box;
                }
                .adv-filter-group select {
                    cursor: pointer;
                    appearance: auto;
                }
                .adv-filter-group select:focus, .adv-filter-group input:focus {
                    outline: none;
                    border-color: #5D4037;
                    box-shadow: 0 0 0 3px rgba(93, 64, 55, 0.1);
                }
                .adv-filter-actions {
                    display: flex;
                    justify-content: flex-end;
                    margin-top: 1.25rem;
                    padding-top: 1rem;
                    border-top: 1px solid #f5f5f5;
                }
                .adv-clear-btn {
                    display: inline-flex;
                    align-items: center;
                    gap: 6px;
                    background: #FFF5F5;
                    color: #C53030;
                    border: 1px solid #FED7D7;
                    padding: 8px 18px;
                    border-radius: 10px;
                    cursor: pointer;
                    font-size: 0.82rem;
                    font-weight: 700;
                    transition: all 0.2s;
                }
                .adv-clear-btn:hover {
                    background: #FED7D7;
                }
                @media (max-width: 768px) {
                    .adv-filter-grid {
                        grid-template-columns: repeat(2, 1fr);
                    }
                }
                @media (max-width: 480px) {
                    .adv-filter-grid {
                        grid-template-columns: 1fr;
                    }
                }
            `}</style>
        </div>
    );
};

export default AdvancedSearch;
