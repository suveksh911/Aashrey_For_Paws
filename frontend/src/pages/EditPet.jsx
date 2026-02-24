import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/axios';
import { toast } from 'react-toastify';
import PetHealthRecords from '../components/PetHealthRecords';
import MultiImageUpload from '../components/MultiImageUpload';
import { useAuth } from '../context/AuthContext';

function EditPet() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({
        name: '',
        type: 'Dog',
        breed: '',
        age: '',
        gender: '',
        location: '',
        description: '',
        adoptionStatus: 'Available',
        images: []
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
                    images: pet.images || (pet.image ? [pet.image] : []),
                    description: pet.description || '',
                    adoptionStatus: pet.adoptionStatus,
                    vaccinations: pet.vaccinations || [],
                    medicalHistory: pet.medicalHistory || []
                });
            }
        } catch (error) {
            // Fallback: load from localStorage (for Owner's locally-stored pets)
            const localPets = JSON.parse(localStorage.getItem('ngoPets')) || [];
            const found = localPets.find(p => p._id === id);
            if (found) {
                setFormData({
                    name: found.name || '',
                    type: found.type || 'Dog',
                    breed: found.breed || '',
                    age: found.age || '',
                    gender: found.gender || 'Male',
                    location: found.location || '',
                    image: found.image || '',
                    images: found.images || (found.image ? [found.image] : []),
                    description: found.description || '',
                    adoptionStatus: found.adoptionStatus || 'Available',
                    vaccinations: found.vaccinations || [],
                    medicalHistory: found.medicalHistory || []
                });
            } else {
                toast.error('Pet not found');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleImagesChange = (files) => {
        // Here we ideally upload to server and get URLs back, 
        // but for mock/base64 we convert and store
        Promise.all(files.map(file => {
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.readAsDataURL(file);
                reader.onload = () => resolve(reader.result);
                reader.onerror = error => reject(error);
            });
        })).then(base64Images => {
            setFormData(prev => ({
                ...prev,
                images: base64Images,
                image: base64Images[0] || prev.image // Update main image too
            }));
        });
    };

    const redirectAfterSave = () => {
        if (user?.role === 'Owner') navigate('/user');
        else navigate('/ngo');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await api.put(`/pets/${id}`, formData);
            if (response.data.success) {
                toast.success('Pet updated successfully');
                redirectAfterSave();
                return;
            }
        } catch (error) {
            // API failed — update locally
        }
        // Local update fallback
        const allPets = JSON.parse(localStorage.getItem('ngoPets')) || [];
        const updated = allPets.map(p => p._id === id ? { ...p, ...formData } : p);
        localStorage.setItem('ngoPets', JSON.stringify(updated));
        toast.success('Pet updated!');
        redirectAfterSave();
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
                    <label>Images</label>
                    <MultiImageUpload onImagesChange={handleImagesChange} maxImages={5} />
                    <div className="current-images">
                        {formData.images && formData.images.map((img, i) => (
                            <img key={i} src={img} alt="Current" style={{ width: '60px', height: '60px', objectFit: 'cover', margin: '5px', borderRadius: '4px' }} />
                        ))}
                    </div>
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
                    <button type="button" className="btn btn-secondary" onClick={() => user?.role === 'Owner' ? navigate('/user') : navigate('/ngo')}>Cancel</button>
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
