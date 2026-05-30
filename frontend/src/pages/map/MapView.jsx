import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import api from '../../services/api';
import MainLayout from '../../components/layout/MainLayout';
import { Search, MapPin, Navigation } from 'lucide-react';
import 'leaflet/dist/leaflet.css';

// Custom Marker Icons
const createIcon = (color) => L.divIcon({
  html: `<div style="background-color: ${color}; width: 30px; height: 30px; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); display: flex; alignItems: center; justifyContent: center; border: 2px solid white; box-shadow: 0 4px 6px rgba(0,0,0,0.3);">
           <div style="width: 10px; height: 10px; background: white; border-radius: 50%; transform: rotate(45deg);"></div>
         </div>`,
  className: '',
  iconSize: [30, 30],
  iconAnchor: [15, 30],
});

const lostIcon = createIcon('#ef4444');
const foundIcon = createIcon('#10b981');

const MapView = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      const response = await api.get('/items');
      // Adding random coords if missing for demo
      const mapped = response.map(item => ({
        ...item,
        lat: item.lat || (23.75 + (Math.random() - 0.5) * 0.08),
        lng: item.lng || (90.38 + (Math.random() - 0.5) * 0.08)
      }));
      setItems(mapped);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = items.filter(i => filter === 'all' || i.item_type === filter);

  return (
    <MainLayout>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div>
            <h1 style={{ fontSize: '32px', fontWeight: 800 }}>Geospatial Tracker</h1>
            <p style={{ color: 'var(--text-muted)' }}>Visualize lost and found reports across the city</p>
          </div>
          <div className="glass" style={{ display: 'flex', gap: '8px', padding: '6px', borderRadius: '16px' }}>
            {['all', 'lost', 'found'].map(t => (
              <button 
                key={t}
                onClick={() => setFilter(t)}
                style={{ 
                  padding: '10px 24px', borderRadius: '12px', border: 'none', 
                  background: filter === t ? '#00cfe8' : 'transparent',
                  color: filter === t ? 'white' : 'var(--text-muted)',
                  fontWeight: 700, textTransform: 'capitalize', cursor: 'pointer', transition: '0.2s'
                }}
              >
                {t}
              </button>
            ))}
          </div>
        </header>

        <div style={{ height: 'calc(100vh - 280px)', borderRadius: '32px', overflow: 'hidden', boxShadow: 'var(--shadow-lg)', border: '1px solid var(--border)' }}>
          <MapContainer center={[23.75, 90.38]} zoom={13} style={{ height: '100%', width: '100%' }}>
            <TileLayer url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png" />
            {filtered.map(item => (
              <Marker 
                key={item.id} 
                position={[item.lat, item.lng]} 
                icon={item.item_type === 'lost' ? lostIcon : foundIcon}
              >
                <Popup className="custom-popup">
                  <div style={{ padding: '4px', minWidth: '180px' }}>
                    <div style={{ height: '100px', background: `url(${item.image_path || 'https://via.placeholder.com/150'})`, backgroundSize: 'cover', borderRadius: '8px', marginBottom: '12px' }}></div>
                    <span style={{ fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', color: item.item_type === 'lost' ? '#ef4444' : '#10b981' }}>{item.item_type}</span>
                    <h4 style={{ margin: '4px 0', fontSize: '16px' }}>{item.title}</h4>
                    <p style={{ margin: '0 0 12px 0', fontSize: '13px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <MapPin size={14} /> {item.location_name}
                    </p>
                    <button 
                      onClick={() => (window.location.href = `/posts/${item.id}`)}
                      style={{ width: '100%', padding: '8px', background: '#00cfe8', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 700, cursor: 'pointer' }}
                    >
                      View Details
                    </button>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
      </div>
    </MainLayout>
  );
};

export default MapView;
