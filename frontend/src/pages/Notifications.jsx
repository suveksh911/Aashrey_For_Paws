import React, { useState } from 'react';
import { FaBell, FaCheckCircle, FaExclamationCircle, FaInfoCircle } from 'react-icons/fa';

const MOCK_NOTIFICATIONS = [
    { id: 1, type: 'success', message: 'Your adoption request for Buddy has been approved!', date: '2023-10-26', read: false },
    { id: 2, type: 'info', message: 'New pets added near you.', date: '2023-10-25', read: true },
    { id: 3, type: 'alert', message: 'Vaccination reminder for Misty.', date: '2023-10-24', read: true }
];

const Notifications = () => {
    const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);

    const markAsRead = (id) => {
        setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n));
    };

    const deleteNotification = (id) => {
        setNotifications(notifications.filter(n => n.id !== id));
    };

    const getIcon = (type) => {
        switch (type) {
            case 'success': return <FaCheckCircle color="#28a745" />;
            case 'alert': return <FaExclamationCircle color="#dc3545" />;
            default: return <FaInfoCircle color="#17a2b8" />;
        }
    };

    return (
        <div className="container" style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
            <h1 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <FaBell /> Notifications
            </h1>

            {notifications.length === 0 ? (
                <p>No new notifications.</p>
            ) : (
                <div className="notification-list" style={{ marginTop: '2rem' }}>
                    {notifications.map(notif => (
                        <div
                            key={notif.id}
                            className={`notification-item ${notif.read ? 'read' : 'unread'}`}
                            onClick={() => markAsRead(notif.id)}
                        >
                            <div className="icon-wrapper">
                                {getIcon(notif.type)}
                            </div>
                            <div className="content">
                                <p className="message">{notif.message}</p>
                                <span className="date">{notif.date}</span>
                            </div>
                            {!notif.read && <span className="dot"></span>}
                            <button onClick={(e) => { e.stopPropagation(); deleteNotification(notif.id); }} className="btn-delete">
                                &times;
                            </button>
                        </div>
                    ))}
                </div>
            )}

            <style>{`
                .notification-list { display: flex; flex-direction: column; gap: 1rem; }
                .notification-item { 
                    display: flex; 
                    align-items: center; 
                    gap: 1rem; 
                    padding: 1rem; 
                    background: white; 
                    border-radius: 8px; 
                    box-shadow: 0 2px 4px rgba(0,0,0,0.05); 
                    cursor: pointer; 
                    position: relative;
                    border-left: 4px solid transparent;
                    transition: all 0.2s;
                }
                .notification-item.unread { 
                    background: #fff8e1; 
                    border-left-color: #ffc107; 
                    font-weight: 500;
                }
                .notification-item:hover { transform: translateY(-2px); box-shadow: 0 4px 8px rgba(0,0,0,0.1); }
                .icon-wrapper { font-size: 1.5rem; display: flex; alignItems: center; }
                .content { flex: 1; }
                .message { margin-bottom: 0.25rem; font-size: 1rem; }
                .date { font-size: 0.8rem; color: #888; }
                .dot { width: 10px; height: 10px; background: #ffc107; border-radius: 50%; }
                .btn-delete { 
                    background: none; 
                    border: none; 
                    font-size: 1.5rem; 
                    color: #aaa; 
                    cursor: pointer; 
                    padding: 0 0.5rem;
                }
                .btn-delete:hover { color: #dc3545; }
            `}</style>
        </div>
    );
};

export default Notifications;
