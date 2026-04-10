import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { FaHandHoldingHeart, FaSpinner, FaTimes, FaCheckCircle } from 'react-icons/fa';
import { toast } from 'react-toastify';
import NGOVerifiedBadge from '../components/NGOVerifiedBadge';
import api from '../services/axios';
import { useAuth } from '../context/AuthContext';

function Campaigns() {
    const [campaigns, setCampaigns] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchParams] = useSearchParams();
    const { user } = useAuth();

    // Donation modal state
    const [donateModal, setDonateModal] = useState(null); // campaign object or null
    const [donateAmount, setDonateAmount] = useState('');
    const [paying, setPaying] = useState(false);
    const [paymentSuccess, setPaymentSuccess] = useState(false);

    useEffect(() => {
        const fetchCampaigns = async () => {
            setLoading(true);
            try {
                const res = await api.get('/campaigns');
                setCampaigns(res.data.data || []);
            } catch (err) {
                setError('Failed to load campaigns. Please try again later.');
            } finally {
                setLoading(false);
            }
        };
        fetchCampaigns();
    }, []);

    // Handle Khalti callback verification
    useEffect(() => {
        const pidx = searchParams.get('pidx');
        if (pidx) {
            const savedAmount = sessionStorage.getItem('pendingCampaignDonationAmount');
            const savedCampaignTitle = sessionStorage.getItem('pendingCampaignTitle');
            api.post('/payment/verify', { pidx })
                .then(res => {
                    if (res.data.success) {
                        setPaymentSuccess(true);
                        if (savedAmount) setDonateAmount(savedAmount);
                        if (savedCampaignTitle) setDonateModal({ title: savedCampaignTitle });
                        sessionStorage.removeItem('pendingCampaignDonationAmount');
                        sessionStorage.removeItem('pendingCampaignTitle');
                    } else {
                        toast.error('Payment verification failed.');
                    }
                })
                .catch(() => toast.error('Payment verification error'))
                .finally(() => window.history.replaceState(null, '', '/campaigns'));
        }
    }, [searchParams]);

    const getDaysLeft = (deadline) => {
        const diff = new Date(deadline) - new Date();
        const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
        return days > 0 ? days : 0;
    };

    const handleDonate = async () => {
        if (!donateAmount || Number(donateAmount) <= 0) return toast.error('Please enter a valid amount');
        if (!user) return toast.error('Please login to make a donation');
        setPaying(true);
        try {
            const res = await api.post('/payment/initiate', {
                amount: donateAmount,
                purpose: 'CampaignContribution',
                referenceId: donateModal._id,
                itemName: donateModal.title,
                returnUrl: `${window.location.origin}/campaigns`
            });
            if (res.data.success && res.data.payment_url) {
                sessionStorage.setItem('pendingCampaignDonationAmount', donateAmount);
                sessionStorage.setItem('pendingCampaignTitle', donateModal.title);
                window.location.href = res.data.payment_url;
            } else {
                toast.error('Failed to initiate payment.');
                setPaying(false);
            }
        } catch (err) {
            toast.error('Failed to initiate Khalti payment.');
            setPaying(false);
        }
    };

    const openDonateModal = (campaign) => {
        setDonateModal(campaign);
        setDonateAmount('');
        setPaying(false);
    };

    const closeDonateModal = () => {
        setDonateModal(null);
        setDonateAmount('');
        setPaying(false);
    };

    return (
        <div className="campaigns-page container">
            <div className="campaigns-header">
                <h1>Donation Campaigns</h1>
                <p>Support specific causes posted by NGOs that matter to you.</p>
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', padding: '4rem', color: '#999' }}>
                    <FaSpinner style={{ animation: 'spin 1s linear infinite' }} size={36} color="#8D6E63" />
                    <p style={{ marginTop: '1rem' }}>Loading campaigns...</p>
                </div>
            ) : error ? (
                <div style={{ textAlign: 'center', padding: '4rem', color: '#dc3545' }}>
                    <p>{error}</p>
                </div>
            ) : campaigns.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '4rem', background: '#fafafa', borderRadius: '16px', color: '#888' }}>
                    <p style={{ fontSize: '2rem', margin: '0 0 0.5rem' }}>📣</p>
                    <h3>No Active Campaigns</h3>
                    <p>NGOs haven't posted any campaigns yet. Check back later!</p>
                    <Link to="/donate" className="btn btn-primary" style={{ marginTop: '1rem', display: 'inline-block' }}>
                        Browse NGOs to Donate
                    </Link>
                </div>
            ) : (
                <div className="campaigns-grid">
                    {campaigns.map(campaign => {
                        const progress = campaign.targetAmount > 0
                            ? Math.min((campaign.raisedAmount / campaign.targetAmount) * 100, 100)
                            : 0;
                        const daysLeft = getDaysLeft(campaign.deadline);
                        return (
                            <div className="campaign-card" key={campaign._id}>
                                <div className="campaign-img" style={{ position: 'relative' }}>
                                    <img
                                        src={campaign.image ||'https://www.snehacare.org/wp-content/uploads/2022/09/advocacy-2.jpg'}
                                        alt={campaign.title}
                                        onError={e => { e.target.src = 'https://katcentre.org/wp-content/uploads/2019/12/rescue2.jpg'; }}
                                    />
                                    {campaign.isVerified && (
                                        <div style={{ position: 'absolute', top: '10px', left: '10px' }}>
                                            <NGOVerifiedBadge isVerified={campaign.isVerified} compact />
                                        </div>
                                    )}
                                    {daysLeft <= 5 && daysLeft > 0 && (
                                        <div style={{ position: 'absolute', top: '10px', right: '10px', background: '#dc3545', color: 'white', padding: '3px 8px', borderRadius: '12px', fontSize: '0.78rem', fontWeight: '700' }}>
                                            ⏰ {daysLeft}d left!
                                        </div>
                                    )}
                                </div>
                                <div className="campaign-content">
                                    <h3>{campaign.title}</h3>
                                    {campaign.ngoName && (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px', fontSize: '0.85rem', color: '#666' }}>
                                            <span>By <strong>{campaign.ngoName}</strong></span>
                                            <NGOVerifiedBadge isVerified={campaign.isVerified} compact />
                                        </div>
                                    )}
                                    <p className="desc">{campaign.description || 'Help support this cause.'}</p>

                                    <div className="progress-bar-container">
                                        <div className="progress-bar" style={{ width: `${progress}%` }}></div>
                                    </div>
                                    <div className="fund-stats">
                                        <span><strong>Rs. {Number(campaign.raisedAmount || 0).toLocaleString()}</strong> raised</span>
                                        <span>of Rs. {Number(campaign.targetAmount).toLocaleString()}</span>
                                    </div>

                                    {/* Payment Details Section */}
                                    {campaign.paymentDetails && (campaign.paymentDetails.khaltiId || campaign.paymentDetails.bankName || campaign.paymentDetails.accountNumber) && (
                                        <div style={{ background: '#f8f5f2', padding: '0.8rem 1rem', borderRadius: '8px', marginBottom: '1rem', border: '1px solid #efe8e1', fontSize: '0.85rem', color: '#555' }}>
                                            <div style={{ fontWeight: '700', color: '#5d4037', marginBottom: '0.4rem', fontSize: '0.82rem' }}>💳 Payment Info</div>
                                            {campaign.paymentDetails.khaltiId && (
                                                <div style={{ marginBottom: '0.3rem', background: '#f3e8ff', padding: '0.4rem 0.6rem', borderRadius: '6px', color: '#5C2D91', fontWeight: '600' }}>📱 Khalti: {campaign.paymentDetails.khaltiId}</div>
                                            )}
                                            {campaign.paymentDetails.bankName && (
                                                <div style={{ marginBottom: '0.2rem' }}>🏦 <strong>Bank:</strong> {campaign.paymentDetails.bankName}</div>
                                            )}
                                            {campaign.paymentDetails.accountName && (
                                                <div style={{ marginBottom: '0.2rem' }}>👤 <strong>A/C Name:</strong> {campaign.paymentDetails.accountName}</div>
                                            )}
                                            {campaign.paymentDetails.accountNumber && (
                                                <div>🔢 <strong>A/C No:</strong> {campaign.paymentDetails.accountNumber}</div>
                                            )}
                                        </div>
                                    )}

                                    <div className="card-footer">
                                        <span className="days-left">
                                            {daysLeft > 0 ? `📅 ${daysLeft} days left` : '⏰ Expired'}
                                        </span>
                                        <button
                                            onClick={() => openDonateModal(campaign)}
                                            className="btn btn-primary btn-sm"
                                            disabled={daysLeft === 0}
                                        >
                                            💳 Donate Now
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            <div className="general-donation-cta">
                <FaHandHoldingHeart size={50} color="#5d4037" />
                <h2>Want to support our general fund?</h2>
                <p>Your general donations help us keep the shelter running every day.</p>
                <Link to="/donate" className="btn btn-secondary">Make a General Donation</Link>
            </div>

            {/* Payment Success Screen */}
            {paymentSuccess && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
                    <div style={{ background: 'white', borderRadius: '20px', padding: '3rem 2rem', maxWidth: '420px', width: '100%', textAlign: 'center', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>
                        <FaCheckCircle size={60} color="#28a745" style={{ marginBottom: '1rem' }} />
                        <h2 style={{ color: '#3E2723', marginBottom: '0.5rem' }}>Thank You! 🎉</h2>
                        <p style={{ color: '#666', marginBottom: '1.5rem' }}>
                            Your donation of <strong>Rs. {donateAmount}</strong> to <strong>{donateModal?.title}</strong> has been processed successfully.
                        </p>
                        <button onClick={() => { setPaymentSuccess(false); setDonateModal(null); }} className="btn btn-primary" style={{ width: '100%' }}>Close</button>
                    </div>
                </div>
            )}

            {/* Khalti Donation Modal */}
            {donateModal && !paymentSuccess && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
                    <div style={{ background: 'white', borderRadius: '20px', padding: '2rem', maxWidth: '440px', width: '100%', boxShadow: '0 20px 60px rgba(0,0,0,0.3)', position: 'relative' }}>
                        <button onClick={closeDonateModal} style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', cursor: 'pointer', color: '#999', fontSize: '1.2rem' }}>
                            <FaTimes />
                        </button>
                        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>💜</div>
                            <h3 style={{ color: '#3E2723', margin: '0 0 0.3rem' }}>Donate to Campaign</h3>
                            <p style={{ color: '#888', fontSize: '0.9rem', margin: 0 }}>{donateModal.title}</p>
                            <p style={{ color: '#aaa', fontSize: '0.8rem' }}>by {donateModal.ngoName}</p>
                        </div>

                        <div style={{ marginBottom: '1rem' }}>
                            <label style={{ display: 'block', fontWeight: '600', fontSize: '0.9rem', color: '#555', marginBottom: '0.5rem' }}>Select Amount</label>
                            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.8rem', flexWrap: 'wrap' }}>
                                {[100, 250, 500, 1000].map(val => (
                                    <button key={val} type="button" onClick={() => setDonateAmount(val)}
                                        style={{ flex: 1, minWidth: '70px', padding: '0.6rem', border: Number(donateAmount) === val ? '2px solid #5C2D91' : '1px solid #ddd', background: Number(donateAmount) === val ? '#f3e8ff' : 'white', borderRadius: '10px', cursor: 'pointer', fontWeight: '700', color: Number(donateAmount) === val ? '#5C2D91' : '#555', transition: 'all 0.2s' }}>
                                        Rs. {val}
                                    </button>
                                ))}
                            </div>
                            <input
                                type="number" placeholder="Or enter custom amount..." min="1"
                                value={donateAmount} onChange={e => setDonateAmount(e.target.value)}
                                style={{ width: '100%', padding: '0.75rem', border: '1px solid #ddd', borderRadius: '10px', fontSize: '1rem', boxSizing: 'border-box' }}
                            />
                        </div>

                        <div style={{ background: '#f3e8ff', padding: '0.6rem 1rem', borderRadius: '10px', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span style={{ fontSize: '1.2rem' }}>📱</span>
                            <span style={{ fontWeight: '700', color: '#5C2D91', fontSize: '0.9rem' }}>Pay with Khalti</span>
                        </div>

                        <button onClick={handleDonate} disabled={paying || !donateAmount}
                            style={{ width: '100%', padding: '0.85rem', background: paying ? '#aaa' : '#5C2D91', color: 'white', border: 'none', borderRadius: '12px', fontWeight: '700', fontSize: '1rem', cursor: paying ? 'not-allowed' : 'pointer', transition: 'all 0.2s' }}>
                            {paying ? '⏳ Processing...' : `💳 Pay Rs. ${donateAmount || '—'} via Khalti`}
                        </button>

                        {!user && <p style={{ marginTop: '0.75rem', textAlign: 'center', fontSize: '0.85rem', color: '#dc3545' }}>⚠️ <Link to="/login">Login</Link> required to donate</p>}
                    </div>
                </div>
            )}

            <style>{`
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                .campaigns-page { padding: 2rem; }
                .campaigns-header { text-align: center; margin-bottom: 3rem; }
                .campaigns-header h1 { font-size: 2.5rem; color: var(--color-primary); margin-bottom: 0.5rem; }
                .campaigns-header p { color: #666; font-size: 1.1rem; }
                .campaigns-grid {
                    display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
                    gap: 2rem; margin-bottom: 4rem;
                }
                .campaign-card {
                    background: #fff; border-radius: var(--radius-md); overflow: hidden;
                    box-shadow: 0 4px 6px rgba(0,0,0,0.1); transition: transform 0.3s;
                    border: 1px solid var(--color-border);
                }
                .campaign-card:hover { transform: translateY(-5px); box-shadow: 0 8px 20px rgba(0,0,0,0.12); }
                .campaign-img { height: 200px; overflow: hidden; }
                .campaign-img img { width: 100%; height: 100%; object-fit: cover; }
                .campaign-content { padding: 1.5rem; }
                .campaign-content h3 { margin: 0 0 1rem 0; font-size: 1.2rem; color: #333; }
                .desc { color: #666; font-size: 0.95rem; line-height: 1.5; margin-bottom: 1.5rem; }
                .progress-bar-container { background: #e0e0e0; height: 10px; border-radius: 5px; overflow: hidden; margin-bottom: 0.5rem; }
                .progress-bar { background: var(--color-primary); height: 100%; transition: width 0.5s ease; }
                .fund-stats { display: flex; justify-content: space-between; font-size: 0.9rem; color: #555; margin-bottom: 1.5rem; }
                .card-footer { display: flex; justify-content: space-between; align-items: center; padding-top: 1rem; border-top: 1px solid #eee; }
                .days-left { font-size: 0.9rem; color: #888; }
                .btn-sm { padding: 0.5rem 1rem; font-size: 0.9rem; }
                .general-donation-cta {
                    background: #f8f5f2; text-align: center; padding: 3rem; border-radius: var(--radius-lg);
                    display: flex; flex-direction: column; align-items: center; gap: 1rem;
                }
            `}</style>
        </div>
    );
}

export default Campaigns;
