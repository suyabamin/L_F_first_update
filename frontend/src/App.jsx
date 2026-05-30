import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './routes/ProtectedRoute';

// Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Dashboard from './pages/dashboard/Dashboard';
import BrowseItems from './pages/posts/BrowseItems';
import PostDetails from './pages/posts/PostDetails';
import CreatePost from './pages/posts/CreatePost';
import ClaimItem from './pages/posts/ClaimItem';
import Chat from './pages/chat/Chat';
import Profile from './pages/profile/Profile';
import EditProfile from './pages/profile/EditProfile';
import AdminPanel from './pages/admin/AdminPanel';
import MapView from './pages/map/MapView';
import Notifications from './pages/notifications/Notifications';
import Favorites from './pages/favorites/Favorites';
import PoliceGDForm from './pages/police/PoliceGDForm';

import { ThemeProvider } from './context/ThemeContext';
import { AnimatePresence } from 'framer-motion';

function App() {
  return (
    <ThemeProvider>
      <Router>
        <AuthProvider>
          <AnimatePresence mode="wait">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/items" element={<BrowseItems />} />
              <Route path="/posts/:id" element={<PostDetails />} />
              <Route path="/claim/:id" element={<ProtectedRoute><ClaimItem /></ProtectedRoute>} />
              <Route path="/create-post" element={<ProtectedRoute><CreatePost /></ProtectedRoute>} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/chat" element={<ProtectedRoute><Chat /></ProtectedRoute>} />
              <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
              <Route path="/profile/edit" element={<ProtectedRoute><EditProfile /></ProtectedRoute>} />
              <Route path="/admin" element={<ProtectedRoute><AdminPanel /></ProtectedRoute>} />
              <Route path="/map" element={<MapView />} />
              <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
              <Route path="/favorites" element={<ProtectedRoute><Favorites /></ProtectedRoute>} />
              <Route path="/police-gd" element={<ProtectedRoute><PoliceGDForm /></ProtectedRoute>} />
              {/* Default catch-all */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </AnimatePresence>
        </AuthProvider>
      </Router>
    </ThemeProvider>
  );
}


export default App;
