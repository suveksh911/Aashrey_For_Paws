import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FaHeart, FaPaw, FaRegHeart, FaCheckCircle, FaSpinner, FaArrowLeft, FaShieldAlt, FaGlobe, FaPhoneAlt, FaEnvelope, FaTimes } from 'react-icons/fa';
import api from '../services/axios';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';

const PRESET_AMOUNTS = [500, 1000, 2500, 5000];

// Fallback NGOs if the database is empty or the API fails
const DEMO_NGOS = [
    { _id: 'mayakochhaano_5', orgName: 'Maya ko Chhaano', location: 'Kathmandu', isVerified: true, email: 'suve345@gmail.com', phone: '980000004', bio: 'We are dedicated to rescuing and rehoming animals in need.', image: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80' },
    { _id: 'animalnepal_1', orgName: 'Animal Nepal', location: 'Nakkhu, Lalitpur', isVerified: true, phone: '+977-9841111111', bio: 'Improving the welfare of working equines and companion animals through rescue and community education.', image: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80' },
    { _id: 'snehacare_2', orgName: "Sneha's Care", location: 'Bhaisepati, Lalitpur', isVerified: true, phone: '+977-9842424242', bio: 'To provide a safe haven for injured and abandoned animals and promote animal welfare in Nepal.', image: 'https://images.unsplash.com/photo-1593134257782-e89567b7718a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80' },
];

export default function Donate() {
    const location = useLocation();
    const navigate = useNavigate();
    const { user, isAuthenticated } = useAuth();
    
    // Check for ngoId in query params (e.g., /donate?ngoId=123)
    const queryParams = new URLSearchParams(location.search);
    const initialNgoId = queryParams.get('ngoId');

    const [ngos, setNgos] = useState([]);
    const [selectedNgo, setSelectedNgo] = useState(null);
    const [amount, setAmount] = useState('');
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        const fetchNgos = async () => {
            try {
                const res = await api.get('/admin/ngos/public');
                const fetchedNgos = res.data.success ? res.data.data : DEMO_NGOS;
                setNgos(fetchedNgos.length > 0 ? fetchedNgos : DEMO_NGOS);
                
                // Pre-select NGO if ID provided in URL
                if (initialNgoId) {
                    const matched = (fetchedNgos.length > 0 ? fetchedNgos : DEMO_NGOS).find(n => n._id === initialNgoId);
                    if (matched) {
                        setSelectedNgo(matched);
                        setShowModal(true);
                    }
                }
            } catch (err) {
                setNgos(DEMO_NGOS);
            } finally {
                setLoading(false);
            }
        };
        fetchNgos();
    }, [initialNgoId]);

    const openDonateModal = (ngo) => {
        setSelectedNgo(ngo);
        setAmount('');
        setShowModal(true);
    };

    const handleDonate = async () => {
        if (!isAuthenticated) return toast.info('Please login to make a donation');
        if (!selectedNgo) return toast.error('Please select an NGO');
        if (!amount || Number(amount) < 10) return toast.error('Minimum donation is Rs. 10');

        setSubmitting(true);
        try {
            const res = await api.post('/payment/initiate', {
                amount: Number(amount),
                purpose: 'Donation',
                referenceId: selectedNgo._id,
                itemName: `Donation to ${selectedNgo.name || selectedNgo.orgName}`,
                returnUrl: `${window.location.origin}/khalti-callback`
            });

            if (res.data.success && res.data.payment_url) {
                window.location.href = res.data.payment_url;
            } else {
                toast.error('Failed to initiate payment.');
                setSubmitting(false);
            }
        } catch (err) {
            toast.error('Error connecting to payment gateway');
            setSubmitting(false);
        }
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-[#FDFBF7]">
            <FaPaw className="animate-bounce text-[#8D6E63]" size={40} />
        </div>
    );

    return (
        <div className="min-h-screen bg-[#FDFBF7] py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <style>{`
                    .khalti-icon {
                        display: inline-block;
                        width: 16px;
                        height: 12px;
                        background: #39b5e0;
                        border-radius: 2px;
                        position: relative;
                        margin-right: 6px;
                        vertical-align: middle;
                    }
                    .khalti-icon::before, .khalti-icon::after {
                        content: '';
                        position: absolute;
                        left: 2px;
                        right: 2px;
                        height: 2px;
                        background: white;
                    }
                    .khalti-icon::before { top: 3px; }
                    .khalti-icon::after { bottom: 3px; }
                `}</style>
                
                {/* Hero Section */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl md:text-5xl font-black text-[#3E2723] mb-4">
                        Support Our Verified NGOs
                    </h1>
                    <p className="text-lg text-gray-500 max-w-2xl mx-auto">
                        Your generous contribution directly helps animal welfare organizations rescue, feed, and provide medical care to pets in need.
                    </p>
                </div>

                {/* NGOs Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {ngos.map((ngo, idx) => (
                        <div key={ngo._id || idx} className="bg-white rounded-2xl overflow-hidden shadow-lg border border-gray-100 flex flex-col hover:shadow-xl transition-shadow">
                            <div className="h-48 w-full bg-gray-200 relative">
                                <img 
                                    src={ngo.profileImage || ngo.image || DEMO_NGOS[idx % DEMO_NGOS.length].image} 
                                    alt={ngo.orgName || ngo.name} 
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            
                            <div className="p-6 flex flex-col flex-grow">
                                {ngo.isVerified && (
                                    <div className="self-start mb-3 bg-[#0088FF] text-white text-[11px] font-bold px-3 py-1 rounded-full flex items-center gap-1">
                                        <FaShieldAlt size={10} /> Verified NGO
                                    </div>
                                )}
                                
                                <h3 className="text-lg font-medium text-gray-700 mb-2 font-serif">
                                    {ngo.orgName || ngo.name || 'NGO'}
                                </h3>
                                
                                <p className="text-sm text-[#8D6E63] mb-6 line-clamp-3">
                                    {ngo.bio || ngo.description || 'We are dedicated to rescuing and rehoming animals in need and providing a safe haven.'}
                                </p>
                                
                                <div className="space-y-2 mb-6 text-sm text-gray-500 flex-grow">
                                    <div className="flex items-center gap-2">
                                        <FaGlobe className="text-gray-400" />
                                        <span>{ngo.email || ngo.location || 'Kathmandu, Nepal'}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <FaPhoneAlt className="text-gray-400" />
                                        <span>{ngo.phone || '+977-XXXXXXXXXX'}</span>
                                    </div>
                                </div>
                                
                                <button 
                                    onClick={() => openDonateModal(ngo)}
                                    className="w-full bg-[#8D6E63] text-white py-3 rounded-lg font-bold hover:bg-[#5D4037] transition-colors flex items-center justify-center gap-2 shadow-sm"
                                >
                                    <span className="khalti-icon"></span> Donate to Support
                                </button>
                                
                                <div className="mt-4 text-center">
                                    <a href={ngo.website || '#'} target="_blank" rel="noopener noreferrer" className="text-xs text-gray-400 hover:text-gray-600 transition-colors">
                                        Visit Website →
                                    </a>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Donation Modal */}
                {showModal && (
                    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                        <div className="bg-white rounded-[2rem] w-full max-w-lg shadow-2xl relative overflow-hidden flex flex-col">
                            {/* Modal Header */}
                            <div className="bg-[#5D4037] p-6 text-white text-center relative">
                                <button 
                                    onClick={() => setShowModal(false)}
                                    className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors"
                                >
                                    <FaTimes size={20} />
                                </button>
                                <h2 className="text-2xl font-black mb-1">Make a Donation</h2>
                                <p className="text-sm opacity-90">Supporting: <span className="font-bold">{selectedNgo?.orgName || selectedNgo?.name}</span></p>
                            </div>
                            
                            {/* Modal Body */}
                            <div className="p-8 space-y-6">
                                {/* Amount Selector */}
                                <div>
                                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-3 text-center">Select Amount (Rs)</label>
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                                        {PRESET_AMOUNTS.map(amt => (
                                            <button
                                                key={amt}
                                                onClick={() => setAmount(amt.toString())}
                                                className={`py-3 rounded-xl text-sm font-black transition-all ${
                                                    amount === amt.toString()
                                                    ? 'bg-[#5D4037] text-white shadow-lg scale-105'
                                                    : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                                                }`}
                                            >
                                                {amt}
                                            </button>
                                        ))}
                                    </div>
                                    <div className="relative">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-gray-400">Rs.</span>
                                        <input
                                            type="number"
                                            placeholder="Enter custom amount"
                                            value={amount}
                                            onChange={(e) => setAmount(e.target.value)}
                                            className="w-full pl-12 pr-4 py-4 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-[#8D6E63] font-bold text-[#3E2723] text-lg text-center"
                                        />
                                    </div>
                                </div>

                                <button
                                    onClick={handleDonate}
                                    disabled={submitting}
                                    className="w-full bg-[#5D4037] text-white py-4 rounded-2xl font-black text-lg hover:bg-[#3E2723] transition-all disabled:opacity-50 shadow-lg shadow-amber-900/20 flex items-center justify-center gap-3"
                                >
                                    {submitting ? (
                                        <><FaSpinner className="animate-spin" /> Processing...</>
                                    ) : (
                                        <><span className="khalti-icon"></span> Donate Now</>
                                    )}
                                </button>

                                <p className="text-center text-[10px] text-gray-400 flex items-center justify-center gap-1 font-bold">
                                    <FaShieldAlt /> Secure Khalti Payment Gateway
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
