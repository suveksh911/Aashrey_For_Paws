import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../services/axios';
import { useAuth } from '../context/AuthContext';
import {
    FaPaw, FaClipboardList, FaBullhorn, FaSyringe, FaHeart, FaHistory,
    FaUserCircle, FaShieldAlt, FaPlus, FaEdit, FaTrash, FaSave,
    FaEye, FaCheck, FaTimes, FaSignOutAlt, FaBars,
    FaCheckCircle, FaHourglassHalf, FaTimesCircle, FaFileUpload,
    FaChartLine, FaDonate, FaBell, FaSpinner, FaCamera,
    FaEnvelope, FaPhone, FaMapMarkerAlt, FaSearch, FaGlobe, FaReply, FaStar
} from 'react-icons/fa';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    BarChart, Bar, Legend
} from 'recharts';
import VaccinationReminder from '../components/pet/VaccinationReminder';
import useVaccinationReminders from '../hooks/useVaccinationReminders';
import { UserMessagesTab, UserReviewsTab } from './DashboardShared';
import { OwnerProfilePage } from './RoleProfiles';
const Notifications = React.lazy(() => import('./Notifications'));

const OwnerDashboardStyles = () => (
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
        .a-hero-details span {
            display: flex !important;
            align-items: center !important;
            gap: 5px !important;
        }
        .a-list-btn { background: white; color: #5d4037; border: none; padding: 12px 24px; border-radius: 12px; font-weight: 800; font-size: 0.95rem; cursor: pointer; transition: all 0.2s ease; display: flex; align-items: center; gap: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); width: 100%; justify-content: center; }
        .edit-profile-btn { background: transparent; color: white; border: 2px solid rgba(255,255,255,0.3); padding: 10px 24px; border-radius: 12px; font-weight: 700; font-size: 0.9rem; cursor: pointer; transition: all 0.2s ease; display: flex; align-items: center; gap: 8px; width: 100%; justify-content: center; }
        .edit-profile-btn:hover { background: rgba(255,255,255,0.1); border-color: white; }
        .status-pill { padding: 4px 12px; border-radius: 20px; font-size: 0.7rem; font-weight: 700; }
        .status-available { background: #E8F5E9; color: #2E7D32; }
        .status-adopted { background: #E3F2FD; color: #1565C0; }
        .status-pending { background: #FFF8E1; color: #F57F17; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .hide-scrollbar::-webkit-scrollbar { display: none; }
    `}</style>
);

const StatusPill = ({ status }) => {
    const map = {
        Available: 'bg-green-100 text-green-700',
        Adopted: 'bg-blue-100 text-blue-700',
        Pending: 'bg-yellow-100 text-yellow-700',
        Approved: 'bg-green-100 text-green-700',
        Rejected: 'bg-red-100 text-red-700',
    };
    return (
        <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${map[status] || 'bg-gray-100 text-gray-600'}`}>
            {status}
        </span>
    );
};

const ActivityChart = ({ data }) => (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-8">
        <h3 className="text-lg font-bold text-[#3E2723] mb-6">Monthly Activity</h3>
        <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data} margin={{ top: 0, right: 0, left: -25, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#888', fontSize: 12 }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#888', fontSize: 12 }} />
                    <Tooltip cursor={{ fill: '#fcfcfc' }} />
                    <Legend iconType="circle" />
                    <Bar dataKey="Listings" fill="#8D6E63" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="Adoptions" fill="#A1887F" radius={[4, 4, 0, 0]} />
                </BarChart>
            </ResponsiveContainer>
        </div>
    </div>
);

const NAV_ITEMS = [
    { key: 'profile', icon: <FaUserCircle />, label: 'My Profile' },
    { key: 'overview', icon: <FaChartLine />, label: 'Overview' },
    { key: 'listings', icon: <FaPaw />, label: 'My Pets' },
    { key: 'lostfound', icon: <FaSearch />, label: 'Lost & Found' },
    { key: 'requests', icon: <FaClipboardList />, label: 'Incoming Requests' },
    { key: 'vaccinations', icon: <FaSyringe />, label: 'Vaccinations' },
    { key: 'reviews', icon: <FaStar />, label: 'My Reviews' },
    { key: 'messages', icon: <FaEnvelope />, label: 'My Messages' },
    { key: 'favorites', icon: <FaHeart />, label: 'Saved Pets' },
    { key: 'history', icon: <FaHistory />, label: 'History' },
    { key: 'notifications', icon: <FaBell />, label: 'Notifications' },
];

export default function OwnerDashboard({ user }) {
    const [tab, setTab] = useState(() => {
        const params = new URLSearchParams(window.location.search);
        return params.get('tab') || localStorage.getItem('owner_active_tab') || 'overview';
    });

    const handleTabChange = (key) => {
        setTab(key);
        localStorage.setItem('owner_active_tab', key);
        setSidebarOpen(false);
        const newUrl = key === 'overview' ? '/owner' : `/owner?tab=${key}`;
        window.history.replaceState({}, '', newUrl);
    };
    const [isEditingProfile, setIsEditingProfile] = useState(false);
    const [isBioExpanded, setIsBioExpanded] = useState(false);
    const [showReadMore, setShowReadMore] = useState(false);
    const bioRef = React.useRef(null);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    useVaccinationReminders();
    const fileInputRef = React.useRef(null);
    const [myListings, setMyListings] = useState([]);
    const [incomingRequests, setIncomingRequests] = useState([]);
    const [myApplications, setMyApplications] = useState([]);
    const [vaccinations, setVaccinations] = useState([]);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [filter, setFilter] = useState('All');
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
            localStorage.setItem('owner_active_tab', activeT);
        }

        const fetchAllData = async () => {
            if (!user?._id) return;
            setLoading(true);
            try {
                const [petRes, reqRes, myReqRes, vacRes, notifRes] = await Promise.allSettled([
                    api.get('/pets/my-pets'),
                    api.get('/adoptions/incoming'),
                    api.get('/adoptions/my-requests'),
                    api.get('/vaccinations/my-vaccines'),
                    api.get('/notifications'),
                    api.post('/vaccinations/check-reminders'),
                ]);

                const pets = petRes.status === 'fulfilled' ? (petRes.value.data.data || []) : [];
                const reqs = reqRes.status === 'fulfilled' ? (reqRes.value.data.data || []) : [];
                const myReqs = myReqRes.status === 'fulfilled' ? (myReqRes.value.data.data || []) : [];
                const vacData = vacRes.status === 'fulfilled' ? (vacRes.value.data.data || []) : [];
                const notifData = notifRes.status === 'fulfilled' ? (notifRes.value.data.data || []) : [];

                setMyListings(pets);
                setIncomingRequests(reqs);
                setMyApplications(myReqs);
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
                    .catch(e => console.error("Messages error", e));

                api.get(`/reviews/ngo/${user._id}`)
                    .then(res => { if (res.data.success) setRecentReviews(res.data.data); })
                    .catch(e => console.error("Reviews error", e));
            } catch (err) {
                console.error("Dashboard error", err);
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



    const removeFavorite = (petId) => {
        const favoriteKey = `userFavorites_${user._id}`;
        const updated = favorites.filter(f => f._id !== petId);
        setFavorites(updated);
        localStorage.setItem(favoriteKey, JSON.stringify(updated));
        toast.info('Removed from favorites');
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const handleDeleteListing = async (petId) => {
        if (!window.confirm('Delete this listing permanently?')) return;
        try {
            await api.delete(`/pets/${petId}`);
            toast.success('Listing removed');
            setMyListings(p => p.filter(x => x._id !== petId));
        } catch { toast.error("Deletion failed"); }
    };

    const handleToggleStatus = async (petId, currentStatus) => {
        const newStatus = currentStatus === 'Adopted' ? 'Available' : 'Adopted';
        try {
            await api.put(`/pets/${petId}`, { status: newStatus });
            toast.success(`Pet marked as ${newStatus}`);
            setMyListings(prev => prev.map(p => p._id === petId ? { ...p, status: newStatus } : p));
        } catch { toast.error("Update failed"); }
    };

    const handleRequestAction = async (requestId, action) => {
        const status = action === 'approve' ? 'Approved' : 'Rejected';
        try {
            await api.patch(`/adoptions/${requestId}/status`, { status });
            toast.success(`Request ${status}!`);
            setIncomingRequests(prev => prev.map(r => r._id === requestId ? { ...r, status } : r));
            setSelectedRequest(null);
        } catch { toast.error("Operation failed"); }
    };

    const handleCancelRequest = async (requestId) => {
        if (!window.confirm('Cancel this adoption request?')) return;
        try {
            await api.delete(`/adoptions/${requestId}`);
            toast.info('Adoption request cancelled');
            setMyApplications(prev => prev.filter(r => r._id !== requestId));
        } catch (err) { toast.error("Failed to cancel request"); }
    };

    const getChartData = () => {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const data = [];
        const now = new Date();
        for (let i = 5; i >= 0; i--) {
            const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const listings = myListings.filter(p => {
                const pDate = new Date(p.createdAt);
                return pDate.getMonth() === d.getMonth() && pDate.getFullYear() === d.getFullYear();
            }).length;
            const adoptions = myListings.filter(p => {
                const pDate = new Date(p.createdAt);
                return p.status === 'Adopted' && pDate.getMonth() === d.getMonth() && pDate.getFullYear() === d.getFullYear();
            }).length;
            data.push({ name: months[d.getMonth()], Listings: listings, Adoptions: adoptions });
        }
        return data;
    };

    return (
        <div className="h-screen bg-gray-50 flex overflow-hidden">
            <OwnerDashboardStyles />
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
                            <p className="text-amber-300 text-xs font-medium">Owner Account</p>
                        </div>
                    </div>
                </div>

                <div className="px-5 py-4 border-b border-white/10">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-amber-200 flex items-center justify-center text-[#5D4037] font-bold text-lg shadow">
                            {user?.name?.charAt(0).toUpperCase() || 'O'}
                        </div>
                        <div className="min-w-0">
                            <p className="text-white font-semibold text-sm truncate">{user?.name || 'Owner User'}</p>
                            <p className="text-amber-300 text-xs">Pet Owner</p>
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
                                    ? 'bg-white/15 text-white shadow-lg shadow-black/10'
                                    : 'text-amber-200/70 hover:bg-white/10 hover:text-white'}`}
                        >
                            <span className="text-base">{item.icon}</span>
                            {item.label}
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

                <div className="px-3 py-4 border-t border-white/10">
                    <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold text-red-300 hover:bg-red-500/20 hover:text-red-200 transition-all">
                        <FaSignOutAlt /> Logout
                    </button>
                </div>
            </aside>

            {sidebarOpen && <div className="fixed inset-0 bg-black/40 z-30 lg:hidden" onClick={() => setSidebarOpen(false)} />}

            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                <header className="bg-white border-b border-gray-100 px-4 lg:px-8 py-4 flex items-center gap-4 sticky top-0 z-20 shadow-sm">
                    <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100"><FaBars size={18} /></button>
                    <div className="flex-1">
                        <h1 className="text-lg font-bold text-[#3E2723]">{NAV_ITEMS.find(n => n.key === tab)?.label || 'Dashboard'}</h1>
                        <p className="text-xs text-gray-400 hidden sm:block">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                    </div>
                </header>

                <main className="flex-1 px-4 lg:px-8 py-6 overflow-y-auto">
                    {tab === 'overview' && (
                        <div className="space-y-8">
                            {/* Stats Cards */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                                {[
                                    { label: 'Listed for Adoption', value: myListings.filter(p => !['Lost', 'Found'].includes(p.type)).length, icon: <FaPaw />, color: 'from-amber-400 to-amber-600', tab: 'listings' },
                                    { label: 'Lost & Found Reports', value: myListings.filter(p => ['Lost', 'Found'].includes(p.type)).length, icon: <FaSearch />, color: 'from-orange-400 to-orange-600', tab: 'lostfound' },
                                    { label: 'Pending Requests', value: incomingRequests.filter(r => r.status === 'Pending').length, icon: <FaClipboardList />, color: 'from-blue-400 to-blue-600', tab: 'requests' },
                                    { label: 'Successfully Rehomed', value: myListings.filter(p => p.status === 'Adopted').length, icon: <FaCheckCircle />, color: 'from-green-400 to-green-600', tab: 'history' },
                                    { label: 'Saved Pets', value: favorites.length, icon: <FaHeart />, color: 'from-rose-400 to-rose-600', tab: 'favorites' }
                                ].map((s, idx) => (
                                    <div key={idx} onClick={() => handleTabChange(s.tab)} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-center gap-3 hover:shadow-md hover:scale-[1.02] cursor-pointer transition-all">
                                        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${s.color} text-white flex items-center justify-center shadow-lg`}>{React.cloneElement(s.icon, { size: 16 })}</div>
                                        <div>
                                            <div className="text-xl font-black text-[#3E2723] leading-none">{s.value}</div>
                                            <div className="text-[9px] font-extrabold text-gray-400 uppercase tracking-wider mt-1">{s.label}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Recent Listings Highlights */}
                            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                                <div className="lg:col-span-3 bg-white/60 backdrop-blur-xl rounded-3xl p-6 border border-white shadow-sm">
                                    <div className="flex justify-between items-center mb-6">
                                        <h3 className="text-lg font-bold text-[#3E2723] flex items-center gap-2">
                                             <span className="w-2 h-6 bg-amber-500 rounded-full"></span>
                                             My Recent Listings
                                        </h3>
                                        <button onClick={() => handleTabChange('listings')} className="text-amber-700 text-xs font-black uppercase tracking-widest hover:underline">Manage All</button>
                                    </div>
                                    {myListings.length > 0 ? (
                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                            {myListings.slice(0, 3).map(pet => (
                                                <div key={pet._id} className="group bg-white rounded-2xl overflow-hidden border border-gray-100/50 shadow-sm hover:shadow-xl transition-all duration-500 p-2">
                                                    <div className="relative h-28 rounded-xl overflow-hidden mb-3">
                                                        <img src={pet.image || pet.images?.[0] || 'https://placehold.co/600x400/5d4037/FFF?text=Image+Unavailable'} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
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
                                             <p className="text-sm text-gray-400">No active listings yet</p>
                                        </div>
                                    )}
                                </div>
                                <div className="bg-gradient-to-br from-[#5D4037] to-[#3E2723] rounded-3xl p-6 text-white shadow-xl shadow-amber-900/10 flex flex-col justify-center gap-4">
                                    <h3 className="font-black text-xs uppercase tracking-widest opacity-70">Quick Action</h3>
                                    <p className="font-bold text-sm leading-relaxed">Have a new pet looking for a home?</p>
                                    <Link to="/add-pet" className="w-full py-3 bg-white text-[#3E2723] rounded-2xl text-center text-[10px] font-black uppercase tracking-widest hover:bg-amber-50 transition-colors shadow-lg shadow-black/20">List New Pet</Link>
                                </div>
                            </div>
                            
                            {/* Layout Split: Chart & Feedback */}
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                <div className="lg:col-span-2">
                                    <ActivityChart data={getChartData()} />
                                </div>
                                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-8 overflow-hidden self-start">
                                    <div className="flex items-center justify-between mb-5">
                                        <h3 className="text-lg font-bold text-[#3E2723]">Recent Feedback</h3>
                                        <button onClick={() => handleTabChange('reviews')} className="text-[#8D6E63] text-xs font-bold hover:underline">View All</button>
                                    </div>
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
                    )}

                    {tab === 'listings' && (
                        <div>
                            <div className="flex items-center justify-between mb-5">
                                <h2 className="text-xl font-bold text-[#3E2723]">My Pet Listings</h2>
                                <Link to="/add-pet" className="flex items-center gap-2 bg-[#5D4037] text-white text-sm font-semibold px-4 py-2 rounded-xl hover:bg-[#3E2723] transition-colors"><FaPlus /> Add Pet</Link>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                {myListings.map(pet => (
                                    <div key={pet._id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                                        <img src={pet.image || pet.images?.[0] || 'https://placehold.co/600x400/5d4037/FFF?text=Image+Unavailable'} className="w-full h-40 object-cover" />
                                        <div className="p-4">
                                            <h3 className="font-bold text-[#3E2723] mb-2">{pet.name}</h3>
                                            <span className={`status-pill status-${pet.status?.toLowerCase() || 'available'}`}>{pet.status || 'Available'}</span>
                                            <div className="flex gap-2 mt-4">
                                                <Link to={`/pet/${pet._id}`} className="flex-1 py-1.5 text-center text-xs font-bold border border-gray-100 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100">View</Link>
                                                <Link to={`/edit-pet/${pet._id}`} className="flex-1 py-1.5 text-center text-xs font-bold border border-gray-100 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100">Edit</Link>
                                                <button onClick={() => handleDeleteListing(pet._id)} className="p-1.5 px-3 text-red-500 border border-red-50 rounded-lg bg-red-50 hover:bg-red-100 transition-colors"><FaTrash size={12}/></button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {tab === 'requests' && (
                        <div className="space-y-6">
                            <div className="flex items-center justify-between flex-wrap gap-4">
                                <div>
                                    <h2 className="text-xl font-bold text-[#3E2723]">Adoption Requests & Applications</h2>
                                    <p className="text-xs text-gray-400">Manage all your incoming and outgoing adoption activity.</p>
                                </div>
                                <div className="flex bg-gray-100 p-1 rounded-xl">
                                    {['All', 'Pending', 'Approved', 'Rejected'].map(f => (
                                        <button
                                            key={f}
                                            onClick={() => setFilter(f)}
                                            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${filter === f ? 'bg-white text-[#5D4037] shadow-sm' : 'text-gray-500 hover:text-[#5D4037]'}`}
                                        >
                                            {f}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead className="bg-gray-50/80 border-b border-gray-100">
                                            <tr className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                                <th className="px-6 py-4 text-left">Pet</th>
                                                <th className="px-6 py-4 text-left">Type</th>
                                                <th className="px-6 py-4 text-left">Involved Party</th>
                                                <th className="px-6 py-4 text-left">Date</th>
                                                <th className="px-6 py-4 text-left">Status</th>
                                                <th className="px-6 py-4 text-left">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-50">
                                            {(() => {
                                                const combined = [
                                                    ...incomingRequests.map(r => ({ ...r, direction: 'Received' })),
                                                    ...myApplications.map(r => ({ ...r, direction: 'Sent' }))
                                                ].sort((a, b) => new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date));
                                                
                                                const filtered = filter === 'All' ? combined : combined.filter(r => r.status === filter);

                                                if (filtered.length === 0) {
                                                    return <tr><td colSpan="6" className="px-6 py-16 text-center text-gray-400 font-medium">No {filter !== 'All' ? filter.toLowerCase() : ''} requests found.</td></tr>;
                                                }

                                                return filtered.map(req => (
                                                    <tr key={req._id} className="hover:bg-gray-50 transition-colors">
                                                        <td className="px-6 py-4 font-bold text-[#3E2723]">{req.petName}</td>
                                                        <td className="px-6 py-4">
                                                            <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider ${req.direction === 'Received' ? 'bg-indigo-50 text-indigo-600' : 'bg-rose-50 text-rose-600'}`}>
                                                                {req.direction}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4 text-gray-600 font-medium">
                                                            {req.direction === 'Received' ? (req.fullName || req.userName) : 'To Owner'}
                                                        </td>
                                                        <td className="px-6 py-4 text-gray-400 text-xs">
                                                            {new Date(req.createdAt || req.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                                        </td>
                                                        <td className="px-6 py-4"><StatusPill status={req.status} /></td>
                                                        <td className="px-6 py-4">
                                                            <div className="flex gap-2">
                                                                {req.direction === 'Received' && (
                                                                    <button onClick={() => setSelectedRequest(req)} className="p-2 text-blue-500 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors" title="View Details"><FaEye size={12}/></button>
                                                                )}
                                                                {req.direction === 'Received' && req.status === 'Pending' && (
                                                                    <>
                                                                        <button onClick={() => handleRequestAction(req._id, 'approve')} className="p-2 text-green-600 bg-green-50 rounded-lg hover:bg-green-100 transition-colors" title="Approve"><FaCheck size={12}/></button>
                                                                        <button onClick={() => handleRequestAction(req._id, 'reject')} className="p-2 text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors" title="Reject"><FaTimes size={12}/></button>
                                                                    </>
                                                                )}
                                                                {req.direction === 'Sent' && req.status === 'Pending' && (
                                                                    <button onClick={() => handleCancelRequest(req._id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Cancel Request">
                                                                        <FaTrash size={12}/>
                                                                    </button>
                                                                )}
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ));
                                            })()}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}

                    {tab === 'vaccinations' && <div><h2 className="text-xl font-bold text-[#3E2723] mb-5">Vaccination Records</h2><VaccinationReminder showAddForm={true} /></div>}
                    {tab === 'messages' && <UserMessagesTab messages={messages} loading={false} />}
                    {tab === 'profile' && (
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                                <div className="a-hero-profile mb-8">
                                    <input ref={fileInputRef} type="file" accept="image/*" onChange={handleHeroImageUpload} style={{ display: 'none' }} />
                                    <div className="a-profile-identity">
                                        <div className="a-avatar-wrapper">
                                            {user?.image || user?.profileImage ? <img src={user?.image || user?.profileImage} /> : <div className="a-avatar-placeholder">{user?.name?.charAt(0) || 'O'}</div>}
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
                                            <div className="a-badge">Pet Owner</div>
                                            <h1 className="text-3xl font-black text-white leading-tight mb-1">{user?.name || 'Owner'}</h1>
                                            <div className="relative">
                                                <p className={`a-hero-bio text-white/90 text-sm mb-1 ${isBioExpanded ? 'expanded' : 'clamped'}`}>
                                                    {(user?.bio || 'Dedicated pet owner sharing love and care.').length > 120 && !isBioExpanded
                                                        ? (user?.bio || 'Dedicated pet owner sharing love and care.').slice(0, 120) + '...'
                                                        : (user?.bio || 'Dedicated pet owner sharing love and care.')}
                                                </p>
                                                {((user?.bio || 'Dedicated pet owner sharing love and care.').length > 120) && (
                                                    <button 
                                                        onClick={(e) => { 
                                                            e.stopPropagation(); 
                                                            setIsBioExpanded(!isBioExpanded); 
                                                        }}
                                                        className="a-read-more-btn"
                                                    >
                                                        {isBioExpanded ? 'Read less' : 'Read more'}
                                                    </button>
                                                )}
                                            </div>
                                            <div className="a-hero-details text-white/80">
                                                {user?.email && <span><FaEnvelope /> {user.email}</span>}
                                                {recentReviews?.length > 0 && <span><FaStar /> {recentReviews.length} Reviews</span>}
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
                                        style={{ background: isEditingProfile ? '#fff' : 'transparent', color: isEditingProfile ? '#3E2723' : '#fff' }}
                                    >
                                        <style>{`.edit-profile-btn { border: 2px solid ${isEditingProfile ? '#fff' : 'rgba(255,255,255,0.3)'} !important; border-radius: 12px; padding: 10px 20px; font-weight: 800; font-size: 0.85rem; cursor: pointer; transition: all 0.2s; display: flex; align-items: center; justify-content: center; gap: 8px; text-transform: uppercase; letter-spacing: 0.5px; }`}</style>
                                        {isEditingProfile ? <><FaCheckCircle /> Finish Editing</> : <><FaUserCircle /> Edit Profile</>}
                                    </button>
                                    <button className="a-list-btn" onClick={() => navigate('/add-pet')}>List Pet</button>
                                </div>
                            </div>
                            <OwnerProfilePage ref={profileRef} isTab={true} externalEditing={isEditingProfile} onEditingComplete={() => setIsEditingProfile(false)} />
                        </div>
                    )}
                    {tab === 'history' && (
                        <div>
                            <h2 className="text-xl font-bold text-[#3E2723] mb-5">Adoption History</h2>
                            <div className="space-y-4">
                                {myListings.filter(p => p.status === 'Adopted').length === 0 ? (
                                    <div className="text-center py-16 bg-gradient-to-b from-white to-gray-50 rounded-2xl border border-dashed border-gray-300">
                                        <p className="text-gray-500 font-medium">No rehomed pets in your history yet.</p>
                                    </div>
                                ) : (
                                    myListings.filter(p => p.status === 'Adopted').map(pet => (
                                        <div key={pet._id} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex items-center gap-4">
                                            <img src={pet.image || pet.images?.[0] || 'https://placehold.co/600x400/5d4037/FFF?text=Image+Unavailable'} className="w-16 h-16 rounded-xl object-cover" />
                                            <div>
                                                <h3 className="font-bold text-[#3E2723]">{pet.name}</h3>
                                                <p className="text-xs text-green-600 font-bold uppercase">Successfully Rehomed</p>
                                            </div>
                                            <div className="ml-auto flex items-center gap-4">
                                                <Link to={`/pet/${pet._id}`} className="text-xs font-bold text-[#8D6E63] hover:underline">View</Link>
                                                <div className="text-green-500" title="Successfully Rehomed"><FaCheckCircle size={20} /></div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    )}

                    {tab === 'favorites' && (
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="flex items-center justify-between mb-6">
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
                                                    src={pet.image || pet.images?.[0] || 'https://placehold.co/600x400/5d4037/FFF?text=Image+Unavailable'} 
                                                    alt={pet.name}
                                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                                                />
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col justify-end p-6">
                                                    <div className="flex gap-2">
                                                        <Link to={`/pet/${pet._id}`} className="flex-1 py-3 bg-white text-[#3E2723] text-[10px] font-black uppercase tracking-widest rounded-xl text-center hover:bg-amber-50 transition-colors shadow-xl">Quick View</Link>
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
                    {tab === 'reviews' && <UserReviewsTab userId={user._id} />}
                    {tab === 'notifications' && <React.Suspense fallback={<FaSpinner className="animate-spin" />}><Notifications isTab={true}/></React.Suspense>}
                    
                    {/* Adoption Detail Modal */}
                    {selectedRequest && (
                        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4 animate-in fade-in duration-200">
                            <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                                <div className="flex items-center justify-between px-8 py-6 border-b border-gray-100 bg-gray-50/50">
                                    <div>
                                        <h3 className="font-black text-[#3E2723] text-xl">Application Details</h3>
                                        <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mt-0.5">Reference #{selectedRequest._id.slice(-6)}</p>
                                    </div>
                                    <button onClick={() => setSelectedRequest(null)} className="p-2 text-gray-400 hover:text-[#3E2723] hover:bg-gray-100 rounded-xl transition-all">
                                        <FaTimes size={20} />
                                    </button>
                                </div>
                                <div className="p-8 space-y-5">
                                    <div className="flex items-center gap-4 bg-[#5D4037]/5 p-4 rounded-2xl border border-[#5D4037]/10">
                                        <div className="w-12 h-12 rounded-xl bg-[#5D4037] flex items-center justify-center text-white text-xl">🐾</div>
                                        <div>
                                            <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Applying For</p>
                                            <p className="text-lg font-black text-[#3E2723]">{selectedRequest.petName}</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                        {[
                                            { label: 'Applicant Name', val: selectedRequest.fullName || selectedRequest.userName, icon: <FaUserCircle /> },
                                            { label: 'Email Address', val: selectedRequest.email, icon: <FaEnvelope /> },
                                            { label: 'Phone Number', val: selectedRequest.phone, icon: <FaPhone /> },
                                            { label: 'Current Address', val: selectedRequest.address, icon: <FaMapMarkerAlt /> },
                                        ].map((item, idx) => item.val && (
                                            <div key={idx}>
                                                <div className="flex items-center gap-2 text-gray-400 mb-1">
                                                    <span className="text-xs">{item.icon}</span>
                                                    <span className="text-[10px] font-black uppercase tracking-widest">{item.label}</span>
                                                </div>
                                                <p className="text-sm font-bold text-[#3E2723]">{item.val}</p>
                                            </div>
                                        ))}
                                    </div>

                                    <div>
                                        <div className="flex items-center gap-2 text-gray-400 mb-2">
                                            <span className="text-xs"><FaClipboardList /></span>
                                            <span className="text-[10px] font-black uppercase tracking-widest">Reason for Adoption</span>
                                        </div>
                                        <div className="bg-gray-50 rounded-2xl p-4 text-gray-700 text-sm leading-relaxed border border-gray-100 font-medium italic">
                                            "{selectedRequest.reason || 'No reason provided.'}"
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between pt-2 border-t border-gray-50">
                                        <div>
                                            <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1">Current Status</p>
                                            <StatusPill status={selectedRequest.status} />
                                        </div>
                                        {selectedRequest.createdAt && (
                                            <div className="text-right">
                                                <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1">Date Sent</p>
                                                <p className="text-xs font-bold text-[#3E2723]">{new Date(selectedRequest.createdAt).toLocaleDateString()}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="px-8 py-6 border-t border-gray-100 bg-gray-50/30 flex justify-end gap-3">
                                    {selectedRequest.status === 'Pending' && selectedRequest.direction === 'Received' ? (
                                        <>
                                            <button onClick={() => handleRequestAction(selectedRequest._id, 'reject')}
                                                className="flex-1 py-3.5 rounded-2xl font-black text-sm uppercase tracking-wider border-2 border-red-50 text-red-500 hover:bg-red-50 transition-all active:scale-95">
                                                Reject
                                            </button>
                                            <button onClick={() => handleRequestAction(selectedRequest._id, 'approve')}
                                                className="flex-1 py-3.5 rounded-2xl font-black text-sm uppercase tracking-wider bg-green-600 text-white shadow-lg shadow-green-100 hover:bg-green-700 transition-all active:scale-95">
                                                Approve
                                            </button>
                                        </>
                                    ) : (
                                        <button onClick={() => setSelectedRequest(null)}
                                            className="w-full py-3.5 rounded-2xl font-black text-sm uppercase tracking-wider bg-gray-900 text-white hover:bg-[#3E2723] transition-all active:scale-95">
                                            Close Record
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {tab === 'lostfound' && (
                        <div>
                            <div className="flex items-center justify-between mb-5">
                                <h2 className="text-xl font-bold text-[#3E2723]">Lost & Found Reports</h2>
                                <Link to="/lost-found" className="flex items-center gap-2 bg-[#5D4037] text-white text-sm font-semibold px-4 py-2 rounded-xl hover:bg-[#3E2723] transition-colors"><FaPlus /> File Report</Link>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                {myListings.filter(p => ['Lost', 'Found'].includes(p.type)).map(pet => (
                                    <div key={pet._id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                                        <div className="relative">
                                            <img src={pet.image || pet.images?.[0] || 'https://placehold.co/600x400/5d4037/FFF?text=Image+Unavailable'} className="w-full h-40 object-cover" />
                                            <span className={`absolute top-2 left-2 ${pet.type === 'Lost' ? 'bg-red-500' : 'bg-blue-500'} text-white text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider`}>
                                                {pet.type}
                                            </span>
                                        </div>
                                        <div className="p-4">
                                            <h3 className="font-bold text-[#3E2723] mb-2">{pet.name}</h3>
                                            <p className="text-xs text-gray-400 mb-4">{pet.location}</p>
                                            <div className="flex gap-2">
                                                <Link to={`/pet/${pet._id}`} className="flex-1 py-1.5 text-center text-xs font-bold border border-gray-100 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100">View</Link>
                                                <Link to={`/edit-pet/${pet._id}`} className="flex-1 py-1.5 text-center text-xs font-bold border border-gray-100 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100">Edit</Link>
                                                <button onClick={() => handleDeleteListing(pet._id)} className="p-1.5 px-3 text-red-500 border border-red-50 rounded-lg bg-red-50 hover:bg-red-100 transition-colors"><FaTrash size={12}/></button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {myListings.filter(p => ['Lost', 'Found'].includes(p.type)).length === 0 && (
                                    <div className="col-span-full text-center py-16 bg-gray-50 border border-dashed rounded-2xl">
                                        <p className="text-gray-400">No lost or found reports yet.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                    {tab === 'campaigns' && (
                        <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
                            <FaBullhorn size={48} className="mx-auto text-gray-200 mb-4" />
                            <h2 className="text-xl font-bold text-[#3E2723]">Fundraising Campaigns</h2>
                            <p className="text-gray-400 max-w-sm mx-auto mt-2 text-sm leading-relaxed">
                                Owners can soon start personal medical fund campaigns for their pets. Stay tuned for this feature!
                            </p>
                        </div>
                    )}
                    {tab === 'verification' && (
                        <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
                            <FaShieldAlt size={48} className="mx-auto text-gray-200 mb-4" />
                            <h2 className="text-xl font-bold text-[#3E2723]">Account Verification</h2>
                            <p className="text-gray-400 max-w-sm mx-auto mt-2 text-sm leading-relaxed">
                                Get your account verified to build trust within the community. Feature coming soon!
                            </p>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}
