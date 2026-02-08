import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import NGOPetListings from '../components/NGOPetListings';
import NGOAdoptionRequests from '../components/NGOAdoptionRequests';
import NGOProfile from '../components/NGOProfile';
import '../components/Navbar.css'; 

function NGODashboard() {
    const [activeTab, setActiveTab] = useState('listings');

    return (
        <div className="container" style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
            <div className="dashboard-header" style={{ marginBottom: '2rem' }}>
                <h1>NGO Dashboard</h1>
                <p>Manage your pet listings and adoption requests.</p>
            </div>

            <div className="dashboard-tabs" style={{ display: 'flex', borderBottom: '1px solid #ddd', marginBottom: '20px' }}>
                <button
                    className={`tab-btn ${activeTab === 'listings' ? 'active' : ''}`}
                    onClick={() => setActiveTab('listings')}
                    style={tabStyle(activeTab === 'listings')}
                >
                    My Listings
                </button>
                <button
                    className={`tab-btn ${activeTab === 'requests' ? 'active' : ''}`}
                    onClick={() => setActiveTab('requests')}
                    style={tabStyle(activeTab === 'requests')}
                >
                    Adoption Requests
                </button>
                <button
                    className={`tab-btn ${activeTab === 'profile' ? 'active' : ''}`}
                    onClick={() => setActiveTab('profile')}
                    style={tabStyle(activeTab === 'profile')}
                >
                    Organization Profile
                </button>
            </div>

            <div className="dashboard-content">
                {activeTab === 'listings' && <NGOPetListings />}
                {activeTab === 'requests' && <NGOAdoptionRequests />}
                {activeTab === 'profile' && <NGOProfile />}
            </div>
        </div>
    );
}

const tabStyle = (isActive) => ({
    padding: '10px 20px',
    border: 'none',
    borderBottom: isActive ? '3px solid #5d4037' : '3px solid transparent',
    backgroundColor: 'transparent',
    fontSize: '1rem',
    fontWeight: isActive ? 'bold' : 'normal',
    color: isActive ? '#5d4037' : '#666',
    cursor: 'pointer',
    marginRight: '10px',
    transition: 'all 0.3s'
});

export default NGODashboard;
