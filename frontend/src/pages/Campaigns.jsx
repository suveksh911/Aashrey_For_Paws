import React from 'react';
import { Link } from 'react-router-dom';
import { FaHandHoldingHeart } from 'react-icons/fa';
import NGOVerifiedBadge from '../components/NGOVerifiedBadge';

const CAMPAIGNS = [
    {
        id: 1,
        title: "Winter Relief for Street Dogs",
        ngo: "Sneha's Care",
        ngoId: 2,
        isVerified: true,
        description: "Help us provide warm blankets and coats for street dogs this winter. The temperature is dropping, and they need our help to survive the cold nights.",
        image: "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=600&q=80",
        goal: 50000,
        raised: 35000,
        daysLeft: 12
    },
    {
        id: 2,
        title: "Medical Fund for Rocky",
        ngo: "KAT Centre",
        ngoId: 1,
        isVerified: true,
        description: "Rocky was found with a severe leg injury. He needs immediate surgery and rehabilitation. Your donation will cover his vet bills and post-op care.",
        image: "https://images.unsplash.com/photo-1537151608828-ea2b11777ee8?auto=format&fit=crop&w=600&q=80",
        goal: 25000,
        raised: 12000,
        daysLeft: 5
    },
    {
        id: 3,
        title: "Sterilization Drive 2024",
        ngo: "Animal Nepal",
        ngoId: 4,
        isVerified: false,
        description: "Our annual sterilization drive aims to spay/neuter 100 street dogs to control the population and improve their health. Join us in making a sustainable impact.",
        image: "https://images.unsplash.com/photo-1596272875729-ed2f21765950?auto=format&fit=crop&w=600&q=80",
        goal: 100000,
        raised: 45000,
        daysLeft: 20
    }
];

function Campaigns() {
    return (
        <div className="campaigns-page container">
            <div className="campaigns-header">
                <h1>Donation Campaigns</h1>
                <p>Support specific causes that matter to you.</p>
            </div>

            <div className="campaigns-grid">
                {CAMPAIGNS.map(campaign => {
                    const progress = (campaign.raised / campaign.goal) * 100;
                    return (
                        <div className="campaign-card" key={campaign.id}>
                            <div className="campaign-img" style={{ position: 'relative' }}>
                                <img src={campaign.image} alt={campaign.title} />
                                {campaign.isVerified && (
                                    <div style={{ position: 'absolute', top: '10px', left: '10px' }}>
                                        <NGOVerifiedBadge isVerified={true} compact />
                                    </div>
                                )}
                            </div>
                            <div className="campaign-content">
                                <h3>{campaign.title}</h3>
                                {campaign.ngo && (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px', fontSize: '0.85rem', color: '#666' }}>
                                        <span>By <strong>{campaign.ngo}</strong></span>
                                        <NGOVerifiedBadge isVerified={campaign.isVerified} compact />
                                    </div>
                                )}
                                <p className="desc">{campaign.description}</p>

                                <div className="progress-bar-container">
                                    <div className="progress-bar" style={{ width: `${progress}%` }}></div>
                                </div>
                                <div className="fund-stats">
                                    <span><strong>Rs. {campaign.raised.toLocaleString()}</strong> raised</span>
                                    <span>of Rs. {campaign.goal.toLocaleString()}</span>
                                </div>

                                <div className="card-footer">
                                    <span className="days-left">📅 {campaign.daysLeft} days left</span>
                                    <Link
                                        to={`/donate?ngoId=${campaign.ngoId}`}
                                        className="btn btn-primary btn-sm"
                                    >
                                        💳 Donate Now
                                    </Link>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="general-donation-cta">
                <FaHandHoldingHeart size={50} color="#5d4037" />
                <h2>Want to support our general fund?</h2>
                <p>Your general donations help us keep the shelter running every day.</p>
                <Link to="/donate" className="btn btn-secondary">Make a General Donation</Link>
            </div>

            <style>{`
                .campaigns-page { padding: 2rem; }
                .campaigns-header {
                    text-align: center;
                    margin-bottom: 3rem;
                }
                .campaigns-header h1 { font-size: 2.5rem; color: var(--color-primary); margin-bottom: 0.5rem; }
                .campaigns-header p { color: #666; font-size: 1.1rem; }

                .campaigns-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
                    gap: 2rem;
                    margin-bottom: 4rem;
                }
                .campaign-card {
                    background: #fff;
                    border-radius: var(--radius-md);
                    overflow: hidden;
                    box-shadow: 0 4px 6px rgba(0,0,0,0.1);
                    transition: transform 0.3s;
                    border: 1px solid var(--color-border);
                }
                .campaign-card:hover {
                    transform: translateY(-5px);
                }
                .campaign-img { height: 200px; overflow: hidden; }
                .campaign-img img { width: 100%; height: 100%; object-fit: cover; }
                
                .campaign-content { padding: 1.5rem; }
                .campaign-content h3 { margin: 0 0 1rem 0; font-size: 1.25rem; color: #333; }
                .desc { color: #666; font-size: 0.95rem; line-height: 1.5; margin-bottom: 1.5rem; }

                .progress-bar-container {
                    background: #e0e0e0;
                    height: 10px;
                    border-radius: 5px;
                    overflow: hidden;
                    margin-bottom: 0.5rem;
                }
                .progress-bar {
                    background: var(--color-primary);
                    height: 100%;
                }
                
                .fund-stats {
                    display: flex;
                    justify-content: space-between;
                    font-size: 0.9rem;
                    color: #555;
                    margin-bottom: 1.5rem;
                }
                
                .card-footer {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding-top: 1rem;
                    border-top: 1px solid #eee;
                }
                .days-left { font-size: 0.9rem; color: #888; }
                .btn-sm { padding: 0.5rem 1rem; font-size: 0.9rem; }

                .general-donation-cta {
                    background: #f8f5f2;
                    text-align: center;
                    padding: 3rem;
                    border-radius: var(--radius-lg);
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 1rem;
                }
            `}</style>
        </div>
    );
}

export default Campaigns;
