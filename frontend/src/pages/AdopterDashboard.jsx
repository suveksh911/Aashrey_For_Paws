import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../services/axios';
import { useAuth } from '../context/AuthContext';
import {
    FaPaw, FaClipboardList, FaHeart, FaShieldAlt, FaChartLine,
    FaUserCircle, FaHistory, FaSearch, FaEnvelope,
    FaBell, FaSpinner, FaCamera, FaPhone, FaMapMarkerAlt,
    FaGlobe, FaStar, FaBars, FaSignOutAlt, FaEye, FaPlus, FaCheckCircle, FaTrash
} from 'react-icons/fa';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    BarChart, Bar, Legend
} from 'recharts';
import VaccinationReminder from '../components/VaccinationReminder';
import useVaccinationReminders from '../hooks/useVaccinationReminders';
import { UserMessagesTab, UserReviewsTab } from './DashboardShared';
import { AdopterProfile } from './UserProfile';
const Notifications = React.lazy(() => import('./Notifications'));

const AdopterDashboardStyles = () => (
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
        .a-hero-details span { display: flex !important; align-items: center !important; gap: 5px !important; }
        .a-hero-bio { font-size: 0.95rem; opacity: 0.85; max-width: 650px; line-height: 1.6; display: -webkit-box; -webkit-box-orient: vertical; overflow: hidden; transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1); }
        .a-hero-bio.clamped { -webkit-line-clamp: 2; }
        .a-hero-bio.expanded { display: block; -webkit-line-clamp: unset; }
        .a-read-more-btn { background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2); color: white; padding: 2px 8px; border-radius: 6px; font-size: 0.7rem; font-weight: 700; cursor: pointer; margin-top: 5px; transition: all 0.2s; display: inline-flex; align-items: center; gap: 4px; }
        .a-read-more-btn:hover { background: rgba(255,255,255,0.2); border-color: white; }
        .a-badge { background: rgba(255,255,255,0.2); padding: 4px 12px; border-radius: 20px; font-size: 0.7rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; display: inline-block; margin-bottom: 8px; }
        .a-hero-details {
            display: flex !important;
            flex-wrap: wrap !important;
            gap: 15px !important;
            margin-top: 8px !important;
            opacity: 0.9 !important;
            font-size: 0.85rem !important;
            color: rgba(255,255,255,0.85) !important;
        }
        .a-list-btn { background: white; color: #5d4037; border: none; padding: 12px 24px; border-radius: 12px; font-weight: 800; font-size: 0.95rem; cursor: pointer; transition: all 0.2s ease; display: flex; align-items: center; gap: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
        .status-pill { padding: 4px 12px; border-radius: 20px; font-size: 0.7rem; font-weight: 700; text-transform: uppercase; }
        .status-pending { background: #FFF8E1; color: #F57F17; }
        .status-approved { background: #E8F5E9; color: #2E7D32; }
        .status-rejected { background: #FFEBEE; color: #C62828; }
        .status-adopted { background: #E3F2FD; color: #1565C0; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .hide-scrollbar::-webkit-scrollbar { display: none; }
    `}</style>
);



const NAV_ITEMS = [
    { key: 'profile', icon: <FaUserCircle />, label: 'My Profile' },
    { key: 'overview', icon: <FaChartLine />, label: 'Overview' },
    { key: 'requests', icon: <FaClipboardList />, label: 'My Applications' },
    { key: 'favorites', icon: <FaHeart />, label: 'Saved Pets' },
    { key: 'history', icon: <FaHistory />, label: 'Adoption History' },
    { key: 'vaccinations', icon: <FaShieldAlt />, label: 'Health Records' },
    { key: 'reviews', icon: <FaStar />, label: 'My Reviews' },
    { key: 'messages', icon: <FaEnvelope />, label: 'My Messages' },
    { key: 'notifications', icon: <FaBell />, label: 'Notifications' },
];

export default function AdopterDashboard({ user }) {
    const [tab, setTab] = useState('overview');
    const [isEditingProfile, setIsEditingProfile] = useState(false);
    const [isBioExpanded, setIsBioExpanded] = useState(false);
    const [showReadMore, setShowReadMore] = useState(false);
    const bioRef = React.useRef(null);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    useVaccinationReminders();
    const fileInputRef = React.useRef(null);
    const [requests, setRequests] = useState([]);
    const [history, setHistory] = useState([]);
    const [vaccinations, setVaccinations] = useState([]);
    const [messages, setMessages] = useState([]);
    const [favorites, setFavorites] = useState([]);
    const [recentReviews, setRecentReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [unreadNotifications, setUnreadNotifications] = useState(0);
    const { logout, refreshUser } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const profileRef = React.useRef(null);

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const activeT = params.get('tab');
        if (activeT && NAV_ITEMS.some(n => n.key === activeT)) {
            setTab(activeT);
        }

        const fetchAllData = async () => {
            if (!user?._id) return;
            setLoading(true);
            try {
                const [reqRes, vacRes, notifRes] = await Promise.allSettled([
                    api.get('/adoptions/my-requests'),
                    api.get('/vaccinations/my-vaccines'),
                    api.get('/notifications'),
                    api.post('/vaccinations/check-reminders'),
                ]);

                const reqData = reqRes.status === 'fulfilled' ? (reqRes.value.data.data || []) : [];
                const vacData = vacRes.status === 'fulfilled' ? (vacRes.value.data.data || []) : [];
                const notifData = notifRes.status === 'fulfilled' ? (notifRes.value.data.data || []) : [];

                setRequests(reqData);
                setHistory(reqData.filter(r => ['Approved', 'Adopted'].includes(r.status)));
                setVaccinations(vacData);
                setUnreadNotifications(notifData.filter(n => !n.read).length);

                // Deep Refresh: Fetch latest data for every favorite from the server
                const favoriteKey = `userFavorites_${user._id}`;
                const savedFavs = JSON.parse(localStorage.getItem(favoriteKey)) || [];
                const favDetailsRes = await Promise.allSettled(
                    savedFavs.map(f => api.get(`/pets/${f._id}`))
                );
                
                const syncedFavs = favDetailsRes.map((res, idx) => {
                    if (res.status === 'fulfilled' && res.value.data.success) {
                        return res.value.data.data;
                    }
                    return savedFavs[idx];
                });
                
                setFavorites(syncedFavs);
                localStorage.setItem(favoriteKey, JSON.stringify(syncedFavs));

                api.get('/contact/my-messages')
                    .then(res => { if (res.data.success) setMessages(res.data.data); })
                    .catch(err => console.error("Messages error", err));

                api.get('/reviews/latest')
                    .then(res => { if (res.data.success) setRecentReviews(res.data.data); })
                    .catch(e => console.error("Recent reviews error", e));

            } catch (err) {
                console.error("Dashboard data error", err);
                toast.error('Failed to load some dashboard sections');
            } finally {
                setLoading(false);
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

    const handleHeroImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = async (ev) => {
            try {
                await api.patch('/users/me', { profileImage: ev.target.result });
                toast.success('Profile picture updated!');
                refreshUser();
            } catch { toast.error('Upload failed'); }
        };
        reader.readAsDataURL(file);
    };

    const removeFavorite = (id) => {
        const favoriteKey = `userFavorites_${user._id}`;
        const saved = JSON.parse(localStorage.getItem(favoriteKey)) || [];
        const filtered = saved.filter(p => p._id !== id);
        localStorage.setItem(favoriteKey, JSON.stringify(filtered));
        setFavorites(filtered);
        toast.info('Removed from favorites');
    };

    const handleTabChange = (key) => {
        setTab(key);
        setSidebarOpen(false);
        const newUrl = key === 'overview' ? '/user' : `/user?tab=${key}`;
        window.history.pushState(null, '', newUrl);
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const cancelRequest = async (requestId) => {
        if (!window.confirm('Cancel this adoption request?')) return;
        try {
            await api.delete(`/adoptions/${requestId}`);
            toast.info('Adoption request cancelled');
            setRequests(prev => prev.filter(r => r._id !== requestId));
        } catch (err) { toast.error("Failed to cancel request"); }
    };




    return (
        <div className="h-screen bg-gray-50 flex overflow-hidden">
            <AdopterDashboardStyles />
            {/* Sidebar matches NGO */}
            <aside className={`
                fixed lg:static inset-y-0 left-0 z-40 w-64
                bg-gradient-to-b from-[#3E2723] to-[#5D4037]
                flex flex-col shadow-xl transform transition-transform duration-300
                ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0
            `}>
                <div className="px-6 py-6 border-b border-white/10">
                    <div className="flex items-center gap-2.5">
                        <span className="text-2xl">🐾</span>
                        <div>
                            <p className="text-white font-bold text-base leading-tight">Aashrey For Paws</p>
                            <p className="text-amber-300 text-xs font-medium">Adopter Account</p>
                        </div>
                    </div>
                </div>

                <div className="px-5 py-4 border-b border-white/10">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-amber-200 flex items-center justify-center text-[#5D4037] font-bold text-lg shadow">
                            {user?.name?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <div className="min-w-0">
                            <p className="text-white font-semibold text-sm truncate">{user?.name || 'Adopter User'}</p>
                            <p className="text-amber-300 text-xs">Pet Adopter</p>
                        </div>
                    </div>
                </div>

                <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto hide-scrollbar">
                    {NAV_ITEMS.map((item) => (
                        <button
                            key={item.key}
                            onClick={() => handleTabChange(item.key)}
                            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all
                                ${tab === item.key
                                    ? 'bg-white/15 text-white'
                                    : 'text-amber-200 hover:bg-white/8 hover:text-white'}`}
                        >
                            <span className="text-base">{item.icon}</span>
                            {item.label}
                        </button>
                    ))}

                </nav>

                <div className="px-3 py-4 border-t border-white/10">
                    <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold text-red-300 hover:bg-red-500/20 hover:text-red-200 transition-all">
                        <FaSignOutAlt /> Logout
                    </button>
                </div>
            </aside>

            {sidebarOpen && <div className="fixed inset-0 bg-black/40 z-30 lg:hidden" onClick={() => setSidebarOpen(false)} />}

            {/* Main Content matches NGO */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
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
                        {unreadNotifications > 0 && <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>}
                    </button>
                    <button onClick={() => handleTabChange('profile')} className="p-2 rounded-xl text-gray-500 hover:bg-gray-100 transition-colors">
                        <FaUserCircle size={20} />
                    </button>
                </header>

                <main className="flex-1 px-4 lg:px-8 py-6 overflow-y-auto">
                    {tab === 'overview' && (
                        <div className="space-y-8">
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                                {[
                                    { label: 'Total Applications', value: requests.length, icon: <FaClipboardList />, color: 'from-amber-400 to-amber-600', tab: 'requests' },
                                    { label: 'Adopted Pets', value: history.length, icon: <FaCheckCircle />, color: 'from-green-400 to-green-600', tab: 'history' },
                                    { label: 'Saved Pets', value: favorites.length, icon: <FaHeart />, color: 'from-rose-400 to-rose-600', tab: 'favorites' },
                                    { label: 'Health Records', value: vaccinations.length, icon: <FaShieldAlt />, color: 'from-purple-400 to-purple-600', tab: 'vaccinations' },
                                    { label: 'Messages', value: messages.length, icon: <FaEnvelope />, color: 'from-blue-400 to-blue-600', tab: 'messages' }
                                ].map((s, idx) => (
                                    <div key={idx} onClick={() => handleTabChange(s.tab)} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-center gap-3 hover:shadow-md hover:scale-[1.02] cursor-pointer transition-all">
                                        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${s.color} text-white flex items-center justify-center shadow-lg`}>
                                            {React.cloneElement(s.icon, { size: 16 })}
                                        </div>
                                        <div>
                                            <div className="text-xl font-black text-[#3E2723] leading-none">{s.value}</div>
                                            <div className="text-[9px] font-extrabold text-gray-400 uppercase tracking-wider mt-1">{s.label}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                {/* Saved Pets Quick Resume */}
                                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-8 flex flex-col">
                                    <div className="flex items-center justify-between mb-4">
                                        <div>
                                            <h3 className="text-lg font-bold text-[#3E2723]">Recently Saved Pets</h3>
                                            <p className="text-[9px] font-extrabold text-gray-400 uppercase tracking-widest mt-0.5">Quick Resume</p>
                                        </div>
                                        <button onClick={() => handleTabChange('favorites')} className="text-[#8D6E63] text-xs font-bold hover:underline">View All</button>
                                    </div>
                                    
                                    {favorites.length === 0 ? (
                                        <div className="text-center py-10 opacity-50 flex-1 flex flex-col justify-center">
                                            <FaHeart className="mx-auto mb-3 text-rose-300" size={32} />
                                            <p className="text-xs text-gray-500 font-medium">No saved pets yet.</p>
                                            <button onClick={() => navigate('/pet-find')} className="text-[10px] uppercase font-bold text-[#5D4037] mt-3 hover:underline">Find Pets</button>
                                        </div>
                                    ) : (
                                        <div className="space-y-3 flex-1">
                                            {favorites.slice(0, 3).map(pet => (
                                                <div key={pet._id} className="flex items-center gap-4 bg-gray-50 p-3 rounded-xl border border-gray-100 hover:border-[#8D6E63]/30 transition-colors">
                                                    <img src={pet.image || pet.images?.[0] || 'https://via.placeholder.com/100x100'} alt={pet.name} className="w-12 h-12 rounded-lg object-cover shadow-sm" />
                                                    <div className="flex-1">
                                                        <h4 className="font-bold text-[#3E2723] text-sm">{pet.name}</h4>
                                                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">{pet.breed}</p>
                                                    </div>
                                                    <Link to={pet.listingType === 'Sale' ? `/pet/buy/${pet._id}` : `/adopt/${pet._id}`} className="px-4 py-2 bg-[#5D4037] text-white text-[10px] font-black uppercase tracking-widest rounded-lg hover:bg-[#3E2723] shadow-md transition-colors">
                                                        Apply
                                                    </Link>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Application Status Tracker */}
                                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-8 flex flex-col">
                                    <div className="flex items-center justify-between mb-4">
                                        <div>
                                            <h3 className="text-lg font-bold text-[#3E2723]">My Applications</h3>
                                            <p className="text-[9px] font-extrabold text-gray-400 uppercase tracking-widest mt-0.5">Recent Status</p>
                                        </div>
                                        <button onClick={() => handleTabChange('requests')} className="text-[#8D6E63] text-xs font-bold hover:underline">View All</button>
                                    </div>
                                    
                                    {requests.length === 0 ? (
                                        <div className="text-center py-10 opacity-50 flex-1 flex flex-col justify-center">
                                            <FaClipboardList className="mx-auto mb-3 text-amber-300" size={32} />
                                            <p className="text-xs text-gray-500 font-medium">No applications sent.</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-3 flex-1">
                                            {requests.slice(0, 3).map(req => (
                                                <div key={req._id} className="flex items-center justify-between bg-gray-50 p-4 rounded-xl border border-gray-100 hover:border-[#8D6E63]/30 transition-colors">
                                                    <div>
                                                        <h4 className="font-bold text-[#3E2723] text-sm">{req.petName}</h4>
                                                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-0.5">{new Date(req.createdAt || req.date).toLocaleDateString()}</p>
                                                    </div>
                                                    <span className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider shadow-sm ${req.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' : req.status === 'Approved' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                        {req.status}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {tab === 'requests' && (
                        <div>
                            <div className="flex items-center justify-between mb-5">
                                <h2 className="text-xl font-bold text-[#3E2723]">My Applications</h2>
                                <Link to="/pet-find" className="flex items-center gap-2 bg-[#5D4037] text-white text-sm font-semibold px-4 py-2 rounded-xl hover:bg-[#3E2723] transition-colors"><FaSearch /> Find Pets</Link>
                            </div>
                            {requests.length === 0 ? (
                                <div className="text-center py-16 bg-gradient-to-b from-white to-gray-50 rounded-2xl border border-dashed border-gray-300">
                                    <p className="text-gray-500 font-medium">No applications found.</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {requests.map(req => (
                                        <div key={req._id} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex items-center justify-between">
                                            <div>
                                                <h3 className="font-bold text-[#3E2723]">{req.petName}</h3>
                                                <p className="text-xs text-gray-500">Submitted: {new Date(req.createdAt || req.date).toLocaleDateString()}</p>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <span className={`status-pill status-${req.status?.toLowerCase()}`}>{req.status}</span>
                                                {req.status === 'Pending' && <button onClick={() => cancelRequest(req._id)} className="text-red-500 hover:text-red-700 transition-colors"><FaTrash /></button>}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {tab === 'favorites' && (
                        <div className="bg-white/40 backdrop-blur-xl rounded-[2.5rem] border border-white p-8 shadow-2xl shadow-amber-900/5 animate-in fade-in zoom-in duration-700">
                             <div className="flex justify-between items-center mb-8">
                                <div>
                                    <h2 className="text-2xl font-black text-[#3E2723]">Saved Pets & Favorites</h2>
                                    <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mt-1">Pets you've bookmarked for later</p>
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
                                    <h3 className="text-xl font-black text-[#3E2723]">Your collection is empty</h3>
                                    <p className="text-gray-400 text-sm max-w-xs mx-auto mt-3 font-medium">Explore our listings and tap the heart icon to save pets you're interested in.</p>
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
                                                            <FaEye size={12}/> Quick View
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
                                                        {pet.listingType === 'Sale' ? 'Purchase Pet' : 'Adopt Now'}
                                                    </Link>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {tab === 'history' && (
                        <div>
                            <h2 className="text-xl font-bold text-[#3E2723] mb-5">Adoption History</h2>
                            {history.length === 0 ? (
                                <div className="text-center py-16 bg-gradient-to-b from-white to-gray-50 rounded-2xl border border-dashed border-gray-300">
                                    <p className="text-gray-500 font-medium">No history yet.</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {history.map(item => (
                                        <div key={item._id} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex items-center gap-4">
                                            <div className="w-16 h-16 rounded-xl bg-gray-50 flex items-center justify-center shrink-0 overflow-hidden">
                                                <img src={item.petId?.image || item.petId?.images?.[0] || 'https://via.placeholder.com/100x100'} className="w-full h-full object-cover" />
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-[#3E2723]">{item.petName}</h3>
                                                <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Adopted on: {new Date(item.date).toLocaleDateString()}</p>
                                            </div>
                                            <div className="ml-auto text-green-500"><FaCheckCircle size={20} /></div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {tab === 'vaccinations' && <div><h2 className="text-xl font-bold text-[#3E2723] mb-5">Vaccination Records</h2><VaccinationReminder showAddForm={true} /></div>}
                    {tab === 'reviews' && <UserReviewsTab userId={user._id} />}
                    {tab === 'messages' && <UserMessagesTab messages={messages} loading={false} />}
                    {tab === 'notifications' && <React.Suspense fallback={<FaSpinner className="animate-spin" />}><Notifications isTab={true}/></React.Suspense>}
                    
                    {tab === 'profile' && (
                        <React.Suspense fallback={<FaSpinner className="animate-spin" />}>
                            <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                                <div className="a-hero-profile mb-8">
                                    <input ref={fileInputRef} type="file" accept="image/*" onChange={handleHeroImageUpload} style={{ display: 'none' }} />
                                    <div className="a-profile-identity">
                                        <div className="a-avatar-wrapper">
                                            {user?.image || user?.profileImage ? <img src={user?.image || user?.profileImage} /> : <div className="a-avatar-placeholder">{user?.name?.charAt(0) || 'U'}</div>}
                                            <label 
                                                className="a-avatar-badge" 
                                                onClick={() => fileInputRef.current.click()}
                                                style={{ cursor: 'pointer' }}
                                                title="Update Photo"
                                            >
                                                <FaCamera />
                                            </label>
                                        </div>
                                        <div className="a-profile-info">
                                            <div className="a-badge">Pet Adopter</div>
                                            <h1 className="text-3xl font-black text-white leading-tight mb-1">{user?.name || 'User'}</h1>
                                            <div className="relative">
                                                <p 
                                                    ref={bioRef}
                                                    className={`a-hero-bio text-white/90 text-sm mb-1 ${isBioExpanded ? 'expanded' : 'clamped'}`}
                                                >
                                                    {user?.bio || 'Passionate pet lover and community supporter.'}
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
                                            <div className="a-hero-details text-white/80">
                                                {user?.email && <span><FaEnvelope /> {user.email}</span>}
                                                {user?.phone && <span><FaPhone /> {user.phone}</span>}
                                                {user?.address && <span><FaMapMarkerAlt /> {user.address}</span>}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-2 shrink-0 min-w-[200px]">
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
                                            <style>{`.edit-profile-btn { border: 2px solid ${isEditingProfile ? '#fff' : 'rgba(255,255,255,0.3)'} !important; border-radius: 12px; padding: 10px 20px; font-weight: 800; font-size: 0.85rem; cursor: pointer; transition: all 0.2s; display: flex; align-items: center; justify-content: center; gap: 8px; text-transform: uppercase; letter-spacing: 0.5px; }`}</style>
                                            {isEditingProfile ? <><FaCheckCircle /> Finish Editing</> : <><FaUserCircle /> Edit Profile</>}
                                        </button>
                                        <button className="a-list-btn" onClick={() => navigate('/pet-find')}>Find a Pet</button>
                                    </div>
                                </div>
                                <AdopterProfile ref={profileRef} isTab={true} externalEditing={isEditingProfile} onEditingComplete={() => setIsEditingProfile(false)} />
                            </div>
                        </React.Suspense>
                    )}
                </main>
            </div>
        </div>
    );
}
