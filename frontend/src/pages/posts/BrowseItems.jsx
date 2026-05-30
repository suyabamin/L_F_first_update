import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import api from '../../services/api';
import MainLayout from '../../components/layout/MainLayout';
import PostCard from '../../components/cards/PostCard';
import { motion } from 'framer-motion';
import { Search, Plus, Compass, SlidersHorizontal, PackageOpen } from 'lucide-react';

const BrowseItems = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [filter, setFilter] = useState(searchParams.get('type') || 'all');

  useEffect(() => {
    fetchPosts();
  }, [searchParams]);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams(searchParams);
      // Switching to Node Backend endpoint
      const response = await api.get(`/items?${params.toString()}`);
      setPosts(response);
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const newParams = new URLSearchParams(searchParams);
    if (searchQuery) newParams.set('q', searchQuery);
    else newParams.delete('q');
    setSearchParams(newParams);
  };

  const handleFilterChange = (newType) => {
    setFilter(newType);
    const newParams = new URLSearchParams(searchParams);
    if (newType !== 'all') newParams.set('type', newType);
    else newParams.delete('type');
    setSearchParams(newParams);
  };

  return (
    <MainLayout>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#00cfe8', fontWeight: 700, fontSize: '14px', textTransform: 'uppercase', marginBottom: '8px' }}>
              <Compass size={18} /> Discover & Reunite
            </div>
            <h1 style={{ fontSize: '36px', fontWeight: 800 }}>Community Listings</h1>
          </div>
          <div style={{ display: 'flex', gap: '16px' }}>
            <Link 
              to="/map" 
              style={{ padding: '12px 24px', borderRadius: '14px', background: 'var(--bg-card)', border: '1px solid var(--border)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              <SlidersHorizontal size={18} /> Filter Map
            </Link>
            <Link 
              to="/create-post" 
              style={{ padding: '12px 24px', borderRadius: '14px', background: '#00cfe8', color: 'white', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              <Plus size={18} /> Post Item
            </Link>
          </div>
        </header>

        <div className="glass" style={{ padding: '24px', borderRadius: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
          <div style={{ display: 'flex', gap: '8px' }}>
            {['all', 'lost', 'found'].map(t => (
              <button 
                key={t}
                onClick={() => handleFilterChange(t)}
                style={{ 
                  padding: '10px 20px', borderRadius: '12px', border: 'none', 
                  background: filter === t ? '#00cfe8' : 'var(--bg-main)',
                  color: filter === t ? 'white' : 'var(--text-muted)',
                  fontWeight: 700, textTransform: 'capitalize', cursor: 'pointer'
                }}
              >
                {t}
              </button>
            ))}
          </div>
          
          <form onSubmit={handleSearch} style={{ position: 'relative', width: '300px' }}>
            <Search size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input 
              type="text" 
              placeholder="Search items..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ width: '100%', padding: '12px 16px 12px 48px', borderRadius: '12px', border: '1px solid var(--border)', background: 'var(--bg-main)', color: 'var(--text-main)', fontSize: '15px' }}
            />
          </form>
        </div>

        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '24px' }}>
            {[1,2,3,4,5,6].map(i => (
              <div key={i} style={{ height: '320px', borderRadius: '24px', background: 'var(--bg-card)', opacity: 0.1, animation: 'pulse 1.5s infinite linear' }}></div>
            ))}
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '24px' }}>
            {posts.length > 0 ? (
              posts.map((post, idx) => (
                <PostCard 
                  key={post.id} 
                  post={post} 
                  delay={idx * 0.1}
                />
              ))
            ) : (
              <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '100px' }}>
                <PackageOpen size={64} style={{ opacity: 0.2, marginBottom: '20px' }} />
                <h3 style={{ fontSize: '24px', opacity: 0.5 }}>No items found matching your criteria</h3>
              </div>
            )}
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default BrowseItems;
