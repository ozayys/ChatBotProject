import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowRight, FaCalculator, FaRegLightbulb, FaClock, FaShieldAlt } from 'react-icons/fa';
import './Layout.css';

const LandingPage = ({ isDarkMode }) => {
  const navigate = useNavigate();

  return (
    <div className={`landing-page ${isDarkMode ? 'dark' : 'light'}`}>
      <div className="hero-section">
        <div className="hero-icon">
          <FaCalculator />
        </div>
        <h1>MathChat</h1>
        <p className="hero-description">
          Matematik problemlerinizi çözen ve günlük sohbetlerinize eşlik eden
          yapay zeka destekli asistanınız.
        </p>
        
        <div className="cta-container">
          <button 
            className="get-started-button"
            onClick={() => navigate('/register')}
          >
            Hemen Başla <FaArrowRight />
          </button>
        </div>
        
        <div className="benefits-banner">
          <div className="benefit-item">
            <FaRegLightbulb className="benefit-icon" />
            <span>Akıllı Çözümler</span>
          </div>
          <div className="benefit-item">
            <FaClock className="benefit-icon" />
            <span>7/24 Erişim</span>
          </div>
          <div className="benefit-item">
            <FaShieldAlt className="benefit-icon" />
            <span>Güvenli Kullanım</span>
          </div>
        </div>
        
        <div className="features">
          <div className="feature-card">
            <div className="feature-icon">
              <FaRegLightbulb />
            </div>
            <h3>Matematik Çözümleri</h3>
            <p>Basit işlemlerden karmaşık problemlere kadar adım adım çözümler sunar.</p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">
              <FaClock />
            </div>
            <h3>7/24 Kullanılabilir</h3>
            <p>İstediğiniz zaman, istediğiniz yerden kolayca erişim sağlayın.</p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">
              <FaShieldAlt />
            </div>
            <h3>Güvenli ve Özel</h3>
            <p>Verileriniz güvende tutulur, tüm sohbetleriniz özel ve korunur.</p>
          </div>
        </div>
      </div>
      
      <div className="background-shapes">
        <div className="shape shape-1"></div>
        <div className="shape shape-2"></div>
        <div className="shape shape-3"></div>
        <div className="shape shape-4"></div>
      </div>
    </div>
  );
};

export default LandingPage; 