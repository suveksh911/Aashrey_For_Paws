import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import api from '../services/axios';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import Skeleton from '../components/common/Skeleton';
import {
    FaUsers, FaPaw, FaClipboardList, FaHeart, FaBuilding,
    FaTrash, FaCheck, FaTimes, FaSearch, FaShieldAlt,
    FaChartLine, FaCog, FaHistory, FaBell, FaFlag, FaStore,
    FaUserCircle, FaSignOutAlt, FaTachometerAlt, FaChevronDown, FaUserCheck,
    FaEnvelope, FaReply, FaPaperPlane, FaGlobe, FaCheckCircle, FaExclamationTriangle, FaInfoCircle
} from 'react-icons/fa';


const DEFAULT_USERS = [
    { _id: '1', name: 'Anu Budhathoki', email: 'anu@example.com', role: 'Adopter', status: 'Active', isVerified: true, joined: '2025-10-01', phone: '9841000001' },
    { _id: '2', name: 'Paw Helpers NGO', email: 'contact@pawhelpers.org', role: 'NGO', status: 'Active', isVerified: false, joined: '2025-10-05', phone: '9841000002' },
    { _id: '3', name: 'Jane Shakya', email: 'jane@example.com', role: 'Owner', status: 'Active', isVerified: true, joined: '2025-10-10', phone: '9841000003' },
    { _id: '4', name: 'Kabita Shah', email: 'kabita@example.com', role: 'Adopter', status: 'Suspended', isVerified: true, joined: '2025-10-12', phone: '9841000004' },
    { _id: '5', name: 'Safe Haven', email: 'info@safehaven.org', role: 'NGO', status: 'Active', isVerified: true, joined: '2025-10-15', phone: '9841000005' },
    { _id: '6', name: 'Raju Tamang', email: 'raju@example.com', role: 'Owner', status: 'Active', isVerified: false, joined: '2025-11-01', phone: '9841000006' },
];

const DEFAULT_PETS = [
    { _id: '101', name: 'Buddy', type: 'Dog', breed: 'Labrador', status: 'Available', owner: 'Paw Helpers NGO', date: '2025-10-06', age: '2 years' },
    { _id: '102', name: 'Whiskers', type: 'Cat', breed: 'Persian', status: 'Adopted', owner: 'Jane Shakya', date: '2025-10-02', age: '1 year' },
    { _id: '103', name: 'Rocky', type: 'Dog', breed: 'German Shepherd', status: 'Pending', owner: 'Paw Helpers NGO', date: '2025-10-08', age: '3 years' },
    { _id: '104', name: 'Goldie', type: 'Bird', breed: 'Canary', status: 'Available', owner: 'Safe Haven', date: '2025-10-16', age: '6 months' },
];

const DEFAULT_NGO = [
    { _id: 'n1', orgName: 'Paw Helpers NGO', email: 'contact@pawhelpers.org', phone: '9841000002', registrationNo: 'NGO-2025-1122', address: 'Kathmandu, Nepal', mission: 'Rescuing stray animals', type: 'NGO', documents: ['Registration Cert', 'PAN Card'], submittedOn: '2025-10-05', status: 'Pending', rejectReason: '' },
    { _id: 'n2', orgName: 'Happy Tails Pet Shop', email: 'info@happytails.com', phone: '9841000099', registrationNo: 'PS-2025-5566', address: 'Lalitpur, Nepal', mission: 'Ethical pet supply store', type: 'PetShop', documents: ['Business Registration', 'Tax Clearance'], submittedOn: '2025-11-01', status: 'Pending', rejectReason: '' },
    { _id: 'n3', orgName: 'Safe Haven', email: 'info@safehaven.org', phone: '9841000005', registrationNo: 'NGO-2025-3344', address: 'Pokhara, Nepal', mission: 'Animal shelter and welfare', type: 'NGO', documents: ['Registration Cert', 'PAN Card', 'Tax Clearance'], submittedOn: '2025-10-15', status: 'Approved', rejectReason: '' },
    { _id: 'n4', orgName: 'Fake Pets Ltd', email: 'scam@fakepets.com', phone: '0000000000', registrationNo: 'FAKE-000', address: 'Unknown', mission: 'Unknown', type: 'PetShop', documents: ['Unknown Doc'], submittedOn: '2025-11-10', status: 'Rejected', rejectReason: 'Could not verify registration. Documents appear fraudulent.' },
];

const ACTIVITY_LOG = [
    { _id: 'a1', type: 'warning', message: 'New NGO Application from Paw Helpers NGO', createdAt: '2025-10-05T10:00:00Z' },
    { _id: 'a2', type: 'success', message: 'Pet Adoption Completed: Whiskers adopted by Anu', createdAt: '2025-10-02T14:30:00Z' },
    { _id: 'a3', type: 'info', message: 'New User Registered: Raju Tamang (Owner)', createdAt: '2025-11-01T09:15:00Z' },
    { _id: 'a4', type: 'warning', message: 'Pet Shop Application from Happy Tails Pet Shop', createdAt: '2025-11-01T11:00:00Z' },
    { _id: 'a5', type: 'alert', message: 'User Suspended: Kabita Shah', createdAt: '2025-10-12T16:45:00Z' },
];

// ─── LS helpers ────────────────────────────────────────────────────────────────
const lsGet = (k, def) => { try { return JSON.parse(localStorage.getItem(k)) ?? def; } catch { return def; } };
const lsSet = (k, v) => localStorage.setItem(k, JSON.stringify(v));

// ─── Tiny Badge ────────────────────────────────────────────────────────────────
const Badge = ({ label, color }) => (
    <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: '0.77rem', fontWeight: 700, background: color + '20', color, border: `1px solid ${color}44` }}>{label}</span>
);

const SC = { active: '#22c55e', suspended: '#ef4444', Pending: '#f59e0b', Approved: '#22c55e', Rejected: '#ef4444' };

