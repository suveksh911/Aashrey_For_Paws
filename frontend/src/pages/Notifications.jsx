import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    FaBell, FaCheckCircle, FaExclamationCircle, FaInfoCircle,
    FaTrash, FaCheck, FaPaw, FaShieldAlt, FaHeart, FaChevronRight
} from 'react-icons/fa';
import api from '../services/axios';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';

const Notifications = ({ isTab = false }) => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const { isAuthenticated, user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (isAuthenticated) fetchNotifications();
        else setLoading(false);
    }, [isAuthenticated]);

    const fetchNotifications = async () => {
        setLoading(true);
        try {
            const res = await api.get('/notifications');
            if (res.data.success) setNotifications(res.data.data);
        } catch {
            toast.error('Failed to load notifications');
        } finally {
            setLoading(false);
        }
    };

    const markAsRead = async (notif) => {
        try {
            if (!notif.read) {
                await api.patch(`/notifications/${notif._id}/read`);
                setNotifications(prev => prev.map(n => n._id === notif._id ? { ...n, read: true } : n));
            }
            // If there's a link, navigate to it
            if (notif.link) navigate(notif.link);
        } catch {
            toast.error('Failed to mark as read');
        }
    };

    const deleteNotif = async (e, id) => {
        e.stopPropagation();
        try {
            await api.delete(`/notifications/${id}`);
            setNotifications(prev => prev.filter(n => n._id !== id));
        } catch {
            toast.error('Failed to delete');
        }
    };

    const markAllRead = async () => {
        try {
            await api.patch('/notifications/read-all');
            setNotifications(prev => prev.map(n => ({ ...n, read: true })));
            toast.success('All notifications marked as read');
        } catch {
            toast.error('Failed');
        }
    };

    const clearAll = async () => {
        if (!window.confirm('Clear all notifications?')) return;
        try {
            await Promise.all(notifications.map(n => api.delete(`/notifications/${n._id}`)));
            setNotifications([]);
            toast.success('All notifications cleared');
        } catch {
            toast.error('Failed to clear');
        }
    };

    const getIcon = (type) => {
        switch (type) {
            case 'success': return <FaCheckCircle size={20} />;
            case 'alert': return <FaExclamationCircle size={20} />;
            case 'warning': return <FaExclamationCircle size={20} />;
            default: return <FaInfoCircle size={20} />;
        }
    };

    const getTypeColor = (type) => {
        switch (type) {
            case 'success': return { bg: '#E8F5E9', color: '#2e7d32', border: '#A5D6A7' };
            case 'alert': return { bg: '#FDF2F2', color: '#c62828', border: '#FFCDD2' };
            case 'warning': return { bg: '#FFFDE7', color: '#f57f17', border: '#FFF176' };
            default: return { bg: '#EDE7F6', color: '#4527a0', border: '#D1C4E9' };
        }
    };

    const unreadCount = notifications.filter(n => !n.read).length;
    const filtered = filter === 'all' ? notifications : filter === 'unread' ? notifications.filter(n => !n.read) : notifications.filter(n => n.read);

    const timeAgo = (date) => {
        const diff = (Date.now() - new Date(date)) / 1000;
        if (diff < 60) return 'Just now';
        if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
        if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
        return new Date(date).toLocaleDateString();
    };

    return (
        <div style={{ 
            minHeight: isTab ? 'auto' : '100vh', 
            background: isTab ? 'transparent' : 'linear-gradient(135deg, #FBF8F6 0%, #F5EDE8 100%)', 
            padding: isTab ? '0' : '2rem 1rem' 
        }}>
            <div style={{ maxWidth: isTab ? '100%' : 820, margin: isTab ? '0' : '0 auto' }}>

                {/* Header - Hidden if embedded as a tab */}
                {!isTab && (
                    <div style={{
                        background: 'linear-gradient(135deg, #3E2723 0%, #5D4037 100%)',
                        borderRadius: 20, padding: '2rem', marginBottom: '1.5rem',
                        color: 'white', display: 'flex', justifyContent: 'space-between',
                        alignItems: 'center', boxShadow: '0 8px 24px rgba(93,64,55,0.2)'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <div style={{
                                width: 52, height: 52, borderRadius: '50%',
                                background: 'rgba(255,255,255,0.2)', display: 'flex',
                                alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem',
                                color: '#fff', flexShrink: 0
                            }}>
                                <FaBell />
                            </div>
                            <div>
                                <h1 style={{ margin: 0, fontSize: '1.6rem', fontWeight: 900, letterSpacing: '-0.5px', color: '#ffffff', textShadow: '0 1px 3px rgba(0,0,0,0.2)' }}>Notifications</h1>
                                <p style={{ margin: 0, color: 'rgba(255,255,255,0.85)', fontSize: '0.88rem' }}>
                                    {unreadCount > 0 ? `${unreadCount} unread message${unreadCount !== 1 ? 's' : ''}` : "You're all caught up!"}
                                </p>
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                            {unreadCount > 0 && (
                                <button onClick={markAllRead} style={{
                                    background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.3)',
                                    color: 'white', borderRadius: 10, padding: '0.5rem 1rem',
                                    cursor: 'pointer', fontWeight: 600, fontSize: '0.83rem',
                                    display: 'flex', alignItems: 'center', gap: 6, transition: 'all 0.2s'
                                }}>
                                    <FaCheck size={11} /> Mark all read
                                </button>
                            )}
                            {notifications.length > 0 && (
                                <button onClick={clearAll} style={{
                                    background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)',
                                    color: 'rgba(255,255,255,0.7)', borderRadius: 10, padding: '0.5rem 1rem',
                                    cursor: 'pointer', fontWeight: 600, fontSize: '0.83rem',
                                    display: 'flex', alignItems: 'center', gap: 6
                                }}>
                                    <FaTrash size={11} /> Clear all
                                </button>
                            )}
                        </div>
                    </div>
                )}

                {/* Local Toolbar for Tab Mode */}
                {isTab && notifications.length > 0 && (
                    <div className="flex justify-end gap-2 mb-4">
                        {unreadCount > 0 && (
                            <button onClick={markAllRead} className="text-xs font-bold text-[#8D6E63] hover:underline flex items-center gap-1">
                                <FaCheck size={10} /> Mark all as read
                            </button>
                        )}
                        <button onClick={clearAll} className="text-xs font-bold text-gray-400 hover:text-red-500 transition-colors flex items-center gap-1">
                            <FaTrash size={10} /> Clear all
                        </button>
                    </div>
                )}

                {/* Filter tabs */}
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.2rem' }}>
                    {[
                        { key: 'all', label: `All (${notifications.length})` },
                        { key: 'unread', label: `Unread (${unreadCount})` },
                        { key: 'read', label: `Read (${notifications.length - unreadCount})` }
                    ].map(tab => (
                        <button key={tab.key} onClick={() => setFilter(tab.key)} style={{
                            padding: '0.5rem 1.1rem', borderRadius: 25,
                            background: filter === tab.key ? '#5D4037' : 'white',
                            color: filter === tab.key ? 'white' : '#5D4037',
                            fontWeight: 700, fontSize: '0.83rem', cursor: 'pointer',
                            boxShadow: '0 1px 4px rgba(0,0,0,0.08)', transition: 'all 0.2s',
                            border: filter === tab.key ? 'none' : '1px solid #E8DAD5'
                        }}>
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Content */}
                {loading ? (
                    <div style={{ textAlign: 'center', padding: '4rem', background: 'white', borderRadius: 16 }}>
                        <FaBell size={40} color="#D7CCC8" style={{ display: 'block', margin: '0 auto 1rem' }} />
                        <p style={{ color: '#aaa', margin: 0 }}>Loading notifications…</p>
                    </div>
                ) : !isAuthenticated ? (
                    <div style={{ textAlign: 'center', padding: '4rem', background: 'white', borderRadius: 16, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
                        <FaPaw size={50} color="#D7CCC8" style={{ display: 'block', margin: '0 auto 1rem' }} />
                        <h3 style={{ color: '#5D4037', margin: '0 0 0.5rem' }}>Please log in</h3>
                        <p style={{ color: '#aaa', margin: 0 }}>Log in to view your personalized notifications.</p>
                    </div>
                ) : filtered.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '4rem', background: 'white', borderRadius: 16, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
                        <FaShieldAlt size={50} color="#D7CCC8" style={{ display: 'block', margin: '0 auto 1rem' }} />
                        <h3 style={{ color: '#5D4037', margin: '0 0 0.5rem' }}>
                            {filter === 'unread' ? 'No unread notifications' : 'No notifications yet'}
                        </h3>
                        <p style={{ color: '#aaa', margin: 0 }}>
                            {filter === 'all' ? 'Updates about adoptions, verifications, and more will appear here.' : 'Switch to "All" to see previous notifications.'}
                        </p>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                        {filtered.map(notif => {
                            const typeStyle = getTypeColor(notif.type);
                            return (
                                <div
                                    key={notif._id}
                                    onClick={() => markAsRead(notif)}
                                    style={{
                                        background: notif.read ? 'white' : '#FFF8F5',
                                        borderRadius: 14, padding: '1rem 1.2rem',
                                        display: 'flex', alignItems: 'center', gap: '1rem',
                                        boxShadow: notif.read ? '0 1px 4px rgba(0,0,0,0.05)' : '0 4px 16px rgba(93,64,55,0.1)',
                                        cursor: notif.link ? 'pointer' : (notif.read ? 'default' : 'pointer'),
                                        transition: 'all 0.2s',
                                        position: 'relative',
                                        border: notif.read ? '1px solid #F0EAE7' : '1px solid #D7C0B5',
                                        borderLeft: `4px solid ${notif.read ? '#D7CCC8' : '#5D4037'}`
                                    }}
                                    onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-1px)'}
                                    onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                                >
                                    {/* Type icon */}
                                    <div style={{
                                        width: 42, height: 42, borderRadius: '50%', flexShrink: 0,
                                        background: typeStyle.bg, color: typeStyle.color,
                                        border: `1px solid ${typeStyle.border}`,
                                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                                    }}>
                                        {getIcon(notif.type)}
                                    </div>

                                    {/* Content */}
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <p style={{
                                            margin: '0 0 4px', fontSize: '0.92rem',
                                            color: notif.read ? '#555' : '#2D1B13',
                                            fontWeight: notif.read ? 400 : 700,
                                            lineHeight: 1.5
                                        }}>
                                            {notif.message}
                                        </p>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                            <span style={{ fontSize: '0.75rem', color: '#999', fontWeight: 500 }}>{timeAgo(notif.createdAt)}</span>
                                            {!notif.read && (
                                                <span style={{ fontSize: '0.65rem', background: '#5D4037', color: 'white', padding: '1px 6px', borderRadius: '4px', fontWeight: 700, textTransform: 'uppercase' }}>New</span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Action Arrow */}
                                    {notif.link && (
                                        <div className="action-arrow" style={{ color: '#D7CCC8', transition: 'transform 0.2s', marginRight: '5px' }}>
                                            <FaChevronRight size={14} />
                                        </div>
                                    )}

                                    {/* Delete button */}
                                    <button
                                        onClick={(e) => deleteNotif(e, notif._id)}
                                        className="notif-delete-btn"
                                        title="Delete notification"
                                        style={{
                                            background: 'none', border: 'none', cursor: 'pointer',
                                            color: '#e0e0e0', fontSize: '1rem', padding: '8px',
                                            borderRadius: '50%', flexShrink: 0, display: 'flex',
                                            alignItems: 'center', justifyContent: 'center',
                                            transition: 'all 0.2s', opacity: 0.6
                                        }}
                                        onMouseEnter={e => {
                                            e.currentTarget.style.color = '#ef4444';
                                            e.currentTarget.style.background = '#FEE2E2';
                                            e.currentTarget.style.opacity = '1';
                                        }}
                                        onMouseLeave={e => {
                                            e.currentTarget.style.color = '#e0e0e0';
                                            e.currentTarget.style.background = 'none';
                                            e.currentTarget.style.opacity = '0.6';
                                        }}
                                    >
                                        <FaTrash size={12} />
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Notifications;
