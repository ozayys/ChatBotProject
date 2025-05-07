import React from 'react';
import './MessageBubble.css';
import { FaRobot, FaUser, FaExclamationTriangle } from 'react-icons/fa';

const MessageBubble = ({ message, theme }) => {
  // App.js'de mesaj formatı: { id, content, sender, timestamp }
  // Uyumluluk için her iki format da desteklenmeli
  const content = message.text || message.content || '';
  const sender = message.sender || 'user';
  const isError = message.isError || false;
  const timestamp = message.timestamp || new Date().toISOString();
  
  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return `${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}`;
  };

  return (
    <div className={`message-container ${sender === 'user' ? 'user' : 'bot'}`}>
      <div className="avatar">
        {sender === 'user' ? (
          <FaUser />
        ) : isError ? (
          <FaExclamationTriangle className="error-icon" />
        ) : (
          <FaRobot />
        )}
      </div>
      <div className={`message-bubble ${isError ? 'error' : ''}`}>
        <div className="message-text">{content}</div>
        {timestamp && (
          <div className="message-timestamp">{formatTimestamp(timestamp)}</div>
        )}
      </div>
    </div>
  );
};

export default MessageBubble; 