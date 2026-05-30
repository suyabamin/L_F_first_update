import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import MainLayout from '../../components/layout/MainLayout';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { 
  ChevronLeft, ChevronRight, Heart, Eye, 
  Clock, MapPin, Tag, User, Calendar,
  Share2, AlertTriangle, MessageSquare, CheckCircle,
  ArrowLeft, Navigation, ShieldCheck
} from 'lucide-react';

const createIcon = (color) => L.divIcon({
  html: `<div style="background-color: ${color}; width: 24px; height: 24px; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); border: 2px solid white; box-shadow: 0 4px 6px rgba(0,0,0,0.3);"></div>`,
  className: '', iconSize: [24, 24], iconAnchor: [12, 24],
});

const PostDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [slideIndex, setSlideIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    fetchItemDetails();
  }, [id]);

  const fetchItemDetails = async () => {
    try {
      setLoading(true);
      const data = await api.get(`/items/${id}`);
      setItem(data);
    } catch (error) {
      console.error('Error fetching item details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (type) => {
    if (!user) { navigate('/login'); return; }
    if (type === 'chat') {
       navigate(`/chat?item_id=${id}&receiver_id=${item.user_id}`);
    } else if (type === 'claim') {
      navigate(`/claim/${id}`);
    }
  };

  if (loading) return <MainLayout><div style={{ height: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading details...</div></MainLayout>;
  if (!item) return <MainLayout><div style={{ textAlign: 'center', padding: '100px' }}>Item not found</div></MainLayout>;

  const images = (item.images && item.images.length > 0) ? item.images.map(img => img.image_path) : [];
  const coords = [item.lat || 23.75, item.lng || 90.38];

  return (
    <MainLayout>
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}
      >
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button onClick={() => navigate(-1)} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontWeight: 700 }}>
            <ArrowLeft size={20} /> Back to Listings
          </button>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button className="glass" style={{ padding: '10px', borderRadius: '12px', border: '1px solid var(--border)', cursor: 'pointer' }}><Share2 size={20} /></button>
            <button 
                onClick={() => setIsFavorite(!isFavorite)}
                className="glass" 
                style={{ padding: '10px', borderRadius: '12px', border: '1px solid var(--border)', cursor: 'pointer', color: isFavorite ? '#ef4444' : 'inherit' }}
            >
                <Heart size={20} fill={isFavorite ? '#ef4444' : 'none'} />
            </button>
          </div>
        </header>

        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.2fr) minmax(0, 0.8fr)', gap: '48px' }}>
          {/* Gallery & Description */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            <div className="glass" style={{ position: 'relative', height: '500px', borderRadius: '32px', overflow: 'hidden', border: '1px solid var(--border)' }}>
              <AnimatePresence mode="wait">
                <motion.img 
                  key={slideIndex}
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  src={images[slideIndex] || 'https://via.placeholder.com/800x500?text=No+Image+Available'} 
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </AnimatePresence>
              
              {images.length > 1 && (
                <>
                  <button onClick={() => setSlideIndex((slideIndex - 1 + images.length) % images.length)} style={{ position: 'absolute', left: 24, top: '50%', transform: 'translateY(-50%)', background: 'white', border: 'none', width: '44px', height: '44px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: 'var(--shadow)' }}><ChevronLeft/></button>
                  <button onClick={() => setSlideIndex((slideIndex + 1) % images.length)} style={{ position: 'absolute', right: 24, top: '50%', transform: 'translateY(-50%)', background: 'white', border: 'none', width: '44px', height: '44px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: 'var(--shadow)' }}><ChevronRight/></button>
                </>
              )}

              <div style={{ position: 'absolute', top: 24, left: 24 }}>
                <span style={{ padding: '10px 24px', background: item.item_type === 'lost' ? '#ef4444' : '#10b981', color: 'white', borderRadius: '40px', fontWeight: 800, textTransform: 'uppercase', fontSize: '13px', boxShadow: '0 10px 20px rgba(0,0,0,0.2)' }}>
                    {item.item_type}
                </span>
              </div>
            </div>

            <div className="glass" style={{ padding: '40px', borderRadius: '32px', border: '1px solid var(--border)' }}>
              <h2 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '20px' }}>Description</h2>
              <p style={{ fontSize: '17px', lineHeight: 1.8, color: 'var(--text-main)', whiteSpace: 'pre-wrap' }}>{item.description}</p>
            </div>

            <div style={{ height: '300px', borderRadius: '32px', overflow: 'hidden', border: '1px solid var(--border)' }}>
               <MapContainer center={coords} zoom={15} style={{ height: '100%', width: '100%' }}>
                  <TileLayer url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png" />
                  <Marker position={coords} icon={createIcon(item.item_type === 'lost' ? '#ef4444' : '#10b981')} />
               </MapContainer>
            </div>
          </div>

          {/* Info Panel */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            <div className="glass" style={{ padding: '40px', borderRadius: '32px', border: '1px solid var(--border)', position: 'sticky', top: '100px' }}>
               <div style={{ marginBottom: '32px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#00cfe8', fontWeight: 700, marginBottom: '8px', textTransform: 'uppercase', fontSize: '13px' }}>
                     <Tag size={16} /> {item.category}
                  </div>
                  <h1 style={{ fontSize: '32px', fontWeight: 900, marginBottom: '16px', letterSpacing: '-1px' }}>{item.title}</h1>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                     <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-muted)' }}><MapPin size={18} /> {item.location_name}</div>
                     <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-muted)' }}><Clock size={18} /> Reported {new Date(item.created_at).toLocaleDateString()}</div>
                     <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-muted)' }}><Eye size={18} /> {item.view_count} people viewed this</div>
                  </div>
               </div>

               <div style={{ padding: '24px', background: 'var(--bg-main)', borderRadius: '24px', marginBottom: '32px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <img src={item.user_avatar || `https://ui-avatars.com/api/?name=${item.full_name}&background=00cfe8&color=fff`} style={{ width: '56px', height: '56px', borderRadius: '50%' }} alt="User" />
                  <div>
                     <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontWeight: 800 }}>{item.full_name}</span>
                        <ShieldCheck size={16} color="#10b981" />
                     </div>
                     <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Community Member</span>
                  </div>
               </div>

               <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <button onClick={() => handleAction('chat')} style={{ width: '100%', padding: '16px', borderRadius: '16px', border: 'none', background: '#00cfe8', color: 'white', fontWeight: 800, fontSize: '17px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', boxShadow: '0 10px 20px rgba(0,207,232,0.3)', cursor: 'pointer' }}>
                     <MessageSquare size={20} /> Contact {item.item_type === 'lost' ? 'Owner' : 'Finder'}
                  </button>
                  {item.item_type === 'lost' && (
                     <button onClick={() => handleAction('claim')} style={{ width: '100%', padding: '16px', borderRadius: '16px', border: '2px solid #00cfe8', background: 'none', color: '#00cfe8', fontWeight: 800, fontSize: '17px', cursor: 'pointer' }}>
                        I Found This Item
                     </button>
                  )}
                  <button style={{ width: '100%', padding: '16px', borderRadius: '16px', border: 'none', background: '#ef444411', color: '#ef4444', fontWeight: 800, fontSize: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', cursor: 'pointer' }}>
                     <AlertTriangle size={18} /> Report Listing
                  </button>
               </div>
            </div>
          </div>
        </div>
      </motion.div>
    </MainLayout>
  );
};

export default PostDetails;
