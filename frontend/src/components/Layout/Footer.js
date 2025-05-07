import React from 'react';
import './Layout.css';

const Footer = ({ isDarkMode }) => {
  return (
    <footer className={`footer ${isDarkMode ? 'dark' : 'light'}`}>
      <div className="footer-content">
        <p>&copy; {new Date().getFullYear()} MathChat. Tüm hakları saklıdır.</p>
      </div>
    </footer>
  );
};

export default Footer; 