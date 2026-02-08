import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

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
        category: 'Dog', age: 'Unknown', status: 'Pending', image: ''
    });
    const { user, isAuthenticated } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        fetchPets();
    }, [activeTab]);

    const fetchPets = async () => {
        try {
            // Check local storage first
            const localPets = JSON.parse(localStorage.getItem('lostFoundPets')) || [];

            // Mock API or Static data
            const allPets = [...localPets, ...LOST_FOUND];

            // Filter by active tab
            setPets(allPets.filter(p => p.type === activeTab));

        } catch (err) {
            console.error(err);
            setPets(LOST_FOUND.filter(p => p.type === activeTab));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const newPet = {
            _id: Date.now().toString(),
            ...formData,
            type: activeTab,
            image: formData.image || 'https://via.placeholder.com/600x400?text=No+Image', // Default image
            createdAt: new Date().toISOString()
        };

        // Save to local storage
        const localPets = JSON.parse(localStorage.getItem('lostFoundPets')) || [];
        localStorage.setItem('lostFoundPets', JSON.stringify([newPet, ...localPets]));

        toast.success("Report submitted successfully");
        setShowForm(false);
        setFormData({
            name: '', breed: '', type: 'Lost', description: '', location: '', contactInfo: '',
            category: 'Dog', age: 'Unknown', status: 'Pending', image: ''
        });
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
                    <div className="form-row">
                        <input type="text" placeholder="Pet Name (if known)" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required />
                        <input type="text" placeholder="Breed" value={formData.breed} onChange={e => setFormData({ ...formData, breed: e.target.value })} required />
                    </div>
                    <div className="form-row">
                        <input type="text" placeholder="Location" value={formData.location} onChange={e => setFormData({ ...formData, location: e.target.value })} required />
                        <input type="text" placeholder="Contact Info" value={formData.contactInfo} onChange={e => setFormData({ ...formData, contactInfo: e.target.value })} required />
                    </div>
                    <div className="form-row">
                        <input type="text" placeholder="Image URL (Public link)" value={formData.image} onChange={e => setFormData({ ...formData, image: e.target.value })} />
                    </div>
                    <textarea placeholder="Description" rows="3" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} required></textarea>
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
