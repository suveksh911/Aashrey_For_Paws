import React, { useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';

function AdoptionRequest() {
    const { id } = useParams(); 
    const location = useLocation();
    const petName = location.state?.petName || 'the pet';

    const { user } = useAuth();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        fullName: user?.name || '',
        email: user?.email || '', 
        phone: '',
        address: '',
        reason: '',
        haveOtherPets: 'No'
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();

       
        const newRequest = {
            id: Date.now(),
            petId: id,
            petName: petName,
            userId: user?.name, 
            ...formData,
            status: 'Pending',
            date: new Date().toLocaleDateString()
        };

       
        const existingRequests = JSON.parse(localStorage.getItem('adoptionRequests')) || [];
        localStorage.setItem('adoptionRequests', JSON.stringify([...existingRequests, newRequest]));

        toast.success(`Adoption request for ${petName} submitted successfully!`);
        navigate('/user'); 
    };

    return (
        <div className="container" style={{ padding: '2rem' }}>
            <div className="form-container" style={{ maxWidth: '600px', margin: '0 auto' }}>
                <h1 style={{ textAlign: 'center', marginBottom: '1rem' }}>Adopt {petName}</h1>
                <p style={{ textAlign: 'center', marginBottom: '2rem', color: 'var(--color-text-secondary)' }}>
                    Please fill out this form to express your interest.
                </p>

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Full Name</label>
                        <input type="text" name="fullName" value={formData.fullName} onChange={handleChange} required />
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Email</label>
                            <input type="email" name="email" value={formData.email} onChange={handleChange} required />
                        </div>
                        <div className="form-group">
                            <label>Phone Number</label>
                            <input type="tel" name="phone" value={formData.phone} onChange={handleChange} required />
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Address</label>
                        <textarea name="address" value={formData.address} onChange={handleChange} rows="2" required></textarea>
                    </div>

                    <div className="form-group">
                        <label>Do you have other pets?</label>
                        <select name="haveOtherPets" value={formData.haveOtherPets} onChange={handleChange}>
                            <option value="No">No</option>
                            <option value="Yes">Yes</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label>Why do you want to adopt?</label>
                        <textarea name="reason" value={formData.reason} onChange={handleChange} rows="4" required></textarea>
                    </div>

                    <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Submit Request</button>
                </form>
            </div>
            <style>{`
                .form-row {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 1rem;
                }
                .form-group {
                    margin-bottom: 1rem;
                }
                .form-group label {
                    display: block;
                    margin-bottom: 0.5rem;
                    font-weight: 500;
                    color: var(--color-text-dark);
                }
                .form-group input, .form-group select, .form-group textarea {
                     width: 100%;
                    padding: 0.75rem;
                    border: 1px solid var(--color-border);
                    border-radius: var(--radius-sm);
                    font-size: 1rem;
                }
                 .form-group input:focus, .form-group select:focus, .form-group textarea:focus {
                     outline: 2px solid var(--color-primary);
                 }
            `}</style>
        </div>
    );
}

export default AdoptionRequest;
