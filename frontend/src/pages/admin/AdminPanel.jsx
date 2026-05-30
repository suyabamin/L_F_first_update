import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import MainLayout from '../../components/layout/MainLayout';
import '../../styles/legacy.css';

const AdminPanel = () => {
    const [stats, setStats] = useState({ users: 0, items: 0, open_reports: 0, returned_items: 0 });
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('metrics');

    useEffect(() => {
        fetchAdminData();
    }, []);

    const fetchAdminData = async () => {
        try {
            const response = await api.get('/admin/stats.php');
            if (response.success) {
                setStats(response.stats);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <MainLayout>
            <header className="topline" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <p className="eyebrow"><i className="fas fa-shield-halved"></i> Control Center</p>
                    <h1 style={{ fontSize: '32px', fontWeight: 800, textTransform: 'uppercase' }}>System Overview</h1>
                    <p className="subtitle">Admin Control Center for moderation and analytics</p>
                </div>
                <div className="admin-badge" style={{ background: '#fef2f2', color: '#ef4444', padding: '8px 16px', borderRadius: '40px', fontWeight: 700, fontSize: '13px', border: '1px solid #fee2e2' }}>
                    <i className="fas fa-eye"></i> LIVE MONITORING
                </div>
            </header>

            <div className="sub-nav" style={{ display: 'flex', gap: '32px', borderBottom: '1px solid #e2e8f0', marginBottom: '32px', paddingBottom: '12px' }}>
                <span style={{ fontWeight: 600, color: '#00cfe8', cursor: 'pointer' }}><i className="fas fa-comments"></i> Moderation</span>
                <span style={{ fontWeight: 600, color: '#64748b', cursor: 'pointer' }}><i className="fas fa-users-cog"></i> User Analytics</span>
                <span style={{ fontWeight: 600, color: '#64748b', cursor: 'pointer' }}><i className="fas fa-file-alt"></i> Reports Center</span>
            </div>

            {loading ? (
                <div className="loading">Initializing...</div>
            ) : (
                <div className="admin-grid" style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '32px' }}>
                    
                    <div className="left-stack" style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                        <section className="legacy-card" style={{ background: 'white', borderRadius: '24px', padding: '32px', border: '1px solid #e2e8f0' }}>
                            <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
                                <h3 style={{ fontSize: '20px', fontWeight: 700 }}><i className="fas fa-chart-simple"></i> Key Metrics</h3>
                                <span style={{ background: '#10b981', color: 'white', fontSize: '10px', padding: '2px 8px', borderRadius: '4px' }}>LIVE</span>
                            </div>
                            <div className="metrics-row" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
                                <div className="metric-box">
                                    <p style={{ color: '#64748b', fontSize: '12px' }}>Total Users</p>
                                    <h2 style={{ fontSize: '32px', fontWeight: 800 }}>{stats.users.toLocaleString()}</h2>
                                    <span style={{ color: '#10b981', fontSize: '11px' }}>+12% <i className="fas fa-arrow-up"></i></span>
                                </div>
                                <div className="metric-box">
                                    <p style={{ color: '#64748b', fontSize: '12px' }}>Total Items</p>
                                    <h2 style={{ fontSize: '32px', fontWeight: 800 }}>{stats.items.toLocaleString()}</h2>
                                    <span style={{ color: '#10b981', fontSize: '11px' }}>+8% <i className="fas fa-arrow-up"></i></span>
                                </div>
                                <div className="metric-box">
                                    <p style={{ color: '#64748b', fontSize: '12px' }}>Reports</p>
                                    <h2 style={{ fontSize: '32px', fontWeight: 800 }}>{stats.open_reports}</h2>
                                    <span style={{ color: '#ef4444', fontSize: '11px' }}>Action required <i className="fas fa-exclamation-triangle"></i></span>
                                </div>
                            </div>
                        </section>

                        <section className="legacy-card" style={{ background: 'white', borderRadius: '24px', padding: '32px', border: '1px solid #e2e8f0' }}>
                            <h3 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '24px' }}><i className="fas fa-brain"></i> System Intelligence</h3>
                            <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '16px' }}>Top Loss Hotspots</p>
                            <div className="hotspots" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                {['UIU Cafeteria', 'Library', 'Main Gate'].map((place, i) => (
                                    <div key={place} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <span style={{ width: '120px', fontSize: '13px' }}>{place}</span>
                                        <div style={{ flex: 1, height: '8px', background: '#f1f5f9', borderRadius: '4px' }}>
                                            <div style={{ width: `${80 - (i*15)}%`, height: '100%', background: '#00cfe8', borderRadius: '4px' }}></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    </div>

                    <div className="right-stack" style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                        <section className="legacy-card" style={{ background: 'white', borderRadius: '24px', padding: '32px', border: '1px solid #e2e8f0' }}>
                            <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '20px' }}><i className="fas fa-flag-checkered"></i> Verification Flags</h3>
                            <div className="mini-table" style={{ fontSize: '13px' }}>
                                {['ahmed_bd', 'sarah_w', 'mike_r'].map(user => (
                                    <div key={user} style={{ padding: '12px 0', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between' }}>
                                        <span>@{user}</span>
                                        <span style={{ color: '#f59e0b' }}>Pending Review</span>
                                    </div>
                                ))}
                            </div>
                        </section>

                        <section className="legacy-card" style={{ background: 'white', borderRadius: '24px', padding: '32px', border: '1px solid #e2e8f0' }}>
                            <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '20px' }}><i className="fas fa-mobile-alt"></i> Revenue Tracking</h3>
                            <div className="revenue-box" style={{ background: '#fdf2f8', padding: '20px', borderRadius: '16px' }}>
                                <p style={{ fontSize: '12px', color: '#db2777' }}>bKash Processed</p>
                                <h2 style={{ fontSize: '28px', fontWeight: 800, color: '#db2777' }}>5,200 BDT</h2>
                                <p style={{ fontSize: '11px', color: '#db2777', opacity: 0.8 }}>Last 30 days turnover</p>
                            </div>
                        </section>
                    </div>
                </div>
            )}

            <div className="quick-actions-bar" style={{ marginTop: '40px', display: 'flex', gap: '20px' }}>
                <button className="legacy-btn" style={{ flex: 1 }}><i className="fas fa-file-pdf"></i> Weekly Report</button>
                <button className="legacy-btn" style={{ flex: 1 }}><i className="fas fa-bullhorn"></i> Broadcast Alert</button>
                <button className="legacy-btn primary" style={{ flex: 1 }}><i className="fas fa-user-shield"></i> Advanced Settings</button>
            </div>
        </MainLayout>
    );
};

export default AdminPanel;
