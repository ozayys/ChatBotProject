import React, { useState, useRef, useEffect } from 'react';
import { FaPaperPlane, FaSpinner, FaComments } from 'react-icons/fa';
import './ChatArea.css';
import MessageBubble from './MessageBubble';

const ChatArea = ({ messages = [], onSendMessage, theme, isLoading }) => {
  const [inputMessage, setInputMessage] = useState('');
  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);

  // Scroll to bottom whenever messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (inputMessage.trim()) {
      onSendMessage(inputMessage);
      setInputMessage('');
    }
  };

  return (
    <div className="chat-area">
      <div className="chat-container" ref={chatContainerRef}>
        {isLoading ? (
          <div className="loading-container">
            <FaSpinner className="spinner" />
            <p>Sohbet geçmişi yükleniyor...</p>
          </div>
        ) : (!messages || messages.length === 0) ? (
          <div className="empty-chat">
            <FaComments className="empty-chat-icon" />
            <h2>Sohbete Başlayın</h2>
            <p>Matematik sorunuzu yazarak yapay zeka asistanınızla konuşmaya başlayabilirsiniz.</p>
          </div>
        ) : (
          <div className="messages-wrapper">
            {messages.map((message) => (
              <MessageBubble 
                key={message.id} 
                message={message} 
                theme={theme} 
              />
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>
      
      <form className="chat-input-container" onSubmit={handleSubmit}>
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          placeholder="Matematik sorunuzu yazın..."
          className="chat-input"
          disabled={isLoading}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSubmit(e);
            }
          }}
        />
        <button 
          type="submit" 
          className="send-button" 
          disabled={!inputMessage.trim() || isLoading}
          aria-label="Mesaj gönder"
        >
          <FaPaperPlane />
        </button>
      </form>
    </div>
  );
};

export default ChatArea; 