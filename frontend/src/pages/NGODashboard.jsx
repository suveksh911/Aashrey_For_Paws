import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../services/axios';
import { useAuth } from '../context/AuthContext';
import {
    FaPaw, FaClipboardList, FaBullhorn, FaSyringe, FaHeart,
    FaUserCircle, FaShieldAlt, FaPlus, FaEdit, FaTrash,
    FaEye, FaCheck, FaTimes, FaSignOutAlt, FaBars,
    FaCheckCircle, FaHourglassHalf, FaTimesCircle, FaFileUpload,
    FaChartLine, FaDonate, FaBell, FaSpinner, FaCamera,
    FaEnvelope, FaPhone, FaMapMarkerAlt, FaSearch, FaGlobe, FaReply, FaStar, FaSave
} from 'react-icons/fa';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    BarChart, Bar, Legend
} from 'recharts';
import VaccinationReminder from '../components/pet/VaccinationReminder';
import useVaccinationReminders from '../hooks/useVaccinationReminders';
const NGOProfilePage = React.lazy(() => import('./RoleProfiles').then(m => ({ default: m.default })));
const Notifications = React.lazy(() => import('./Notifications'));

const NGODashboardStyles = () => (
    <style>{`
        .a-hero-profile {
            background: linear-gradient(135deg, #3E2723 0%, #5D4037 100%) !important;
            border-radius: 20px !important;
            padding: 2.5rem !important;
            color: white !important;
            display: flex !important;
            justify-content: space-between !important;
            align-items: center !important;
            margin-bottom: 2.5rem !important;
            box-shadow: 0 8px 24px rgba(93, 64, 55, 0.15) !important;
            position: relative !important;
            overflow: hidden !important;
            border: 1px solid rgba(255,255,255,0.05) !important;
        }
        .a-profile-identity {
            display: flex !important;
            align-items: center !important;
            gap: 2rem !important;
        }
        .a-avatar-wrapper {
            position: relative !important;
            width: 100px !important;
            height: 100px !important;
        }
        .a-avatar-wrapper img, .a-avatar-placeholder {
            width: 100% !important;
            height: 100% !important;
            border-radius: 50% !important;
            object-fit: cover !important;
            border: 4px solid rgba(255,255,255,0.2) !important;
            background: #5D4037 !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            font-size: 2.2rem !important;
            font-weight: 800 !important;
            color: rgba(255,255,255,0.9) !important;
            text-transform: uppercase !important;
        }
        .a-avatar-badge {
            position: absolute !important;
            bottom: 0 !important;
            right: 0 !important;
            background: #FFAB91 !important;
            color: #3E2723 !important;
            width: 32px !important;
            height: 32px !important;
            border-radius: 50% !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            border: 2px solid #5D4037 !important;
        }
        .a-profile-info h1 { color: white !important; margin: 0 !important; font-size: 2.2rem !important; font-weight: 900 !important; }
        .a-profile-info p { opacity: 0.8 !important; margin: 4px 0 0 !important; font-size: 0.95rem !important; }
        .a-badge { background: rgba(255,255,255,0.2); padding: 4px 12px; border-radius: 20px; font-size: 0.7rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; display: inline-block; margin-bottom: 8px; }
        .a-hero-bio { font-size: 0.95rem; opacity: 0.85; max-width: 650px; line-height: 1.6; display: -webkit-box; -webkit-box-orient: vertical; overflow: hidden; }
        .a-hero-bio.clamped { -webkit-line-clamp: 3; }
        .a-hero-bio.expanded { display: block; -webkit-line-clamp: unset; }
        .a-read-more-btn { background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2); color: white; padding: 2px 8px; border-radius: 6px; font-size: 0.7rem; font-weight: 700; cursor: pointer; margin-top: 5px; transition: all 0.2s; display: inline-flex; align-items: center; gap: 4px; }
        .a-read-more-btn:hover { background: rgba(255,255,255,0.2); border-color: white; }
        .a-list-btn { background: white; color: #5d4037; border: none; padding: 12px 24px; border-radius: 12px; font-weight: 800; font-size: 0.95rem; cursor: pointer; transition: all 0.2s ease; display: flex; align-items: center; gap: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); width: 100%; justify-content: center; }
        .edit-profile-btn { background: transparent; color: white; border: 2px solid rgba(255,255,255,0.3); padding: 10px 24px; border-radius: 12px; font-weight: 700; font-size: 0.9rem; cursor: pointer; transition: all 0.2s ease; display: flex; align-items: center; gap: 8px; width: 100%; justify-content: center; }
        .edit-profile-btn:hover { background: rgba(255,255,255,0.1); border-color: white; }
        .a-hero-details {
            display: flex !important;
            flex-wrap: wrap !important;
            gap: 15px !important;
            margin-top: 8px !important;
            opacity: 0.9 !important;
            font-size: 0.85rem !important;
            color: rgba(255,255,255,0.85) !important;
        }
        .a-hero-details span {
            display: flex !important;
            align-items: center !important; gap: 5px !important;
        }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .hide-scrollbar::-webkit-scrollbar { display: none; }
    `}</style>
);

