import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaCheckCircle, FaExclamationCircle, FaInfoCircle, FaTimes, FaBell } from 'react-icons/fa';

const NotificationDropdown = ({ onClose }) => {
    const [notifications, setNotifications] = useState([]);
    const { user } = useAuth();

    useEffect(() => {
        loadNotifications();
    }, []);

    const loadNotifications = () => {
        // Read real notifications from localStorage first
        const stored = JSON.parse(localStorage.getItem('appNotifications')) || [];

        // Default seed notifications
        const defaults = [
            { id: 'def1', type: 'success', message: 'Welcome to Aashrey For Paws! Start exploring pets.', date: new Date().toLocaleDateString(), read: false },
            { id: 'def2', type: 'info', message: 'New pets added near you.', date: '2026-2-1', read: true },
        ];

        // Merge: stored first (most recent), then defaults
        const merged = [...stored, ...defaults].slice(0, 10);
        setNotifications(merged);
    };

    const markAllRead = () => {
        const stored = JSON.parse(localStorage.getItem('appNotifications')) || [];
        const updated = stored.map(n => ({ ...n, read: true }));
        localStorage.setItem('appNotifications', JSON.stringify(updated));
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    };

    const dismiss = (id) => {
        const stored = JSON.parse(localStorage.getItem('appNotifications')) || [];
        const updated = stored.filter(n => n.id !== id);
        localStorage.setItem('appNotifications', JSON.stringify(updated));
        setNotifications(prev => prev.filter(n => n.id !== id));
    };

    const unreadCount = notifications.filter(n => !n.read).length;

    const getIcon = (type) => {
        switch (type) {
            case 'success': return <FaCheckCircle color="#28a745" size={16} />;
            case 'alert': return <FaExclamationCircle color="#dc3545" size={16} />;
            default: return <FaInfoCircle color="#17a2b8" size={16} />;
        }
    };

    return (
        <div className="notification-dropdown">
            <div className="dropdown-header">
                <h3>
                    <FaBell style={{ marginRight: '6px' }} />
                    Notifications
                    {unreadCount > 0 && (
                        <span className="unread-badge">{unreadCount}</span>
                    )}
                </h3>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    {unreadCount > 0 && (
                        <button className="mark-read-btn" onClick={markAllRead} title="Mark all as read">
                            ✓ All Read
                        </button>
                    )}
                    <button className="close-btn-mobile" onClick={onClose}><FaTimes /></button>
                </div>
            </div>

            <div className="dropdown-body">
                {notifications.length === 0 ? (
                    <div className="empty-state">🎉 You're all caught up!</div>
                ) : (
                    notifications.map(notif => (
                        <div key={notif.id} className={`dropdown-item ${notif.read ? 'read' : 'unread'}`}>
                            <div className="icon">{getIcon(notif.type)}</div>
                            <div className="content">
                                <p>{notif.message}</p>
                                <span className="date">{notif.date}</span>
                            </div>
                            <button className="dismiss-btn" onClick={() => dismiss(notif.id)} title="Dismiss">
                                <FaTimes size={10} />
                            </button>
                        </div>
                    ))
                )}
            </div>

            <div className="dropdown-footer">
                <Link to="/notifications" onClick={onClose}>View All Notifications</Link>
            </div>

            <style>{`
                .notification-dropdown {
                    position: absolute;
                    top: 60px;
                    right: 20px;
                    width: 340px;
                    background: white;
                    border-radius: 12px;
                    box-shadow: 0 8px 24px rgba(0,0,0,0.15);
                    z-index: 1000;
                    overflow: hidden;
                    border: 1px solid #eee;
                    animation: fadeIn 0.2s ease-out;
                }
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(-10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .dropdown-header {
                    padding: 12px 16px;
                    border-bottom: 1px solid #eee;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    background: #f8f9fa;
                }
                .dropdown-header h3 {
                    margin: 0; font-size: 1rem; color: #333;
                    display: flex; align-items: center;
                }
                .unread-badge {
                    background: #dc3545; color: white; border-radius: 50%;
                    font-size: 0.7rem; padding: 2px 6px; margin-left: 6px;
                }
                .mark-read-btn {
                    background: none; border: 1px solid #5d4037;
                    color: #5d4037; font-size: 0.75rem; padding: 3px 8px;
                    border-radius: 12px; cursor: pointer; white-space: nowrap;
                }
                .mark-read-btn:hover { background: #5d4037; color: white; }
                .close-btn-mobile {
                    background: none; border: none; font-size: 1.2rem;
                    cursor: pointer; color: #666; display: none;
                }
                .dropdown-body {
                    max-height: 320px;
                    overflow-y: auto;
                }
                .dropdown-item {
                    padding: 12px 16px;
                    display: flex;
                    gap: 10px;
                    align-items: flex-start;
                    border-bottom: 1px solid #f1f1f1;
                    transition: background 0.2s;
                    position: relative;
                }
                .dropdown-item:hover { background: #f9f9f9; }
                .dropdown-item.unread { background: #fff8e1; border-left: 3px solid #ff9800; }
                .dropdown-item .content { flex: 1; }
                .dropdown-item .content p { margin: 0; font-size: 0.88rem; color: #333; line-height: 1.4; }
                .dropdown-item .date { font-size: 0.75rem; color: #888; display: block; margin-top: 4px; }
                .dismiss-btn {
                    background: none; border: none; cursor: pointer; color: #aaa;
                    padding: 2px; flex-shrink: 0;
                }
                .dismiss-btn:hover { color: #dc3545; }
                .empty-state { padding: 24px; text-align: center; color: #888; font-size: 0.95rem; }
                .dropdown-footer {
                    padding: 10px;
                    text-align: center;
                    background: #f8f9fa;
                    border-top: 1px solid #eee;
                }
                .dropdown-footer a {
                    color: var(--color-primary);
                    font-weight: 600;
                    text-decoration: none;
                    font-size: 0.9rem;
                }
                .dropdown-footer a:hover { text-decoration: underline; }

                @media (max-width: 768px) {
                    .notification-dropdown {
                        position: fixed;
                        top: 0; left: 0; right: 0; bottom: 0;
                        width: 100%; height: 100vh; border-radius: 0;
                    }
                    .close-btn-mobile { display: block; }
                }
            `}</style>
        </div>
    );
};

export default NotificationDropdown;
