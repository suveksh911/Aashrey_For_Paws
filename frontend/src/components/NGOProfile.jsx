import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { FaCheckCircle } from 'react-icons/fa';
import { toast } from 'react-toastify';

const NGOProfile = () => {
    const { user } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [profileData, setProfileData] = useState({
        name: user?.name || '',
        email: user?.email || '',
        phone: '9800000000',
        address: 'Kathmandu, Nepal' 
    });

    const handleChange = (e) => {
        setProfileData({ ...profileData, [e.target.name]: e.target.value });
    };

    const handleSave = () => {
        
        toast.success("Profile updated!");
        setIsEditing(false);
    };

    return (
        <div className="ngo-profile">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <h3>Organization Profile</h3>
                    {}
                    <span style={{ color: '#007bff', display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <FaCheckCircle /> Verified NGO
                    </span>
                </div>
                <button
                    onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                    className="btn btn-primary"
                    style={{ padding: '5px 15px' }}
                >
                    {isEditing ? 'Save Changes' : 'Edit Profile'}
                </button>
            </div>

            <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '8px', border: '1px solid #eee' }}>
                {isEditing ? (
                    <div className="edit-form" style={{ display: 'grid', gap: '1rem' }}>
                        <div>
                            <label style={{ display: 'block', fontWeight: 'bold' }}>Name</label>
                            <input type="text" name="name" value={profileData.name} onChange={handleChange} style={{ width: '100%', padding: '8px' }} />
                        </div>
                        <div>
                            <label style={{ display: 'block', fontWeight: 'bold' }}>Email</label>
                            <input type="email" name="email" value={profileData.email} onChange={handleChange} style={{ width: '100%', padding: '8px' }} disabled />
                        </div>
                        <div>
                            <label style={{ display: 'block', fontWeight: 'bold' }}>Phone</label>
                            <input type="text" name="phone" value={profileData.phone} onChange={handleChange} style={{ width: '100%', padding: '8px' }} />
                        </div>
                        <div>
                            <label style={{ display: 'block', fontWeight: 'bold' }}>Address</label>
                            <input type="text" name="address" value={profileData.address} onChange={handleChange} style={{ width: '100%', padding: '8px' }} />
                        </div>
                    </div>
                ) : (
                    <div className="view-mode">
                        <p><strong>Name:</strong> {profileData.name}</p>
                        <p><strong>Email:</strong> {profileData.email}</p>
                        <p><strong>Phone:</strong> {profileData.phone}</p>
                        <p><strong>Address:</strong> {profileData.address}</p>
                        <p><strong>Role:</strong> {user?.role}</p>
                        <p><strong>Status:</strong> Active</p>
                    </div>
                )}

                <hr style={{ margin: '15px 0', borderTop: '1px solid #eee' }} />

                <h4>Health Records Management</h4>
                <p>Keep your pet health records up to date to increase adoption chances.</p>
                <div style={{ background: '#f8f9fa', padding: '10px', borderRadius: '4px', fontSize: '0.9rem' }}>
                    Quick Tip: You can manage health records directly from the "Edit Pet" page for each listing.
                </div>
            </div>
        </div>
    );
};

export default NGOProfile;
