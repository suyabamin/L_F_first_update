import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import '../../styles/auth.css';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await login(formData.email, formData.password);
      if (result.success) {
        navigate('/');
      } else {
        setError(result.message || 'Invalid email or password');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-window">
      <div className="animated-bg">
        <div className="gradient-orb orb-1"></div>
        <div className="gradient-orb orb-2"></div>
        <div className="gradient-orb orb-3"></div>
        <div className="gradient-orb orb-4"></div>
      </div>

      <div className="auth-wrapper">
        <div className="brand-section">
          <div className="brand-content">
            <div className="logo-animation">
              <div className="logo-icon"><i className="fas fa-shield-heart"></i></div>
            </div>
            <h1 className="brand-title">Welcome Back</h1>
            <p className="brand-subtitle">Sign in to continue your journey of reuniting lost items with their owners</p>
            <div className="brand-features">
              <div className="feature-item"><i className="fas fa-check-circle"></i><span>Track lost items in real-time</span></div>
              <div className="feature-item"><i className="fas fa-check-circle"></i><span>Connect with finders instantly</span></div>
              <div className="feature-item"><i className="fas fa-check-circle"></i><span>Secure and verified platform</span></div>
            </div>
          </div>
          <div className="brand-illustration">
            <div className="float-icon icon-1"><i className="fas fa-mobile-alt"></i></div>
            <div className="float-icon icon-2"><i className="fas fa-wallet"></i></div>
            <div className="float-icon icon-3"><i className="fas fa-key"></i></div>
            <div className="float-icon icon-4"><i className="fas fa-laptop"></i></div>
          </div>
        </div>

        <div className="form-section">
          <div className="auth-form-container">
            <div className="form-header">
              <div className="form-badge"><i className="fas fa-lock"></i> Secure Login</div>
              <h2>Sign In</h2>
              <p>Enter your credentials to access your account</p>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="input-group">
                <label><i className="fas fa-envelope"></i> Email Address</label>
                <div className="input-wrapper">
                  <i className="fas fa-envelope input-icon"></i>
                  <input 
                    type="email" 
                    placeholder="Enter your email" 
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required 
                  />
                </div>
              </div>

              <div className="input-group">
                <label><i className="fas fa-lock"></i> Password</label>
                <div className="input-wrapper">
                  <i className="fas fa-lock input-icon"></i>
                  <input 
                    type={showPassword ? 'text' : 'password'} 
                    placeholder="Enter your password" 
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required 
                  />
                  <button type="button" className="toggle-password" onClick={() => setShowPassword(!showPassword)}>
                    <i className={`fas fa-${showPassword ? 'eye-slash' : 'eye'}`}></i>
                  </button>
                </div>
              </div>

              {error && <div style={{ color: 'var(--danger)', fontSize: '13px', marginBottom: '16px', textAlign: 'center' }}>{error}</div>}

              <div className="auth-options">
                <label className="checkbox-label">
                  <input type="checkbox" />
                  <span className="checkmark"></span>
                  Remember me
                </label>
                <Link to="/forgot-password" style={{ color: 'var(--primary-teal)', fontSize: '13px', fontWeight: 600, textDecoration: 'none' }}>Forgot Password?</Link>
              </div>

              <button type="submit" className="submit-btn" disabled={loading}>
                {loading ? <i className="fas fa-circle-notch fa-spin"></i> : <span>Sign In</span>}
              </button>

              <div className="divider"><span>or</span></div>

              <div className="social-login">
                <button type="button" className="social-btn google"><i className="fab fa-google"></i><span>Google</span></button>
                <button type="button" className="social-btn facebook"><i className="fab fa-facebook-f"></i><span>Facebook</span></button>
              </div>

              <div className="form-footer">
                <p>Don't have an account? <Link to="/register">Sign up now</Link></p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
