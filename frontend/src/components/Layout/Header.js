import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaMoon, FaSun, FaUser } from 'react-icons/fa';
import './Layout.css';

const Header = ({ user, onLogout, isDarkMode, toggleDarkMode }) => {
  const navigate = useNavigate();

  return (
    <header className={`header ${isDarkMode ? 'dark' : 'light'}`}>
      <div className="header-left">
        <Link to="/" className="logo">
          MathChat
        </Link>
      </div>
      <div className="header-right">
        <button 
          className="theme-toggle" 
          onClick={toggleDarkMode}
          aria-label={isDarkMode ? 'Light mode' : 'Dark mode'}
        >
          {isDarkMode ? <FaSun /> : <FaMoon />}
        </button>
        {user ? (
          <div className="user-menu">
            <button className="profile-button" onClick={() => navigate('/profile')}>
              <FaUser />
              <span>{user.name}</span>
            </button>
            <button className="logout-button" onClick={onLogout}>
              Çıkış Yap
            </button>
          </div>
        ) : (
          <div className="auth-buttons">
            <Link to="/login" className="login-button">
              Giriş Yap
            </Link>
            <Link to="/register" className="register-button">
              Kayıt Ol
            </Link>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header; 