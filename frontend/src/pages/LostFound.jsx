import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import MultiImageUpload from '../components/MultiImageUpload';

const LOST_FOUND = [
    {
        _id: 'lf1',
        name: 'KIko',
        type: 'Lost',
        breed: 'Local Mix',
        location: 'Koteshwor, Kathmandu',
        gender: 'Male',
        description: 'Lost near the main chowk. Wearing a red collar. Very friendly but scared.',
        contactInfo: '9841000000',
        image: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=600&q=80'
    },
    {
        _id: 'lf2',
        name: 'Unknown',
        type: 'Found',
        breed: 'Golden Retriever',
        location: 'Dharan -15',
        gender: 'Female',
        description: 'Found wandering near the main road. Seems well fed and trained. Currently at shelter.',
        contactInfo: '9801000000 (Sneha\'s Care)',
        image: 'https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=600&q=80'
    },
    {
        _id: 'lf3',
        name: 'pluff',
        type: 'Lost',
        breed: 'Beagle',
        location: 'Itahari -17',
        gender: 'Female',
        description: 'Ran away during Tihar festival due to firecrackers. Has a distinct spot on left ear.',
        contactInfo: '9851000000',
        image: 'https://images.unsplash.com/photo-1537151608828-ea2b11777ee8?auto=format&fit=crop&w=600&q=80'
    },
    {
        _id: 'lf4',
        name: 'Unknown Pup',
        type: 'Found',
        breed: 'Husky Mix',
        location: 'BPKIHS, Dharan',
        gender: 'Male',
        description: 'Found near camp main gate shivering in the cold. Young puppy, blue eyes.',
        contactInfo: 'Contact local police station',
        image: 'https://images.unsplash.com/photo-1605568427561-40dd23d2acca?auto=format&fit=crop&w=600&q=80'
    }
];

