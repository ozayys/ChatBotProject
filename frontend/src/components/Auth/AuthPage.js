import React, { useState } from 'react';
import Login from './Login';
import Register from './Register';
import './Auth.css';

const AuthPage = ({ onAuthSuccess }) => {
  const [isLoginMode, setIsLoginMode] = useState(true);

  const handleLogin = (user) => {
    onAuthSuccess(user);
  };

  const handleRegister = (user) => {
    onAuthSuccess(user);
  };

  const switchToRegister = () => {
    setIsLoginMode(false);
  };

  const switchToLogin = () => {
    setIsLoginMode(true);
  };

  return (
    <div className="auth-page">
      <div className="auth-container-wrapper">
        {isLoginMode ? (
          <Login 
            onLogin={handleLogin} 
            switchToRegister={switchToRegister} 
          />
        ) : (
          <Register 
            onRegister={handleRegister} 
            switchToLogin={switchToLogin} 
          />
        )}
      </div>
    </div>
  );
};

export default AuthPage; 