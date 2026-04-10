import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import api from '../services/axios';
import { FaSpinner } from 'react-icons/fa';

const NGOCampaignsManager = () => {
    const [campaigns, setCampaigns] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        targetAmount: '',
        deadline: '',
        image: '',
        bankName: '',
        accountName: '',
        accountNumber: '',
        khaltiId: ''
    });

    useEffect(() => {
        fetchCampaigns();
    }, []);

    const fetchCampaigns = async () => {
        setLoading(true);
        try {
            const res = await api.get('/campaigns/mine');
            setCampaigns(res.data.data || []);
        } catch (err) {
            toast.error('Failed to load campaigns');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        if (file.size > 3 * 1024 * 1024) {
            toast.error('Image must be under 3 MB');
            return;
        }
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            setFormData(prev => ({ ...prev, image: reader.result }));
        };
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.title || !formData.targetAmount || !formData.deadline) {
            toast.error('Please fill all required fields');
            return;
        }
        setSubmitting(true);
        try {
            const payload = {
                title: formData.title,
                description: formData.description,
                targetAmount: formData.targetAmount,
                deadline: formData.deadline,
                image: formData.image,
                paymentDetails: {
                    bankName: formData.bankName,
                    accountName: formData.accountName,
                    accountNumber: formData.accountNumber,
                    khaltiId: formData.khaltiId
                }
            };
            await api.post('/campaigns', payload);
            toast.success('Campaign published successfully!');
            setShowForm(false);
            setFormData({ title: '', description: '', targetAmount: '', deadline: '', image: '', bankName: '', accountName: '', accountNumber: '', khaltiId: '' });
            fetchCampaigns();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to create campaign');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this campaign?')) return;
        try {
            await api.delete(`/campaigns/${id}`);
            setCampaigns(prev => prev.filter(c => c._id !== id));
            toast.success('Campaign deleted');
        } catch (err) {
            toast.error('Failed to delete campaign');
        }
    };

    const getDaysLeft = (deadline) => {
        const diff = new Date(deadline) - new Date();
        const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
        return days > 0 ? `${days} days left` : 'Expired';
    };

    return (
        <div className="campaigns-manager">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h3 style={{ margin: 0, color: '#3E2723' }}>Manage Donation Campaigns</h3>
                <button
                    onClick={() => setShowForm(!showForm)}
                    style={{ background: '#5d4037', color: 'white', border: 'none', padding: '9px 18px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '0.9rem' }}
                >
                    {showForm ? '✕ Cancel' : '+ New Campaign'}
                </button>
            </div>

            {showForm && (
                <div style={{ background: '#fdf8f6', padding: '1.5rem', borderRadius: '12px', marginBottom: '2rem', border: '1px solid #EFEBE9' }}>
                    <h4 style={{ marginTop: 0, color: '#5d4037' }}>Create New Campaign</h4>
                    <form onSubmit={handleSubmit}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: '600', fontSize: '0.9rem', color: '#555' }}>Title *</label>
                                <input type="text" name="title" value={formData.title} onChange={handleChange} required
                                    style={{ width: '100%', padding: '0.6rem', border: '1px solid #ddd', borderRadius: '8px', boxSizing: 'border-box' }} />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: '600', fontSize: '0.9rem', color: '#555' }}>Target Amount (NPR) *</label>
                                <input type="number" name="targetAmount" value={formData.targetAmount} onChange={handleChange} required min="100"
                                    style={{ width: '100%', padding: '0.6rem', border: '1px solid #ddd', borderRadius: '8px', boxSizing: 'border-box' }} />
                            </div>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: '600', fontSize: '0.9rem', color: '#555' }}>Deadline *</label>
                                <input type="date" name="deadline" value={formData.deadline} onChange={handleChange} required
                                    min={new Date().toISOString().split('T')[0]}
                                    style={{ width: '100%', padding: '0.6rem', border: '1px solid #ddd', borderRadius: '8px', boxSizing: 'border-box' }} />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: '600', fontSize: '0.9rem', color: '#555' }}>Cover Image</label>
                                <input type="file" onChange={handleImageChange} accept="image/*"
                                    style={{ width: '100%', padding: '0.5rem', boxSizing: 'border-box' }} />
                            </div>
                        </div>
                        <div style={{ marginBottom: '1rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: '600', fontSize: '0.9rem', color: '#555' }}>Description</label>
                            <textarea name="description" value={formData.description} onChange={handleChange} rows="3"
                                placeholder="Describe your campaign and how the funds will be used..."
                                style={{ width: '100%', padding: '0.6rem', border: '1px solid #ddd', borderRadius: '8px', boxSizing: 'border-box', resize: 'vertical' }} />
                        </div>
                        {/* Payment Details Section */}
                        <div style={{ background: '#f0ebe6', padding: '1rem 1.2rem', borderRadius: '10px', marginBottom: '1rem', border: '1px solid #d7ccc8' }}>
                            <h5 style={{ margin: '0 0 0.8rem 0', color: '#5d4037', fontSize: '0.95rem' }}>💳 Payment Details</h5>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '0.8rem' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: '600', fontSize: '0.85rem', color: '#555' }}>Bank Name</label>
                                    <input type="text" name="bankName" value={formData.bankName} onChange={handleChange}
                                        placeholder="e.g. Nepal Bank Limited"
                                        style={{ width: '100%', padding: '0.6rem', border: '1px solid #ddd', borderRadius: '8px', boxSizing: 'border-box' }} />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: '600', fontSize: '0.85rem', color: '#555' }}>Account Holder Name</label>
                                    <input type="text" name="accountName" value={formData.accountName} onChange={handleChange}
                                        placeholder="Name on the account"
                                        style={{ width: '100%', padding: '0.6rem', border: '1px solid #ddd', borderRadius: '8px', boxSizing: 'border-box' }} />
                                </div>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: '600', fontSize: '0.85rem', color: '#555' }}>Account Number</label>
                                    <input type="text" name="accountNumber" value={formData.accountNumber} onChange={handleChange}
                                        placeholder="Bank account number"
                                        style={{ width: '100%', padding: '0.6rem', border: '1px solid #ddd', borderRadius: '8px', boxSizing: 'border-box' }} />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: '600', fontSize: '0.85rem', color: '#555' }}>Khalti ID</label>
                                    <input type="text" name="khaltiId" value={formData.khaltiId} onChange={handleChange}
                                        placeholder="Khalti number (optional)"
                                        style={{ width: '100%', padding: '0.6rem', border: '1px solid #ddd', borderRadius: '8px', boxSizing: 'border-box' }} />
                                </div>
                            </div>
                        </div>
                        {formData.image && (
                            <img src={formData.image} alt="Preview"
                                style={{ height: '100px', borderRadius: '8px', marginBottom: '1rem', display: 'block', objectFit: 'cover' }} />
                        )}
                        <button type="submit" disabled={submitting}
                            style={{ background: '#28a745', color: 'white', border: 'none', padding: '10px 24px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '1rem', opacity: submitting ? 0.7 : 1 }}>
                            {submitting ? '⏳ Publishing...' : '🚀 Publish Campaign'}
                        </button>
                    </form>
                </div>
            )}

            {loading ? (
                <div style={{ textAlign: 'center', padding: '2rem', color: '#999' }}>
                    <FaSpinner style={{ animation: 'spin 1s linear infinite' }} size={28} color="#8D6E63" />
                    <p>Loading campaigns...</p>
                </div>
            ) : campaigns.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '3rem', background: '#fafafa', borderRadius: '12px', color: '#888', border: '1px dashed #ddd' }}>
                    <p style={{ fontSize: '2rem', margin: '0 0 0.5rem' }}>📣</p>
                    <p>No campaigns yet. Create your first campaign to start raising funds!</p>
                </div>
            ) : (
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                        <thead>
                            <tr style={{ background: '#f5f5f5', borderBottom: '2px solid #eee' }}>
                                <th style={{ padding: '12px 16px', textAlign: 'left', color: '#5d4037' }}>Title</th>
                                <th style={{ padding: '12px 16px', textAlign: 'left', color: '#5d4037' }}>Target</th>
                                <th style={{ padding: '12px 16px', textAlign: 'left', color: '#5d4037' }}>Raised</th>
                                <th style={{ padding: '12px 16px', textAlign: 'left', color: '#5d4037' }}>Deadline</th>
                                <th style={{ padding: '12px 16px', textAlign: 'left', color: '#5d4037' }}>Status</th>
                                <th style={{ padding: '12px 16px', textAlign: 'left', color: '#5d4037' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {campaigns.map(c => (
                                <tr key={c._id} style={{ borderBottom: '1px solid #eee' }}>
                                    <td style={{ padding: '12px 16px', fontWeight: '600', color: '#333' }}>{c.title}</td>
                                    <td style={{ padding: '12px 16px', color: '#555' }}>Rs. {Number(c.targetAmount).toLocaleString()}</td>
                                    <td style={{ padding: '12px 16px', color: '#28a745', fontWeight: '600' }}>Rs. {Number(c.raisedAmount || 0).toLocaleString()}</td>
                                    <td style={{ padding: '12px 16px', color: '#555' }}>
                                        {new Date(c.deadline).toLocaleDateString()}<br />
                                        <span style={{ fontSize: '0.78rem', color: new Date(c.deadline) < new Date() ? '#dc3545' : '#888' }}>
                                            {getDaysLeft(c.deadline)}
                                        </span>
                                    </td>
                                    <td style={{ padding: '12px 16px' }}>
                                        <span style={{
                                            padding: '3px 10px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: '600',
                                            background: c.status === 'Active' ? '#d4edda' : '#f8d7da',
                                            color: c.status === 'Active' ? '#155724' : '#721c24'
                                        }}>{c.status}</span>
                                    </td>
                                    <td style={{ padding: '12px 16px' }}>
                                        <button onClick={() => handleDelete(c._id)}
                                            style={{ background: '#dc3545', color: 'white', border: 'none', padding: '5px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem' }}>
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
            <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
        </div>
    );
};

export default NGOCampaignsManager;
