import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/axios';
import { toast } from 'react-toastify';

const NGOPetListings = () => {
    const [pets, setPets] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchPets();
    }, []);

    const fetchPets = async () => {
        try {
            const response = await api.get('/pets');
            setPets(response.data.pets || []);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching pets, using mock data:", error);
        
            const mockNgoPets = [
                { _id: 'm1', name: 'Buddy', breed: 'Golden Retriever', adoptionStatus: 'Available', image: 'https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=600&q=80', adopted: false },
                { _id: 'm3', name: 'Rocky', breed: 'German Shepherd', adoptionStatus: 'Available', image: 'https://images.unsplash.com/photo-1589941013453-ec89f33b5e95?auto=format&fit=crop&w=600&q=80', adopted: false }
            ];

            
            const localPets = JSON.parse(localStorage.getItem('ngoPets')) || [];

            setPets([...mockNgoPets, ...localPets]);
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this pet listing?")) {
            try {
                await api.delete(`/pets/${id}`);
                toast.success("Pet listing deleted successfully");
                fetchPets();
            } catch (error) {
                toast.error("Failed to delete pet");
            }
        }
    };

    if (loading) return <div>Loading pets...</div>;

    return (
        <div className="ngo-pet-listings">
            <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <h3>My Pet Listings</h3>
                <Link to="/add-pet" className="btn-primary" style={{ textDecoration: 'none', padding: '8px 16px', backgroundColor: '#5d4037', color: 'white', borderRadius: '4px' }}>
                    Add New Pet
                </Link>
            </div>

            {pets.length === 0 ? (
                <p>No pets listed yet.</p>
            ) : (
                <div className="table-responsive">
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ backgroundColor: '#f2f2f2' }}>
                                <th style={{ padding: '10px', textAlign: 'left' }}>Image</th>
                                <th style={{ padding: '10px', textAlign: 'left' }}>Name</th>
                                <th style={{ padding: '10px', textAlign: 'left' }}>Breed</th>
                                <th style={{ padding: '10px', textAlign: 'left' }}>Status</th>
                                <th style={{ padding: '10px', textAlign: 'left' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {pets.map(pet => (
                                <tr key={pet._id} style={{ borderBottom: '1px solid #ddd' }}>
                                    <td style={{ padding: '10px' }}>
                                        <img src={pet.image} alt={pet.name} style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '50%' }} />
                                    </td>
                                    <td style={{ padding: '10px' }}>{pet.name}</td>
                                    <td style={{ padding: '10px' }}>{pet.breed}</td>
                                    <td style={{ padding: '10px' }}>
                                        <span style={{
                                            padding: '4px 8px',
                                            borderRadius: '12px',
                                            backgroundColor: pet.adopted ? '#d4edda' : '#fff3cd',
                                            color: pet.adopted ? '#155724' : '#856404',
                                            fontSize: '0.85rem'
                                        }}>
                                            {pet.adopted ? 'Adopted' : 'Available'}
                                        </span>
                                    </td>
                                    <td style={{ padding: '10px' }}>
                                        <button onClick={() => handleDelete(pet._id)} style={{ padding: '5px 10px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                                            Delete
                                        </button>
                                        <Link to={`/edit-pet/${pet._id}`} style={{ marginLeft: '10px', padding: '5px 10px', backgroundColor: '#007bff', color: 'white', textDecoration: 'none', borderRadius: '4px', fontSize: '0.9rem' }}>Edit</Link>
                                        <Link to={`/pet/${pet._id}`} style={{ marginLeft: '10px', color: '#5d4037' }}>View</Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default NGOPetListings;
