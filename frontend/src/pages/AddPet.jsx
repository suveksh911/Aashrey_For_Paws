import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../services/axios';
import { useAuth } from '../context/AuthContext';

function AddPet() {
    const [petInfo, setPetInfo] = useState({
        name: '',
        type: 'Dog',
        breed: '',
        age: '',
        gender: 'Male',
        location: '',
        description: '',
        healthStatus: 'Healthy',
        adoptionStatus: 'Available',
        image: ''
    });
    const [imagePreview, setImagePreview] = useState(null);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { user } = useAuth();
    const handleChange = (e) => {
        const { name, value } = e.target;
        setPetInfo((prev) => ({ ...prev, [name]: value }));
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setPetInfo((prev) => ({ ...prev, image: reader.result }));
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {

            if (!petInfo.name || !petInfo.breed || !petInfo.location) {
                toast.error("Please fill in all required fields.");
                setLoading(false);
                return;
            }

            
            const newPet = {
                ...petInfo,
                _id: Date.now().toString(),
                adopted: false, 
                createdAt: new Date().toISOString()
            };

           
            const currentPets = JSON.parse(localStorage.getItem('ngoPets')) || [];
            localStorage.setItem('ngoPets', JSON.stringify([...currentPets, newPet]));

           
            setTimeout(() => {
                toast.success('Pet added successfully (Local)!');
                navigate('/ngo');
            }, 500);

        } catch (error) {
            console.error("Error adding pet:", error);
            toast.error('Error adding pet');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container" style={{ padding: '2rem' }}>
            <div className="form-container" style={{ maxWidth: '600px', margin: '0 auto' }}>
                <h1 style={{ textAlign: 'center', marginBottom: '2rem' }}>Add a New Pet</h1>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Pet Name *</label>
                        <input type="text" name="name" value={petInfo.name} onChange={handleChange} required />
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Type</label>
                            <select name="type" value={petInfo.type} onChange={handleChange}>
                                <option value="Dog">Dog</option>
                                <option value="Cat">Cat</option>
                                <option value="Bird">Bird</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Breed *</label>
                            <input type="text" name="breed" value={petInfo.breed} onChange={handleChange} required />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Age (e.g., "2 years")</label>
                            <input type="text" name="age" value={petInfo.age} onChange={handleChange} />
                        </div>
                        <div className="form-group">
                            <label>Gender</label>
                            <select name="gender" value={petInfo.gender} onChange={handleChange}>
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                            </select>
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Location *</label>
                        <input type="text" name="location" value={petInfo.location} onChange={handleChange} required />
                    </div>

                    <div className="form-group">
                        <label>Health Status</label>
                        <input type="text" name="healthStatus" value={petInfo.healthStatus} onChange={handleChange} />
                    </div>

                    <div className="form-group">
                        <label>Description</label>
                        <textarea name="description" value={petInfo.description} onChange={handleChange} rows="4"></textarea>
                    </div>

                    <div className="form-group">
                        <label>Pet Image</label>
                        <input type="file" accept="image/*" onChange={handleImageChange} />
                        {imagePreview && (
                            <div style={{ marginTop: '1rem', textAlign: 'center' }}>
                                <img src={imagePreview} alt="Preview" style={{ maxWidth: '200px', borderRadius: '8px' }} />
                            </div>
                        )}
                    </div>

                    <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%', marginTop: '1rem' }}>
                        {loading ? 'Adding...' : 'Add Pet'}
                    </button>
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

export default AddPet;
