import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FaHeart, FaPaw, FaRegHeart, FaCheckCircle, FaSpinner, FaArrowLeft, FaShieldAlt } from 'react-icons/fa';
import api from '../services/axios';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';

const PRESET_AMOUNTS = [500, 1000, 2500, 5000];

// Fallback NGOs if the database is empty or the API fails
const DEMO_NGOS = [
    { _id: 'mayakochhaano_5', name: 'Maya ko Chhaano', location: 'Kathmandu', isVerified: true },
    { _id: 'animalnepal_1', name: 'Animal Nepal', location: 'Nakkhu, Lalitpur', isVerified: true },
    { _id: 'snehacare_2', name: "Sneha's Care", location: 'Bhaisepati, Lalitpur', isVerified: true },
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

    useEffect(() => {
        const fetchNgos = async () => {
            try {
                const res = await api.get('/admin/ngos/public');
                const fetchedNgos = res.data.success ? res.data.data : DEMO_NGOS;
                setNgos(fetchedNgos);
                
                // Pre-select NGO if ID provided in URL
                if (initialNgoId) {
                    const matched = fetchedNgos.find(n => n._id === initialNgoId);
                    if (matched) setSelectedNgo(matched);
                }
            } catch (err) {
                setNgos(DEMO_NGOS);
            } finally {
                setLoading(false);
            }
        };
        fetchNgos();
    }, [initialNgoId]);

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
                itemName: `Donation to ${selectedNgo.name}`,
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
        <div className="min-h-screen bg-[#FDFBF7] py-12 px-4">
            <div className="max-w-4xl mx-auto">
                <button onClick={() => navigate(-1)} className="mb-8 flex items-center gap-2 text-[#8D6E63] font-bold hover:gap-3 transition-all">
                    <FaArrowLeft /> Back
                </button>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
                    {/* Left: Info */}
                    <div className="space-y-6">
                        <div className="inline-block p-3 bg-red-50 rounded-2xl">
                            <FaHeart className="text-red-500 text-2xl" />
                        </div>
                        <h1 className="text-4xl font-black text-[#3E2723] leading-tight">
                            Help us provide a <span className="text-[#8D6E63]">better life</span> for every animal.
                        </h1>
                        <p className="text-gray-600 leading-relaxed font-medium">
                            Your generous contribution directly supports animal welfare organizations in providing food, medical care, and shelter to abandoned pets across Nepal.
                        </p>
                        
                        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-4">
                            <h3 className="font-bold text-[#5D4037]">Where your money goes:</h3>
                            <ul className="space-y-3">
                                {[
                                    '100% direct transfer to the selected NGO',
                                    'Critical medical emergencies & vaccinations',
                                    'Daily nutrition for sheltered animals',
                                    'Rescue operations and rehabilitation'
                                ].map((item, i) => (
                                    <li key={i} className="flex items-center gap-3 text-sm text-gray-500 font-medium">
                                        <FaCheckCircle className="text-green-500" /> {item}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    {/* Right: Form */}
                    <div className="bg-white rounded-[2rem] p-8 shadow-xl shadow-amber-900/5 border border-amber-100">
                        <h2 className="text-xl font-bold text-[#3E2723] mb-6">Make a Donation</h2>
                        
                        <div className="space-y-6">
                            {/* NGO Selector */}
                            <div>
                                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Select NGO</label>
                                <div className="grid grid-cols-1 gap-2">
                                    {ngos.map(ngo => (
                                        <button
                                            key={ngo._id}
                                            onClick={() => setSelectedNgo(ngo)}
                                            className={`flex items-center justify-between p-4 rounded-2xl border-2 transition-all ${
                                                selectedNgo?._id === ngo._id 
                                                ? 'border-[#8D6E63] bg-amber-50' 
                                                : 'border-gray-50 bg-gray-50 hover:border-amber-100'
                                            }`}
                                        >
                                            <div className="text-left">
                                                <p className={`font-bold text-sm ${selectedNgo?._id === ngo._id ? 'text-[#5D4037]' : 'text-gray-600'}`}>{ngo.name}</p>
                                                <p className="text-[10px] text-gray-400 font-bold uppercase">{ngo.location}</p>
                                            </div>
                                            {selectedNgo?._id === ngo._id && <FaRegHeart className="text-[#8D6E63]" />}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Amount Selector */}
                            <div>
                                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Donation Amount (Rs)</label>
                                <div className="grid grid-cols-4 gap-2 mb-4">
                                    {PRESET_AMOUNTS.map(amt => (
                                        <button
                                            key={amt}
                                            onClick={() => setAmount(amt.toString())}
                                            className={`py-3 rounded-xl text-sm font-black transition-all ${
                                                amount === amt.toString()
                                                ? 'bg-[#5D4037] text-white shadow-lg'
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
                                        className="w-full pl-12 pr-4 py-4 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-[#8D6E63] font-bold text-[#3E2723]"
                                    />
                                </div>
                            </div>

                            <button
                                onClick={handleDonate}
                                disabled={submitting}
                                className="w-full bg-[#5D4037] text-white py-5 rounded-2xl font-black text-lg hover:bg-[#3E2723] transition-all disabled:opacity-50 shadow-lg shadow-amber-900/20 flex items-center justify-center gap-3"
                            >
                                {submitting ? (
                                    <><FaSpinner className="animate-spin" /> Processing...</>
                                ) : (
                                    <>Donate Now</>
                                )}
                            </button>

                            <p className="text-center text-[10px] text-gray-400 flex items-center justify-center gap-1 font-bold">
                                <FaShieldAlt /> Secure Khalti Payment Gateway
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

