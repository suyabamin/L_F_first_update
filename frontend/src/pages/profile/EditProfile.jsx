import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../../components/layout/MainLayout';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Camera, Save, User as UserIcon, Phone, MapPin, Calendar, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const EditProfile = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [profile, setProfile] = useState({
    full_name: '',
    phone: '',
    country: '',
    gender: 'other',
    date_of_birth: ''
  });
  const [avatar, setAvatar] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await api.get('/auth/profile');
        setProfile({
          full_name: data.full_name || '',
          phone: data.phone || '',
          country: data.country || '',
          gender: data.gender || 'other',
          date_of_birth: data.date_of_birth ? data.date_of_birth.split('T')[0] : ''
        });
        setAvatarPreview(data.avatar_url);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatar(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (avatar) {
        const formData = new FormData();
        formData.append('avatar', avatar);
        await api.post('/auth/avatar', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }
      await api.put('/auth/profile', profile);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      alert(err.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <MainLayout><div className="loading">Loading profile...</div></MainLayout>;

  return (
    <MainLayout>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <header style={{ marginBottom: '32px' }}>
          <h1 style={{ fontSize: '32px', fontWeight: 800 }}>Edit Profile</h1>
          <p style={{ color: 'var(--text-muted)' }}>Manage your personal information and profile picture</p>
        </header>

        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '32px' }}>
          {/* Avatar Section */}
          <section className="glass" style={{ padding: '32px', borderRadius: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
            <div style={{ position: 'relative' }}>
              <img 
                src={avatarPreview || `https://ui-avatars.com/api/?name=${profile.full_name}&background=00cfe8&color=fff&size=128`} 
                alt="Avatar" 
                style={{ width: '128px', height: '128px', borderRadius: '50%', objectFit: 'cover', border: '4px solid #00cfe8' }}
              />
              <label 
                htmlFor="avatar-input"
                style={{ 
                  position: 'absolute', bottom: '5px', right: '5px', 
                  background: '#00cfe8', color: 'white', padding: '8px', 
                  borderRadius: '50%', cursor: 'pointer', shadow: 'var(--shadow)' 
                }}
              >
                <Camera size={20} />
                <input id="avatar-input" type="file" hidden onChange={handleFileChange} accept="image/*" />
              </label>
            </div>
            <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-muted)' }}>Click camera to change Avatar</p>
          </section>

          {/* Details Section */}
          <section className="glass" style={{ padding: '32px', borderRadius: '24px', display: 'grid', gap: '24px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div className="form-group">
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', fontWeight: 600 }}>
                  <UserIcon size={18} color="#00cfe8" /> Full Name
                </label>
                <input 
                  name="full_name" value={profile.full_name} onChange={handleChange}
                  style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid var(--border)', background: 'var(--bg-main)', color: 'var(--text-main)' }}
                />
              </div>
              <div className="form-group">
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', fontWeight: 600 }}>
                  <Phone size={18} color="#00cfe8" /> Phone Number
                </label>
                <input 
                  name="phone" value={profile.phone} onChange={handleChange}
                  style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid var(--border)', background: 'var(--bg-main)', color: 'var(--text-main)' }}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div className="form-group">
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', fontWeight: 600 }}>
                  <MapPin size={18} color="#00cfe8" /> Country
                </label>
                <input 
                  name="country" value={profile.country} onChange={handleChange}
                  style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid var(--border)', background: 'var(--bg-main)', color: 'var(--text-main)' }}
                />
              </div>
              <div className="form-group">
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', fontWeight: 600 }}>
                  <Calendar size={18} color="#00cfe8" /> Date of Birth
                </label>
                <input 
                  type="date" name="date_of_birth" value={profile.date_of_birth} onChange={handleChange}
                  style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid var(--border)', background: 'var(--bg-main)', color: 'var(--text-main)' }}
                />
              </div>
            </div>

            <div className="form-group">
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>Gender</label>
              <div style={{ display: 'flex', gap: '20px' }}>
                {['male', 'female', 'other'].map(g => (
                  <label key={g} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                    <input 
                      type="radio" name="gender" value={g} 
                      checked={profile.gender === g} onChange={handleChange} 
                    />
                    <span style={{ textTransform: 'capitalize' }}>{g}</span>
                  </label>
                ))}
              </div>
            </div>
          </section>

          <footer style={{ display: 'flex', justifyContent: 'flex-end', gap: '16px' }}>
            <button 
              type="button" 
              onClick={() => navigate('/profile')}
              style={{ padding: '12px 32px', borderRadius: '14px', border: '1px solid var(--border)', background: 'none', color: 'var(--text-muted)', fontWeight: 700 }}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={saving}
              style={{ 
                padding: '12px 32px', borderRadius: '14px', border: 'none', 
                background: success ? '#10b981' : '#00cfe8', color: 'white', 
                fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px',
                width: '200px', justifyContent: 'center'
              }}
            >
              {saving ? 'Saving...' : success ? <><CheckCircle size={20}/> Saved</> : <><Save size={20}/> Save Changes</>}
            </button>
          </footer>
        </form>
      </div>
    </MainLayout>
  );
};

export default EditProfile;
