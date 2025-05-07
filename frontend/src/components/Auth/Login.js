import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaGoogle, FaEnvelope, FaLock, FaExclamationTriangle } from 'react-icons/fa';
import './Auth.css';

const Login = ({ onLogin, isDarkMode, switchToRegister }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const emailInputRef = useRef(null);

  // Ensure scrolling to top when component mounts and focus on email input
  useEffect(() => {
    window.scrollTo(0, 0);
    if (emailInputRef.current) {
      emailInputRef.current.focus();
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

    // Simple validation
    if (!formData.email || !formData.password) {
      setError('Lütfen tüm alanları doldurun');
      setLoading(false);
      return;
    }

    // Create mock user data instead of actual server authentication
    try {
      // Simulate API call with timeout
      setTimeout(() => {
        const mockUserData = {
          id: 'user_' + Math.random().toString(36).substring(2, 9),
          name: formData.email.split('@')[0],
          email: formData.email,
          createdAt: new Date().toISOString()
        };
        
        const mockToken = 'token_' + Math.random().toString(36).substring(2, 15);
        
        // Store login info in localStorage
        localStorage.setItem('token', mockToken);
        localStorage.setItem('user', JSON.stringify(mockUserData));
        
        // Login success
        onLogin(mockUserData);
        navigate('/');
        setLoading(false);
      }, 500); // Add slight delay for better UX
    } catch (err) {
      console.error('Login process error:', err);
      setError('Bir hata oluştu. Lütfen tekrar deneyin.');
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    
    // Create mock Google user
    setTimeout(() => {
      const mockGoogleUser = {
        id: 'google_' + Math.random().toString(36).substring(2, 9),
        name: 'Google Kullanıcı',
        email: 'google_user@gmail.com',
        createdAt: new Date().toISOString(),
        provider: 'google'
      };
      
      const mockToken = 'google_token_' + Math.random().toString(36).substring(2, 15);
      
      localStorage.setItem('token', mockToken);
      localStorage.setItem('user', JSON.stringify(mockGoogleUser));
      
      onLogin(mockGoogleUser);
      navigate('/');
      setLoading(false);
    }, 800);
  };

  return (
    <div className={`auth-container ${isDarkMode ? 'dark' : 'light'}`}>
      <div className="auth-box">
        <h2>Giriş Yap</h2>
        {error && (
          <div className="error-message">
            <FaExclamationTriangle className="error-icon" />
            <span>{error}</span>
          </div>
        )}
        <form onSubmit={handleSubmit}>
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
              ref={emailInputRef}
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
          <button 
            type="submit" 
            className="submit-button"
            disabled={loading}
          >
            {loading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
          </button>
        </form>
        <div className="auth-links">
          <p>
            Hesabınız yok mu?{' '}
            <span onClick={() => navigate('/register')}>
              Kayıt Ol
            </span>
          </p>
        </div>
        <div className="divider">veya</div>
        
        <button 
          type="button" 
          className="google-button"
          onClick={handleGoogleLogin}
          disabled={loading}
        >
          <FaGoogle className="icon" />
          Google ile Giriş Yap
        </button>
      </div>
    </div>
  );
};

export default Login; 