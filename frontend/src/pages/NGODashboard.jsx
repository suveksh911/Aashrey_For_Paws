import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import NGOPetListings from '../components/NGOPetListings';
import AdoptionRequestsManager from '../components/AdoptionRequestsManager';
import NGOProfile from '../components/NGOProfile';
import VerificationStatus from './VerificationStatus';
import '../components/Navbar.css';

import NGOCampaignsManager from '../components/NGOCampaignsManager';

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
                    className={`tab-btn ${activeTab === 'campaigns' ? 'active' : ''}`}
                    onClick={() => setActiveTab('campaigns')}
                    style={tabStyle(activeTab === 'campaigns')}
                >
                    Campaigns
                </button>
                <button
                    className={`tab-btn ${activeTab === 'profile' ? 'active' : ''}`}
                    onClick={() => setActiveTab('profile')}
                    style={tabStyle(activeTab === 'profile')}
                >
                    Profile
                </button>
                <button
                    className={`tab-btn ${activeTab === 'verification' ? 'active' : ''}`}
                    onClick={() => setActiveTab('verification')}
                    style={tabStyle(activeTab === 'verification')}
                >
                    Verification
                </button>
            </div>

            <div className="dashboard-content">
                {activeTab === 'listings' && <NGOPetListings />}
                {activeTab === 'requests' && <AdoptionRequestsManager />}
                {activeTab === 'campaigns' && <NGOCampaignsManager />}
                {activeTab === 'profile' && <NGOProfile />}
                {activeTab === 'verification' && <VerificationStatus />}
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
