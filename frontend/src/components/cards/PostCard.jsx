import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { Heart, MapPin, Clock, Tag } from 'lucide-react';

const getCategoryEmoji = (category) => {
  const cat = category?.toLowerCase() || '';
  if (cat.includes('elect')) return '💻';
  if (cat.includes('pet')) return '🐕';
  if (cat.includes('bag')) return '👜';
  if (cat.includes('key')) return '🔑';
  if (cat.includes('doc') || cat.includes('paper')) return '📄';
  if (cat.includes('jewel')) return '💎';
  return '📦';
};

const PostCard = ({ post, delay }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isLiked, setIsLiked] = useState(false);

  const toggleFavorite = async (e) => {
    e.stopPropagation();
    setIsLiked(!isLiked);
    // Add favorite logic if needed
  };

  const isLost = post.item_type === 'lost';
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      whileHover={{ y: -8, transition: { duration: 0.2 } }}
      viewport={{ once: true }}
      className="glass card-hover"
      onClick={() => navigate(`/posts/${post.id}`)}
      style={{ 
        cursor: 'pointer', borderRadius: '24px', overflow: 'hidden', 
        border: '1px solid var(--border)', background: 'var(--bg-card)',
        transition: 'background 0.3s ease, border-color 0.3s ease'
      }}
    >
      <div style={{ height: '200px', position: 'relative', overflow: 'hidden' }}>
        {post.image_path ? (
          <img 
            src={post.image_path} 
            alt={post.title} 
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ) : (
          <div style={{ 
            width: '100%', height: '100%', background: 'linear-gradient(135deg, #f0f9fa, #00cfe822)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '48px'
          }}>
            {getCategoryEmoji(post.category)}
          </div>
        )}
        <div style={{ 
          position: 'absolute', top: '12px', left: '12px',
          background: isLost ? '#fee2e2' : '#dcfce7',
          color: isLost ? '#ef4444' : '#10b981',
          padding: '6px 12px', borderRadius: '40px', fontSize: '12px', fontWeight: 800,
          display: 'flex', alignItems: 'center', gap: '4px'
        }}>
          <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'currentColor' }}></div>
          {post.item_type?.toUpperCase()}
        </div>
      </div>

      <div style={{ padding: '20px' }}>
        <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', fontWeight: 800, color: 'var(--text-main)' }}>{post.title}</h3>
        <p style={{ margin: '0 0 12px 0', fontSize: '14px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
          <MapPin size={14} /> {post.location_name}
        </p>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--border)' }}>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Clock size={12} /> {new Date(post.created_at).toLocaleDateString()}
          </span>
          <button 
            onClick={toggleFavorite}
            style={{ background: 'none', border: 'none', color: isLiked ? '#ef4444' : 'var(--text-muted)', cursor: 'pointer' }}
          >
            <Heart size={20} fill={isLiked ? '#ef4444' : 'none'} />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default PostCard;
