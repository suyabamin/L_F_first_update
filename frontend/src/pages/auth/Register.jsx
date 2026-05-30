import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import '../../styles/auth.css';

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    fullname: '',
    email: '',
    password: '',
    phone: '',
    country: 'Bangladesh'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await register(formData);
      if (result.success) {
        navigate('/');
      } else {
        setError(result.message || 'Registration failed');
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
              <div className="logo-icon"><i className="fas fa-user-plus"></i></div>
            </div>
            <h1 className="brand-title">Join Our Community</h1>
            <p className="brand-subtitle">Create an account to start reuniting lost items with their owners</p>
            <div className="brand-features">
              <div className="feature-item"><i className="fas fa-check-circle"></i><span>Post lost or found items in seconds</span></div>
              <div className="feature-item"><i className="fas fa-check-circle"></i><span>Instantly message owners/finders</span></div>
              <div className="feature-item"><i className="fas fa-check-circle"></i><span>Get notified about potential matches</span></div>
            </div>
          </div>
          <div className="brand-illustration">
             {/* Floating Icons background effect */}
             <div className="float-icon icon-1"><i className="fas fa-mobile-alt"></i></div>
             <div className="float-icon icon-2"><i className="fas fa-wallet"></i></div>
             <div className="float-icon icon-3"><i className="fas fa-key"></i></div>
             <div className="float-icon icon-4"><i className="fas fa-laptop"></i></div>
          </div>
        </div>

        <div className="form-section">
          <div className="auth-form-container" style={{ maxWidth: '550px' }}>
            <div className="form-header">
              <div className="form-badge"><i className="fas fa-user-shield"></i> Member Registration</div>
              <h2>Create Account</h2>
              <p>Join thousands of users helping each other</p>
            </div>

            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="input-group" style={{ gridColumn: 'span 2' }}>
                  <label><i className="fas fa-user"></i> Full Name *</label>
                  <div className="input-wrapper">
                    <i className="fas fa-user input-icon"></i>
                    <input name="fullname" placeholder="John Doe" value={formData.fullname} onChange={handleChange} required />
                  </div>
                </div>

                <div className="input-group">
                  <label><i className="fas fa-id-card"></i> Username *</label>
                  <div className="input-wrapper">
                    <i className="fas fa-at input-icon"></i>
                    <input name="username" placeholder="johndoe" value={formData.username} onChange={handleChange} required />
                  </div>
                </div>

                <div className="input-group">
                  <label><i className="fas fa-phone"></i> Phone Number</label>
                  <div className="input-wrapper">
                    <i className="fas fa-phone input-icon"></i>
                    <input name="phone" placeholder="+880..." value={formData.phone} onChange={handleChange} />
                  </div>
                </div>

                <div className="input-group" style={{ gridColumn: 'span 2' }}>
                  <label><i className="fas fa-envelope"></i> Email Address *</label>
                  <div className="input-wrapper">
                    <i className="fas fa-envelope input-icon"></i>
                    <input name="email" type="email" placeholder="john@example.com" value={formData.email} onChange={handleChange} required />
                  </div>
                </div>

                <div className="input-group" style={{ gridColumn: 'span 2' }}>
                  <label><i className="fas fa-lock"></i> Password *</label>
                  <div className="input-wrapper">
                    <i className="fas fa-lock input-icon"></i>
                    <input name="password" type="password" placeholder="Min 6 characters" value={formData.password} onChange={handleChange} required />
                  </div>
                </div>
              </div>

              {error && <div style={{ color: 'var(--danger)', fontSize: '13px', marginBottom: '16px', textAlign: 'center' }}>{error}</div>}

              <button type="submit" className="submit-btn" disabled={loading}>
                {loading ? <i className="fas fa-circle-notch fa-spin"></i> : <span>Create Account</span>}
              </button>

              <div className="divider"><span>or</span></div>

              <div className="social-login">
                <button type="button" className="social-btn google"><i className="fab fa-google"></i><span>Google</span></button>
                <button type="button" className="social-btn facebook"><i className="fab fa-facebook-f"></i><span>Facebook</span></button>
              </div>

              <div className="form-footer">
                <p>Already have an account? <Link to="/login">Sign in here</Link></p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