// ─── Overview Tab ──────────────────────────────────────────────────────────────
function OverviewTab({ stats, loading, activity, users = [], pets = [] }) {
    if (loading) return <div style={{ padding: '2rem' }}><Skeleton count={4} /></div>;
    
    // Calculate real-time growth data for the last 6 months
    const getGrowthData = () => {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const data = [];
        const now = new Date();
        
        for (let i = 5; i >= 0; i--) {
            const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const monthName = months[d.getMonth()];
            const year = d.getFullYear();
            
            // Count cumulative users up to this month
            const userCount = users.filter(u => {
                const uDate = new Date(u.createdAt);
                return uDate <= new Date(year, d.getMonth() + 1, 0); // End of month
            }).length;
            
            // Count cumulative pets up to this month
            const petCount = pets.filter(p => {
                const pDate = new Date(p.createdAt || p.date);
                return pDate <= new Date(year, d.getMonth() + 1, 0); // End of month
            }).length;
            
            data.push({ name: monthName, users: userCount, pets: petCount });
        }
        return data;
    };

    const growthData = getGrowthData();

    const cards = [
        { label: 'Total Users', value: stats.users, gradient: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)', emoji: <FaUsers /> },
        { label: 'Total Pets', value: stats.pets, gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', emoji: <FaPaw /> },
        { label: 'Pending Requests', value: stats.requests, gradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', emoji: <FaClipboardList /> },
        { label: 'NGO Apps', value: stats.ngoApps, gradient: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)', emoji: <FaBuilding /> },
    ];

    const timeAgo = (date) => {
        const diff = (Date.now() - new Date(date)) / 1000;
        if (diff < 60) return 'Just now';
        if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
        if (diff < 84600) return `${Math.floor(diff / 3600)}h ago`;
        return new Date(date).toLocaleDateString();
    };

    const getActivityStyle = (type) => {
        switch(type) {
            case 'success': return { color: '#22c55e', icon: <FaCheckCircle size={14} /> };
            case 'alert': return { color: '#ef4444', icon: <FaShieldAlt size={14} /> };
            case 'warning': return { color: '#f59e0b', icon: <FaExclamationTriangle size={14} /> };
            default: return { color: '#3b82f6', icon: <FaInfoCircle size={14} /> };
        }
    };

    const formatActivityMessage = (msg) => {
        if (!msg) return '';
        // Remove trailing emails in parentheses (e.g. "User (aaa@bbb.com)")
        let cleaned = msg.replace(/\s*\([^)]+@[^)]+\)/g, '');
        // Standardize phrasing for common actions
        cleaned = cleaned.replace(/^You updated status of user\s+/i, 'User Status Updated: ');
        cleaned = cleaned.replace(/^You approved the NGO application for\s+/i, 'NGO Approved: ');
        return cleaned;
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <div className="ad-stats-grid">
                {cards.map(c => (
                    <div key={c.label} className="ad-stat-card-premium" style={{ background: c.gradient }}>
                        <div className="ad-stat-icon-wrapper">{c.emoji}</div>
                        <div>
                            <div className="ad-stat-value-white">{c.value}</div>
                            <div className="ad-stat-label-white">{c.label}</div>
                        </div>
                    </div>
                ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }} className="ad-overview-grid">
                <div className="ad-panel" style={{ padding: '1.5rem' }}>
                    <h3 className="ad-panel-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <FaChartLine /> Platform Growth
                    </h3>
                    <div style={{ width: '100%', height: 300, marginTop: '1rem' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={growthData}>
                                <defs>
                                    <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} />
                                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
                                <Area type="monotone" dataKey="users" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorUsers)" />
                                <Area type="monotone" dataKey="pets" stroke="#10b981" strokeWidth={3} fillOpacity={0} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="ad-panel">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <h3 className="ad-panel-title" style={{ margin: 0 }}>🕐 Recent Activity</h3>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#22c55e', fontSize: '0.65rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.5px', background: '#22c55e15', padding: '2px 8px', borderRadius: '20px' }}>
                            <span className="ad-live-dot" /> Live
                        </div>
                    </div>
                    {(() => {
                        const filtered = (activity || []).filter(a => {
                            const isPlatform = !a.message.toLowerCase().includes('profile details');
                            const isVeryRecent = (Date.now() - new Date(a.createdAt)) < (1000 * 60 * 60 * 24 * 3); // Last 72 hours
                            return isPlatform && isVeryRecent;
                        }).slice(0, 6);

                        if (filtered.length === 0) {
                            return (
                                <div style={{ textAlign: 'center', padding: '2.5rem 1rem', color: '#94a3b8' }}>
                                    <div style={{ fontSize: '1.8rem', marginBottom: '0.5rem' }}>✨</div>
                                    <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#64748b' }}>No recent platform activity</div>
                                    <div style={{ fontSize: '0.75rem', marginTop: '4px' }}>New events will appear here automatically.</div>
                                </div>
                            );
                        }

                        return (
                            <ul className="ad-activity-list">
                                {filtered.map(a => {
                                    const style = getActivityStyle(a.type);
                                    return (
                                        <li key={a._id} className="ad-activity-item">
                                            <div className="ad-activity-icon" style={{ background: style.color + '15', color: style.color }}>{style.icon}</div>
                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <div style={{ fontWeight: 700, fontSize: '0.82rem', color: '#1e293b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={a.message}>
                                                    {formatActivityMessage(a.message)}
                                                </div>
                                                <div style={{ color: '#94a3b8', fontSize: '0.72rem', fontWeight: 600, marginTop: '1px' }}>{timeAgo(a.createdAt)}</div>
                                            </div>
                                        </li>
                                    );
                                })}
                            </ul>
                        );
                    })()}
                </div>
            </div>
        </div>
    );
}

// ─── Users Tab ─────────────────────────────────────────────────────────────────
function UsersTab({ users, setUsers }) {
    const [search, setSearch] = useState('');
    const [roleFilter, setRoleFilter] = useState('All');

    const saveUsers = (updated) => { setUsers(updated); lsSet('ad_users', updated); };

    const filtered = users.filter(u =>
        (u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase())) &&
        (roleFilter === 'All' || u.role === roleFilter)
    );

    const verify = async (id) => {
        try {
            await api.patch(`/admin/users/${id}/status`, { status: 'active' });
            toast.success('User activated');
            setUsers(users.map(u => u._id === id ? { ...u, status: 'active' } : u));
        } catch (err) {
            toast.error("Failed to activate user");
        }
    };

    const suspend = async (id, currentStatus) => {
        const newStatus = currentStatus === 'suspended' ? 'active' : 'suspended';
        try {
            await api.patch(`/admin/users/${id}/status`, { status: newStatus });
            toast.info(`User ${newStatus === 'suspended' ? 'suspended' : 'reactivated'}`);
            setUsers(users.map(u => u._id === id ? { ...u, status: newStatus } : u));
        } catch (err) {
            toast.error("Failed to update status");
        }
    };

    const verifyUser = async (id) => {
        try {
            await api.patch(`/admin/users/${id}/status`, { status: 'active', isVerified: true });
            toast.success('User verified successfully');
            setUsers(users.map(u => u._id === id ? { ...u, status: 'active', isVerified: true } : u));
        } catch (err) {
            toast.error("Failed to verify user");
        }
    };

    const remove = async (id) => {
        if (!window.confirm('Delete this user permanently?')) return;
        try {
            await api.delete(`/admin/users/${id}`);
            toast.success('User deleted');
            setUsers(users.filter(u => u._id !== id));
        } catch (err) {
            toast.error("Deletion failed");
        }
    };

    return (
        <div>
            <div className="ad-toolbar">
                <div className="ad-search-box"><FaSearch className="ad-search-icon" /><input placeholder="Search name or email…" value={search} onChange={e => setSearch(e.target.value)} /></div>
                <select className="ad-select" value={roleFilter} onChange={e => setRoleFilter(e.target.value)}>
                    {['All', 'Adopter', 'Owner', 'NGO'].map(r => <option key={r}>{r}</option>)}
                </select>
                <div style={{ marginLeft: 'auto', fontSize: '0.85rem', color: '#64748b' }}>{filtered.length} user{filtered.length !== 1 ? 's' : ''}</div>
            </div>
            <div className="ad-table-wrap">
                <table className="ad-table">
                    <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Status</th><th>Verified</th><th>Joined</th><th>Actions</th></tr></thead>
                    <tbody>
                        {filtered.map(u => (
                            <tr key={u._id}>
                                <td><strong>{u.name}</strong><div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>{u.phone}</div></td>
                                <td style={{ color: '#555' }}>{u.email}</td>
                                <td><Badge label={u.role} color="#8b5cf6" /></td>
                                <td><Badge label={u.status || 'active'} color={SC[u.status] || '#888'} /></td>
                                <td>
                                    {u.isVerified ? (
                                        <Badge label={u.role === 'NGO' ? "NGO Verified" : "Verified ✅"} color="#22c55e" />
                                    ) : (
                                        <Badge label="Unverified ❌" color="#f59e0b" />
                                    )}
                                </td>
                                <td style={{ color: '#777', fontSize: '0.85rem' }}>{u.createdAt ? new Date(u.createdAt).toLocaleDateString() : u.joined}</td>
                                <td>
                                    <div style={{ display: 'flex', gap: 4 }}>
                                        {!u.isVerified && u.status !== 'suspended' && (
                                            <button className="ad-btn-icon blue" title="Verify User" onClick={() => verifyUser(u._id)}><FaUserCheck /></button>
                                        )}
                                        {u.status === 'suspended' && <button className="ad-btn-icon green" title="Reactivate" onClick={() => suspend(u._id, u.status)}><FaCheck /></button>}
                                        {u.status !== 'suspended' && <button className="ad-btn-icon amber" title="Suspend" onClick={() => suspend(u._id, u.status)}><FaFlag /></button>}
                                        <button className="ad-btn-icon red" title="Delete" onClick={() => remove(u._id)}><FaTrash /></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {filtered.length === 0 && <tr><td colSpan={7} style={{ textAlign: 'center', padding: '2rem', color: '#888' }}>No users found.</td></tr>}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

// ─── NGO Verification Tab ──────────────────────────────────────────────────────
function NGOVerificationTab({ applications, setApplications }) {
    const [filter, setFilter] = useState('All');
    const [selected, setSelected] = useState(null);
    const [reason, setReason] = useState('');

    const save = (updated) => { setApplications(updated); lsSet('ad_ngoApps', updated); };

    const approve = async (id) => {
        try {
            await api.patch(`/admin/ngo-verify/${id}`, { status: 'Approved' });
            toast.success('Organization approved as Trusted ✅');
            setApplications(applications.map(a => a._id === id ? { ...a, status: 'Approved' } : a));
        } catch (err) {
            toast.error("Approval failed");
        }
    };
    const confirmReject = async () => {
        if (!reason.trim()) return toast.error('Please enter a rejection reason.');
        try {
            await api.patch(`/admin/ngo-verify/${selected._id}`, { status: 'Rejected', rejectReason: reason });
            toast.error('Organization marked as Rejected ❌');
            setApplications(applications.map(a => a._id === selected._id ? { ...a, status: 'Rejected', rejectReason: reason } : a));
            setSelected(null);
        } catch (err) {
            toast.error("Rejection failed");
        }
    };

    const shown = applications.filter(a => filter === 'All' || a.status === filter);

    return (
        <div>
            <div className="ad-info-banner">
                🛡️ Review each NGO or Pet Shop carefully before approving. Approve only those with verifiable documents.
            </div>
            <div className="ad-toolbar">
                {['All', 'Pending', 'Approved', 'Rejected'].map(s => (
                    <button key={s} className={`ad-filter-btn ${filter === s ? 'active' : ''}`} onClick={() => setFilter(s)}>
                        {s} <span style={{ background: '#e2e8f0', borderRadius: 20, padding: '1px 7px', fontSize: '0.72rem', marginLeft: 4 }}>{applications.filter(a => s === 'All' || a.status === s).length}</span>
                    </button>
                ))}
            </div>
            <div style={{ display: 'grid', gap: '1rem' }}>
                {shown.length === 0 ? (
                    <div className="ad-panel" style={{ textAlign: 'center', padding: '4rem 2rem', color: '#64748b', background: '#f8fafc', border: '1px dashed #cbd5e1' }}>
                        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🏢</div>
                        <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#1e293b' }}>No {filter !== 'All' ? filter : ''} Applications</h3>
                        <p style={{ margin: '8px 0 0', opacity: 0.8 }}>When someone applies to be a verified NGO, it will appear here for your review.</p>
                    </div>
                ) : (
                    shown.map(app => (
                        <div key={app._id} className="ad-ngo-card">
                            <div className="ad-ngo-header">
                                <div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                                        <h3 style={{ margin: 0, fontSize: '1.05rem' }}>{app.orgName}</h3>
                                        <Badge label={app.status} color={SC[app.status] || '#888'} />
                                    </div>
                                    <div style={{ color: '#666', fontSize: '0.88rem', marginTop: 4 }}>{app.email} · {app.phone}</div>
                                </div>
                                {app.status === 'Pending' && (
                                    <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                                        <button className="ad-action-btn green" onClick={() => approve(app._id)}><FaCheck /> Approve</button>
                                        <button className="ad-action-btn red" onClick={() => { setSelected(app); setReason(''); }}><FaTimes /> Reject</button>
                                    </div>
                                )}
                                {app.status === 'Approved' && <span style={{ color: '#22c55e', fontWeight: 700, fontSize: '1rem' }}>✅ Trusted</span>}
                                {app.status === 'Rejected' && <span style={{ color: '#ef4444', fontWeight: 700, fontSize: '1rem' }}>❌ Rejected</span>}
                            </div>
                            <div className="ad-ngo-grid">
                                <div><span className="ad-ngo-key">Reg. No.</span>{app.registrationNo || '—'}</div>
                                <div><span className="ad-ngo-key">Address</span>{app.address || '—'}</div>
                                <div><span className="ad-ngo-key">Submitted</span>{app.submittedAt ? new Date(app.submittedAt).toLocaleDateString() : '—'}</div>
                                <div><span className="ad-ngo-key">Mission</span>{app.mission || '—'}</div>
                                <div><span className="ad-ngo-key">Document</span>
                                    {app.documentImage
                                        ? <a href={app.documentImage} target="_blank" rel="noreferrer" style={{ color: '#3b82f6', fontWeight: 600 }}>View Document</a>
                                        : <span style={{ color: '#aaa' }}>No document uploaded</span>
                                    }
                                </div>
                            </div>
                            {app.rejectReason && <div className="ad-reject-reason">🚩 {app.rejectReason}</div>}
                        </div>
                    ))
                )}
            </div>

            {selected && (
                <div className="ad-modal-overlay" onClick={e => e.target === e.currentTarget && setSelected(null)}>
                    <div className="ad-modal">
                        <h3 style={{ margin: '0 0 6px' }}>Reject Application</h3>
                        <p style={{ color: '#64748b', margin: '0 0 1rem' }}>Organisation: <strong>{selected.orgName}</strong></p>
                        <label style={{ fontWeight: 600, fontSize: '0.9rem', display: 'block', marginBottom: 6 }}>Reason for Rejection *</label>
                        <textarea value={reason} onChange={e => setReason(e.target.value)} rows={4} placeholder="e.g. Documents could not be verified…" style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1.5px solid #e2e8f0', fontSize: '0.9rem', resize: 'vertical', boxSizing: 'border-box', fontFamily: 'inherit' }} />
                        <div className="ad-modal-actions">
                            <button className="ad-action-btn grey" onClick={() => setSelected(null)}>Cancel</button>
                            <button className="ad-action-btn red" onClick={confirmReject}><FaTimes /> Confirm Reject</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

// ─── Verified NGOs Section ───────────────────────────────────────────────────────
function VerifiedNGOsSection({ users }) {
    const verifiedNGOs = (users || []).filter(u => u.role === 'NGO' && u.ngoStatus === 'verified');
    return (
        <div style={{ marginTop: '1.5rem' }}>
            <h3 style={{ fontSize: '0.98rem', fontWeight: 700, color: '#1e293b', marginBottom: '0.75rem' }}>
                ✅ Verified NGOs on Platform ({verifiedNGOs.length})
            </h3>
            {verifiedNGOs.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '1.5rem', color: '#888', background: '#fff', borderRadius: 10 }}>No verified NGOs yet.</div>
            ) : (
                <div className="ad-table-wrap">
                    <table className="ad-table">
                        <thead><tr><th>Name</th><th>Email</th><th>Phone</th><th>Address</th><th>Joined</th></tr></thead>
                        <tbody>
                            {verifiedNGOs.map(ngo => (
                                <tr key={ngo._id}>
                                    <td><strong>{ngo.name}</strong></td>
                                    <td style={{ color: '#555' }}>{ngo.email}</td>
                                    <td style={{ color: '#777' }}>{ngo.phone || '—'}</td>
                                    <td style={{ color: '#777' }}>{ngo.address || '—'}</td>
                                    <td style={{ color: '#777', fontSize: '0.85rem' }}>{ngo.createdAt ? new Date(ngo.createdAt).toLocaleDateString() : '—'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

function PendingPetsTab({ pets, setPets }) {
    const pending = pets.filter(p => p.isApproved === false);

    const approve = async (id) => {
        try {
            await api.patch(`/pets/${id}/approve`);
            toast.success('Pet approved for public listing ✅');
            setPets(pets.map(p => p._id === id ? { ...p, isApproved: true } : p));
        } catch (err) {
            toast.error("Approval failed");
        }
    };

    const reject = async (id) => {
        const reason = window.prompt('Please provide a reason for rejecting this pet listing:');
        if (reason === null) return; // User clicked Cancel
        if (!reason.trim()) return toast.error('A reason is required to reject a pet listing.');

        try {
            await api.delete(`/pets/${id}/reject`, { params: { reason } });
            toast.success('Pet listing rejected ❌');
            setPets(pets.filter(p => p._id !== id));
        } catch (err) {
            toast.error("Rejection failed");
        }
    };

    return (
        <div>
            <div className="ad-info-banner">
                ⏳ These pets were listed by NGOs and require approval before appearing publicly.
            </div>
            <div className="ad-table-wrap">
                <table className="ad-table">
                    <thead><tr><th>Name</th><th>Type</th><th>Breed</th><th>Owner (NGO)</th><th>Listed On</th><th>Actions</th></tr></thead>
                    <tbody>
                        {pending.map(p => (
                            <tr key={p._id}>
                                <td><strong>{p.name}</strong></td>
                                <td>{p.type}</td>
                                <td style={{ color: '#666' }}>{p.breed}</td>
                                <td>{p.owner}</td>
                                <td style={{ color: '#777', fontSize: '0.85rem' }}>{p.createdAt ? new Date(p.createdAt).toLocaleDateString() : p.date}</td>
                                <td>
                                    <div style={{ display: 'flex', gap: 8 }}>
                                        <button className="ad-action-btn green" onClick={() => approve(p._id)}><FaCheck /> Approve</button>
                                        <button className="ad-action-btn red" onClick={() => reject(p._id)}><FaTimes /> Reject</button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {pending.length === 0 && <tr><td colSpan={6} style={{ textAlign: 'center', padding: '2rem', color: '#888' }}>No pending pets.</td></tr>}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

// ─── Pets Tab ──────────────────────────────────────────────────────────────────
function PetsTab({ pets, setPets }) {
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const PC = { Available: '#3b82f6', Adopted: '#22c55e', Pending: '#f59e0b' };

    const save = (updated) => { setPets(updated); lsSet('ad_pets', updated); };
    const filtered = pets.filter(p => p.isApproved !== false).filter(p =>
        (p.name.toLowerCase().includes(search.toLowerCase()) || p.owner.toLowerCase().includes(search.toLowerCase()) || p.type.toLowerCase().includes(search.toLowerCase())) &&
        (statusFilter === 'All' || p.status === statusFilter)
    );

    return (
        <div>
            <div className="ad-toolbar">
                <div className="ad-search-box"><FaSearch className="ad-search-icon" /><input placeholder="Search pets…" value={search} onChange={e => setSearch(e.target.value)} /></div>
                <select className="ad-select" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
                    {['All', 'Available', 'Pending', 'Adopted'].map(s => <option key={s}>{s}</option>)}
                </select>
                <div style={{ marginLeft: 'auto', fontSize: '0.85rem', color: '#64748b' }}>{filtered.length} pet{filtered.length !== 1 ? 's' : ''}</div>
            </div>
            <div className="ad-table-wrap">
                <table className="ad-table">
                    <thead><tr><th>Name</th><th>Type</th><th>Breed</th><th>Age</th><th>Owner</th><th>Status</th><th>Listed On</th><th>Actions</th></tr></thead>
                    <tbody>
                        {filtered.map(p => (
                            <tr key={p._id}>
                                <td><strong>{p.name}</strong></td>
                                <td>{p.type}</td>
                                <td style={{ color: '#666' }}>{p.breed}</td>
                                <td style={{ color: '#666' }}>{p.age}</td>
                                <td>{p.owner}</td>
                                <td><Badge label={p.status} color={PC[p.status] || '#888'} /></td>
                                <td style={{ color: '#777', fontSize: '0.85rem' }}>{p.date}</td>
                                <td>
                                    <button 
                                        className="ad-btn-icon red" 
                                        title="Remove" 
                                        onClick={async () => { 
                                            const reason = window.prompt('Please provide a reason for removing this pet listing:');
                                            if (reason === null) return; // User clicked Cancel
                                            if (!reason.trim()) return toast.error('A reason is required to remove a pet listing.');

                                            try {
                                                await api.delete(`/pets/${p._id}`, { params: { reason } });
                                                save(pets.filter(x => x._id !== p._id)); 
                                                toast.success('Listing completely removed'); 
                                            } catch (err) {
                                                toast.error('Failed to remove listing from server');
                                            }
                                        }}
                                    >
                                        <FaTrash />
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {filtered.length === 0 && <tr><td colSpan={8} style={{ textAlign: 'center', padding: '2rem', color: '#888' }}>No pets found.</td></tr>}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

function ReportsTab({ stats, users, pets = [] }) {
    // Calculate real-time adoption trends for the last 6 months
    const getAdoptionTrends = () => {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const data = [];
        const now = new Date();
        
        for (let i = 5; i >= 0; i--) {
            const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const mName = months[d.getMonth()];
            const year = d.getFullYear();
            
            // Count pets with status 'Adopted' whose creation/adoption date falls in this specific month
            const count = pets.filter(p => {
                const pDate = new Date(p.createdAt || p.date);
                return p.status === 'Adopted' && 
                       pDate.getMonth() === d.getMonth() && 
                       pDate.getFullYear() === year;
            }).length;
            
            data.push({ m: mName, v: count });
        }
        return data;
    };

    const bars = getAdoptionTrends();
    const max = Math.max(...bars.map(b => b.v), 1); // Ensure max is at least 1 to avoid division by zero


    // Distribution calculation
    const ngoCount = users.filter(u => u.role === 'NGO').length;
    const ownerCount = users.filter(u => u.role === 'Owner').length;
    const adopterCount = users.filter(u => u.role === 'Adopter').length;

    const dogCount = pets.filter(p => p.type === 'Dog').length;
    const catCount = pets.filter(p => p.type === 'Cat').length;
    const otherCount = pets.length - dogCount - catCount;

    return (
        <div style={{ display: 'grid', gap: '1.5rem' }}>
            {/* Row 1: Charts */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
                <div className="ad-panel">
                    <h3 className="ad-panel-title">📊 Adoption Trends</h3>
                    <div className="ad-bar-chart">
                        {bars.map(b => (
                            <div className="ad-bar-col" key={b.m}>
                                <div className="ad-bar-value">{b.v}</div>
                                <div className="ad-bar" style={{ height: `${(b.v / (max || 1)) * 130}px` }} />
                                <div className="ad-bar-label">{b.m}</div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="ad-panel">
                    <h3 className="ad-panel-title">👥 User Distribution</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
                        {[
                            { label: 'Adopters', count: adopterCount, color: '#3b82f6' },
                            { label: 'NGOs', count: ngoCount, color: '#8b5cf6' },
                            { label: 'Pet Owners', count: ownerCount, color: '#22c55e' }
                        ].map(item => (
                            <div key={item.label}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: 4 }}>
                                    <span style={{ fontWeight: 600 }}>{item.label}</span>
                                    <span style={{ color: '#64748b' }}>{item.count}</span>
                                </div>
                                <div style={{ height: 10, background: '#f1f5f9', borderRadius: 5, overflow: 'hidden' }}>
                                    <div style={{ height: '100%', background: item.color, width: `${(item.count / (users.length || 1)) * 100}%` }} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Row 2: Stats Grid */}
            <div className="ad-stats-grid" style={{ marginBottom: 0 }}>
                {[
                    { label: 'Total Users', value: stats.users, color: '#3b82f6', icon: <FaUsers /> },
                    { label: 'Verified NGOs', value: stats.verifiedNGOs, color: '#06b6d4', icon: <FaBuilding /> },
                    { label: 'Available Pets', value: pets.filter(p => p.status === 'Available').length, color: '#22c55e', icon: <FaPaw /> },
                    { label: 'Total Adoptions', value: stats.adoptions, color: '#ec4899', icon: <FaHeart /> },
                ].map(r => (
                    <div key={r.label} className="ad-panel" style={{ borderLeft: `4px solid ${r.color}`, padding: '1.2rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ background: r.color + '15', color: r.color, width: 45, height: 45, borderRadius: 10, display: 'flex', alignItems: 'center', justifyCenter: 'center', fontSize: '1.2rem' }}>
                            <div style={{ margin: 'auto' }}>{r.icon}</div>
                        </div>
                        <div>
                            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#1e293b', lineHL: 1 }}>{r.value}</div>
                            <div style={{ color: '#64748b', fontSize: '0.78rem', marginTop: 2, fontWeight: 600, textTransform: 'uppercase' }}>{r.label}</div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

// ─── Admin Notifications Tab ──────────────────────────────────────────────────
function AdminNotificationsTab({ notifications, onUpdate }) {
    const markRead = async (id) => {
        try {
            await api.patch(`/notifications/${id}/read`);
            onUpdate();
        } catch (err) { toast.error("Failed to mark as read"); }
    };

    const markAllRead = async () => {
        try {
            await api.patch('/notifications/read-all');
            toast.success("All notifications marked as read");
            onUpdate();
        } catch (err) { toast.error("Failed to clear notifications"); }
    };

    const remove = async (id) => {
        try {
            await api.delete(`/notifications/${id}`);
            onUpdate();
        } catch (err) { toast.error("Deletion failed"); }
    };

    const clearAll = async () => {
        if (!window.confirm("Permanently delete all notifications?")) return;
        try {
            await api.delete('/notifications');
            toast.success("Inbox cleared");
            onUpdate();
        } catch (err) { toast.error("Clear failed"); }
    };

    const getIcon = (type) => {
        switch(type) {
            case 'success': return { icon: <FaCheck />, bg: '#dcfce7', color: '#16a34a' };
            case 'alert': return { icon: <FaTimes />, bg: '#fee2e2', color: '#dc2626' };
            case 'warning': return { icon: <FaFlag />, bg: '#fef3c7', color: '#d97706' };
            default: return { icon: <FaBell />, bg: '#eff6ff', color: '#2563eb' };
        }
    };

    return (
        <div className="ad-panel" style={{ minHeight: '400px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '1rem' }}>
                <div>
                    <h3 className="ad-panel-title" style={{ margin: 0 }}>🔔 Activity Notifications</h3>
                    <p style={{ margin: '4px 0 0', fontSize: '0.8rem', color: '#64748b' }}>Logs of all administrative actions and system alerts.</p>
                </div>
                {notifications.length > 0 && (
                    <div style={{ display: 'flex', gap: 10 }}>
                        {notifications.some(n => !n.read) && (
                            <button onClick={markAllRead} className="ad-icon-btn" style={{ fontSize: '0.75rem', fontWeight: 700, gap: 6 }}>
                                Mark all read
                            </button>
                        )}
                        <button onClick={clearAll} className="ad-icon-btn" style={{ fontSize: '0.75rem', fontWeight: 700, gap: 6, color: '#dc2626', borderColor: '#fecaca' }}>
                            <FaTrash size={10} /> Clear all
                        </button>
                    </div>
                )}
            </div>

            {notifications.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '5rem 2rem', color: '#94a3b8' }}>
                    <div style={{ fontSize: '3.5rem', opacity: 0.3, marginBottom: '1rem' }}>📭</div>
                    <h4 style={{ margin: 0, color: '#475569' }}>Your inbox is empty</h4>
                    <p style={{ fontSize: '0.85rem', marginTop: 8 }}>System logs and updates will appear here.</p>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {notifications.map(n => {
                        const style = getIcon(n.type);
                        return (
                            <div key={n._id} style={{ 
                                display: 'flex', alignItems: 'center', gap: '15px', padding: '12px 16px', 
                                border: '1px solid #f1f5f9', borderRadius: '10px', 
                                background: n.read ? '#fff' : '#f8fafc',
                                borderLeft: n.read ? '1px solid #f1f5f9' : `4px solid ${style.color}`,
                                transition: 'all 0.2s'
                            }}>
                                <div style={{ 
                                    width: '36px', height: '36px', borderRadius: '50%', background: style.bg, color: style.color,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', flexShrink: 0
                                }}>
                                    <div style={{ margin: 'auto' }}>{style.icon}</div>
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontSize: '0.88rem', fontWeight: n.read ? 500 : 700, color: '#1e293b' }}>{n.message}</div>
                                    <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: 4, display: 'flex', alignItems: 'center', gap: 10 }}>
                                        <span>{new Date(n.createdAt).toLocaleString()}</span>
                                        {!n.read && <span style={{ color: style.color, fontWeight: 700 }}>● New</span>}
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: 6 }}>
                                    <button onClick={() => remove(n._id)} className="ad-icon-btn" title="Delete" style={{ padding: '6px' }}>
                                        <FaTrash size={12} />
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

// ─── Settings Tab ──────────────────────────────────────────────────────────────
function SettingsTab() {
    const [s, setS] = useState(() => lsGet('ad_settings', {
        siteName: 'Aashrey For Paws',
        adminEmail: 'admin@aashrey.com',
        maxPets: 10,
        allowRegistrations: true,
        requireEmailVerification: false,
        autoApproveNGO: false,
    }));
    const toggle = k => setS(p => ({ ...p, [k]: !p[k] }));
    const save = () => { lsSet('ad_settings', s); toast.success('Settings saved!'); };

    return (
        <div className="ad-panel" style={{ maxWidth: 580 }}>
            <h3 className="ad-panel-title">⚙️ Platform Settings</h3>
            <div style={{ display: 'grid', gap: '1.1rem' }}>
                {[['Site Name', 'siteName', 'text'], ['Admin Email', 'adminEmail', 'email'], ['Max Pets Per Owner', 'maxPets', 'number']].map(([lbl, key, type]) => (
                    <div key={key}>
                        <label style={{ display: 'block', fontWeight: 600, fontSize: '0.88rem', marginBottom: 5, color: '#374151' }}>{lbl}</label>
                        <input type={type} className="ad-input" value={s[key]} onChange={e => setS(p => ({ ...p, [key]: e.target.value }))} />
                    </div>
                ))}
                {[['allowRegistrations', 'Allow New Registrations'], ['requireEmailVerification', 'Require Email Verification'], ['autoApproveNGO', 'Auto-Approve NGO Applications']].map(([key, lbl]) => (
                    <div key={key} className="ad-setting-toggle">
                        <span style={{ fontSize: '0.9rem', color: '#374151' }}>{lbl}</span>
                        <label className="ad-toggle">
                            <input type="checkbox" checked={s[key]} onChange={() => toggle(key)} />
                            <span className="ad-toggle-slider" />
                        </label>
                    </div>
                ))}
                <button className="ad-save-btn" onClick={save}>💾 Save Settings</button>
            </div>
        </div>
    );
}

// ─── Admin Profile Tab ────────────────────────────────────────────────────────
function ProfileTab({ user, onUpdate }) {
    const [formData, setFormData] = useState({
        name: user?.name || '',
        email: user?.email || '',
        phone: user?.phone || '',
        profileImage: user?.profileImage || ''
    });
    const [submitting, setSubmitting] = useState(false);
    const [imagePreview, setImagePreview] = useState(user?.profileImage || '');
    const [isEditing, setIsEditing] = useState(false);
    const [showPwForm, setShowPwForm] = useState(false);
    const [pwData, setPwData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
    const [pwSubmitting, setPwSubmitting] = useState(false);

    const handleCancelEdit = () => {
        setFormData({ name: user?.name || '', email: user?.email || '', phone: user?.phone || '', profileImage: user?.profileImage || '' });
        setImagePreview(user?.profileImage || '');
        setIsEditing(false);
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
                setFormData(prev => ({ ...prev, profileImage: reader.result }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Check if any fields actually changed
        const isUnchanged = (
            formData.name === (user?.name || '') &&
            formData.phone === (user?.phone || '') &&
            formData.profileImage === (user?.profileImage || '')
        );

        if (isUnchanged) {
            setIsEditing(false);
            toast.info('No changes were made');
            return;
        }

        setSubmitting(true);
        try {
            const res = await api.patch('/users/me', formData);
            if (res.data.success) {
                toast.success('Profile updated successfully');
                if (onUpdate) onUpdate();
            }
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to update profile');
        } finally {
            setSubmitting(false);
            setIsEditing(false);
        }
    };

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        if (pwData.newPassword !== pwData.confirmPassword) {
            return toast.error('New passwords do not match.');
        }
        if (pwData.newPassword.length < 6) {
            return toast.error('Password must be at least 6 characters.');
        }
        setPwSubmitting(true);
        try {
            const res = await api.patch('/users/me/password', {
                currentPassword: pwData.currentPassword,
                newPassword: pwData.newPassword,
            });
            if (res.data.success) {
                toast.success('Password updated successfully!');
                setPwData({ currentPassword: '', newPassword: '', confirmPassword: '' });
                setShowPwForm(false);
            }
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to update password.');
        } finally {
            setPwSubmitting(false);
        }
    };

    return (
        <div style={{ maxWidth: 800 }}>
            <div className="ad-panel" style={{ padding: '2.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', marginBottom: '2.5rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '2.5rem' }}>
                    <div style={{ position: 'relative' }}>
                        <div style={{ 
                            width: 120, height: 120, borderRadius: '50%', background: 'linear-gradient(135deg,#1e293b,#334155)', 
                            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3rem', color: '#fff',
                            overflow: 'hidden', border: '4px solid #fff', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                        }}>
                            {imagePreview ? (
                                <img src={imagePreview} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : (
                                (formData.name?.charAt(0).toUpperCase() || 'A')
                            )}
                        </div>
                        {isEditing && (
                            <label className="ad-btn-icon blue" style={{ 
                                position: 'absolute', bottom: 5, right: 5, background: '#fff', 
                                boxShadow: '0 2px 8px rgba(0,0,0,0.2)', padding: 8, cursor: 'pointer' 
                            }}>
                                <FaCog size={14} />
                                <input type="file" hidden accept="image/*" onChange={handleImageChange} />
                            </label>
                        )}
                    </div>
                    <div style={{ flex: 1 }}>
                        <h2 style={{ margin: 0, fontSize: '1.6rem', color: '#1e293b' }}>{user?.name}</h2>
                        <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: '0.92rem' }}>System Administrator · Aashrey For Paws</p>
                        <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
                            <Badge label="Super Admin" color="#3b82f6" />
                            <Badge label="Full Access" color="#7c3aed" />
                        </div>
                    </div>
                    {!isEditing && (
                        <button
                            type="button"
                            onClick={() => setIsEditing(true)}
                            style={{ alignSelf: 'flex-start', background: '#1e293b', color: '#fff', border: 'none', padding: '9px 20px', borderRadius: 8, fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer' }}
                        >
                            ✏️ Edit Profile
                        </button>
                    )}
                </div>

                <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem' }}>
                    <div style={{ gridColumn: 'span 1' }}>
                        <label style={{ display: 'block', fontWeight: 700, fontSize: '0.85rem', marginBottom: 8, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Full Name</label>
                        <input 
                            className="ad-input" 
                            value={formData.name} 
                            onChange={e => setFormData(p => ({ ...p, name: e.target.value }))}
                            placeholder="Enter your full name"
                            disabled={!isEditing}
                            style={!isEditing ? { background: '#f8fafc', cursor: 'default' } : {}}
                        />
                    </div>
                    <div style={{ gridColumn: 'span 1' }}>
                        <label style={{ display: 'block', fontWeight: 700, fontSize: '0.85rem', marginBottom: 8, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Email Address</label>
                        <input 
                            className="ad-input" 
                            value={formData.email} 
                            disabled 
                            style={{ background: '#f8fafc', cursor: 'not-allowed' }}
                        />
                        <span style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: 4, display: 'block' }}>Login email — cannot be changed here</span>
                    </div>
                    <div style={{ gridColumn: 'span 1' }}>
                        <label style={{ display: 'block', fontWeight: 700, fontSize: '0.85rem', marginBottom: 8, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Phone Number</label>
                        <input 
                            className="ad-input" 
                            value={formData.phone} 
                            onChange={e => setFormData(p => ({ ...p, phone: e.target.value }))}
                            placeholder="98XXXXXXXX"
                            disabled={!isEditing}
                            style={!isEditing ? { background: '#f8fafc', cursor: 'default' } : {}}
                        />
                    </div>
                    <div style={{ gridColumn: 'span 1' }}>
                        <label style={{ display: 'block', fontWeight: 700, fontSize: '0.85rem', marginBottom: 8, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Role</label>
                        <input 
                            className="ad-input" 
                            value="Administrator" 
                            disabled 
                            style={{ background: '#f8fafc', cursor: 'not-allowed' }}
                        />
                        <span style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: 4, display: 'block' }}>System-assigned role — cannot be changed</span>
                    </div>
                    {isEditing && (
                        <div style={{ gridColumn: 'span 2', marginTop: '1rem', borderTop: '1px solid #f1f5f9', paddingTop: '2rem', display: 'flex', gap: '1rem' }}>
                            <button type="submit" className="ad-save-btn" disabled={submitting} style={{ maxWidth: '200px' }}>
                                {submitting ? 'Saving...' : '💾 Save Changes'}
                            </button>
                            <button type="button" onClick={handleCancelEdit} style={{ background: '#e2e8f0', color: '#475569', border: 'none', padding: '9px 20px', borderRadius: 8, fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer' }}>
                                Cancel
                            </button>
                        </div>
                    )}
                </form>
            </div>
            
            {/* Account Info */}
            <div className="ad-panel" style={{ marginTop: '1.5rem', padding: '1.5rem' }}>
                <h4 style={{ margin: '0 0 1rem', color: '#1e293b', fontSize: '0.95rem', fontWeight: 700 }}>🗂️ Account Information</h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                    {[
                        { label: 'Account Status', value: 'Active', color: '#22c55e' },
                        { label: 'Access Level', value: 'Full Platform Control', color: '#3b82f6' },
                        { label: 'Account Type', value: 'Internal Admin', color: '#7c3aed' },
                    ].map(item => (
                        <div key={item.label} style={{ background: '#f8fafc', borderRadius: 10, padding: '1rem', border: '1px solid #e2e8f0' }}>
                            <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: 6 }}>{item.label}</div>
                            <div style={{ fontWeight: 700, color: item.color, fontSize: '0.9rem' }}>{item.value}</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Security */}
            <div className="ad-panel" style={{ marginTop: '1.5rem', borderLeft: '4px solid #f59e0b', background: '#fffbf0', padding: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                        <div style={{ color: '#f59e0b', fontSize: '1.5rem' }}>🔐</div>
                        <div>
                            <h4 style={{ margin: 0, color: '#92400e', fontSize: '0.95rem' }}>Password &amp; Security</h4>
                            <p style={{ margin: '4px 0 0', fontSize: '0.82rem', color: '#b45309' }}>Use a strong, unique password. Never share your admin credentials with anyone.</p>
                        </div>
                    </div>
                    <button
                        onClick={() => setShowPwForm(v => !v)}
                        style={{ background: '#f59e0b', color: '#fff', border: 'none', padding: '8px 18px', borderRadius: 8, fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer' }}
                    >
                        {showPwForm ? 'Cancel' : 'Change Password'}
                    </button>
                </div>

                {showPwForm && (
                    <form onSubmit={handlePasswordChange} style={{ marginTop: '1.5rem', borderTop: '1px solid #fcd34d', paddingTop: '1.5rem', display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
                        <div style={{ gridColumn: 'span 2' }}>
                            <label style={{ display: 'block', fontWeight: 700, fontSize: '0.82rem', marginBottom: 6, color: '#92400e', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Current Password</label>
                            <input
                                type="password"
                                className="ad-input"
                                value={pwData.currentPassword}
                                onChange={e => setPwData(p => ({ ...p, currentPassword: e.target.value }))}
                                placeholder="Enter your current password"
                                required
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', fontWeight: 700, fontSize: '0.82rem', marginBottom: 6, color: '#92400e', textTransform: 'uppercase', letterSpacing: '0.5px' }}>New Password</label>
                            <input
                                type="password"
                                className="ad-input"
                                value={pwData.newPassword}
                                onChange={e => setPwData(p => ({ ...p, newPassword: e.target.value }))}
                                placeholder="Min. 6 characters"
                                required
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', fontWeight: 700, fontSize: '0.82rem', marginBottom: 6, color: '#92400e', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Confirm New Password</label>
                            <input
                                type="password"
                                className="ad-input"
                                value={pwData.confirmPassword}
                                onChange={e => setPwData(p => ({ ...p, confirmPassword: e.target.value }))}
                                placeholder="Re-enter new password"
                                required
                            />
                        </div>
                        <div style={{ gridColumn: 'span 2' }}>
                            <button type="submit" disabled={pwSubmitting} style={{ background: '#92400e', color: '#fff', border: 'none', padding: '9px 22px', borderRadius: 8, fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer' }}>
                                {pwSubmitting ? 'Updating...' : '🔒 Update Password'}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}

// ─── Contact Messages Tab ──────────────────────────────────────────────────────
function ContactMessagesTab() {
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expanded, setExpanded] = useState(null);
    const [search, setSearch] = useState('');
    const [subjectFilter, setSubjectFilter] = useState('All');
    const [replyingTo, setReplyingTo] = useState(null);
    const [replyText, setReplyText] = useState('');

    useEffect(() => { fetchMessages(); }, []);

    const fetchMessages = async () => {
        setLoading(true);
        try {
            const res = await api.get('/contact');
            if (res.data.success) setMessages(res.data.data);
        } catch (err) {
            console.error('Failed to fetch contact messages', err);
        } finally {
            setLoading(false);
        }
    };

    const deleteMessage = async (id) => {
        if (!window.confirm('Delete this message?')) return;
        try {
            await api.delete(`/contact/${id}`);
            toast.success('Message deleted');
            setMessages(messages.filter(m => m._id !== id));
        } catch (err) {
            toast.error('Failed to delete message');
        }
    };

    const submitReply = async (id) => {
        if (!replyText.trim()) return toast.error('Please enter a response');
        try {
            const res = await api.patch(`/contact/${id}/reply`, { message: replyText });
            if (res.data.success) {
                toast.success('Reply sent successfully');
                setMessages(messages.map(m => m._id === id ? res.data.data : m));
                setReplyingTo(null);
                setReplyText('');
            }
        } catch (err) {
            toast.error('Failed to send reply');
        }
    };

    const subjects = ['All', ...Array.from(new Set(messages.map(m => m.subject).filter(Boolean)))];

    const filtered = messages.filter(m => {
        const matchSearch = m.name?.toLowerCase().includes(search.toLowerCase()) ||
            m.email?.toLowerCase().includes(search.toLowerCase()) ||
            m.message?.toLowerCase().includes(search.toLowerCase());
        const matchSubject = subjectFilter === 'All' || m.subject === subjectFilter;
        return matchSearch && matchSubject;
    });

    const subjectColor = (s) => {
        const map = {
            'Adoption Inquiry': '#3b82f6',
            'Report a Stray': '#ef4444',
            'NGO Partnership': '#8b5cf6',
            'Volunteer': '#22c55e',
            'Lost & Found': '#f59e0b',
            'Donation Query': '#06b6d4',
            'General Question': '#64748b',
            'Other': '#94a3b8',
        };
        return map[s] || '#94a3b8';
    };

    if (loading) return <div style={{ padding: '2rem' }}><Skeleton count={4} /></div>;

    return (
        <div>
            <div className="ad-info-banner">
                📬 All messages submitted via the Contact Us page are shown here. Users cannot see this inbox.
            </div>
            <div className="ad-toolbar">
                <div className="ad-search-box">
                    <FaSearch className="ad-search-icon" />
                    <input
                        placeholder="Search by name, email or message…"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                </div>
                <select className="ad-select" value={subjectFilter} onChange={e => setSubjectFilter(e.target.value)}>
                    {subjects.map(s => <option key={s}>{s}</option>)}
                </select>
                <div style={{ marginLeft: 'auto', fontSize: '0.85rem', color: '#64748b' }}>
                    {filtered.length} message{filtered.length !== 1 ? 's' : ''}
                </div>
            </div>

            {filtered.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '3rem', color: '#aaa', background: '#fff', borderRadius: 12 }}>
                    <div style={{ fontSize: '2.5rem', marginBottom: 8 }}>📭</div>
                    <p style={{ margin: 0 }}>No messages yet.</p>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                    {filtered.map(msg => (
                        <div key={msg._id} style={{
                            background: '#fff', borderRadius: 12, padding: '1.1rem 1.3rem',
                            boxShadow: '0 1px 4px rgba(0,0,0,.07)', border: '1px solid #e2e8f0',
                            cursor: 'pointer', transition: 'box-shadow 0.2s'
                        }}
                            onClick={() => setExpanded(expanded === msg._id ? null : msg._id)}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                    <div style={{
                                        width: 38, height: 38, borderRadius: '50%',
                                        background: 'linear-gradient(135deg,#f97316,#ea580c)',
                                        color: '#fff', display: 'flex', alignItems: 'center',
                                        justifyContent: 'center', fontWeight: 800, fontSize: '1rem', flexShrink: 0
                                    }}>
                                        {(msg.name || '?').charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <div style={{ fontWeight: 700, color: '#1e293b', fontSize: '0.92rem' }}>{msg.name}</div>
                                        <div style={{ fontSize: '0.78rem', color: '#64748b' }}>{msg.email}</div>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                    {msg.subject && (
                                        <span style={{
                                            padding: '3px 10px', borderRadius: 20,
                                            fontSize: '0.75rem', fontWeight: 700,
                                            background: subjectColor(msg.subject) + '18',
                                            color: subjectColor(msg.subject),
                                            border: `1px solid ${subjectColor(msg.subject)}33`
                                        }}>
                                            {msg.subject}
                                        </span>
                                    )}
                                    <span style={{ fontSize: '0.75rem', color: '#94a3b8', whiteSpace: 'nowrap' }}>
                                        {new Date(msg.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                                    </span>
                                    
                                    {/* Action Buttons */}
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); deleteMessage(msg._id); }}
                                        style={{ background: 'none', border: 'none', padding: '4px', cursor: 'pointer', color: '#94a3b8' }}
                                        title="Delete Message"
                                        className="hover:text-red-500 transition-colors"
                                    >
                                        <FaTrash size={14} />
                                    </button>

                                    <span style={{ color: '#94a3b8', fontSize: '0.8rem', transition: 'transform 0.2s', transform: expanded === msg._id ? 'rotate(180deg)' : 'none' }}>▼</span>
                                </div>
                            </div>

                            {/* Preview line */}
                            {expanded !== msg._id && (
                                <div style={{ marginTop: 8, fontSize: '0.84rem', color: '#64748b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                    {msg.message}
                                </div>
                            )}

                            {/* Full message and Actions */}
                            {expanded === msg._id && (
                                <div style={{ marginTop: 12 }}>
                                    <div style={{
                                        padding: '1rem', background: '#f8fafc',
                                        borderRadius: 8, borderLeft: `4px solid ${subjectColor(msg.subject)}`,
                                        fontSize: '0.9rem', color: '#374151', lineHeight: 1.65,
                                        whiteSpace: 'pre-wrap', wordBreak: 'break-word', marginBottom: '1rem'
                                    }}>
                                        {msg.message}
                                    </div>

                                    {/* Admin Replies */}
                                    {msg.replies?.length > 0 && (
                                        <div style={{ marginLeft: '1rem', borderLeft: '2px dashed #e2e8f0', paddingLeft: '1rem', marginBottom: '1rem' }}>
                                            <div style={{ fontSize: '0.7rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', marginBottom: 8 }}>Responses</div>
                                            {msg.replies.map((reply, idx) => (
                                                <div key={idx} style={{ marginBottom: 10, background: '#f0fdf4', padding: '8px 12px', borderRadius: 8, border: '1px solid #dcfce7' }}>
                                                    <p style={{ margin: 0, fontSize: '0.85rem', color: '#166534' }}>{reply.message}</p>
                                                    <span style={{ fontSize: '0.65rem', color: '#15803d', opacity: 0.7 }}>{new Date(reply.createdAt).toLocaleString()}</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* Reply Form */}
                                    <div onClick={(e) => e.stopPropagation()}>
                                        {replyingTo === msg._id ? (
                                            <div style={{ background: '#f1f5f9', padding: '1rem', borderRadius: 10 }}>
                                                <textarea 
                                                    style={{ width: '100%', minHeight: 80, padding: 10, borderRadius: 8, border: '1px solid #cbd5e1', fontSize: '0.85rem', marginBottom: 10, outline: 'none' }}
                                                    placeholder="Write your response... The user will be notified."
                                                    value={replyText}
                                                    onChange={e => setReplyText(e.target.value)}
                                                />
                                                <div style={{ display: 'flex', gap: 8 }}>
                                                    <button 
                                                        onClick={() => submitReply(msg._id)}
                                                        style={{ background: '#8b5cf6', color: '#fff', border: 'none', padding: '6px 15px', borderRadius: 6, fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
                                                    >
                                                        <FaPaperPlane size={12} /> Send Response
                                                    </button>
                                                    <button 
                                                        onClick={() => { setReplyingTo(null); setReplyText(''); }}
                                                        style={{ background: '#e2e8f0', color: '#475569', border: 'none', padding: '6px 15px', borderRadius: 6, fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer' }}
                                                    >
                                                        Cancel
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <button 
                                                onClick={() => setReplyingTo(msg._id)}
                                                style={{ background: 'none', border: 'none', color: '#8b5cf6', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
                                            >
                                                <FaReply size={14} /> {msg.isReplied ? 'Send another response' : 'Reply to message'}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

// ─── Main Component ────────────────────────────────────────────────────────────
export default function AdminDashboard() {
    const { user, logout, refreshUser } = useAuth();
    const navigate = useNavigate();
    const dropRef = useRef(null);
    const [activeTab, setActiveTab] = useState(() => localStorage.getItem('ad_active_tab') || 'overview');
    const changeTab = (tab) => { setActiveTab(tab); localStorage.setItem('ad_active_tab', tab); };
    const [showDrop, setShowDrop] = useState(false);
    const [loading, setLoading] = useState(true);
    const [users, setUsers] = useState([]);
    const [pets, setPets] = useState([]);
    const [applications, setApplications] = useState([]);
    const [activity, setActivity] = useState([]);
    const [summary, setSummary] = useState({ users: 0, pets: 0, requests: 0, adoptions: 0, ngoApps: 0, verifiedNGOs: 0, unreadNotifs: 0 });

    useEffect(() => {
        fetchAllData();
        
        // Professional Real-time Polling: Refresh data every 30 seconds
        const pollInterval = setInterval(() => {
            fetchAllData();
        }, 30000);
        
        return () => clearInterval(pollInterval);
    }, []);

    const fetchAllData = async () => {
        setLoading(true);
        try {
            const results = await Promise.allSettled([
                api.get('/admin/stats'),
                api.get('/admin/users'),
                api.get('/admin/ngo-applications'),
                api.get('/pets?isApproved=all'),
                api.get('/notifications') // Changed to standard notifications endpoint to avoid 404 on stale backend
            ]);

            const [statRes, userRes, ngoRes, petRes, notifRes] = results;

            const unreadCount = notifRes.status === 'fulfilled' && notifRes.value.data.success
                ? notifRes.value.data.data.filter(n => !n.read).length
                : 0;
            if (statRes.status === 'fulfilled' && statRes.value.data.success) {
                setSummary({ ...statRes.value.data.data, unreadNotifs: unreadCount });
            }
            if (userRes.status === 'fulfilled' && userRes.value.data.success) setUsers(userRes.value.data.data);
            if (ngoRes.status === 'fulfilled' && ngoRes.value.data.success) setApplications(ngoRes.value.data.data);
            if (petRes.status === 'fulfilled' && petRes.value.data.success) setPets(petRes.value.data.data);
            if (notifRes.status === 'fulfilled' && notifRes.value.data.success) setActivity(notifRes.value.data.data);
        } catch (err) {
            toast.error("Cloud data fetch failed. Some features might be limited.");
        } finally {
            setLoading(false);
        }
    };

    // Close dropdown on outside click
    useEffect(() => {
        const h = e => { if (dropRef.current && !dropRef.current.contains(e.target)) setShowDrop(false); };
        document.addEventListener('mousedown', h);
        return () => document.removeEventListener('mousedown', h);
    }, []);

    const adoptionRequests = lsGet('adoptionRequests', []);
    const stats = {
        users: users.length,
        pets: pets.length,
        requests: adoptionRequests.filter(r => r.status === 'Pending').length,
        adoptions: pets.filter(p => p.status === 'Adopted').length,
        ngoApps: applications.length,
        verifiedNGOs: applications.filter(a => a.status === 'Approved').length,
    };

    const tabs = [
        { id: 'overview', label: 'Overview', emoji: '📊' },
        { id: 'users', label: 'Users', emoji: '👥' },
        { id: 'ngo-verify', label: 'NGO Verification', emoji: '🛡️' },
        { id: 'pets', label: 'Pets', emoji: '🐾' },
        { id: 'pending-pets', label: 'Pending Pets', emoji: '⏳' },
        { id: 'messages', label: 'Messages', emoji: '📬' },
        { id: 'reports', label: 'Reports', emoji: '📈' },
        { id: 'notifications', label: 'Notifications', emoji: '🔔', badge: summary.unreadNotifs },
        { id: 'profile', label: 'My Profile', emoji: '👤' },
        { id: 'settings', label: 'Settings', emoji: '⚙️' },
    ];

    const pendingNGO = applications.filter(a => a.status === 'Pending').length;
    const adminName = user?.name === 'Admin User' ? 'Admin' : (user?.name || 'Admin');
    const adminInitial = adminName.charAt(0).toUpperCase();

    const handleLogout = () => { logout(); navigate('/login'); };

    return (
        <div className="ad-root">
            {/* ── Sidebar ── */}
            <aside className="ad-sidebar">
                <div className="ad-logo">🐾 <span>Admin Panel</span></div>
                <nav className="ad-nav">
                    {tabs.filter(t => !['notifications', 'profile'].includes(t.id)).map(t => (
                        <button key={t.id} className={`ad-nav-btn ${activeTab === t.id ? 'active' : ''}`} onClick={() => changeTab(t.id)}>
                            <span className="ad-nav-icon">{t.emoji}</span>
                            <span>{t.label}</span>
                            {t.id === 'ngo-verify' && pendingNGO > 0 && <span className="ad-nav-badge">{pendingNGO}</span>}
                            {t.id === 'pending-pets' && pets.filter(p => p.isApproved === false).length > 0 && <span className="ad-nav-badge">{pets.filter(p => p.isApproved === false).length}</span>}
                            {t.id === 'notifications' && summary.unreadNotifs > 0 && <span className="ad-nav-badge">{summary.unreadNotifs}</span>}
                        </button>
                    ))}


                </nav>
            </aside>

            {/* ── Main ── */}
            <main className="ad-main">
                {/* Topbar — single profile here, nowhere else */}
                <div className="ad-topbar">
                    <h1 className="ad-page-title">{tabs.find(t => t.id === activeTab)?.label}</h1>
                    <div className="ad-topbar-right">
                        {/* Bell → notifications */}
                        <button className="ad-icon-btn" title="Notifications" onClick={() => changeTab('notifications')} style={{ position: 'relative' }}>
                            <FaBell />
                            {summary.unreadNotifs > 0 && <span style={{ position: 'absolute', top: -4, right: -4, background: '#ef4444', color: '#fff', fontSize: '10px', width: 16, height: 16, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyCenter: 'center', fontWeight: 'bold', border: '2px solid #fff' }}>{summary.unreadNotifs}</span>}
                        </button>

                        {/* Single profile dropdown */}
                        <div ref={dropRef} style={{ position: 'relative' }}>
                            <button className="ad-user-btn" onClick={() => setShowDrop(s => !s)}>
                                <div className="ad-avatar">{adminInitial}</div>
                                <span className="ad-user-name">{adminName}</span>
                                <FaChevronDown size={11} style={{ opacity: 0.7, transition: 'transform 0.2s', transform: showDrop ? 'rotate(180deg)' : 'none' }} />
                            </button>
                            {showDrop && (
                                <div className="ad-user-dropdown">
                                    <div className="ad-user-dropdown-header">
                                        <div className="ad-user-dropdown-avatar">{adminInitial}</div>
                                        <div>
                                            <div style={{ fontWeight: 700, color: '#fff', fontSize: '0.9rem' }}>{adminName}</div>
                                            <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: '0.6px' }}>Administrator</div>
                                        </div>
                                    </div>
                                    <button className="ad-drop-item" onClick={() => { changeTab('profile'); setShowDrop(false); }}>
                                        <FaUserCircle size={14} /> My Profile
                                    </button>
                                    <div style={{ height: 1, background: '#f0e8e5', margin: '2px 0' }} />
                                    <button className="ad-drop-item ad-drop-danger" onClick={handleLogout}>
                                        <FaSignOutAlt size={14} /> Logout
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="ad-content">
                    {activeTab === 'overview' && <OverviewTab stats={summary} loading={loading} activity={activity} users={users} pets={pets} />}
                    {activeTab === 'users' && <UsersTab users={users} setUsers={setUsers} />}
                    {activeTab === 'ngo-verify' && <><NGOVerificationTab applications={applications} setApplications={setApplications} /><VerifiedNGOsSection users={users} /></>}
                    {activeTab === 'pets' && <PetsTab pets={pets} setPets={setPets} />}
                    {activeTab === 'pending-pets' && <PendingPetsTab pets={pets} setPets={setPets} />}
                    {activeTab === 'messages' && <ContactMessagesTab />}
                    {activeTab === 'reports' && <ReportsTab stats={summary} users={users} pets={pets} />}
                    {activeTab === 'notifications' && <AdminNotificationsTab notifications={activity} onUpdate={fetchAllData} />}
                    {activeTab === 'profile' && <ProfileTab user={user} onUpdate={refreshUser} />}
                    {activeTab === 'settings' && <SettingsTab />}
                </div>
            </main>

            <style>{`
                * { box-sizing: border-box; }
                .ad-root { display:flex; height:100vh; overflow:hidden; background:#f1f5f9; font-family:'Inter','Segoe UI',system-ui,sans-serif; }

                /* Sidebar */
                .ad-sidebar { width:230px; height:100vh; background:#1e293b; display:flex; flex-direction:column; flex-shrink:0; z-index:100; }
                .ad-logo { display:flex; align-items:center; gap:10px; padding:1.4rem 1.2rem; font-size:1rem; font-weight:800; color:#f8fafc; border-bottom:1px solid #334155; letter-spacing:0.2px; }
                .ad-nav { flex:1; padding:.8rem 0; overflow-y:auto; scrollbar-width: none; -ms-overflow-style: none; }
                .ad-nav::-webkit-scrollbar { display: none; }
                .ad-nav-btn { width:100%; display:flex; align-items:center; gap:10px; padding:11px 1.2rem; background:none; border:none; color:#94a3b8; font-size:0.88rem; cursor:pointer; transition:all .2s; text-align:left; position:relative; }
                .ad-nav-btn:hover { background:#334155; color:#e2e8f0; }
                .ad-nav-btn.active { background:linear-gradient(90deg,#f97316,#ea580c); color:#fff; font-weight:700; }
                .ad-nav-icon { font-size:.95rem; width:20px; text-align:center; }
                .ad-nav-badge { margin-left:auto; background:#ef4444; color:#fff; border-radius:50%; width:19px; height:19px; display:flex; align-items:center; justify-content:center; font-size:.68rem; font-weight:700; }

                /* Main */
                .ad-main { flex:1; height:100vh; display:flex; flex-direction:column; overflow:hidden; }
                .ad-topbar { background:#fff; padding:.9rem 1.8rem; display:flex; align-items:center; justify-content:space-between; border-bottom:1px solid #e2e8f0; box-shadow:0 1px 3px rgba(0,0,0,.05); position:sticky; top:0; z-index:50; }
                .ad-page-title { margin:0; font-size:1.2rem; font-weight:800; color:#1e293b; }
                .ad-topbar-right { display:flex; align-items:center; gap:10px; }
                .ad-icon-btn { background:none; border:1px solid #e2e8f0; border-radius:8px; padding:7px 9px; cursor:pointer; color:#64748b; font-size:.95rem; transition:all .2s; display:flex; align-items:center; }
                .ad-icon-btn:hover { background:#f8fafc; color:#1e293b; border-color:#cbd5e1; }

                /* Single profile button in topbar */
                .ad-user-btn { display:flex; align-items:center; gap:8px; padding:5px 10px 5px 5px; background:none; border:1.5px solid #e2e8f0; border-radius:50px; cursor:pointer; transition:all .2s; color:#1e293b; }
                .ad-user-btn:hover { background:#f8fafc; border-color:#cbd5e1; }
                .ad-avatar { width:30px; height:30px; border-radius:50%; background:linear-gradient(135deg,#f97316,#ea580c); color:#fff; display:flex; align-items:center; justify-content:center; font-weight:800; font-size:.88rem; flex-shrink:0; }
                .ad-user-name { font-size:.85rem; font-weight:600; color:#374151; max-width:80px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }

                /* Dropdown */
                .ad-user-dropdown { position:absolute; top:calc(100% + 8px); right:0; min-width:200px; background:#fff; border-radius:12px; box-shadow:0 10px 40px rgba(0,0,0,.15); overflow:hidden; animation:adFade .15s ease; z-index:200; }
                @keyframes adFade { from{opacity:0;transform:translateY(-6px)} to{opacity:1;transform:translateY(0)} }
                .ad-user-dropdown-header { display:flex; align-items:center; gap:10px; padding:12px 14px; background:linear-gradient(135deg,#1e293b,#334155); }
                .ad-user-dropdown-avatar { width:36px; height:36px; border-radius:50%; background:linear-gradient(135deg,#f97316,#ea580c); color:#fff; display:flex; align-items:center; justify-content:center; font-weight:800; font-size:1rem; flex-shrink:0; }
                .ad-drop-item { width:100%; display:flex; align-items:center; gap:9px; padding:10px 14px; background:none; border:none; font-size:.875rem; color:#374151; cursor:pointer; text-align:left; transition:background .15s; }
                .ad-drop-item:hover { background:#fdf0eb; color:#5d4037; }
                .ad-drop-danger { color:#dc2626; }
                .ad-drop-danger:hover { background:#fee2e2; color:#dc2626; }

                .ad-content { 
                    padding:1.8rem; 
                    flex:1; 
                    overflow-y:auto; 
                    scrollbar-width: none; 
                    -ms-overflow-style: none; 
                    scroll-behavior: smooth;
                }
                .ad-content::-webkit-scrollbar { display: none; }

                /* Stats */
                .ad-stats-grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(220px,1fr)); gap:1.2rem; margin-bottom:2rem; }
                .ad-stat-card-premium { border-radius:16px; padding:1.5rem; display:flex; align-items:center; gap:1.2rem; color:#fff; box-shadow:0 10px 15px -3px rgba(0,0,0,0.1); transition:transform .2s; }
                .ad-stat-card-premium:hover { transform:translateY(-4px); }
                .ad-stat-icon-wrapper { width:48px; height:48px; background:rgba(255,255,255,0.2); border-radius:12px; display:flex; align-items:center; justify-content:center; font-size:1.4rem; }
                .ad-stat-value-white { font-size:1.8rem; font-weight:800; line-height:1; }
                .ad-stat-label-white { font-size:0.85rem; font-weight:600; opacity:0.8; margin-top:4px; }

                /* Panel */
                .ad-panel { background:#fff; border-radius:12px; padding:1.4rem; box-shadow:0 1px 3px rgba(0,0,0,.06); }
                .ad-panel-title { margin:0 0 1rem; font-size:.98rem; font-weight:700; color:#1e293b; }

                /* Activity */
                .ad-activity-list { list-style:none; padding:0; margin:0; display:flex; flex-direction:column; gap:.7rem; }
                .ad-activity-item { display:flex; align-items:center; gap:12px; padding:12px; border-radius:12px; background:#fff; border:1px solid #f1f5f9; transition:all 0.2s; }
                .ad-activity-item:hover { background:#f8fafc; border-color:#e2e8f0; transform:translateX(2px); }
                .ad-activity-icon { width:36px; height:36px; border-radius:10px; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
                .ad-activity-time { margin-left:auto; font-size:.78rem; color:#94a3b8; white-space:nowrap; }
                
                .ad-live-dot { width: 6px; height: 6px; background: #22c55e; border-radius: 50%; display: inline-block; animation: ad-pulse 2s infinite; }
                @keyframes ad-pulse {
                    0% { box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.7); }
                    70% { box-shadow: 0 0 0 6px rgba(34, 197, 94, 0); }
                    100% { box-shadow: 0 0 0 0 rgba(34, 197, 94, 0); }
                }

                /* Toolbar */
                .ad-toolbar { display:flex; gap:8px; flex-wrap:wrap; margin-bottom:1rem; align-items:center; }
                .ad-search-box { display:flex; align-items:center; background:#fff; border:1px solid #e2e8f0; border-radius:8px; padding:0 12px; gap:8px; flex:1; min-width:180px; }
                .ad-search-box input { border:none; outline:none; padding:9px 0; width:100%; font-size:.88rem; }
                .ad-search-icon { color:#94a3b8; font-size:.85rem; }
                .ad-select { padding:9px 12px; border:1px solid #e2e8f0; border-radius:8px; background:#fff; font-size:.88rem; outline:none; cursor:pointer; }
                .ad-filter-btn { padding:7px 15px; border:1px solid #e2e8f0; border-radius:20px; background:#fff; color:#64748b; font-size:.83rem; cursor:pointer; transition:all .2s; }
                .ad-filter-btn.active { background:#1e293b; color:#fff; border-color:#1e293b; font-weight:600; }

                /* Table */
                .ad-table-wrap { background:#fff; border-radius:12px; box-shadow:0 1px 3px rgba(0,0,0,.06); overflow:auto; }
                .ad-table { width:100%; border-collapse:collapse; font-size:.87rem; }
                .ad-table th { background:#f8fafc; color:#64748b; font-weight:600; padding:11px 14px; text-align:left; border-bottom:1px solid #e2e8f0; font-size:.78rem; text-transform:uppercase; letter-spacing:.05em; }
                .ad-table td { padding:12px 14px; border-bottom:1px solid #f1f5f9; color:#374151; vertical-align:middle; }
                .ad-table tr:last-child td { border-bottom:none; }
                .ad-table tr:hover td { background:#fafbfc; }
                .ad-btn-icon { border:none; background:none; cursor:pointer; padding:6px 8px; border-radius:6px; font-size:.82rem; transition:background .15s; }
                .ad-btn-icon.green { color:#22c55e; } .ad-btn-icon.green:hover { background:#dcfce7; }
                .ad-btn-icon.red { color:#ef4444; } .ad-btn-icon.red:hover { background:#fee2e2; }
                .ad-btn-icon.amber { color:#f59e0b; } .ad-btn-icon.amber:hover { background:#fef3c7; }
                .ad-btn-icon.blue { color:#3b82f6; } .ad-btn-icon.blue:hover { background:#dbeafe; }

                /* NGO */
                .ad-info-banner { background:#eff6ff; border:1px solid #bfdbfe; border-radius:10px; padding:11px 16px; color:#1d4ed8; font-size:.88rem; margin-bottom:1rem; }
                .ad-ngo-card { background:#fff; border-radius:12px; padding:1.3rem; box-shadow:0 1px 4px rgba(0,0,0,.07); border:1px solid #e2e8f0; }
                .ad-ngo-header { display:flex; justify-content:space-between; align-items:flex-start; flex-wrap:wrap; gap:10px; margin-bottom:1rem; }
                .ad-ngo-grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(180px,1fr)); gap:.5rem 1.2rem; font-size:.86rem; color:#374151; }
                .ad-ngo-key { color:#94a3b8; font-weight:700; font-size:.72rem; text-transform:uppercase; letter-spacing:.06em; display:block; margin-bottom:2px; }
                .ad-type-badge { background:#ede9fe; color:#7c3aed; border-radius:20px; padding:2px 10px; font-size:.75rem; font-weight:700; }
                .ad-reject-reason { background:#fee2e2; color:#b91c1c; border-radius:8px; padding:9px 14px; font-size:.86rem; margin-top:.8rem; }
                .ad-action-btn { display:flex; align-items:center; gap:6px; padding:7px 14px; border:none; border-radius:8px; font-weight:600; font-size:.85rem; cursor:pointer; transition:opacity .2s; }
                .ad-action-btn.green { background:#dcfce7; color:#15803d; }
                .ad-action-btn.red { background:#fee2e2; color:#b91c1c; }
                .ad-action-btn.grey { background:#f1f5f9; color:#475569; }
                .ad-action-btn:hover { opacity:.85; }

                /* Modal */
                .ad-modal-overlay { position:fixed; inset:0; background:rgba(0,0,0,.5); display:flex; align-items:center; justify-content:center; z-index:999; }
                .ad-modal { background:#fff; border-radius:16px; padding:2rem; width:460px; max-width:90vw; box-shadow:0 20px 60px rgba(0,0,0,.2); }
                .ad-modal-actions { display:flex; gap:10px; justify-content:flex-end; margin-top:1.1rem; }

                /* Reports chart */
                .ad-bar-chart { display:flex; gap:10px; align-items:flex-end; height:168px; padding:0 .5rem; }
                .ad-bar-col { display:flex; flex-direction:column; align-items:center; gap:4px; flex:1; }
                .ad-bar { background:linear-gradient(180deg,#f97316,#ea580c); border-radius:4px 4px 0 0; width:100%; min-height:4px; }
                .ad-bar-label { font-size:.78rem; color:#64748b; font-weight:600; }
                .ad-bar-value { font-size:.78rem; color:#1e293b; font-weight:700; }

                /* Settings */
                .ad-input { width:100%; padding:9px 12px; border:1.5px solid #e2e8f0; border-radius:8px; font-size:.88rem; outline:none; transition:border-color .2s; font-family:inherit; }
                .ad-input:focus { border-color:#f97316; }
                .ad-setting-toggle { display:flex; justify-content:space-between; align-items:center; padding:9px 0; border-bottom:1px solid #f1f5f9; }
                .ad-toggle { position:relative; display:inline-block; width:42px; height:22px; cursor:pointer; }
                .ad-toggle input { opacity:0; width:0; height:0; }
                .ad-toggle-slider { position:absolute; inset:0; background:#cbd5e1; border-radius:22px; transition:.3s; }
                .ad-toggle-slider::before { content:''; position:absolute; height:16px; width:16px; left:3px; bottom:3px; background:#fff; border-radius:50%; transition:.3s; }
                .ad-toggle input:checked + .ad-toggle-slider { background:#f97316; }
                .ad-toggle input:checked + .ad-toggle-slider::before { transform:translateX(20px); }
                .ad-save-btn { width:100%; padding:11px; background:linear-gradient(135deg,#f97316,#ea580c); color:#fff; border:none; border-radius:8px; font-size:.95rem; font-weight:700; cursor:pointer; margin-top:.4rem; transition:opacity .2s; }
                .ad-save-btn:hover { opacity:.9; }

                @media (max-width:768px) {
                    .ad-sidebar { width:56px; }
                    .ad-nav-btn span:not(.ad-nav-icon):not(.ad-nav-badge) { display:none; }
                    .ad-logo span { display:none; }
                    .ad-main { margin-left:56px; }
                    .ad-user-name { display:none; }
                    .ad-content { padding:1rem; }
                }
            `}</style>
        </div>
    );
}
