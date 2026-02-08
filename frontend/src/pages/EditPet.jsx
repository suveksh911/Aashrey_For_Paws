import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/axios';
import { toast } from 'react-toastify';
import PetHealthRecords from '../components/PetHealthRecords';

function EditPet() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({
        name: '',
        type: 'Dog',
        breed: '',
        age: '',
        gender: '',
        location: '',
        image: '',
        description: '',
        adoptionStatus: 'Available'
    });

    useEffect(() => {
        fetchPetDetails();
    }, [id]);

    const fetchPetDetails = async () => {
        try {
            const response = await api.get(`/pets/${id}`);
            if (response.data.success) {
                const pet = response.data.data;
                setFormData({
                    name: pet.name,
                    type: pet.type,
                    breed: pet.breed,
                    age: pet.age,
                    gender: pet.gender,
                    location: pet.location,
                    image: pet.image || '',
                    description: pet.description || '',
                    adoptionStatus: pet.adoptionStatus,
                    vaccinations: pet.vaccinations || [],
                    medicalHistory: pet.medicalHistory || []
                });
            }
        } catch (error) {
            toast.error('Failed to load pet details');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await api.put(`/pets/${id}`, formData);
            if (response.data.success) {
                toast.success('Pet updated successfully');
                navigate('/ngo');
            } else {
                toast.error(response.data.message || 'Update failed');
            }
        } catch (error) {
            toast.error('Failed to update pet');
        }
    };

    if (loading) return <div className="container center-content">Loading...</div>;

    return (
        <div className="container" style={{ padding: '2rem', maxWidth: '800px' }}>
            <h1>Edit Pet Details</h1>
            <form onSubmit={handleSubmit} className="edit-pet-form">
                <div className="form-group">
                    <label>Name</label>
                    <input type="text" name="name" value={formData.name} onChange={handleChange} required />
                </div>

                <div className="form-row">
                    <div className="form-group">
                        <label>Type</label>
                        <select name="type" value={formData.type} onChange={handleChange}>
                            <option value="Dog">Dog</option>
                            <option value="Cat">Cat</option>
                        </select>
                    </div>
                    <div className="form-group">
                        <label>Breed</label>
                        <input type="text" name="breed" value={formData.breed} onChange={handleChange} required />
                    </div>
                </div>

                <div className="form-row">
                    <div className="form-group">
                        <label>Age</label>
                        <input type="text" name="age" value={formData.age} onChange={handleChange} placeholder="e.g. 2 years" />
                    </div>
                    <div className="form-group">
                        <label>Gender</label>
                        <select name="gender" value={formData.gender} onChange={handleChange}>
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                        </select>
                    </div>
                </div>

                <div className="form-group">
                    <label>Location</label>
                    <input type="text" name="location" value={formData.location} onChange={handleChange} required />
                </div>

                <div className="form-group">
                    <label>Image URL</label>
                    <input type="text" name="image" value={formData.image} onChange={handleChange} />
                </div>

                <div className="form-group">
                    <label>Description</label>
                    <textarea name="description" value={formData.description} onChange={handleChange} rows="4"></textarea>
                </div>

                <div className="form-group">
                    <label>Adoption Status</label>
                    <select name="adoptionStatus" value={formData.adoptionStatus} onChange={handleChange}>
                        <option value="Available">Available</option>
                        <option value="Adopted">Adopted</option>
                        <option value="Pending">Pending</option>
                    </select>
                </div>

                <div style={{ marginTop: '2rem', borderTop: '1px solid #eee', paddingTop: '2rem' }}>

                    <PetHealthRecords
                        pet={formData}
                        isEditable={true}
                        onUpdate={(field, updatedData) => setFormData(prev => ({ ...prev, [field]: updatedData }))}
                    />

                </div>

                <div className="form-actions" style={{ marginTop: '2rem', display: 'flex', gap: '1rem' }}>
                    <button type="submit" className="btn btn-primary">Save Changes</button>
                    <button type="button" className="btn btn-secondary" onClick={() => navigate('/ngo')}>Cancel</button>
                </div>
            </form>

            <style>{`
                .edit-pet-form {
                    background: #fff;
                    padding: 2rem;
                    border-radius: 8px;
                    border: 1px solid #ddd;
                }
                .form-group {
                    margin-bottom: 1rem;
                }
                .form-group label {
                    display: block;
                    margin-bottom: 0.5rem;
                    font-weight: bold;
                }
                .form-group input, .form-group select, .form-group textarea {
                    width: 100%;
                    padding: 0.8rem;
                    border: 1px solid #ddd;
                    border-radius: 4px;
                }
                .form-row {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 1rem;
                }
            `}</style>
        </div>
    );
}

export default EditPet;
