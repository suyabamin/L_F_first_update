import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import MainLayout from '../../components/layout/MainLayout';
import '../../styles/legacy.css';

const Notifications = () => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        fetchNotifications();
    }, []);

    const fetchNotifications = async () => {
        try {
            const response = await api.get('/notifications.php');
            if (response.success) {
                setNotifications(response.notifications);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const markAsRead = async (id) => {
        try {
            await api.post('/notification_read.php', { id });
            setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n));
        } catch (err) {
            console.error(err);
        }
    };

    const markAllRead = async () => {
        try {
            await api.post('/notification_read.php', { all: true });
            setNotifications(notifications.map(n => ({ ...n, read: true })));
        } catch (err) {
            console.error(err);
        }
    };

    const filtered = notifications.filter(n => {
        if (filter === 'unread') return !n.read;
        if (filter === 'read') return n.read;
        return true;
    });

    const unreadCount = notifications.filter(n => !n.read).length;

    return (
        <MainLayout>
            <header className="topline">
                <div>
                    <p className="eyebrow"><i className="fas fa-bell"></i> Notification Center</p>
                    <h1 style={{ fontSize: '32px', fontWeight: 800 }}>Latest updates</h1>
                    <p className="subtitle">Stay informed about your lost & found activities</p>
                </div>
                <div className="top-actions" style={{ display: 'flex', gap: '12px' }}>
                    <button className="legacy-btn" onClick={markAllRead}><i className="fas fa-check-double"></i> Mark all as read</button>
                    <button className="legacy-btn primary"><i className="fas fa-cog"></i> Settings</button>
                </div>
            </header>

            <div className="filter-tabs" style={{ display: 'flex', gap: '20px', marginBottom: '32px', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px' }}>
                <button 
                    className={`filter-tab ${filter === 'all' ? 'active' : ''}`}
                    onClick={() => setFilter('all')}
                    style={{ background: 'none', border: 'none', fontWeight: 600, color: filter === 'all' ? '#00cfe8' : '#64748b', cursor: 'pointer' }}
                >
                    All Notifications
                </button>
                <button 
                    className={`filter-tab ${filter === 'unread' ? 'active' : ''}`}
                    onClick={() => setFilter('unread')}
                    style={{ background: 'none', border: 'none', fontWeight: 600, color: filter === 'unread' ? '#00cfe8' : '#64748b', cursor: 'pointer' }}
                >
                    Unread <span className="count-badge" style={{ background: '#00cfe8', color: 'white', padding: '2px 8px', borderRadius: '10px', fontSize: '10px', marginLeft: '4px' }}>{unreadCount}</span>
                </button>
                <button 
                    className={`filter-tab ${filter === 'read' ? 'active' : ''}`}
                    onClick={() => setFilter('read')}
                    style={{ background: 'none', border: 'none', fontWeight: 600, color: filter === 'read' ? '#00cfe8' : '#64748b', cursor: 'pointer' }}
                >
                    Read
                </button>
            </div>

            {loading ? (
                <div className="loading">Loading...</div>
            ) : filtered.length > 0 ? (
                <div className="notifications-list" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {filtered.map(notif => (
                        <div 
                            key={notif.id} 
                            onClick={() => !notif.read && markAsRead(notif.id)}
                            style={{ 
                                background: notif.read ? 'white' : 'rgba(0,207,232,0.05)', 
                                padding: '20px', 
                                borderRadius: '16px', 
                                border: '1px solid #e2e8f0',
                                borderLeft: notif.read ? '1px solid #e2e8f0' : '4px solid #00cfe8',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '20px',
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                            }}
                        >
                            <div className="notif-icon" style={{ width: '45px', height: '45px', background: 'white', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
                                <i className="fas fa-bell" style={{ color: '#00cfe8' }}></i>
                            </div>
                            <div style={{ flex: 1 }}>
                                <h4 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '4px' }}>{notif.title}</h4>
                                <p style={{ fontSize: '14px', color: '#64748b' }}>{notif.description}</p>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <span style={{ fontSize: '12px', color: '#94a3b8' }}>{notif.createdAt}</span>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="empty-state" style={{ textAlign: 'center', padding: '100px' }}>
                    <i className="fas fa-bell-slash" style={{ fontSize: '64px', opacity: 0.1, marginBottom: '20px', display: 'block' }}></i>
                    <h3>No notifications</h3>
                    <p style={{ color: '#64748b' }}>You're all caught up!</p>
                </div>
            )}
        </MainLayout>
    );
};

export default Notifications;
