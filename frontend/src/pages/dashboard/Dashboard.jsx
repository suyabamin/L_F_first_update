import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import MainLayout from '../../components/layout/MainLayout';
import PostCard from '../../components/cards/PostCard';
import { motion } from 'framer-motion';
import { 
  Laptop, Dog, Briefcase, Key, FileText, 
  Gem, Search, PlusCircle, Users, Package, 
  CheckCircle2, ArrowRight, TrendingUp 
} from 'lucide-react';

const categories = [
  { id: 'electronics', name: 'Electronics', icon: <Laptop size={24} />, color: '#6366f1' },
  { id: 'pets', name: 'Pets', icon: <Dog size={24} />, color: '#f59e0b' },
  { id: 'bag', name: 'Bag & Luggage', icon: <Briefcase size={24} />, color: '#10b981' },
  { id: 'key', name: 'Keys', icon: <Key size={24} />, color: '#ef4444' },
  { id: 'paper', name: 'Documents', icon: <FileText size={24} />, color: '#00cfe8' },
  { id: 'jewelry', name: 'Jewelry', icon: <Gem size={24} />, color: '#ec4899' }
];

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const postsRes = await api.get('/items');
      setPosts(postsRes.slice(0, 8));
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1, 
      transition: { staggerChildren: 0.1 } 
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  return (
    <MainLayout>
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        style={{ display: 'flex', flexDirection: 'column', gap: '48px' }}
      >
        {/* HERO SECTION */}
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <motion.h1 variants={itemVariants} style={{ fontSize: '42px', fontWeight: 900, marginBottom: '12px', letterSpacing: '-1px' }}>
              Welcome back, <span style={{ color: '#00cfe8' }}>{user?.full_name?.split(' ')[0] || 'Explorer'}</span> 👋
            </motion.h1>
            <motion.p variants={itemVariants} style={{ color: 'var(--text-muted)', fontSize: '18px' }}>
              Your central hub for community sightings and recovery reports.
            </motion.p>
          </div>
          <motion.div variants={itemVariants} style={{ display: 'flex', gap: '16px' }}>
            <Link to="/create-post" className="glass" style={{ padding: '14px 28px', borderRadius: '16px', background: '#00cfe8', color: 'white', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '10px', boxShadow: '0 10px 20px rgba(0,207,232,0.2)' }}>
              <PlusCircle size={22} /> Report New Item
            </Link>
          </motion.div>
        </header>

        {/* QUICK STATS */}
        <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px' }}>
          {[
            { label: 'Active Reports', value: '1,248', icon: <Package />, color: '#00cfe8' },
            { label: 'Community Members', value: '5,842', icon: <Users />, color: '#6366f1' },
            { label: 'Successfully Returned', value: '367', icon: <CheckCircle2 />, color: '#10b981' },
            { label: 'Views This Month', value: '12.5k', icon: <TrendingUp />, color: '#ec4899' }
          ].map((stat, i) => (
            <motion.div 
              key={i} 
              variants={itemVariants}
              whileHover={{ scale: 1.05 }}
              className="glass" 
              style={{ padding: '24px', borderRadius: '24px', display: 'flex', alignItems: 'center', gap: '20px', border: `1px solid var(--border)` }}
            >
              <div style={{ padding: '12px', background: `${stat.color}11`, color: stat.color, borderRadius: '14px' }}>
                {stat.icon}
              </div>
              <div>
                <h4 style={{ fontSize: '24px', fontWeight: 800, margin: 0 }}>{stat.value}</h4>
                <p style={{ color: 'var(--text-muted)', fontSize: '13px', margin: 0, fontWeight: 600 }}>{stat.label}</p>
              </div>
            </motion.div>
          ))}
        </section>

        {/* CATEGORIES */}
        <section>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '24px' }}>
            <h2 style={{ fontSize: '24px', fontWeight: 800 }}>Browse Categories</h2>
            <Link to="/items" style={{ color: '#00cfe8', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
              View All <ArrowRight size={18} />
            </Link>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '20px' }}>
            {categories.map((cat) => (
              <motion.div 
                key={cat.id} 
                variants={itemVariants}
                whileHover={{ y: -5 }}
                onClick={() => navigate(`/items?category=${cat.id}`)}
                className="glass"
                style={{ 
                  padding: '24px', borderRadius: '24px', textAlign: 'center', 
                  cursor: 'pointer', border: '1px solid var(--border)',
                  background: 'var(--bg-card)'
                }}
              >
                <div style={{ 
                  width: '56px', height: '56px', margin: '0 auto 16px', 
                  background: `${cat.color}11`, color: cat.color, 
                  borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' 
                }}>
                  {cat.icon}
                </div>
                <p style={{ fontWeight: 700, fontSize: '15px' }}>{cat.name}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* RECENT LISTINGS */}
        <section>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '24px' }}>
            <div>
              <h2 style={{ fontSize: '24px', fontWeight: 800 }}>Recent Discovery Reports</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Latest updates from your community</p>
            </div>
            <div className="glass" style={{ display: 'flex', gap: '4px', padding: '4px', borderRadius: '12px' }}>
              {['all', 'lost', 'found'].map(t => (
                <button 
                  key={t}
                  onClick={() => setFilter(t)}
                  style={{ 
                    padding: '8px 16px', borderRadius: '8px', border: 'none', 
                    background: filter === t ? '#00cfe8' : 'transparent',
                    color: filter === t ? 'white' : 'var(--text-muted)',
                    fontWeight: 700, textTransform: 'capitalize', cursor: 'pointer'
                  }}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '24px' }}>
            {loading ? (
              [1,2,3,4].map(i => <div key={i} style={{ height: '320px', borderRadius: '24px', background: 'var(--bg-card)', opacity: 0.1 }}></div>)
            ) : (
              posts.filter(p => filter === 'all' || p.item_type === filter).map((post, idx) => (
                <PostCard key={post.id} post={post} delay={idx * 0.1} />
              ))
            )}
          </div>
        </section>
      </motion.div>
    </MainLayout>
  );
};

export default Dashboard;