function LostFound() {
    const [activeTab, setActiveTab] = useState('Lost');
    const [pets, setPets] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        name: '', breed: '', type: 'Lost', description: '', location: '', contactInfo: '',
        category: 'Dog', age: 'Unknown', status: 'Pending', image: '',
        color: '', gender: 'Unknown', condition: 'Unknown', dateFound: new Date().toISOString().split('T')[0]
    });
    const { user, isAuthenticated } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        fetchPets();
    }, [activeTab]);

    const fetchPets = async () => {
        try {

            const localPets = JSON.parse(localStorage.getItem('lostFoundPets')) || [];


            const allPets = [...localPets, ...LOST_FOUND];


            setPets(allPets.filter(p => p.type === activeTab));

        } catch (err) {
            console.error(err);
            setPets(LOST_FOUND.filter(p => p.type === activeTab));
        }
    };

    const [imageFiles, setImageFiles] = useState([]);

    const handleImagesChange = (files) => {
        setImageFiles(files);
    };

    const convertToBase64 = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result);
            reader.onerror = error => reject(error);
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        let imageUrl = 'https://via.placeholder.com/600x400?text=No+Image';

        if (imageFiles.length > 0) {
            try {
                // For demo, just take the first image
                imageUrl = await convertToBase64(imageFiles[0]);
            } catch (error) {
                console.error("Error converting image", error);
                toast.error("Failed to process image");
                return;
            }
        } else if (formData.image) {
            imageUrl = formData.image;
        }

        const newPet = {
            _id: Date.now().toString(),
            ...formData,
            type: activeTab,
            image: imageUrl,
            createdAt: new Date().toISOString()
        };

        const localPets = JSON.parse(localStorage.getItem('lostFoundPets')) || [];
        localStorage.setItem('lostFoundPets', JSON.stringify([newPet, ...localPets]));

        toast.success("Report submitted successfully");
        setShowForm(false);
        setFormData({
            name: '', breed: '', type: 'Lost', description: '', location: '', contactInfo: '',
            category: 'Dog', age: 'Unknown', status: 'Pending', image: '',
            color: '', gender: 'Unknown', condition: 'Unknown', dateFound: new Date().toISOString().split('T')[0]
        });
        setImageFiles([]);
        fetchPets();
    };

    return (
        <div className="lost-found-page container">
            <div className="lost-found-header">
                <h1>Lost & Found</h1>
                <p>Help us reunite pets with their owners.</p>
            </div>
            <div className="tabs">
                <button className={`tab-btn ${activeTab === 'Lost' ? 'active' : ''}`} onClick={() => setActiveTab('Lost')}>Lost Pets</button>
                <button className={`tab-btn ${activeTab === 'Found' ? 'active' : ''}`} onClick={() => setActiveTab('Found')}>Found Pets</button>
            </div>

            <div className="action-bar">
                <p>Have you {activeTab === 'Lost' ? 'lost' : 'found'} a pet? Report it here to help reunite them.</p>
                <button className="btn btn-primary" onClick={() => {
                    if (!isAuthenticated) {
                        toast.info("Please login to report a pet");
                        navigate('/login');
                    } else {
                        setShowForm(!showForm);
                    }
                }}>
                    {showForm ? 'Cancel Report' : `Report ${activeTab} Pet`}
                </button>
            </div>

            {showForm && (
                <form className="report-form" onSubmit={handleSubmit}>
                    <h3>Report {activeTab} Pet</h3>
                    <div className="form-row">
                        <input type="text" placeholder="Pet Name (if known)" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required />
                        <input type="text" placeholder="Breed" value={formData.breed} onChange={e => setFormData({ ...formData, breed: e.target.value })} required />
                    </div>
                    <div className="form-row">
                        <input type="text" placeholder="Location" value={formData.location} onChange={e => setFormData({ ...formData, location: e.target.value })} required />
                        <input type="text" placeholder="Contact Info" value={formData.contactInfo} onChange={e => setFormData({ ...formData, contactInfo: e.target.value })} required />
                    </div>

                    {/* Extra fields for Found pets */}
                    {activeTab === 'Found' && (
                        <>
                            <div className="form-row">
                                <div style={{ flex: 1 }}>
                                    <label style={{ display: 'block', marginBottom: '4px', fontSize: '0.85rem', color: '#666' }}>Pet Color / Markings</label>
                                    <input type="text" placeholder="e.g. Brown with white spots" value={formData.color} onChange={e => setFormData({ ...formData, color: e.target.value })} />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <label style={{ display: 'block', marginBottom: '4px', fontSize: '0.85rem', color: '#666' }}>Date Found</label>
                                    <input type="date" value={formData.dateFound} onChange={e => setFormData({ ...formData, dateFound: e.target.value })} max={new Date().toISOString().split('T')[0]} />
                                </div>
                            </div>
                            <div className="form-row">
                                <div style={{ flex: 1 }}>
                                    <label style={{ display: 'block', marginBottom: '4px', fontSize: '0.85rem', color: '#666' }}>Gender</label>
                                    <select value={formData.gender} onChange={e => setFormData({ ...formData, gender: e.target.value })} style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)' }}>
                                        <option value="Unknown">Unknown</option>
                                        <option value="Male">Male</option>
                                        <option value="Female">Female</option>
                                    </select>
                                </div>
                                <div style={{ flex: 1 }}>
                                    <label style={{ display: 'block', marginBottom: '4px', fontSize: '0.85rem', color: '#666' }}>Condition When Found</label>
                                    <select value={formData.condition} onChange={e => setFormData({ ...formData, condition: e.target.value })} style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)' }}>
                                        <option value="Unknown">Unknown</option>
                                        <option value="Healthy">Healthy</option>
                                        <option value="Injured">Injured</option>
                                        <option value="Malnourished">Malnourished</option>
                                    </select>
                                </div>
                            </div>
                        </>
                    )}

                    {/* Replaced Text Input with MultiImageUpload */}
                    <div className="form-section">
                        <label>Upload Image:</label>
                        <MultiImageUpload onImagesChange={handleImagesChange} maxImages={1} />
                    </div>

                    <textarea placeholder="Description (Color, distinct marks, etc.)" rows="3" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} required></textarea>
                    <button type="submit" className="btn btn-primary">Submit Report</button>
                </form>
            )}

            <div className="listings-grid">
                {pets.map(pet => (
                    <div className="listing-card" key={pet._id}>
                        <div className="pet-img">
                            <img src={pet.image} alt={pet.name} />
                        </div>
                        <div className="listing-info">
                            <h3>{pet.name}</h3>
                            <p className="location">📍 {pet.location}</p>
                            {pet.type === 'Found' && (
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', margin: '6px 0' }}>
                                    {pet.condition && pet.condition !== 'Unknown' && (
                                        <span style={{ background: pet.condition === 'Healthy' ? '#d4edda' : pet.condition === 'Injured' ? '#f8d7da' : '#fff3cd', color: pet.condition === 'Healthy' ? '#155724' : pet.condition === 'Injured' ? '#721c24' : '#856404', fontSize: '0.75rem', padding: '2px 8px', borderRadius: '12px', fontWeight: '600' }}>🐾 {pet.condition}</span>
                                    )}
                                    {pet.color && (
                                        <span style={{ background: '#e8f4fd', color: '#0c5460', fontSize: '0.75rem', padding: '2px 8px', borderRadius: '12px' }}>🎨 {pet.color}</span>
                                    )}
                                    {pet.gender && pet.gender !== 'Unknown' && (
                                        <span style={{ background: '#f3e5f5', color: '#6a1b9a', fontSize: '0.75rem', padding: '2px 8px', borderRadius: '12px' }}>{pet.gender === 'Male' ? '♂' : '♀'} {pet.gender}</span>
                                    )}
                                    {pet.dateFound && (
                                        <span style={{ background: '#f5f5f5', color: '#555', fontSize: '0.75rem', padding: '2px 8px', borderRadius: '12px' }}>📅 Found: {pet.dateFound}</span>
                                    )}
                                </div>
                            )}
                            <p className="desc">{pet.description}</p>
                            <div className="contact-box">Contact: {pet.contactInfo}</div>
                        </div>
                    </div>
                ))}
            </div>

            <style>{`
                .lost-found-page { padding: 2rem; }
                .lost-found-header {
                    background: linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.6)), url('https://images.unsplash.com/photo-1601758228041-f3b2795255db?auto=format&fit=crop&w=1950&q=80');
                    background-size: cover;
                    background-position: center;
                    color: white;
                    text-align: center;
                    padding: 4rem 1rem;
                    border-radius: var(--radius-md);
                    margin-bottom: 2rem;
                }
                .lost-found-header h1 { font-size: 3rem; margin-bottom: 0.5rem; color: white; }
                .lost-found-header p { font-size: 1.2rem; opacity: 0.9; }
                .tabs { display: flex; justify-content: center; gap: 1rem; margin-bottom: 2rem; }
                .tab-btn { padding: 1rem 2rem; background: var(--color-surface); border: 2px solid transparent; font-size: 1.2rem; font-weight: 600; cursor: pointer; border-radius: var(--radius-md); }
                .tab-btn.active { border-color: var(--color-primary); color: var(--color-primary); }
                .action-bar { text-align: center; margin-bottom: 2rem; padding: 2rem; background: var(--color-surface); border-radius: var(--radius-lg); }
                .action-bar button { margin-top: 1rem; }
                
                .report-form { max-width: 600px; margin: 0 auto 3rem; padding: 2rem; background: var(--color-surface); border: 1px solid var(--color-border); border-radius: var(--radius-md); display: flex; flex-direction: column; gap: 1rem; }
                .form-row { display: flex; gap: 1rem; }
                .report-form input, .report-form textarea { width: 100%; padding: 0.75rem; border: 1px solid var(--color-border); border-radius: var(--radius-sm); }
                
                .listings-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 2rem; }
                .listing-card { background: var(--color-surface); border-radius: var(--radius-md); overflow: hidden; border: 1px solid var(--color-border); }
                .pet-img { height: 200px; overflow: hidden; }
                .pet-img img { width: 100%; height: 100%; object-fit: cover; }
                .listing-info { padding: 1.5rem; }
                .location { color: var(--color-primary); font-size: 0.9rem; margin-bottom: 0.5rem; }
                .contact-box { background: #EFEBE9; padding: 0.5rem; border-radius: var(--radius-sm); margin-top: 1rem; font-weight: 600; text-align: center; }

                @media(max-width: 600px) { .form-row { flex-direction: column; } }
            `}</style>
        </div>
    );
}

export default LostFound;
