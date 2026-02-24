import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import MultiImageUpload from './MultiImageUpload'; // Reuse for single image for now or adapt

const NGOCampaignsManager = () => {
    const [campaigns, setCampaigns] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        targetAmount: '',
        deadline: '',
        image: ''
    });

    useEffect(() => {
        fetchCampaigns();
    }, []);

    const fetchCampaigns = () => {
        const stored = JSON.parse(localStorage.getItem('ngoCampaigns')) || [];
        setCampaigns(stored);
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleImageChange = (files) => {
        if (files.length > 0) {
            const file = files[0];
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => {
                setFormData(prev => ({ ...prev, image: reader.result }));
            };
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.title || !formData.targetAmount || !formData.deadline) {
            toast.error("Please fill required fields");
            return;
        }

        const newCampaign = {
            id: Date.now().toString(),
            ...formData,
            raisedAmount: 0,
            status: 'Active',
            createdAt: new Date().toISOString()
        };

        const updatedCampaigns = [...campaigns, newCampaign];
        localStorage.setItem('ngoCampaigns', JSON.stringify(updatedCampaigns));
        setCampaigns(updatedCampaigns);
        setShowForm(false);
        setFormData({ title: '', description: '', targetAmount: '', deadline: '', image: '' });
        toast.success("Campaign created!");
    };

    const handleDelete = (id) => {
        if (window.confirm("Delete this campaign?")) {
            const updated = campaigns.filter(c => c.id !== id);
            localStorage.setItem('ngoCampaigns', JSON.stringify(updated));
            setCampaigns(updated);
            toast.success("Campaign deleted");
        }
    };

    return (
        <div className="campaigns-manager">
            <div className="header" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <h3>Manage Donation Campaigns</h3>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="btn btn-primary"
                    style={{ background: '#5d4037', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '4px' }}
                >
                    {showForm ? 'Cancel' : 'Create New Campaign'}
                </button>
            </div>

            {showForm && (
                <div className="form-card" style={{ background: '#f9f9f9', padding: '1.5rem', borderRadius: '8px', marginBottom: '2rem' }}>
                    <h4>Create Campaign</h4>
                    <form onSubmit={handleSubmit}>
                        <div style={{ marginBottom: '1rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem' }}>Title *</label>
                            <input type="text" name="title" value={formData.title} onChange={handleChange} required style={{ width: '100%', padding: '0.5rem' }} />
                        </div>
                        <div style={{ marginBottom: '1rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem' }}>Target Amount (NPR) *</label>
                            <input type="number" name="targetAmount" value={formData.targetAmount} onChange={handleChange} required style={{ width: '100%', padding: '0.5rem' }} />
                        </div>
                        <div style={{ marginBottom: '1rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem' }}>Deadline *</label>
                            <input type="date" name="deadline" value={formData.deadline} onChange={handleChange} required style={{ width: '100%', padding: '0.5rem' }} />
                        </div>
                        <div style={{ marginBottom: '1rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem' }}>Description</label>
                            <textarea name="description" value={formData.description} onChange={handleChange} rows="3" style={{ width: '100%', padding: '0.5rem' }}></textarea>
                        </div>
                        <div style={{ marginBottom: '1rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem' }}>Cover Image</label>
                            <input type="file" onChange={(e) => handleImageChange(e.target.files)} accept="image/*" />
                            {formData.image && <img src={formData.image} alt="Preview" style={{ height: '100px', marginTop: '10px', display: 'block' }} />}
                        </div>
                        <button type="submit" className="btn btn-success" style={{ background: '#28a745', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '4px' }}>
                            Publish Campaign
                        </button>
                    </form>
                </div>
            )}

            <div className="campaigns-list">
                {campaigns.length === 0 ? <p>No active campaigns.</p> : (
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ background: '#eee' }}>
                                <th style={{ padding: '10px', textAlign: 'left' }}>Title</th>
                                <th style={{ padding: '10px', textAlign: 'left' }}>Target</th>
                                <th style={{ padding: '10px', textAlign: 'left' }}>Raised</th>
                                <th style={{ padding: '10px', textAlign: 'left' }}>Deadline</th>
                                <th style={{ padding: '10px', textAlign: 'left' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {campaigns.map(c => (
                                <tr key={c.id} style={{ borderBottom: '1px solid #ddd' }}>
                                    <td style={{ padding: '10px' }}>{c.title}</td>
                                    <td style={{ padding: '10px' }}>Rs. {c.targetAmount}</td>
                                    <td style={{ padding: '10px' }}>Rs. {c.raisedAmount}</td>
                                    <td style={{ padding: '10px' }}>{c.deadline}</td>
                                    <td style={{ padding: '10px' }}>
                                        <button onClick={() => handleDelete(c.id)} style={{ background: '#dc3545', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer' }}>Delete</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default NGOCampaignsManager;
