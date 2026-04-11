import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { FaPaw, FaMapMarkerAlt, FaShieldAlt, FaCheckCircle, FaArrowLeft } from 'react-icons/fa';
import { toast } from 'react-toastify';
import api from '../services/axios';
import { useAuth } from '../context/AuthContext';

export default function PetPurchase() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [pet, setPet] = useState(null);
    const [loading, setLoading] = useState(true);
    const [paying, setPaying] = useState(false);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        api.get(`/pets/${id}`)
            .then(res => { if (res.data.success) setPet(res.data.data); })
            .catch(() => toast.error('Failed to load pet details'))
            .finally(() => setLoading(false));
    }, [id]);

    const handleKhaltiPay = async () => {
        if (!user) { toast.info('Please login to proceed'); navigate('/login'); return; }

        setPaying(true);
        try {
            const res = await api.post('/payment/initiate', {
                amount: pet.price || 0,
                purpose: 'PetPurchase',
                referenceId: pet._id,
                itemName: pet.name,
                returnUrl: `${window.location.origin}/khalti-callback` // Dynamic callback URL
            });

            if (res.data.success && res.data.payment_url) {
                // Redirect user to Khalti hosted page
                window.location.href = res.data.payment_url;
            } else {
                toast.error('Failed to initialize Khalti payment.');
                setPaying(false);
            }
        } catch (error) {
            console.error(error);
            toast.error('Payment initiation error. Please try again.');
            setPaying(false);
        }
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center">
            <FaPaw className="animate-bounce" style={{ color: "var(--color-primary)" }} size={36} />
        </div>
    );

    if (!pet) return (
        <div className="min-h-screen flex flex-col items-center justify-center gap-4">
            <p className="text-gray-500">Pet not found.</p>
            <Link to="/pet-find" style={{ color: "var(--color-primary)", textDecoration: "underline" }}>Browse all pets</Link>
        </div>
    );

    // ── MAIN PAYMENT PAGE ──────────────────────────────────────────────────────
    return (
        <div className="min-h-screen bg-gray-50 py-10 px-4">
            <div className="max-w-2xl mx-auto space-y-6">
                {/* Back */}
                <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-[#8D6E63] font-semibold text-sm hover:underline">
                    <FaArrowLeft /> Back
                </button>

                {/* Pet summary card */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="flex">
                        <div className="w-40 sm:w-52 flex-shrink-0">
                            <img
                                src={pet.image || pet.images?.[0] || 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=400'}
                                alt={pet.name}
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <div className="flex-1 p-5">
                            <div className="flex items-start justify-between flex-wrap gap-2">
                                <div>
                                    <h2 className="text-xl font-bold text-[#3E2723]">{pet.name}</h2>
                                    <p className="text-gray-400 text-sm">{pet.breed} · {pet.age}</p>
                                </div>
                                <span className="bg-orange-100 text-orange-700 text-xs font-bold px-3 py-1 rounded-full border border-orange-200">
                                    🛒 For Sale
                                </span>
                            </div>
                            <div className="flex items-center gap-2 mt-3 text-sm text-gray-500">
                                <FaMapMarkerAlt className="text-[#8D6E63]" />
                                {pet.location}
                            </div>
                            {pet.vaccinated && (
                                <span className="inline-flex items-center gap-1 mt-2 text-xs text-green-600 font-semibold">
                                    <FaCheckCircle /> Vaccinated
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Order summary */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                    <h3 className="font-bold text-[#5D4037] mb-4">Order Summary</h3>
                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between"><span className="text-gray-400">Pet Price</span><span className="font-semibold">Rs. {(pet.price || 0).toLocaleString()}</span></div>
                        <div className="flex justify-between"><span className="text-gray-400">Platform Fee</span><span className="text-green-600 font-semibold">Free</span></div>
                        <hr className="my-2" />
                        <div className="flex justify-between text-base font-bold">
                            <span>Total</span>
                            <span className="text-[#5D4037]">Rs. {(pet.price || 0).toLocaleString()}</span>
                        </div>
                    </div>
                </div>

                {/* Trust badges */}
                <div className="grid grid-cols-3 gap-3 text-center">
                    {[
                        { icon: '🔒', label: 'Secure Payment', sub: 'Khalti encrypted' },
                        { icon: '✅', label: 'Verified Seller', sub: 'NGO / Owner verified' },
                        { icon: '🐾', label: 'Adoption Care', sub: 'Post-purchase support' },
                    ].map(b => (
                        <div key={b.label} className="bg-white rounded-xl border border-gray-100 p-3">
                            <div className="text-xl mb-1">{b.icon}</div>
                            <p className="text-xs font-bold text-gray-700">{b.label}</p>
                            <p className="text-xs text-gray-400">{b.sub}</p>
                        </div>
                    ))}
                </div>

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
                {/* Pay button */}
                <button
                    onClick={handleKhaltiPay}
                    disabled={paying}
                    className="w-full bg-[#5D4037] text-white py-4 rounded-2xl font-black text-lg flex items-center justify-center gap-3 hover:bg-[#3E2723] transition-colors disabled:opacity-60 shadow-lg shadow-amber-900/20"
                >
                    {paying ? (
                        <>Processing…</>
                    ) : (
                        <>
                            <span className="khalti-icon"></span>
                            Pay Rs. {(pet.price || 0).toLocaleString()} with Khalti
                        </>
                    )}
                </button>

                <p className="text-center text-xs text-gray-400 flex items-center justify-center gap-1">
                    <FaShieldAlt /> Your payment is secured by Khalti. We never store card details.
                </p>
            </div>
        </div>
    );
}
