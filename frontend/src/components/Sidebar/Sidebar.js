import React, { useState, useEffect } from 'react';
import './Sidebar.css';
import { FaPlus, FaTrashAlt, FaComment } from 'react-icons/fa';

const Sidebar = ({ 
  chats, 
  activeChat, 
  onChatSelect, 
  onNewChat, 
  onDeleteChat,
  isDarkMode 
}) => {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleNewChat = () => {
    onNewChat();
  };

  const handleChatDelete = (chatId, e) => {
    e.stopPropagation();
    onDeleteChat(chatId);
  };

  return (
    <div className={`sidebar ${isDarkMode ? 'dark' : 'light'} ${isMobile ? 'mobile' : ''}`}>
      <div className="sidebar-header">
        <button 
          className="new-chat-button"
          onClick={handleNewChat}
        >
          <FaPlus /> {!isMobile && 'Yeni Sohbet'}
        </button>
      </div>
      
      <div className="chat-list">
        {chats.map((chat) => (
          <div
            key={chat.id}
            className={`chat-item ${activeChat?.id === chat.id ? 'active' : ''}`}
            onClick={() => onChatSelect(chat)}
          >
            <div className="chat-title">
              <FaComment />
              <span>{chat.title || 'Yeni Sohbet'}</span>
            </div>
            <button
              className="delete-chat-button"
              onClick={(e) => handleChatDelete(chat.id, e)}
              title="Sohbeti sil"
            >
              <FaTrashAlt />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Sidebar; 