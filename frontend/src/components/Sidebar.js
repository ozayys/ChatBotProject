import React, { useState, useEffect } from 'react';
import { FaMoon, FaSun, FaTrash, FaChevronLeft, FaRobot, FaCalculator, FaPlus, FaTimes } from 'react-icons/fa';
import './Sidebar.css';

const Sidebar = ({ 
  toggleTheme, 
  theme, 
  clearChat, 
  resetModelSelection, 
  selectedModel, 
  children,
  messages,
  onSendMessage,
  fetchChatHistory,
  user
}) => {
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [loading, setLoading] = useState(false);

  // Fetch conversations on component mount
  useEffect(() => {
    fetchConversations();
  }, [user]);

  const fetchConversations = async () => {
    setLoading(true);
    try {
      // Get token from localStorage
      const token = localStorage.getItem('token');
      
      if (token) {
        const response = await fetch('http://localhost:8000/api/conversations', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          setConversations(data);
          
          // Set active conversation if there's one
          if (data.length > 0 && !activeConversation) {
            setActiveConversation(data[0].id);
          }
        } else {
          console.error('Error fetching conversations:', response.statusText);
          // Demo fallback
          const demoConversations = [
            { id: 1, title: 'Matematik Soruları', updated_at: new Date().toISOString() },
            { id: 2, title: 'Programlama Yardımı', updated_at: new Date().toISOString() }
          ];
          setConversations(demoConversations);
          setActiveConversation(1);
        }
      } else {
        // Demo fallback when no token
        const demoConversations = [
          { id: 1, title: 'Matematik Soruları', updated_at: new Date().toISOString() },
          { id: 2, title: 'Programlama Yardımı', updated_at: new Date().toISOString() }
        ];
        setConversations(demoConversations);
        setActiveConversation(1);
      }
    } catch (error) {
      console.error('Error fetching conversations:', error);
      // Set some demo conversations for testing
      const demoConversations = [
        { id: 1, title: 'Matematik Soruları', updated_at: new Date().toISOString() },
        { id: 2, title: 'Programlama Yardımı', updated_at: new Date().toISOString() }
      ];
      setConversations(demoConversations);
      setActiveConversation(1);
    } finally {
      setLoading(false);
    }
  };

  const createNewConversation = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8000/api/conversations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title: 'Yeni Sohbet',
          model_id: selectedModel === 'api' ? 1 : 2
        })
      });
      
      if (response.ok) {
        const newConversation = await response.json();
        setConversations(prev => [newConversation, ...prev]);
        setActiveConversation(newConversation.id);
        clearChat(); // Clear current chat messages
      } else {
        console.error('Error creating conversation:', response.statusText);
        // Demo fallback
        const newId = Math.max(...conversations.map(c => c.id), 0) + 1;
        const newConversation = {
          id: newId,
          title: 'Yeni Sohbet',
          updated_at: new Date().toISOString()
        };
        setConversations(prev => [newConversation, ...prev]);
        setActiveConversation(newId);
        clearChat();
      }
    } catch (error) {
      console.error('Error creating conversation:', error);
      // Demo fallback
      const newId = Math.max(...conversations.map(c => c.id), 0) + 1;
      const newConversation = {
        id: newId,
        title: 'Yeni Sohbet',
        updated_at: new Date().toISOString()
      };
      setConversations(prev => [newConversation, ...prev]);
      setActiveConversation(newId);
      clearChat();
    }
  };

  const deleteConversation = async (id, e) => {
    e.stopPropagation(); // Prevent triggering conversation selection
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8000/api/conversations/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        setConversations(prev => prev.filter(conv => conv.id !== id));
        
        // If we deleted the active conversation, select another one
        if (activeConversation === id) {
          const remainingConversations = conversations.filter(conv => conv.id !== id);
          if (remainingConversations.length > 0) {
            setActiveConversation(remainingConversations[0].id);
          } else {
            setActiveConversation(null);
            clearChat();
          }
        }
      } else {
        console.error('Error deleting conversation:', response.statusText);
        // Demo fallback
        setConversations(prev => prev.filter(conv => conv.id !== id));
        
        if (activeConversation === id) {
          const remainingConversations = conversations.filter(conv => conv.id !== id);
          if (remainingConversations.length > 0) {
            setActiveConversation(remainingConversations[0].id);
          } else {
            setActiveConversation(null);
            clearChat();
          }
        }
      }
    } catch (error) {
      console.error('Error deleting conversation:', error);
      // Demo fallback
      setConversations(prev => prev.filter(conv => conv.id !== id));
      
      if (activeConversation === id) {
        const remainingConversations = conversations.filter(conv => conv.id !== id);
        if (remainingConversations.length > 0) {
          setActiveConversation(remainingConversations[0].id);
        } else {
          setActiveConversation(null);
          clearChat();
        }
      }
    }
  };

  const selectConversation = async (id) => {
    setActiveConversation(id);
    // Fetch messages for the selected conversation
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8000/api/conversations/${id}/messages`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        // Assuming your fetchChatHistory function can load messages for a specific conversation
        fetchChatHistory(selectedModel, id);
      } else {
        console.error('Error fetching conversation messages:', response.statusText);
      }
    } catch (error) {
      console.error('Error fetching conversation messages:', error);
    }
  };

  // Format date in a user-friendly way
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  return (
    <div className="sidebar">
      {children}
      
      <div className="sidebar-header">
        <div className="model-info">
          {selectedModel === 'api' ? (
            <>
              <FaRobot className="model-icon-small" />
              <span>Hazır API Modeli</span>
            </>
          ) : (
            <>
              <FaCalculator className="model-icon-small" />
              <span>Özel Eğitilmiş Model</span>
            </>
          )}
        </div>
        
        <button 
          className="new-chat-button" 
          onClick={createNewConversation}
          title="Yeni Sohbet"
        >
          <FaPlus /> <span>Yeni Sohbet</span>
        </button>
      </div>
      
      <div className="conversation-list">
        {loading ? (
          <div className="loading-conversations">Sohbetler yükleniyor...</div>
        ) : conversations.length === 0 ? (
          <div className="no-conversations">
            <p>Henüz sohbet bulunmuyor.</p>
            <button onClick={createNewConversation} className="start-chat-button">
              <FaPlus /> İlk sohbetinizi başlatın
            </button>
          </div>
        ) : (
          conversations.map(conv => (
            <div 
              key={conv.id} 
              className={`conversation-item ${activeConversation === conv.id ? 'active' : ''}`}
              onClick={() => selectConversation(conv.id)}
            >
              <div className="conversation-title">{conv.title}</div>
              <div className="conversation-date">{formatDate(conv.updated_at)}</div>
              <button 
                className="delete-conversation" 
                onClick={(e) => deleteConversation(conv.id, e)}
                title="Sohbeti Sil"
              >
                <FaTimes />
              </button>
            </div>
          ))
        )}
      </div>
      
      <div className="sidebar-buttons">
        <button 
          className="sidebar-button" 
          onClick={toggleTheme}
          title={theme === 'light' ? 'Karanlık Moda Geç' : 'Aydınlık Moda Geç'}
        >
          {theme === 'light' ? <FaMoon /> : <FaSun />}
        </button>
        
        <button 
          className="sidebar-button" 
          onClick={clearChat}
          title="Sohbeti Temizle"
        >
          <FaTrash />
        </button>
        
        <button 
          className="sidebar-button" 
          onClick={resetModelSelection}
          title="Model Seçimine Dön"
        >
          <FaChevronLeft />
        </button>
      </div>
    </div>
  );
};

export default Sidebar; 