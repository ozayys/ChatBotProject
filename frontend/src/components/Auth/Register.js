import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUser, FaEnvelope, FaLock, FaExclamationTriangle } from 'react-icons/fa';
import './Auth.css';

const Register = ({ onLogin, isDarkMode }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const nameInputRef = useRef(null);

  // Ensure scrolling to top when component mounts and focus on name input
  useEffect(() => {
    window.scrollTo(0, 0);
    if (nameInputRef.current) {
      nameInputRef.current.focus();
    }
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    
    // Clear error when user starts typing
    if (error) {
      setError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Şifreler eşleşmiyor');
      setLoading(false);
      return;
    }

    // Simple validation
    if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
      setError('Lütfen tüm alanları doldurun');
      setLoading(false);
      return;
    }

    // Create mock user without server connection
    try {
      // Simulate API call with timeout
      setTimeout(() => {
        const mockUserData = {
          id: 'user_' + Math.random().toString(36).substring(2, 9),
          name: formData.name,
          email: formData.email,
          createdAt: new Date().toISOString()
        };
        
        const mockToken = 'token_' + Math.random().toString(36).substring(2, 15);
        
        // Store registration info in localStorage
        localStorage.setItem('token', mockToken);
        localStorage.setItem('user', JSON.stringify(mockUserData));
        
        // Registration success
        onLogin(mockUserData);
        navigate('/');
        setLoading(false);
      }, 800); // Add slight delay for better UX
    } catch (err) {
      console.error('Registration error:', err);
      setError('Bir hata oluştu. Lütfen tekrar deneyin.');
      setLoading(false);
    }
  };

  return (
    <div className={`auth-container ${isDarkMode ? 'dark' : 'light'}`}>
      <div className="auth-box">
        <h2>Kayıt Ol</h2>
        {error && (
          <div className="error-message">
            <FaExclamationTriangle className="error-icon" />
            <span>{error}</span>
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">
              <FaUser className="input-icon" /> İsim
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="İsminizi girin"
              ref={nameInputRef}
            />
          </div>
          <div className="form-group">
            <label htmlFor="email">
              <FaEnvelope className="input-icon" /> E-posta
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="E-posta adresinizi girin"
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">
              <FaLock className="input-icon" /> Şifre
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="Şifrenizi girin"
            />
          </div>
          <div className="form-group">
            <label htmlFor="confirmPassword">
              <FaLock className="input-icon" /> Şifre Tekrar
            </label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              placeholder="Şifrenizi tekrar girin"
            />
          </div>
          <button 
            type="submit" 
            className="submit-button"
            disabled={loading}
          >
            {loading ? 'Kayıt yapılıyor...' : 'Kayıt Ol'}
          </button>
        </form>
        <div className="auth-links">
          <p>
            Zaten hesabınız var mı?{' '}
            <span onClick={() => navigate('/login')}>
              Giriş Yap
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register; 