// ────────────────────────────────────────────────
//  Helpers
// ────────────────────────────────────────────────
const StatusPill = ({ status }) => {
    const map = {
        Available: 'bg-green-100 text-green-700',
        Adopted: 'bg-blue-100 text-blue-700',
        Pending: 'bg-yellow-100 text-yellow-700',
        Approved: 'bg-green-100 text-green-700',
        Rejected: 'bg-red-100 text-red-700',
        Active: 'bg-emerald-100 text-emerald-700',
        Expired: 'bg-gray-100 text-gray-500',
    };
    return (
        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${map[status] || 'bg-gray-100 text-gray-600'}`}>
            {status}
        </span>
    );
};

// ────────────────────────────────────────────────
//  SECTION: Analytics Chart (Simple & Clean)
// ────────────────────────────────────────────────
const ActivityChart = ({ data }) => {
    return (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-8">
            <h3 className="text-lg font-bold text-[#3E2723] mb-6">Monthly Activity</h3>
            
            <div className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data} margin={{ top: 0, right: 0, left: -25, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                        <XAxis 
                            dataKey="name" 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{ fill: '#888', fontSize: 12 }}
                        />
                        <YAxis 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{ fill: '#888', fontSize: 12 }}
                        />
                        <Tooltip cursor={{fill: '#fcfcfc'}} />
                        <Legend iconType="circle" />
                        <Bar dataKey="Listings" fill="#8D6E63" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="Adoptions" fill="#A1887F" radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

// ────────────────────────────────────────────────
//  SECTION: Overview (Stat Cards)
// ────────────────────────────────────────────────
const Overview = ({ petCount, reportCount, requestCount, campaignCount, approvedCount, onStatClick, chartData, recentReviews, latestPets }) => {
    const stats = [
        { label: 'Listed for Adoption', value: petCount, icon: <FaPaw />, color: 'from-amber-400 to-amber-600', tab: 'pets' },
        { label: 'Lost & Found Reports', value: reportCount, icon: <FaSearch />, color: 'from-orange-400 to-orange-600', tab: 'lostfound' },
        { label: 'Pending Requests', value: requestCount, icon: <FaClipboardList />, color: 'from-blue-400 to-blue-600', tab: 'requests' },
        { label: 'Approved Adoptions', value: approvedCount, icon: <FaCheckCircle />, color: 'from-green-400 to-green-600', tab: 'requests' },
        { label: 'Campaigns', value: campaignCount, icon: <FaBullhorn />, color: 'from-purple-400 to-purple-600', tab: 'campaigns' },
    ];
    return (
        <div className="space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                {stats.map((s, idx) => (
                    <div key={idx} 
                        onClick={() => onStatClick(s.tab)}
                        className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-center gap-3 hover:shadow-md hover:scale-[1.02] cursor-pointer transition-all">
                        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${s.color} text-white flex items-center justify-center shadow-lg shadow-amber-500/10`}>
                            {React.cloneElement(s.icon, { size: 16 })}
                        </div>
                        <div>
                            <div className="text-xl font-black text-[#3E2723] leading-none">{s.value}</div>
                            <div className="text-[9px] font-extrabold text-gray-400 uppercase tracking-wider mt-1">{s.label}</div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Quick Actions & Recent Listings Row */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <div className="lg:col-span-3 bg-white/60 backdrop-blur-xl rounded-3xl p-6 border border-white shadow-sm">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-bold text-[#3E2723] flex items-center gap-2">
                             <span className="w-2 h-6 bg-amber-500 rounded-full"></span>
                             Recently Listed Pets
                        </h3>
                        <button onClick={() => onStatClick('pets')} className="text-amber-700 text-xs font-black uppercase tracking-widest hover:underline">View Gallery</button>
                    </div>
                    {latestPets && latestPets.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            {latestPets.slice(0, 3).map(pet => (
                                <div key={pet._id} className="group bg-white rounded-2xl overflow-hidden border border-gray-100/50 shadow-sm hover:shadow-xl transition-all duration-500 p-2">
                                    <div className="relative h-28 rounded-xl overflow-hidden mb-3">
                                        <img src={pet.image || pet.images?.[0] || 'https://via.placeholder.com/300x200'} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                        <div className="absolute top-2 right-2"><StatusPill status={pet.status} /></div>
                                    </div>
                                    <h4 className="font-bold text-[#3E2723] text-sm px-1 truncate">{pet.name}</h4>
                                    <p className="text-[10px] text-gray-400 font-bold px-1 uppercase tracking-tight">{pet.breed}</p>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="py-12 text-center bg-gray-50/50 rounded-2xl border border-dashed border-gray-200">
                             <FaPaw className="mx-auto text-gray-200 mb-2" size={32} />
                             <p className="text-sm text-gray-400">No pets listed yet</p>
                        </div>
                    )}
                </div>
                <div className="bg-gradient-to-br from-[#5D4037] to-[#3E2723] rounded-3xl p-6 text-white shadow-xl shadow-amber-900/10 flex flex-col justify-center gap-4">
                    <h3 className="font-black text-xs uppercase tracking-widest opacity-70">Quick Action</h3>
                    <p className="font-bold text-sm leading-relaxed">Ready to find a forever home for another pet?</p>
                    <Link to="/add-pet" className="w-full py-3 bg-white text-[#3E2723] rounded-2xl text-center text-[10px] font-black uppercase tracking-widest hover:bg-amber-50 transition-colors shadow-lg shadow-black/20">List New Pet</Link>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                    <ActivityChart data={chartData} />
                </div>
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-8 overflow-hidden">
                    <div className="flex items-center justify-between mb-5">
                        <h3 className="text-lg font-bold text-[#3E2723]">Recent Feedback</h3>
                        <button onClick={() => onStatClick('reviews')} className="text-[#8D6E63] text-xs font-bold hover:underline">View All</button>
                    </div>
                    {/* Tiny snippet of top 2 reviews */}
                    <div className="space-y-4">
                        {(!recentReviews || recentReviews.length === 0) ? (
                           <div className="text-center py-10">
                                <FaStar className="mx-auto text-gray-100 mb-2" size={30} />
                                <p className="text-xs text-gray-400">No reviews yet</p>
                           </div>
                        ) : (
                            <div className="flex flex-col gap-3">
                                {recentReviews.slice(0, 3).map((r, i) => (
                                    <div key={i} className="bg-gray-50/50 p-3 rounded-xl border border-gray-100">
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="text-xs font-bold text-[#3E2723]">{r.userName || 'Adopter'}</span>
                                            <div className="flex gap-0.5">
                                                {[1, 2, 3, 4, 5].map(s => <FaStar key={s} size={8} color={s <= r.rating ? '#f59e0b' : '#d1d5db'} />)}
                                            </div>
                                        </div>
                                        <p className="text-[11px] text-gray-500 italic line-clamp-2">"{r.comment || 'No comment provided'}"</p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

// ────────────────────────────────────────────────
//  SECTION: My Pets (Adoption Listings)
// ────────────────────────────────────────────────
const MyPets = ({ pets, loading, onDelete }) => {
    const adoptionPets = pets.filter(p => p.type === 'Adoption' || !['Lost', 'Found'].includes(p.type));

    return (
        <div>
            <div className="flex items-center justify-between mb-5">
                <h2 className="text-xl font-bold text-[#3E2723]">My Pet Listings</h2>
                <Link to="/add-pet"
                    className="flex items-center gap-2 bg-[#5D4037] text-white text-sm font-semibold px-4 py-2 rounded-xl hover:bg-[#3E2723] transition-colors">
                    <FaPlus /> Add Pet
                </Link>
            </div>

            {loading ? (
                <div className="flex justify-center py-16"><FaSpinner className="animate-spin text-[#8D6E63]" size={28} /></div>
            ) : adoptionPets.length === 0 ? (
                <div className="text-center py-16 bg-gradient-to-b from-white to-gray-50 rounded-2xl border border-dashed border-gray-300 hover:border-[#5D4037] hover:bg-orange-50 transition-all duration-300 group">
                    <FaPaw className="mx-auto text-gray-300 mb-3 group-hover:scale-110 group-hover:-rotate-3 group-hover:text-[#8D6E63] transition-transform duration-300" size={40} />
                    <p className="text-gray-500 font-medium">No adoption pets listed yet</p>
                    <Link to="/add-pet" className="mt-3 inline-block text-[#8D6E63] font-semibold text-sm hover:underline">
                        Add your first pet
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                    {adoptionPets.map(pet => (
                        <div key={pet._id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
                            <div className="relative h-44 bg-gray-100">
                                <img
                                    src={pet.image || pet.images?.[0] || 'https://via.placeholder.com/400x300?text=No+Image'}
                                    alt={pet.name}
                                    className="w-full h-full object-cover"
                                />
                                {!pet.isApproved && (
                                    <span className="absolute top-2 left-2 bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-0.5 rounded-full">
                                        Pending Approval
                                    </span>
                                )}
                                <div className="absolute top-2 right-2">
                                    <StatusPill status={pet.status || 'Available'} />
                                </div>
                            </div>
                            <div className="p-4">
                                <p className="font-bold text-[#3E2723] text-base">{pet.name}</p>
                                <p className="text-sm text-gray-500">{pet.breed} · {pet.age}</p>
                                <p className="text-xs text-gray-400 mt-1">{pet.location}</p>
                                <div className="flex gap-2 mt-3">
                                    <Link to={`/pet/${pet._id}`}
                                        className="flex-1 flex items-center justify-center gap-1 py-1.5 text-xs font-semibold text-[#8D6E63] border border-[#D7CCC8] rounded-lg hover:bg-amber-50 transition-colors">
                                        <FaEye /> View
                                    </Link>
                                    <Link to={`/edit-pet/${pet._id}`}
                                        className="flex-1 flex items-center justify-center gap-1 py-1.5 text-xs font-semibold text-blue-600 border border-blue-100 rounded-lg bg-blue-50 hover:bg-blue-100 transition-colors">
                                        <FaEdit /> Edit
                                    </Link>
                                    <button onClick={() => onDelete(pet._id)}
                                        className="flex-1 flex items-center justify-center gap-1 py-1.5 text-xs font-semibold text-red-600 border border-red-100 rounded-lg bg-red-50 hover:bg-red-100 transition-colors">
                                        <FaTrash /> Delete
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

// ────────────────────────────────────────────────
//  SECTION: Lost & Found reports
// ────────────────────────────────────────────────
const LostFoundReports = ({ pets, loading, onDelete }) => {
    const reports = pets.filter(p => ['Lost', 'Found'].includes(p.type));

    return (
        <div>
            <div className="flex items-center justify-between mb-5">
                <h2 className="text-xl font-bold text-[#3E2723]">Lost & Found Reports</h2>
                <Link to="/lost-found"
                    className="flex items-center gap-2 bg-[#5D4037] text-white text-sm font-semibold px-4 py-2 rounded-xl hover:bg-[#3E2723] transition-colors">
                    <FaPlus /> File Report
                </Link>
            </div>

            {loading ? (
                <div className="flex justify-center py-16"><FaSpinner className="animate-spin text-[#8D6E63]" size={28} /></div>
            ) : reports.length === 0 ? (
                <div className="text-center py-16 bg-gradient-to-b from-white to-gray-50 rounded-2xl border border-dashed border-gray-300 hover:border-[#5D4037] hover:bg-orange-50 transition-all duration-300 group">
                    <FaSearch className="mx-auto text-gray-300 mb-3 group-hover:scale-110 group-hover:-rotate-3 group-hover:text-[#8D6E63] transition-transform duration-300" size={40} />
                    <p className="text-gray-500 font-medium">No lost or found reports yet</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                    {reports.map(pet => (
                        <div key={pet._id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
                            <div className="relative h-44 bg-gray-100">
                                <img
                                    src={pet.image || pet.images?.[0] || 'https://via.placeholder.com/400x300?text=No+Image'}
                                    alt={pet.name}
                                    className="w-full h-full object-cover"
                                />
                                <span className={`absolute top-2 left-2 ${pet.type === 'Lost' ? 'bg-red-500' : 'bg-blue-500'} text-white text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider`}>
                                    {pet.type}
                                </span>
                                <div className="absolute top-2 right-2">
                                    <StatusPill status={pet.status || 'Available'} />
                                </div>
                            </div>
                            <div className="p-4">
                                <p className="font-bold text-[#3E2723] text-base">{pet.name}</p>
                                <p className="text-xs text-gray-400 mt-1">{pet.location}</p>
                                <div className="flex gap-2 mt-3">
                                    <Link to={`/pet/${pet._id}`}
                                        className="flex-1 flex items-center justify-center gap-1 py-1.5 text-xs font-semibold text-[#8D6E63] border border-[#D7CCC8] rounded-lg hover:bg-amber-50 transition-colors">
                                        <FaEye /> View
                                    </Link>
                                    <button onClick={() => onDelete(pet._id)}
                                        className="flex-1 flex items-center justify-center gap-1 py-1.5 text-xs font-semibold text-red-600 border border-red-100 rounded-lg bg-red-50 hover:bg-red-100 transition-colors">
                                        <FaTrash /> Delete
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

// ────────────────────────────────────────────────
//  SECTION: Adoption Requests
// ────────────────────────────────────────────────
const AdoptionRequests = () => {
    const [incomingRequests, setIncomingRequests] = useState([]);
    const [myApplications, setMyApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selected, setSelected] = useState(null);
    const [filter, setFilter] = useState('All');

    useEffect(() => { fetchRequests(); }, []);

    const fetchRequests = async () => {
        try {
            const [incRes, myRes] = await Promise.all([
                api.get('/adoptions/incoming'),
                api.get('/adoptions/my-requests')
            ]);
            setIncomingRequests(incRes.data.data || []);
            setMyApplications(myRes.data.data || []);
        } catch { toast.error('Failed to load requests'); }
        finally { setLoading(false); }
    };

    const handleAction = async (id, action) => {
        const status = action === 'approve' ? 'Approved' : 'Rejected';
        try {
            await api.patch(`/adoptions/${id}/status`, { status });
            toast.success(`Request ${status}`);
            setIncomingRequests(prev => prev.map(r => r._id === id ? { ...r, status } : r));
            setSelected(null);
        } catch { toast.error(`Failed to ${action} request`); }
    };

    const handleCancelRequest = async (id) => {
        if (!window.confirm('Cancel this adoption request?')) return;
        try {
            await api.delete(`/adoptions/${id}`);
            toast.info('Adoption request cancelled');
            setMyApplications(prev => prev.filter(r => r._id !== id));
        } catch { toast.error('Failed to cancel request'); }
    };

    const combinedRequests = [
        ...incomingRequests.map(r => ({ ...r, direction: 'Received' })),
        ...myApplications.map(r => ({ ...r, direction: 'Sent' }))
    ].sort((a, b) => new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date));

    const filtered = filter === 'All' ? combinedRequests : combinedRequests.filter(r => r.status === filter);

    return (
        <div>
            <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
                <h2 className="text-xl font-bold text-[#3E2723]">Adoption Requests & Applications</h2>
                <div className="flex gap-2">
                    {['All', 'Pending', 'Approved', 'Rejected'].map(f => (
                        <button key={f} onClick={() => setFilter(f)}
                            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${filter === f ? 'bg-[#5D4037] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                            {f}
                        </button>
                    ))}
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center py-16"><FaSpinner className="animate-spin text-[#8D6E63]" size={28} /></div>
            ) : filtered.length === 0 ? (
                <div className="text-center py-16 bg-gradient-to-b from-white to-gray-50 rounded-2xl border border-dashed border-gray-300 hover:border-[#5D4037] hover:bg-orange-50 transition-all duration-300 group">
                    <FaClipboardList className="mx-auto text-gray-300 mb-3 group-hover:scale-110 group-hover:rotate-3 group-hover:text-[#8D6E63] transition-transform duration-300" size={40} />
                    <p className="text-gray-500 font-medium">No {filter !== 'All' ? filter.toLowerCase() : ''} requests found</p>
                </div>
            ) : (
                <div className="overflow-x-auto rounded-xl border border-gray-100 shadow-sm bg-white">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                                {['Pet', 'Type', 'Involved Party', 'Date', 'Status', 'Actions'].map(h => (
                                    <th key={h} className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {filtered.map(req => (
                                <tr key={req._id} className="bg-white hover:bg-amber-50/30 transition-colors">
                                    <td className="px-4 py-3 font-semibold text-[#3E2723]">{req.petName || 'N/A'}</td>
                                    <td className="px-4 py-3">
                                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${req.direction === 'Received' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}`}>
                                            {req.direction}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-gray-700">{req.direction === 'Received' ? (req.fullName || req.userName) : 'To Owner'}</td>
                                    <td className="px-4 py-3 text-gray-400 text-xs">{req.createdAt ? new Date(req.createdAt).toLocaleDateString() : '—'}</td>
                                    <td className="px-4 py-3"><StatusPill status={req.status} /></td>
                                    <td className="px-4 py-3">
                                        <div className="flex gap-2 items-center">
                                            {req.direction === 'Received' && (
                                                <button onClick={() => setSelected(req)}
                                                    className="p-1.5 rounded-lg text-blue-500 hover:bg-blue-50 transition-colors" title="View Details">
                                                    <FaEye size={13} />
                                                </button>
                                            )}
                                            {req.direction === 'Received' && req.status === 'Pending' && (
                                                <>
                                                    <button onClick={() => handleAction(req._id, 'approve')}
                                                        className="p-1.5 rounded-lg text-green-600 hover:bg-green-50 transition-colors" title="Approve">
                                                        <FaCheck size={13} />
                                                    </button>
                                                    <button onClick={() => handleAction(req._id, 'reject')}
                                                        className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition-colors" title="Reject">
                                                        <FaTimes size={13} />
                                                    </button>
                                                </>
                                            )}
                                            {req.direction === 'Sent' && req.status === 'Pending' && (
                                                <button onClick={() => handleCancelRequest(req._id)}
                                                    className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition-colors" title="Cancel Application">
                                                    <FaTrash size={13} />
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Detail Modal */}
            {selected && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                            <h3 className="font-bold text-[#3E2723] text-lg">Application Details</h3>
                            <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-gray-700 transition-colors">
                                <FaTimes size={16} />
                            </button>
                        </div>
                        <div className="p-6 space-y-3 text-sm">
                            {[
                                ['Pet', selected.petName],
                                ['Applicant', selected.fullName || selected.userName],
                                ['Email', selected.email],
                                ['Phone', selected.phone],
                                ['Address', selected.address],
                                ['Other Pets at Home', selected.haveOtherPets],
                            ].map(([label, val]) => val ? (
                                <div key={label} className="flex gap-2">
                                    <span className="font-semibold text-gray-600 w-36 shrink-0">{label}:</span>
                                    <span className="text-gray-800">{val}</span>
                                </div>
                            ) : null)}
                            {selected.reason && (
                                <div>
                                    <p className="font-semibold text-gray-600 mb-1">Reason for Adoption:</p>
                                    <p className="bg-gray-50 rounded-xl p-3 text-gray-700 text-sm">{selected.reason}</p>
                                </div>
                            )}
                            <div className="flex items-center gap-2 pt-1">
                                <span className="font-semibold text-gray-600 w-36 shrink-0">Status:</span>
                                <StatusPill status={selected.status} />
                            </div>
                        </div>
                        <div className="px-6 py-4 border-t border-gray-100 flex justify-between gap-3">
                            {selected.status === 'Pending' ? (
                                <>
                                    <button onClick={() => handleAction(selected._id, 'reject')}
                                        className="flex-1 py-2 rounded-xl font-bold text-sm border border-red-200 text-red-600 hover:bg-red-50 transition-colors">
                                        Reject
                                    </button>
                                    <button onClick={() => handleAction(selected._id, 'approve')}
                                        className="flex-1 py-2 rounded-xl font-bold text-sm bg-green-600 text-white hover:bg-green-700 transition-colors">
                                        Approve
                                    </button>
                                </>
                            ) : (
                                <button onClick={() => setSelected(null)}
                                    className="flex-1 py-2 rounded-xl font-bold text-sm bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors">
                                    Close
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// ────────────────────────────────────────────────
//  SECTION: Campaigns
// ────────────────────────────────────────────────
const Campaigns = () => {
    const [campaigns, setCampaigns] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [form, setForm] = useState({ title: '', description: '', targetAmount: '', deadline: '', image: '', bankName: '', accountName: '', accountNumber: '', khaltiId: '' });

    useEffect(() => { fetchCampaigns(); }, []);

    const fetchCampaigns = async () => {
        try {
            const res = await api.get('/campaigns/mine');
            setCampaigns(res.data.data || []);
        } catch { toast.error('Failed to load campaigns'); }
        finally { setLoading(false); }
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        if (file.size > 3 * 1024 * 1024) return toast.error('Image must be under 3 MB');
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => setForm(p => ({ ...p, image: reader.result }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.title || !form.targetAmount || !form.deadline) return toast.error('Fill all required fields');
        setSubmitting(true);
        try {
            const payload = {
                title: form.title,
                description: form.description,
                targetAmount: form.targetAmount,
                deadline: form.deadline,
                image: form.image,
                paymentDetails: {
                    bankName: form.bankName,
                    accountName: form.accountName,
                    accountNumber: form.accountNumber,
                    khaltiId: form.khaltiId
                }
            };
            await api.post('/campaigns', payload);
            toast.success('Campaign published!');
            setShowForm(false);
            setForm({ title: '', description: '', targetAmount: '', deadline: '', image: '', bankName: '', accountName: '', accountNumber: '', khaltiId: '' });
            fetchCampaigns();
        } catch (err) { toast.error(err.response?.data?.message || 'Failed to create campaign'); }
        finally { setSubmitting(false); }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this campaign?')) return;
        try {
            await api.delete(`/campaigns/${id}`);
            setCampaigns(p => p.filter(c => c._id !== id));
            toast.success('Campaign deleted');
        } catch { toast.error('Failed to delete'); }
    };

    const totalRaised = campaigns.reduce((sum, c) => sum + (c.raisedAmount || 0), 0);
    const getDaysLeft = (d) => { const diff = Math.ceil((new Date(d) - new Date()) / 86400000); return diff > 0 ? `${diff}d left` : 'Expired'; };

    return (
        <div>
            <div className="flex items-center justify-between mb-5">
                <div>
                    <h2 className="text-xl font-bold text-[#3E2723]">Campaigns & Donations</h2>
                    {campaigns.length > 0 && (
                        <p className="text-sm text-gray-500 mt-0.5">
                            Total raised: <span className="font-bold text-green-600">Rs. {totalRaised.toLocaleString()}</span>
                        </p>
                    )}
                </div>
                <button onClick={() => setShowForm(!showForm)}
                    className="flex items-center gap-2 bg-[#5D4037] text-white text-sm font-semibold px-4 py-2 rounded-xl hover:bg-[#3E2723] transition-colors">
                    {showForm ? <><FaTimes /> Cancel</> : <><FaPlus /> New Campaign</>}
                </button>
            </div>

            {/* Create Form */}
            {showForm && (
                <div className="bg-amber-50 border border-amber-100 rounded-2xl p-5 mb-6">
                    <h3 className="font-bold text-[#5D4037] mb-4">Create New Campaign</h3>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-600 mb-1">Title *</label>
                                <input className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#8D6E63]"
                                    name="title" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} required />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-600 mb-1">Target Amount (NPR) *</label>
                                <input type="number" min="100" className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#8D6E63]"
                                    name="targetAmount" value={form.targetAmount} onChange={e => setForm(p => ({ ...p, targetAmount: e.target.value }))} required />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-600 mb-1">Deadline *</label>
                                <input type="date" min={new Date().toISOString().split('T')[0]}
                                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#8D6E63]"
                                    value={form.deadline} onChange={e => setForm(p => ({ ...p, deadline: e.target.value }))} required />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-600 mb-1">Cover Image</label>
                                <input type="file" accept="image/*" onChange={handleImageChange}
                                    className="w-full text-sm text-gray-500 file:mr-2 file:py-1 file:px-3 file:rounded-lg file:border-0 file:bg-amber-100 file:text-[#5D4037] file:font-semibold hover:file:bg-amber-200" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-600 mb-1">Description</label>
                            <textarea rows={3} placeholder="Describe your campaign..."
                                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#8D6E63] resize-none"
                                value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} />
                        </div>
                        {/* Payment Details Section */}
                        <div className="bg-amber-100/50 border border-amber-200 rounded-xl p-4">
                            <h4 className="text-sm font-bold text-[#5D4037] mb-3 flex items-center gap-2">💳 Payment Details</h4>
                            {/* Khalti - Primary */}
                            <div className="mb-3">
                                <label className="block text-xs font-bold text-gray-700 mb-1">Khalti ID *</label>
                                <input className="w-full border-2 border-[#5C2D91] rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#5C2D91] bg-white"
                                    placeholder="Enter your Khalti ID / phone number"
                                    value={form.khaltiId} onChange={e => setForm(p => ({ ...p, khaltiId: e.target.value }))} />
                                <p className="text-xs text-gray-400 mt-1">Primary payment method — donors will pay via Khalti</p>
                            </div>
                            {/* Bank Details - Secondary */}
                            <p className="text-xs font-semibold text-gray-500 mb-2">Bank Details (optional)</p>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                <div>
                                    <label className="block text-xs font-bold text-gray-600 mb-1">Bank Name</label>
                                    <input className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#8D6E63]"
                                        placeholder="e.g. Nepal Bank Limited"
                                        value={form.bankName} onChange={e => setForm(p => ({ ...p, bankName: e.target.value }))} />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-600 mb-1">Account Holder Name</label>
                                    <input className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#8D6E63]"
                                        placeholder="Name on the account"
                                        value={form.accountName} onChange={e => setForm(p => ({ ...p, accountName: e.target.value }))} />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-600 mb-1">Account Number</label>
                                    <input className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#8D6E63]"
                                        placeholder="Bank account number"
                                        value={form.accountNumber} onChange={e => setForm(p => ({ ...p, accountNumber: e.target.value }))} />
                                </div>
                            </div>
                        </div>
                        {form.image && <img src={form.image} alt="Preview" className="h-24 rounded-xl object-cover" />}
                        <button type="submit" disabled={submitting}
                            className="bg-green-600 text-white px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-green-700 transition-colors disabled:opacity-60 flex items-center gap-2">
                            {submitting ? <><FaSpinner className="animate-spin" /> Publishing…</> : 'Publish Campaign'}
                        </button>
                    </form>
                </div>
            )}

            {loading ? (
                <div className="flex justify-center py-16"><FaSpinner className="animate-spin text-[#8D6E63]" size={28} /></div>
            ) : campaigns.length === 0 ? (
                <div className="text-center py-16 bg-gradient-to-b from-white to-gray-50 rounded-2xl border border-dashed border-gray-300 hover:border-[#5D4037] hover:bg-orange-50 transition-all duration-300 group">
                    <FaBullhorn className="mx-auto text-gray-300 mb-3 group-hover:scale-110 group-hover:-rotate-3 group-hover:text-[#8D6E63] transition-transform duration-300" size={40} />
                    <p className="text-gray-500 font-medium">No campaigns yet</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {campaigns.map(c => {
                        const pct = Math.min(100, Math.round(((c.raisedAmount || 0) / c.targetAmount) * 100));
                        const isExpired = new Date(c.deadline) < new Date();
                        return (
                            <div key={c._id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
                                {c.image && <img src={c.image} alt={c.title} className="w-full h-36 object-cover" />}
                                <div className="p-4">
                                    <div className="flex items-start justify-between gap-2 mb-2">
                                        <h3 className="font-bold text-[#3E2723] text-sm leading-snug">{c.title}</h3>
                                        <StatusPill status={isExpired ? 'Expired' : c.status || 'Active'} />
                                    </div>
                                    <p className="text-xs text-gray-400 mb-3 line-clamp-2">{c.description}</p>

                                    {/* Progress bar */}
                                    <div className="mb-3">
                                        <div className="flex justify-between text-xs text-gray-500 mb-1">
                                            <span>Rs. {(c.raisedAmount || 0).toLocaleString()} raised</span>
                                            <span>{pct}%</span>
                                        </div>
                                        <div className="w-full bg-gray-100 rounded-full h-2">
                                            <div className="bg-gradient-to-r from-green-400 to-green-600 h-2 rounded-full transition-all" style={{ width: `${pct}%` }} />
                                        </div>
                                        <div className="text-xs text-gray-400 mt-1">Target: Rs. {Number(c.targetAmount).toLocaleString()} · {getDaysLeft(c.deadline)}</div>
                                    </div>

                                    <button onClick={() => handleDelete(c._id)}
                                        className="text-xs text-red-500 hover:text-red-700 font-semibold flex items-center gap-1 transition-colors">
                                        <FaTrash size={10} /> Delete Campaign
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

// ────────────────────────────────────────────────
//  SECTION: Verification Status
// ────────────────────────────────────────────────
const VerificationSection = () => {
    const { user } = useAuth();
    const [status, setStatus] = useState(null);
    const [reason, setReason] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        (async () => {
            try {
                const res = await api.get('/ngo/verification-status');
                setStatus(res.data.data?.verificationStatus || res.data.data?.status || 'Unverified');
                setReason(res.data.data?.rejectionReason || '');
            } catch {
                setStatus(user?.isVerified ? 'Verified' : 'Unverified');
            } finally { setLoading(false); }
        })();
    }, []);

    if (loading) return <div className="flex justify-center py-16"><FaSpinner className="animate-spin text-[#8D6E63]" size={28} /></div>;

    const configs = {
        Verified: { icon: <FaCheckCircle size={48} />, iconBg: 'bg-green-100', iconColor: 'text-green-500', title: 'Verified', titleColor: 'text-green-600', desc: 'Your organization is verified. You have the verified badge on all your listings.', action: null },
        Approved: { icon: <FaCheckCircle size={48} />, iconBg: 'bg-green-100', iconColor: 'text-green-500', title: 'Approved', titleColor: 'text-green-600', desc: 'Your organization is fully approved and verified.', action: null },
        Pending: { icon: <FaHourglassHalf size={48} />, iconBg: 'bg-yellow-100', iconColor: 'text-yellow-500', title: 'Under Review', titleColor: 'text-yellow-600', desc: 'Documents submitted and under admin review (24–48 hours).', action: null },
        Rejected: { icon: <FaTimesCircle size={48} />, iconBg: 'bg-red-100', iconColor: 'text-red-500', title: 'Verification Failed', titleColor: 'text-red-600', desc: 'Your verification was rejected. Please re-upload valid documents.', action: { label: 'Re-upload Documents', to: '/ngo-document-upload' } },
        Unverified: { icon: <FaFileUpload size={48} />, iconBg: 'bg-gray-100', iconColor: 'text-gray-400', title: 'Not Verified', titleColor: 'text-gray-600', desc: 'Submit NGO documents to get a verified badge and build trust.', action: { label: 'Start Verification', to: '/ngo-document-upload' } },
    };

    const cfg = configs[status] || configs.Unverified;

    return (
        <div className="ngo-verification">
            <h2 className="text-2xl font-black text-[#3E2723] mb-6 flex items-center gap-3">
                <FaShieldAlt className="text-[#8D6E63]" /> Verification Status
            </h2>
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-10 max-w-2xl mx-auto text-center">
                <div className={`w-28 h-28 ${cfg.iconBg} rounded-full flex items-center justify-center mx-auto mb-6 ${cfg.iconColor} shadow-inner`}>
                    {cfg.icon}
                </div>
                <h3 className={`text-3xl font-black mb-3 ${cfg.titleColor}`}>{cfg.title}</h3>
                <p className="text-gray-500 text-lg mb-8 max-w-md mx-auto">{cfg.desc}</p>
                {reason && (
                    <div className="bg-red-50 border border-red-100 rounded-2xl p-5 text-sm text-red-700 mb-8 text-left">
                        <strong className="block mb-1">Message from Admin:</strong> {reason}
                    </div>
                )}
                {cfg.action && (
                    <Link to={cfg.action.to}
                        className="inline-flex bg-[#5D4037] text-white px-10 py-4 rounded-2xl font-black text-base hover:shadow-xl transition-all hover:-translate-y-1">
                        {cfg.action.label}
                    </Link>
                )}
            </div>
        </div>
    );
};

// ────────────────────────────────────────────────
//  SECTION: My Messages
// ────────────────────────────────────────────────
const UserMessagesTab = ({ messages, loading }) => {
    const [expanded, setExpanded] = useState(null);

    if (loading) return <div className="flex justify-center py-16"><FaSpinner className="animate-spin text-[#8D6E63]" size={28} /></div>;

    if (messages.length === 0) return (
        <div className="text-center py-16 bg-gradient-to-b from-white to-gray-50 rounded-2xl border border-dashed border-gray-300 hover:border-[#5D4037] hover:bg-orange-50 transition-all duration-300 group">
            <FaEnvelope className="mx-auto text-gray-300 mb-3 group-hover:scale-110 group-hover:rotate-3 group-hover:text-[#db2777] transition-transform duration-300" size={40} />
            <p className="text-gray-500 font-medium">No messages yet</p>
            <p className="text-xs text-gray-400 mt-1">Your inquiries to the Admin will appear here.</p>
        </div>
    );

    return (
        <div className="space-y-4">
            {messages.map(msg => (
                <div key={msg._id} className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all cursor-pointer" onClick={() => setExpanded(expanded === msg._id ? null : msg._id)}>
                    <div className="flex justify-between items-start mb-2">
                        <div>
                            <div className="font-black text-[#3E2723] text-lg">{msg.subject || 'General Inquiry'}</div>
                            <div className="text-xs text-gray-400 font-bold uppercase">{new Date(msg.createdAt).toLocaleDateString()}</div>
                        </div>
                        {msg.isReplied && <span className="bg-[#1e293b] text-white text-[10px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider">Replied</span>}
                    </div>
                    
                    {expanded === msg._id ? (
                        <div className="mt-4 pt-4 border-t border-gray-50">
                            <div className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap mb-6 bg-gray-50 p-4 rounded-xl">{msg.message}</div>
                            {msg.replies?.length > 0 && (
                                <div className="space-y-4 ml-4 border-l-2 border-[#1e293b]/20 pl-4">
                                    <div className="text-[10px] font-black text-[#1e293b] uppercase tracking-widest mb-2">Admin Response</div>
                                    {msg.replies.map((reply, i) => (
                                        <div key={i} className="bg-[#f8fafc] border border-[#e2e8f0] p-4 rounded-xl relative shadow-sm">
                                            <p className="text-sm text-[#0f172a] font-medium leading-relaxed">{reply.message}</p>
                                            <span className="text-[10px] text-[#64748b] font-bold mt-2 block opacity-70">{new Date(reply.createdAt).toLocaleString()}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="text-sm text-gray-400 line-clamp-1 italic mt-1">
                            {msg.message}
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
};

// ────────────────────────────────────────────────
//  SECTION: My Reviews
// ────────────────────────────────────────────────
const UserReviewsTab = ({ userId }) => {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        (async () => {
            try {
                const res = await api.get(`/reviews/ngo/${userId}`);
                setReviews(res.data.data || []);
            } catch { toast.error('Failed to load reviews'); }
            finally { setLoading(false); }
        })();
    }, [userId]);

    if (loading) return <div className="flex justify-center py-16"><FaSpinner className="animate-spin text-[#8D6E63]" size={28} /></div>;

    if (reviews.length === 0) return (
        <div className="text-center py-16 bg-gradient-to-b from-white to-gray-50 rounded-2xl border border-dashed border-gray-300">
            <FaStar className="mx-auto text-gray-200 mb-3" size={40} />
            <p className="text-gray-500 font-medium">No reviews yet</p>
            <p className="text-xs text-gray-400 mt-1">Feedback from the community will appear here.</p>
        </div>
    );

    return (
        <div className="space-y-4">
            <div className="bg-amber-50 rounded-2xl p-6 border border-amber-100 flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-xl font-bold text-[#5D4037]">My Reputation</h2>
                    <p className="text-sm text-gray-500">What others are saying about your organization.</p>
                </div>
                <div className="text-center">
                    <div className="text-3xl font-black text-[#5D4037]">{(reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)}</div>
                    <div className="flex gap-0.5 justify-center">
                        {[1, 2, 3, 4, 5].map(s => <FaStar key={s} size={10} color={s <= Math.round(reviews.reduce((s, r) => s + r.rating, 0) / reviews.length) ? '#f59e0b' : '#d1d5db'} />)}
                    </div>
                    <div className="text-[10px] font-bold text-gray-400 uppercase mt-1">{reviews.length} total</div>
                </div>
            </div>

            {reviews.map((r, i) => (
                <div key={i} className="bg-white border border-gray-100 rounded-2x1 p-5 shadow-sm hover:shadow-md transition-all rounded-2xl">
                    <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 border border-gray-100">
                                <FaUserCircle size={24} />
                            </div>
                            <div>
                                <div className="font-bold text-[#3E2723] text-sm">{r.userName || 'Anonymous User'}</div>
                                <div className="text-[10px] text-gray-400 font-bold uppercase">{new Date(r.createdAt || r.date).toLocaleDateString()}</div>
                            </div>
                        </div>
                        <div className="flex gap-0.5">
                            {[1, 2, 3, 4, 5].map(s => (
                                <FaStar key={s} size={12} color={s <= r.rating ? '#f59e0b' : '#e5e7eb'} />
                            ))}
                        </div>
                    </div>
                    {r.comment && <p className="text-gray-600 text-sm leading-relaxed bg-gray-50 p-4 rounded-xl">{r.comment}</p>}
                </div>
            ))}
        </div>
    );
};

// ────────────────────────────────────────────────
//  Main Dashboard Shell
// ────────────────────────────────────────────────
const NAV_ITEMS = [
    { key: 'profile', icon: <FaUserCircle />, label: 'My Profile' },
    { key: 'overview', icon: <FaChartLine />, label: 'Overview' },
    { key: 'pets', icon: <FaPaw />, label: 'Adoption Pets' },
    { key: 'lostfound', icon: <FaSearch />, label: 'Lost & Found' },
    { key: 'requests', icon: <FaClipboardList />, label: 'Adoptions' },
    { key: 'campaigns', icon: <FaBullhorn />, label: 'Campaigns' },
    { key: 'favorites', icon: <FaHeart />, label: 'Saved Pets' },
    { key: 'vaccinations', icon: <FaSyringe />, label: 'Vaccinations' },
    { key: 'reviews', icon: <FaStar />, label: 'My Reviews' },
    { key: 'messages', icon: <FaEnvelope />, label: 'My Messages' },
    { key: 'notifications', icon: <FaBell />, label: 'Notifications' },
    { key: 'verification', icon: <FaShieldAlt />, label: 'Verification' },
];

export default function NGODashboard() {
    const [tab, setTab] = useState('overview');
    const [sidebarOpen, setSidebarOpen] = useState(false);
    useVaccinationReminders();
    const fileInputRef = React.useRef(null);
    const [stats, setStats] = useState({ pets: 0, reports: 0, pending: 0, approved: 0, campaigns: 0, unreadNotifications: 0 });
    const [messages, setMessages] = useState([]);
    const [messagesLoading, setMessagesLoading] = useState(false);
    const { user, logout, refreshUser } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const profileRef = React.useRef(null);
    const [petsData, setPetsData] = useState([]);
    const [petsLoading, setPetsLoading] = useState(false);
    const [recentReviews, setRecentReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isEditingProfile, setIsEditingProfile] = useState(false);
    const [isBioExpanded, setIsBioExpanded] = useState(false);
    const [showReadMore, setShowReadMore] = useState(false);
    const bioRef = React.useRef(null);
    const [favorites, setFavorites] = useState([]);
    const [favoritesLoading, setFavoritesLoading] = useState(false);

    // Unified Dashboard Loader
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const activeT = params.get('tab');
        if (activeT && NAV_ITEMS.some(n => n.key === activeT)) {
            setTab(activeT);
        }

        const fetchAllData = async () => {
            if (!user?._id) return;
            setLoading(true);
            setPetsLoading(true);
            try {
                const [pRes, rRes, reqRes, campRes, notifRes] = await Promise.allSettled([
                    api.get('/pets/my-pets'),
                    api.get(`/reviews/ngo/${user._id}`),
                    api.get('/adoptions/incoming'),
                    api.get('/campaigns/mine'),
                    api.get('/notifications'),
                    api.post('/vaccinations/check-reminders'), // Notify NGO of due vaccines now
                ]);

                const pets = pRes.status === 'fulfilled' ? (pRes.value.data.data || []) : [];
                const reviews = rRes.status === 'fulfilled' ? (rRes.value.data.data || []) : [];
                const reqs = reqRes.status === 'fulfilled' ? (reqRes.value.data.data || []) : [];
                const camps = campRes.status === 'fulfilled' ? (campRes.value.data.data || []) : [];
                const notifs = notifRes.status === 'fulfilled' ? (notifRes.value.data.data || []) : [];

                setPetsData(pets);
                setRecentReviews(reviews);

                // Initialize and Deep Sync Favorites
                const favoriteKey = `userFavorites_${user._id}`;
                const savedFavs = JSON.parse(localStorage.getItem(favoriteKey)) || [];
                setFavorites(savedFavs);
                // Perform deep refresh for favorites
                if (savedFavs.length > 0) {
                    Promise.allSettled(savedFavs.map(f => api.get(`/pets/${f._id}`)))
                        .then(results => {
                            const synced = results.map((res, idx) => {
                                if (res.status === 'fulfilled' && res.value.data.success) {
                                    return res.value.data.data;
                                }
                                return savedFavs[idx];
                            });
                            setFavorites(synced);
                            localStorage.setItem(favoriteKey, JSON.stringify(synced));
                        });
                }

                setStats({
                    pets: pets.filter(p => p.type === 'Adoption' || !['Lost', 'Found'].includes(p.type)).length,
                    reports: pets.filter(p => ['Lost', 'Found'].includes(p.type)).length,
                    pending: reqs.filter(r => r.status === 'Pending').length,
                    approved: reqs.filter(r => r.status === 'Approved').length,
                    campaigns: camps.length,
                    unreadNotifications: notifs.filter(n => !n.read).length
                });

                // Messages separately
                setMessagesLoading(true);
                api.get('/contact/my-messages')
                    .then(res => { if (res.data.success) setMessages(res.data.data); })
                    .catch(err => console.error("Messages error", err))
                    .finally(() => setMessagesLoading(false));

            } catch (err) {
                console.error("Dashboard error", err);
                toast.error('Failed to load some dashboard sections');
            } finally {
                setLoading(false);
                setPetsLoading(false);
            }
        };

        fetchAllData();
    }, [user, location.search]);

    // Detect if bio needs "Read More"
    useEffect(() => {
        if (bioRef.current) {
            const hasOverflow = bioRef.current.scrollHeight > bioRef.current.clientHeight;
            setShowReadMore(hasOverflow);
        }
    }, [user?.bio, tab]);

    const handleDeletePet = async (id) => {
        if (!window.confirm('Are you sure you want to delete this pet?')) return;
        try {
            await api.delete(`/pets/${id}`);
            setPetsData(prev => prev.filter(p => p._id !== id));
            toast.success('Pet removed successfully');
        } catch { toast.error('Failed to delete pet'); }
    };

    const removeFavorite = (id) => {
        const favoriteKey = `userFavorites_${user._id}`;
        const saved = JSON.parse(localStorage.getItem(favoriteKey)) || [];
        const filtered = saved.filter(p => p._id !== id);
        localStorage.setItem(favoriteKey, JSON.stringify(filtered));
        setFavorites(filtered);
        toast.info('Removed from favorites');
    };

    const handleHeroImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = async (ev) => {
            try {
                await api.patch('/users/me', { profileImage: ev.target.result });
                toast.success('NGO logo updated!');
                refreshUser();
            } catch { toast.error('Upload failed'); }
        };
        reader.readAsDataURL(file);
    };

    const handleTabChange = (key) => {
        setTab(key);
        setSidebarOpen(false);
        const newUrl = key === 'overview' ? '/ngo' : `/ngo?tab=${key}`;
        window.history.pushState(null, '', newUrl);
    };

    const getChartData = () => {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const data = [];
        const now = new Date();

        for (let i = 5; i >= 0; i--) {
            const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const monthName = months[d.getMonth()];
            const year = d.getFullYear();
            
            const listings = petsData.filter(p => {
                const pDate = new Date(p.createdAt);
                return pDate.getMonth() === d.getMonth() && pDate.getFullYear() === d.getFullYear();
            }).length;

            const adoptions = petsData.filter(p => {
                const pDate = new Date(p.createdAt);
                return p.status === 'Adopted' && pDate.getMonth() === d.getMonth() && pDate.getFullYear() === d.getFullYear();
            }).length;

            data.push({ 
                name: `${monthName}`, 
                Listings: listings || 0, 
                Adoptions: adoptions || 0 
            });
        }
        return data;
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="h-screen bg-gray-50 flex overflow-hidden">
            {/* Sidebar */}
            <aside className={`
                fixed lg:static inset-y-0 left-0 z-40 w-64
                bg-gradient-to-b from-[#3E2723] to-[#5D4037]
                flex flex-col shadow-xl transform transition-transform duration-300
                ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0
            `}>
                {/* Logo */}
                <div className="px-6 py-6 border-b border-white/10">
                    <div className="flex items-center gap-2.5">
                        <span className="text-2xl">🐾</span>
                        <div>
                            <p className="text-white font-bold text-base leading-tight">Aashrey For Paws</p>
                            <p className="text-amber-300 text-xs font-medium">NGO Account</p>
                        </div>
                    </div>
                </div>

                {/* User Card */}
                <div className="px-5 py-4 border-b border-white/10">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-amber-200 flex items-center justify-center text-[#5D4037] font-bold text-lg shadow">
                            {user?.name?.charAt(0).toUpperCase() || 'N'}
                        </div>
                        <div className="min-w-0">
                            <p className="text-white font-semibold text-sm truncate">{user?.name || 'NGO User'}</p>
                            <p className="text-amber-300 text-xs">NGO Organization</p>
                        </div>
                    </div>
                </div>

                {/* Nav */}
                <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto hide-scrollbar">
                    {NAV_ITEMS.map((item) => (
                        <button
                            key={item.key}
                            onClick={() => {
                                setTab(item.key);
                                setSidebarOpen(false);
                                const newUrl = item.key === 'overview' ? '/ngo' : `/ngo?tab=${item.key}`;
                                window.history.pushState(null, '', newUrl);
                            }}
                            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all
                                ${tab === item.key
                                    ? 'bg-white/15 text-white'
                                    : 'text-amber-200 hover:bg-white/8 hover:text-white'}`}
                        >
                            <span className="text-base">{item.icon}</span>
                            {item.label}
                            {item.key === 'requests' && stats.pending > 0 && (
                                <span className="ml-auto bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center">
                                    {stats.pending}
                                </span>
                            )}
                        </button>
                    ))}

                    {/* Explore Platform */}
                    <div className="pt-4 mt-2 border-t border-white/10">
                        <p className="px-4 text-[10px] font-black tracking-widest text-[#FFAB91] uppercase mb-2">Explore Platform</p>
                        <Link to="/" className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold text-amber-200 hover:bg-white/8 hover:text-white transition-all">
                            <FaGlobe className="text-base" /> Go to Main Site
                        </Link>
                    </div>
                </nav>

                {/* Logout */}
                <div className="px-3 py-4 border-t border-white/10">
                    <button onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold text-red-300 hover:bg-red-500/20 hover:text-red-200 transition-all">
                        <FaSignOutAlt /> Logout
                    </button>
                </div>
            </aside>

            {/* Sidebar overlay for mobile */}
            {sidebarOpen && (
                <div className="fixed inset-0 bg-black/40 z-30 lg:hidden" onClick={() => setSidebarOpen(false)} />
            )}

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {/* Top bar */}
                <header className="bg-white border-b border-gray-100 px-4 lg:px-8 py-4 flex items-center gap-4 sticky top-0 z-20 shadow-sm">
                    <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100">
                        <FaBars size={18} />
                    </button>
                    <div className="flex-1">
                        <h1 className="text-lg font-bold text-[#3E2723]">
                            {NAV_ITEMS.find(n => n.key === tab)?.label || 'Dashboard'}
                        </h1>
                        <p className="text-xs text-gray-400 hidden sm:block">
                            {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                        </p>
                    </div>
                    <button onClick={() => handleTabChange('notifications')} className={`p-2 rounded-xl transition-colors relative ${tab === 'notifications' ? 'bg-amber-100 text-[#5D4037]' : 'text-gray-500 hover:bg-gray-100'}`}>
                        <FaBell size={18} />
                        {stats.unreadNotifications > 0 && (
                            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                        )}
                    </button>
                    <Link to="/profile" onClick={(e) => { e.preventDefault(); setTab('profile'); window.history.pushState(null, '', '/ngo?tab=profile'); }} className="p-2 rounded-xl text-gray-500 hover:bg-gray-100 transition-colors">
                        <FaUserCircle size={20} />
                    </Link>
                </header>

                {/* Page Content */}
                <main className="flex-1 px-4 lg:px-8 py-6 overflow-y-auto">
                    {/* Header Hero */}
                    <NGODashboardStyles />
                    {/* NGO Dashboard Sections */}

                            {tab === 'overview' && (
                        <Overview
                            petCount={stats.pets}
                            reportCount={stats.reports}
                            requestCount={stats.pending}
                            campaignCount={stats.campaigns}
                            approvedCount={stats.approved}
                            onStatClick={handleTabChange}
                            chartData={getChartData()}
                            recentReviews={recentReviews}
                            latestPets={petsData}
                        />
                    )}
                    {tab === 'pets' && <MyPets pets={petsData} loading={petsLoading} onDelete={handleDeletePet} />}
                    {tab === 'lostfound' && <LostFoundReports pets={petsData} loading={petsLoading} onDelete={handleDeletePet} />}
                    {tab === 'requests' && <AdoptionRequests />}
                    {tab === 'campaigns' && <Campaigns />}
                    {tab === 'vaccinations' && (
                        <div>
                            <h2 className="text-xl font-bold text-[#3E2723] mb-5">Vaccination Records</h2>
                            <VaccinationReminder showAddForm={true} />
                        </div>
                    )}
                    {tab === 'verification' && <VerificationSection />}
                    {tab === 'messages' && <UserMessagesTab messages={messages} loading={messagesLoading} />}
                    {tab === 'favorites' && (
                        <div className="bg-white/40 backdrop-blur-xl rounded-[2.5rem] border border-white p-8 shadow-2xl shadow-amber-900/5 animate-in fade-in zoom-in duration-700">
                             <div className="flex justify-between items-center mb-8">
                                <div>
                                    <h2 className="text-2xl font-black text-[#3E2723]">Saved Pets & Favorites</h2>
                                    <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mt-1">Pets your NGO is interested in</p>
                                </div>
                                <div className="bg-rose-50 text-rose-600 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest border border-rose-100 flex items-center gap-2">
                                    <FaHeart /> {favorites.length} Saved
                                </div>
                            </div>

                            {favorites.length === 0 ? (
                                <div className="text-center py-24 bg-white rounded-[2rem] border-2 border-dashed border-gray-100 shadow-sm">
                                    <div className="w-20 h-20 bg-rose-50 rounded-3xl flex items-center justify-center mx-auto mb-6 text-rose-200 transform -rotate-12">
                                        <FaHeart size={32} />
                                    </div>
                                    <h3 className="text-xl font-black text-[#3E2723]">Collection is empty</h3>
                                    <p className="text-gray-400 text-sm max-w-xs mx-auto mt-3 font-medium">Explore pets and tap the heart icon to save them for later reference.</p>
                                    <Link to="/pet-find" className="inline-block mt-8 px-8 py-3.5 bg-[#5D4037] text-white text-xs font-black uppercase tracking-widest rounded-2xl hover:bg-[#3E2723] transition-all shadow-lg shadow-gray-200 active:scale-95">Discover Pets</Link>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                    {favorites.map(pet => (
                                        <div key={pet._id} className="group bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden hover:shadow-2xl hover:shadow-[#5D4037]/5 transition-all duration-500">
                                            <div className="relative h-56 overflow-hidden">
                                                <img 
                                                    src={pet.image || pet.images?.[0] || 'https://via.placeholder.com/400x300?text=No+Image'} 
                                                    alt={pet.name}
                                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                                                />
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col justify-end p-6">
                                                    <div className="flex gap-2">
                                                        <Link to={`/pet/${pet._id}`} className="flex-1 py-3 bg-white text-[#3E2723] text-[10px] font-black uppercase tracking-widest rounded-xl text-center hover:bg-amber-50 transition-colors shadow-xl flex items-center justify-center gap-2">
                                                            <FaEye size={12}/> View Profile
                                                        </Link>
                                                        <button 
                                                            onClick={(e) => { e.preventDefault(); removeFavorite(pet._id); }}
                                                            className="w-12 h-12 bg-rose-500 text-white rounded-xl flex items-center justify-center hover:bg-rose-600 transition-colors shadow-xl"
                                                            title="Remove from favorites"
                                                        >
                                                            <FaTrash size={14} />
                                                        </button>
                                                    </div>
                                                </div>
                                                <div className="absolute top-4 left-4 px-4 py-1.5 bg-white/90 backdrop-blur-md text-[#3E2723] text-[10px] font-black uppercase tracking-widest rounded-full shadow-sm border border-white/20">
                                                    {pet.breed || 'Pet'}
                                                </div>
                                                <div className="absolute top-4 right-4 text-white drop-shadow-lg">
                                                    <FaHeart size={20} className="text-rose-500 active:scale-125 transition-transform" />
                                                </div>
                                            </div>
                                            <div className="p-6">
                                                <div className="flex justify-between items-start mb-4">
                                                    <div>
                                                        <h3 className="text-xl font-black text-[#3E2723] group-hover:text-[#5D4037] transition-colors">{pet.name}</h3>
                                                        <div className="flex items-center gap-2 text-gray-400 text-[10px] font-black uppercase tracking-widest mt-1">
                                                            <FaMapMarkerAlt size={10} className="text-[#8D6E63]" />
                                                            {pet.location}
                                                        </div>
                                                    </div>
                                                    <div className="bg-[#5D4037]/5 px-3 py-1 rounded-lg text-right">
                                                        <div className="text-[#5D4037] font-black text-sm">
                                                            {pet.listingType === 'Sale' ? `Rs. ${pet.price}` : 'Adopt'}
                                                        </div>
                                                        <div className="text-[9px] font-black text-gray-400 uppercase tracking-widest leading-none mt-0.5">{pet.age}</div>
                                                    </div>
                                                </div>
                                                {pet.status === 'Adopted' ? (
                                                    <div className="w-full py-4 rounded-2xl block text-center text-xs font-black uppercase tracking-widest bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed">
                                                        Adopted
                                                    </div>
                                                ) : (
                                                    <Link 
                                                        to={pet.listingType === 'Sale' ? `/pet/buy/${pet._id}` : `/adopt/${pet._id}`}
                                                        className={`w-full py-4 rounded-2xl block text-center text-xs font-black uppercase tracking-widest transition-all shadow-lg active:scale-[0.98] ${
                                                            pet.listingType === 'Sale' 
                                                                ? 'bg-purple-600 text-white shadow-purple-100 hover:bg-purple-700' 
                                                                : 'bg-amber-100 text-[#5D4037] shadow-amber-50 hover:bg-amber-200'
                                                        }`}
                                                    >
                                                        {pet.listingType === 'Sale' ? 'Purchase Pet' : 'Start Adoption'}
                                                    </Link>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                    {tab === 'notifications' && (
                        <React.Suspense fallback={<div className="flex justify-center py-16"><FaSpinner className="animate-spin text-[#8D6E63]" size={28} /></div>}>
                            <Notifications isTab={true} />
                        </React.Suspense>
                    )}
                    {tab === 'profile' && (
                        <React.Suspense fallback={<div className="flex justify-center py-16"><FaSpinner className="animate-spin text-[#8D6E63]" size={28} /></div>}>
                            <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                                <div className="a-hero-profile mb-8">
                                    <input ref={fileInputRef} type="file" accept="image/*" onChange={handleHeroImageUpload} style={{ display: 'none' }} />
                                    <div className="a-profile-identity">
                                        <div className="a-avatar-wrapper">
                                            {user?.image || user?.profileImage ? (
                                                <img src={user?.image || user?.profileImage} alt="" />
                                            ) : (
                                                <div className="a-avatar-placeholder">{user?.name?.charAt(0) || 'N'}</div>
                                            )}
                                            <label 
                                                className="a-avatar-badge" 
                                                onClick={() => fileInputRef.current.click()}
                                                style={{ cursor: 'pointer' }}
                                                title="Update Logo"
                                            >
                                                <FaCamera />
                                            </label>
                                        </div>
                                        <div className="a-profile-info">
                                            <div className="flex gap-2 flex-wrap mb-2">
                                                <div className="a-badge">Verified NGO Partner</div>
                                            </div>
                                            <h1 className="text-3xl font-black text-white leading-tight mb-1">{user?.name || 'NGO Dashboard'}</h1>
                                            <div className="relative">
                                                <p 
                                                    ref={bioRef}
                                                    className={`a-hero-bio text-white/90 text-sm mb-1 ${isBioExpanded ? 'expanded' : 'clamped'}`}
                                                >
                                                    {user?.bio || 'Dedicated to animal welfare and community service.'}
                                                </p>
                                                {(showReadMore || isBioExpanded) && (
                                                    <button 
                                                        onClick={(e) => { 
                                                            e.stopPropagation(); 
                                                            setIsBioExpanded(!isBioExpanded); 
                                                        }}
                                                        className="a-read-more-btn"
                                                    >
                                                        {isBioExpanded ? 'Show Less' : 'Read More'}
                                                    </button>
                                                )}
                                            </div>
                                            <div className="a-hero-details">
                                                {user?.email && <span><FaEnvelope /> {user.email}</span>}
                                                {user?.phone && <span><FaPhone /> {user.phone}</span>}
                                                {user?.address && <span><FaMapMarkerAlt /> {user.address}</span>}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-2 shrink-0 min-w-[180px]">
                                        <button 
                                            className="edit-profile-btn" 
                                            onClick={() => {
                                                if (isEditingProfile && profileRef.current) {
                                                    profileRef.current.handleSave();
                                                } else {
                                                    setIsEditingProfile(true);
                                                }
                                            }}
                                            style={{ background: isEditingProfile ? '#fff' : 'transparent', color: isEditingProfile ? '#3E2723' : '#fff', borderColor: isEditingProfile ? '#fff' : 'rgba(255,255,255,0.3)' }}
                                        >
                                            {isEditingProfile ? <><FaSave /> Finish Editing</> : <><FaEdit /> Edit Profile</>}
                                        </button>
                                        <button className="a-list-btn" onClick={() => navigate('/add-pet')}>
                                            <FaPlus /> List a Pet
                                        </button>
                                    </div>
                                </div>
                                <NGOProfilePage ref={profileRef} isTab={true} externalEditing={isEditingProfile} onEditingComplete={() => setIsEditingProfile(false)} />
                            </div>
                        </React.Suspense>
                    )}
                 </main>
            </div>
        </div>
    );
}
