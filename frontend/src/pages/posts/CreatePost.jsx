import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../services/api';
import MainLayout from '../../components/layout/MainLayout';
import { 
  Box, MapPin, Calendar, Tag, Upload, 
  X, AlertCircle, CheckCircle, Trash, 
  Info, Sparkles, Send
} from 'lucide-react';

const CreatePost = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState([]);
  const [previewImages, setPreviewImages] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    category: 'electronics',
    item_type: 'lost',
    description: '',
    location: '',
    date: new Date().toISOString().split('T')[0],
    contact: '',
    reward_amount: 0
  });
  const [success, setSuccess] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (images.length + files.length > 5) {
      alert('You can only upload up to 5 images');
      return;
    }

    setImages(prev => [...prev, ...files]);
    
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewImages(prev => [...prev, e.target.result]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setPreviewImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    const data = new FormData();
    Object.keys(formData).forEach(key => data.append(key, formData[key]));
    images.forEach(image => data.append('images', image)); // Note: key matches backend upload.array('images')

    try {
      const response = await api.post('/items', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setSuccess(true);
      setTimeout(() => navigate(`/posts/${response.id}`), 2000);
    } catch (error) {
      alert(error.message || 'Error creating post');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <MainLayout>
        <div style={{ height: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
          <motion.div 
            initial={{ scale: 0 }} 
            animate={{ scale: 1 }} 
            style={{ width: '100px', height: '100px', borderRadius: '50%', backgroundColor: '#dcfce7', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px' }}
          >
            <CheckCircle size={48} />
          </motion.div>
          <motion.h2 initial={{ opacity: 0 }} animate={{ opacity:1 }} style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: '12px' }}>A Discovery Shared!</motion.h2>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity:1 }} style={{ color: 'var(--text-muted)', fontSize: '18px' }}>Your item has been listed securely. Redirecting to recovery hub...</motion.p>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        <header style={{ marginBottom: '48px', position: 'relative' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#00cfe8', fontWeight: 800, textTransform: 'uppercase', marginBottom: '12px', fontSize: '14px' }}>
            <Sparkles size={20} /> Community Support
          </div>
          <h1 style={{ fontSize: '42px', fontWeight: 900, marginBottom: '12px', letterSpacing: '-1.5px' }}>Report Discovery</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '18px' }}>Detailed reports increase the chance of successful recovery by 85%.</p>
        </header>

        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '32px' }}>
          {/* Item Type & Category */}
          <section className="glass" style={{ padding: '32px', borderRadius: '28px', border: '1px solid var(--border)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '15px', fontWeight: 700, marginBottom: '16px' }}>What happened?</label>
              <div style={{ display: 'flex', background: 'var(--bg-main)', padding: '6px', borderRadius: '14px', gap: '6px' }}>
                {['lost', 'found'].map(type => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, item_type: type }))}
                    style={{
                      flex: 1, padding: '12px', borderRadius: '10px', border: 'none',
                      background: formData.item_type === type ? '#00cfe8' : 'transparent',
                      color: formData.item_type === type ? 'white' : 'var(--text-muted)',
                      fontWeight: 700, textTransform: 'capitalize', cursor: 'pointer', transition: '0.3s'
                    }}
                  >
                    Item is {type}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '15px', fontWeight: 700, marginBottom: '16px' }}>Category</label>
              <div style={{ position: 'relative' }}>
                <Tag size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#00cfe8' }} />
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  style={{ width: '100%', padding: '14px 16px 14px 48px', borderRadius: '14px', border: '1px solid var(--border)', background: 'var(--bg-main)', color: 'var(--text-main)', fontSize: '16px', outline: 'none', appearance: 'none' }}
                >
                  <option value="electronics">Electronics</option>
                  <option value="pets">Pets</option>
                  <option value="bag">Bags & Luggage</option>
                  <option value="key">Keys</option>
                  <option value="paper">Documents</option>
                  <option value="jewelry">Jewelry</option>
                  <option value="others">Others</option>
                </select>
              </div>
            </div>
          </section>

          {/* Details Section */}
          <section className="glass" style={{ padding: '32px', borderRadius: '28px', border: '1px solid var(--border)', display: 'grid', gap: '24px' }}>
            <h3 style={{ fontSize: '20px', fontWeight: 800, borderBottom: '1px solid var(--border)', paddingBottom: '16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Info size={20} color="#00cfe8" /> Item Details
            </h3>
            
            <div className="form-group">
              <label style={{ display: 'block', fontWeight: 700, marginBottom: '8px' }}>Title *</label>
              <input
                type="text" name="title" placeholder="E.g. Blue Dell Laptop with stickers"
                value={formData.title} onChange={handleInputChange} required
                style={{ width: '100%', padding: '14px 16px', borderRadius: '14px', border: '1px solid var(--border)', background: 'var(--bg-main)', color: 'var(--text-main)' }}
              />
            </div>

            <div className="form-group">
              <label style={{ display: 'block', fontWeight: 700, marginBottom: '8px' }}>Description *</label>
              <textarea
                name="description" placeholder="Describe unique features, condition, and any metadata..."
                value={formData.description} onChange={handleInputChange} required rows={4}
                style={{ width: '100%', padding: '14px 16px', borderRadius: '14px', border: '1px solid var(--border)', background: 'var(--bg-main)', color: 'var(--text-main)', resize: 'none' }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
              <div className="form-group">
                <label style={{ display: 'block', fontWeight: 700, marginBottom: '8px' }}>Location *</label>
                <div style={{ position: 'relative' }}>
                  <MapPin size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#00cfe8' }} />
                  <input
                    type="text" name="location" placeholder="Mention area/landmark"
                    value={formData.location} onChange={handleInputChange} required
                    style={{ width: '100%', padding: '14px 16px 14px 48px', borderRadius: '14px', border: '1px solid var(--border)', background: 'var(--bg-main)', color: 'var(--text-main)' }}
                  />
                </div>
              </div>
              <div className="form-group">
                <label style={{ display: 'block', fontWeight: 700, marginBottom: '8px' }}>Date Incident *</label>
                <div style={{ position: 'relative' }}>
                  <Calendar size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#00cfe8' }} />
                  <input
                    type="date" name="date" value={formData.date} onChange={handleInputChange} required
                    style={{ width: '100%', padding: '14px 16px 14px 48px', borderRadius: '14px', border: '1px solid var(--border)', background: 'var(--bg-main)', color: 'var(--text-main)' }}
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Media Section */}
          <section className="glass" style={{ padding: '32px', borderRadius: '28px', border: '1px solid var(--border)' }}>
            <h3 style={{ fontSize: '20px', fontWeight: 800, borderBottom: '1px solid var(--border)', paddingBottom: '16px', marginBottom: '24px' }}>Discovery Photos</h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '16px' }}>
              {previewImages.map((src, index) => (
                <motion.div 
                  key={index} initial={{ scale: 0.9 }} animate={{ scale: 1 }}
                  style={{ position: 'relative', height: '140px', borderRadius: '16px', overflow: 'hidden', border: '2px solid #00cfe8' }}
                >
                  <img src={src} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <button onClick={() => removeImage(index)} style={{ position: 'absolute', top: 8, right: 8, background: '#ef4444', color: 'white', border: 'none', borderRadius: '50%', width: '24px', height: '24px', cursor: 'pointer' }}><X size={14}/></button>
                </motion.div>
              ))}
              
              {previewImages.length < 5 && (
                <label style={{ height: '140px', borderRadius: '16px', border: '2px dashed var(--border)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-main)', cursor: 'pointer', transition: 'all 0.3s' }}>
                  <Upload size={32} color="#00cfe8" />
                  <span style={{ fontSize: '13px', fontWeight: 700, marginTop: '12px' }}>Upload Photo</span>
                  <input type="file" multiple hidden onChange={handleImageChange} accept="image/*" />
                </label>
              )}
            </div>
          </section>

          <footer style={{ display: 'flex', gap: '20px', marginTop: '20px' }}>
            <button type="button" onClick={() => navigate(-1)} style={{ flex: 1, padding: '16px', borderRadius: '16px', border: '1px solid var(--border)', background: 'var(--bg-card)', fontWeight: 800, color: 'var(--text-muted)' }}>Discard Report</button>
            <button type="submit" disabled={loading} style={{ flex: 2, padding: '16px', borderRadius: '16px', border: 'none', background: '#00cfe8', color: 'white', fontWeight: 800, fontSize: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', boxShadow: '0 15px 25px rgba(0,207,232,0.3)' }}>
              {loading ? 'Publishing Discovery...' : <><Send size={20}/> Publish Report</>}
            </button>
          </footer>
        </form>
      </div>
    </MainLayout>
  );
};

export default CreatePost;
