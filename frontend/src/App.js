import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import Header from './components/Layout/Header';
import Footer from './components/Layout/Footer';
import Sidebar from './components/Sidebar/Sidebar';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import UserProfile from './components/UserProfile';
import ChatArea from './components/ChatArea';
import LandingPage from './components/Layout/LandingPage';

function App() {
  const [user, setUser] = useState(null);
  const [chats, setChats] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [isDarkMode, setIsDarkMode] = useState(
    localStorage.getItem('darkMode') === 'true'
  );

  useEffect(() => {
    // Kullanıcı verilerini yükle ve format tutarlılığı sağla
    const loadUserData = () => {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        try {
          const userData = JSON.parse(storedUser);
          
          // Tutarlı alan adları sağla (camelCase ve snake_case karışımını düzelt)
          const normalizedUser = {
            id: userData.id || userData.user_id || null,
            email: userData.email || '',
            name: userData.name || userData.username || '',
            created_at: userData.created_at || userData.createdAt || new Date().toISOString(),
            last_login: userData.last_login || userData.lastLogin || null
          };
          
          setUser(normalizedUser);
          localStorage.setItem('user', JSON.stringify(normalizedUser));
        } catch (error) {
          console.error('User data parsing error:', error);
        }
      }
    };
    
    loadUserData();

    // Eğer localStorage'da chat yok ise veya oturum açtıktan sonra yüklüyorsak API'den çekmeyi deneyelim
    const loadChats = async () => {
      try {
        if (localStorage.getItem('token')) {
          // API'den chat geçmişini yüklemeyi dene
          const response = await fetch('http://localhost:8000/api/chats', {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          });
          
          if (response.ok) {
            const chatData = await response.json();
            setChats(chatData);
            localStorage.setItem('chats', JSON.stringify(chatData));
            return;
          }
        }
        
        // API çağrısı başarısız olursa localStorage'dan yükle
        const storedChats = localStorage.getItem('chats');
        if (storedChats) {
          setChats(JSON.parse(storedChats));
        }
      } catch (err) {
        console.error('Sohbet geçmişi yüklenirken hata:', err);
        // Hata durumunda localStorage'dan yükle
        const storedChats = localStorage.getItem('chats');
        if (storedChats) {
          setChats(JSON.parse(storedChats));
        }
      }
    };
    
    loadChats();
  }, []);

  useEffect(() => {
    localStorage.setItem('darkMode', isDarkMode);
    document.body.classList.toggle('dark-mode', isDarkMode);
  }, [isDarkMode]);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  const handleLogin = (userData) => {
    // Tutarlı alan adları sağla
    const normalizedUser = {
      id: userData.id || userData.user_id || null,
      email: userData.email || '',
      name: userData.name || userData.username || '',
      created_at: userData.created_at || userData.createdAt || new Date().toISOString(),
      last_login: userData.last_login || userData.lastLogin || null
    };
    
    setUser(normalizedUser);
    localStorage.setItem('user', JSON.stringify(normalizedUser));
  };

  const handleLogout = () => {
    setUser(null);
    setChats([]);
    setActiveChat(null);
    localStorage.removeItem('user');
    localStorage.removeItem('chats');
    localStorage.removeItem('token');
  };

  const handleUpdateUser = (updatedUser) => {
    // Tutarlı alan adları sağla
    const normalizedUser = {
      ...user,
      ...updatedUser,
      id: updatedUser.id || updatedUser.user_id || user.id,
      name: updatedUser.name || updatedUser.username || user.name,
      created_at: updatedUser.created_at || updatedUser.createdAt || user.created_at,
      last_login: updatedUser.last_login || updatedUser.lastLogin || user.last_login
    };
    
    setUser(normalizedUser);
    localStorage.setItem('user', JSON.stringify(normalizedUser));
  };

  const handleNewChat = async () => {
    const newChat = {
      id: Date.now().toString(),
      title: 'Yeni Sohbet',
      messages: [],
      createdAt: new Date().toISOString()
    };

    try {
      const response = await fetch('http://localhost:8000/api/chats', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(newChat)
      });

      if (response.ok) {
        const savedChat = await response.json();
        if (!savedChat.messages) savedChat.messages = [];
        const updatedChats = [savedChat, ...chats];
        setChats(updatedChats);
        setActiveChat(savedChat);
        localStorage.setItem('chats', JSON.stringify(updatedChats));
      } else {
        // Fallback to local storage in demo mode
        const updatedChats = [newChat, ...chats];
        setChats(updatedChats);
        setActiveChat(newChat);
        localStorage.setItem('chats', JSON.stringify(updatedChats));
      }
    } catch (err) {
      console.error('Error creating new chat:', err);
      // Fallback to local storage in demo mode
      const updatedChats = [newChat, ...chats];
      setChats(updatedChats);
      setActiveChat(newChat);
      localStorage.setItem('chats', JSON.stringify(updatedChats));
    }
  };

  const handleDeleteChat = async (chatId) => {
    try {
      const response = await fetch(`http://localhost:8000/api/chats/${chatId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const updatedChats = chats.filter(chat => chat.id !== chatId);
        setChats(updatedChats);
        if (activeChat?.id === chatId) {
          setActiveChat(null);
        }
        localStorage.setItem('chats', JSON.stringify(updatedChats));
      }
    } catch (err) {
      console.error('Error deleting chat:', err);
      // Fallback to local storage in demo mode
      const updatedChats = chats.filter(chat => chat.id !== chatId);
      setChats(updatedChats);
      if (activeChat?.id === chatId) {
        setActiveChat(null);
      }
      localStorage.setItem('chats', JSON.stringify(updatedChats));
    }
  };

  return (
    <Router>
      <div className={`app ${isDarkMode ? 'dark' : 'light'}`}>
        <Header 
          user={user} 
          onLogout={handleLogout} 
          isDarkMode={isDarkMode}
          toggleDarkMode={toggleDarkMode}
        />
        <main className="main-content">
          <Routes>
            <Route
              path="/login"
              element={
                user ? (
                  <Navigate to="/" />
                ) : (
                  <Login onLogin={handleLogin} isDarkMode={isDarkMode} />
                )
              }
            />
            <Route
              path="/register"
              element={
                user ? (
                  <Navigate to="/" />
                ) : (
                  <Register onLogin={handleLogin} isDarkMode={isDarkMode} />
                )
              }
            />
            <Route
              path="/profile"
              element={
                user ? (
                  <UserProfile
                    user={user}
                    onLogout={handleLogout}
                    onUpdateUser={handleUpdateUser}
                    isDarkMode={isDarkMode}
                  />
                ) : (
                  <Navigate to="/login" />
                )
              }
            />
            <Route
              path="/chat"
              element={
                user ? (
                  <div className="chat-layout">
                    <Sidebar
                      chats={chats}
                      activeChat={activeChat}
                      onChatSelect={setActiveChat}
                      onNewChat={handleNewChat}
                      onDeleteChat={handleDeleteChat}
                      isDarkMode={isDarkMode}
                      user={user}
                    />
                    <div className="chat-container">
                      {activeChat ? (
                        <ChatArea
                          messages={activeChat.messages || []}
                          onSendMessage={async (message) => {
                            // Öncelikle UI'ı güncelleyelim
                            const newMessage = {
                              id: Date.now().toString(),
                              content: message,
                              sender: 'user',
                              timestamp: new Date().toISOString()
                            };
                            
                            const updatedChat = {
                              ...activeChat,
                              messages: [...(activeChat.messages || []), newMessage]
                            };
                            
                            // UI'yi hemen güncelle (optimistik güncelleme)
                            const updatedChats = chats.map(chat => 
                              chat.id === activeChat.id ? updatedChat : chat
                            );
                            setChats(updatedChats);
                            setActiveChat(updatedChat);
                            localStorage.setItem('chats', JSON.stringify(updatedChats));
                            
                            try {
                              // Mesajı API'ye gönder
                              const response = await fetch('http://localhost:8000/api/math-solver', {
                                method: 'POST',
                                headers: {
                                  'Content-Type': 'application/json',
                                  'Authorization': `Bearer ${localStorage.getItem('token')}`
                                },
                                body: JSON.stringify({
                                  message: message,
                                  model_type: 'local'
                                })
                              });
                              
                              if (response.ok) {
                                const data = await response.json();
                                
                                // Bot yanıtını da ekleyelim
                                const botResponse = {
                                  id: Date.now().toString() + 1,
                                  content: data.response,
                                  sender: 'bot',
                                  timestamp: new Date().toISOString()
                                };
                                
                                const finalChat = {
                                  ...updatedChat,
                                  messages: [...(updatedChat.messages || []), botResponse]
                                };
                                
                                const finalChats = chats.map(chat => 
                                  chat.id === activeChat.id ? finalChat : chat
                                );
                                
                                setChats(finalChats);
                                setActiveChat(finalChat);
                                localStorage.setItem('chats', JSON.stringify(finalChats));
                              }
                            } catch (err) {
                              console.error('Mesaj gönderme hatası:', err);
                              // Hata durumunda basit bir bot yanıtı gösterelim
                              const errorResponse = {
                                id: Date.now().toString() + 1,
                                content: "Üzgünüm, bir hata oluştu. Lütfen tekrar deneyin.",
                                sender: 'bot',
                                timestamp: new Date().toISOString()
                              };
                              
                              const errorChat = {
                                ...updatedChat,
                                messages: [...(updatedChat.messages || []), errorResponse]
                              };
                              
                              const errorChats = chats.map(chat => 
                                chat.id === activeChat.id ? errorChat : chat
                              );
                              
                              setChats(errorChats);
                              setActiveChat(errorChat);
                              localStorage.setItem('chats', JSON.stringify(errorChats));
                            }
                          }}
                          theme={isDarkMode ? 'dark' : 'light'}
                          isLoading={false}
                        />
                      ) : (
                        <div className="welcome-message">
                          <h2>Hoş Geldiniz, {user.name || 'Kullanıcı'}!</h2>
                          <p>Yeni bir sohbet başlatmak için sol menüden "Yeni Sohbet" butonuna tıklayın.</p>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <Navigate to="/login" />
                )
              }
            />
            <Route
              path="/"
              element={
                user ? (
                  <Navigate to="/chat" />
                ) : (
                  <LandingPage isDarkMode={isDarkMode} />
                )
              }
            />
          </Routes>
        </main>
        <Footer isDarkMode={isDarkMode} />
      </div>
    </Router>
  );
}

export default App; 