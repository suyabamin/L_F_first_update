import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import MainLayout from '../../components/layout/MainLayout';
import { User, Phone, Mail, MapPin, Calendar, Edit3, Settings, ShieldCheck, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

const Profile = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const data = await api.get('/auth/profile');
                setUser(data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, []);

    if (loading) return <MainLayout><div className="loading">Loading...</div></MainLayout>;

    return (
        <MainLayout>
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                style={{ maxWidth: '1000px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '32px' }}
            >
                {/* Profile Header Card */}
                <div className="glass" style={{ 
                    borderRadius: '32px', padding: '48px', overflow: 'hidden', 
                    background: 'linear-gradient(135deg, #00cfe822, var(--bg-card))',
                    border: '1px solid var(--border)', position: 'relative'
                }}>
                    <div style={{ position: 'absolute', top: '24px', right: '24px' }}>
                        <button 
                            onClick={() => navigate('/profile/edit')}
                            style={{ 
                                display: 'flex', alignItems: 'center', gap: '8px', 
                                padding: '12px 24px', borderRadius: '14px', border: 'none', 
                                background: '#00cfe8', color: 'white', fontWeight: 700, cursor: 'pointer' 
                            }}
                        >
                            <Edit3 size={18} /> Edit Profile
                        </button>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '32px', flexWrap: 'wrap' }}>
                        <img 
                            src={user?.avatar_url || `https://ui-avatars.com/api/?name=${user?.full_name}&background=00cfe8&color=fff&size=140`} 
                            alt="Profile" 
                            style={{ width: '140px', height: '140px', borderRadius: '50%', border: '4px solid #00cfe8', objectFit: 'cover' }}
                        />
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                                <h1 style={{ fontSize: '36px', fontWeight: 900, margin: 0 }}>{user?.full_name}</h1>
                                <ShieldCheck color="#10b981" />
                            </div>
                            <p style={{ color: 'var(--text-muted)', fontSize: '18px', margin: 0 }}>@{user?.username} • Global Recoverist</p>
                            <div style={{ display: 'flex', gap: '16px', marginTop: '20px' }}>
                                <div style={{ textAlign: 'center', background: 'var(--bg-main)', padding: '10px 20px', borderRadius: '12px' }}>
                                    <span style={{ fontWeight: 800, fontSize: '20px', display: 'block' }}>12</span>
                                    <span style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Reports</span>
                                </div>
                                <div style={{ textAlign: 'center', background: 'var(--bg-main)', padding: '10px 20px', borderRadius: '12px' }}>
                                    <span style={{ fontWeight: 800, fontSize: '20px', display: 'block' }}>5</span>
                                    <span style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Matches</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Details Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '32px' }}>
                    <div className="glass" style={{ padding: '32px', borderRadius: '24px', border: '1px solid var(--border)' }}>
                        <h3 style={{ fontSize: '20px', fontWeight: 800, marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <Settings size={20} color="#00cfe8" /> Security & Info
                        </h3>
                        <div style={{ display: 'grid', gap: '20px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <Mail size={18} color="var(--text-muted)" />
                                <div>
                                    <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0 }}>Email Address</p>
                                    <p style={{ fontWeight: 600, margin: 0 }}>{user?.email}</p>
                                </div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <Phone size={18} color="var(--text-muted)" />
                                <div>
                                    <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0 }}>Phone Number</p>
                                    <p style={{ fontWeight: 600, margin: 0 }}>{user?.phone || 'Not provided'}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="glass" style={{ padding: '32px', borderRadius: '24px', border: '1px solid var(--border)' }}>
                        <h3 style={{ fontSize: '20px', fontWeight: 800, marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <MapPin size={20} color="#00cfe8" /> Identity & Locale
                        </h3>
                        <div style={{ display: 'grid', gap: '20px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <MapPin size={18} color="var(--text-muted)" />
                                <div>
                                    <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0 }}>Location</p>
                                    <p style={{ fontWeight: 600, margin: 0 }}>{user?.country || 'Dhaka, Bangladesh'}</p>
                                </div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <Calendar size={18} color="var(--text-muted)" />
                                <div>
                                    <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0 }}>Date of Birth</p>
                                    <p style={{ fontWeight: 600, margin: 0 }}>{user?.date_of_birth ? new Date(user.date_of_birth).toLocaleDateString() : 'N/A'}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>
        </MainLayout>
    );
};


export default Profile;
