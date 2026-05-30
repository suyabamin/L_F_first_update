import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, Search, Map as MapIcon, MessageSquare, 
  User, Shield, Heart, Bell, FileText, LogOut, 
  ChevronLeft, Moon, Sun, Menu, X 
} from 'lucide-react';
import '../../styles/legacy.css';

const MainLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const { isDarkMode, toggleDarkMode } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setSidebarOpen] = useState(true);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/', icon: <LayoutDashboard size={20} /> },
    { name: 'Browse', path: '/items', icon: <Search size={20} /> },
    { name: 'Map View', path: '/map', icon: <MapIcon size={20} /> },
    { name: 'Chat', path: '/chat', icon: <MessageSquare size={20} /> },
    { name: 'Notifications', path: '/notifications', icon: <Bell size={20} /> },
    { name: 'Favorites', path: '/favorites', icon: <Heart size={20} /> },
    { name: 'Police GD', path: '/police-gd', icon: <FileText size={20} /> },
    { name: 'Profile', path: '/profile', icon: <User size={20} /> },
  ];

  if (user?.role === 'admin') {
    navItems.push({ name: 'Admin', path: '/admin', icon: <Shield size={20} /> });
  }

  const pageVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 }
  };

  return (
    <div className={`app-shell ${isDarkMode ? 'dark-mode' : ''}`} style={{ 
      display: 'flex', 
      minHeight: '100vh', 
      background: 'var(--bg-main)',
      color: 'var(--text-main)',
      transition: 'all 0.3s ease'
    }}>
      {/* Sidebar */}
      <motion.aside 
        initial={false}
        animate={{ width: isSidebarOpen ? '280px' : '80px' }}
        className="sidebar"
        style={{ 
          background: 'var(--bg-sidebar)', 
          borderRight: '1px solid var(--border)',
          display: 'flex',
          flexDirection: 'column',
          padding: '24px 16px',
          zIndex: 100,
          position: 'sticky',
          top: 0,
          height: '100vh'
        }}
      >
        <div className="logo-area" style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '40px', overflow: 'hidden' }}>
          <div style={{ 
            minWidth: '40px', height: '40px', background: 'linear-gradient(135deg, #00cfe8, #008b8b)', 
            borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' 
          }}>
            <Shield size={24} />
          </div>
          {isSidebarOpen && (
            <span style={{ fontWeight: 800, fontSize: '18px', whiteSpace: 'nowrap' }}>
              Lost<span style={{ color: '#00cfe8' }}>&Found</span>
            </span>
          )}
        </div>

        <nav style={{ flex: 1 }}>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {navItems.map((item) => (
              <li key={item.path} style={{ marginBottom: '4px' }}>
                <Link 
                  to={item.path}
                  style={{ 
                    display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', 
                    borderRadius: '12px', cursor: 'pointer',
                    color: location.pathname === item.path ? '#00cfe8' : 'var(--text-muted)',
                    background: location.pathname === item.path ? 'rgba(0,207,232,0.1)' : 'transparent',
                    fontWeight: 600,
                    transition: 'all 0.2s ease',
                    textDecoration: 'none',
                    overflow: 'hidden'
                  }}
                >
                  {item.icon}
                  {isSidebarOpen && <span>{item.name}</span>}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="sidebar-footer" style={{ borderTop: '1px solid var(--border)', paddingTop: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', overflow: 'hidden' }}>
             <img 
               src={user?.avatar_url || `https://ui-avatars.com/api/?name=${user?.full_name || 'User'}&background=00cfe8&color=fff&bold=true`} 
               alt="User" 
               style={{ width: '40px', height: '40px', borderRadius: '50%', border: '2px solid #00cfe8' }}
             />
             {isSidebarOpen && (
               <div style={{ minWidth: 0 }}>
                 <p style={{ fontWeight: 600, fontSize: '14px', margin: 0, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{user?.full_name || 'Guest'}</p>
                 <span style={{ fontSize: '11px', color: '#10b981' }}>Active Now</span>
               </div>
             )}
          </div>
        </div>
      </motion.aside>

      {/* Main Content Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <header style={{ 
          padding: '16px 40px', 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          background: 'var(--bg-sidebar)',
          borderBottom: '1px solid var(--border)',
          position: 'sticky',
          top: 0,
          zIndex: 90
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <button 
              onClick={() => navigate(-1)} 
              style={{ background: 'none', border: '1px solid var(--border)', padding: '8px', borderRadius: '8px', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '4px' }}
            >
              <ChevronLeft size={18} /> <span style={{ fontSize: '14px', fontWeight: 600 }}>Back</span>
            </button>
            <button onClick={() => setSidebarOpen(!isSidebarOpen)} style={{ background: 'none', border: 'none', color: 'var(--text-main)' }}>
              {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>

          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            <button 
              onClick={toggleDarkMode}
              style={{ background: 'var(--bg-main)', border: '1px solid var(--border)', padding: '8px', borderRadius: '12px', color: '#00cfe8' }}
            >
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            {user && (
              <button 
                onClick={handleLogout}
                style={{ background: '#fee2e2', color: '#ef4444', border: 'none', padding: '10px 20px', borderRadius: '12px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                <LogOut size={18} /> <span>Logout</span>
              </button>
            )}
          </div>
        </header>

        <main style={{ padding: '40px', flex: 1 }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.3, ease: "easeOut" }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
};

export default MainLayout;

