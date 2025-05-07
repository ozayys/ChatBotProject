import React, { useState, useEffect } from 'react';
import { FaUser, FaSignOutAlt, FaCog, FaChevronDown, FaChevronUp, FaCalendarAlt, FaIdCard } from 'react-icons/fa';
import './UserProfile.css';

const UserProfile = ({ user, onLogout }) => {
  const [showDetails, setShowDetails] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(user?.name || '');
  
  // Update name when user changes
  useEffect(() => {
    if (user?.name) {
      setEditedName(user.name);
    }
  }, [user]);

  const handleUpdateProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8000/api/users/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: editedName
        })
      });
      
      if (response.ok) {
        // Update local storage with new name
        const userData = JSON.parse(localStorage.getItem('user'));
        if (userData) {
          userData.name = editedName;
          localStorage.setItem('user', JSON.stringify(userData));
        }
        setIsEditing(false);
      } else {
        console.error('Error updating profile:', response.statusText);
        // Demo mode - update anyway
        const userData = JSON.parse(localStorage.getItem('user'));
        if (userData) {
          userData.name = editedName;
          localStorage.setItem('user', JSON.stringify(userData));
        }
        setIsEditing(false);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      // Demo mode - update anyway
      const userData = JSON.parse(localStorage.getItem('user'));
      if (userData) {
        userData.name = editedName;
        localStorage.setItem('user', JSON.stringify(userData));
      }
      setIsEditing(false);
    }
  };

  const toggleDetails = () => {
    setShowDetails(!showDetails);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Bilgi yok';
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Geçersiz tarih';
      
      return date.toLocaleDateString('tr-TR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      console.error('Date formatting error:', error);
      return 'Tarih biçimlendirme hatası';
    }
  };
  
  // Early return if no user
  if (!user) return null;

  return (
    <div className="user-profile">
      <div className="user-info" onClick={toggleDetails}>
        <div className="user-avatar">
          <FaUser />
        </div>
        <div className="user-details">
          {isEditing ? (
            <input
              type="text"
              value={editedName}
              onChange={(e) => setEditedName(e.target.value)}
              className="edit-name-input"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleUpdateProfile();
                }
              }}
              autoFocus
            />
          ) : (
            <span className="user-name" onDoubleClick={() => setIsEditing(true)}>
              {editedName || 'İsimsiz Kullanıcı'}
            </span>
          )}
          <span className="user-email">{user.email || 'E-posta yok'}</span>
        </div>
        <button className="toggle-details-button" aria-label="Detayları göster/gizle">
          {showDetails ? <FaChevronUp /> : <FaChevronDown />}
        </button>
      </div>
      
      {showDetails && (
        <div className="user-details-expanded">
          <div className="user-detail-item">
            <span className="detail-label">
              <FaIdCard className="detail-icon" /> Kullanıcı ID:
            </span>
            <span className="detail-value">{user.id || user.user_id || 'Bilgi yok'}</span>
          </div>
          <div className="user-detail-item">
            <span className="detail-label">
              <FaCalendarAlt className="detail-icon" /> Katılma Tarihi:
            </span>
            <span className="detail-value">
              {formatDate(user.created_at || user.createdAt)}
            </span>
          </div>
          <div className="user-actions">
            <button className="action-button settings-button">
              <FaCog />
              <span>Ayarlar</span>
            </button>
          </div>
        </div>
      )}
      
      <button 
        className="logout-button" 
        onClick={onLogout}
        aria-label="Çıkış Yap"
      >
        <FaSignOutAlt />
        <span>Çıkış Yap</span>
      </button>
    </div>
  );
};

export default UserProfile; 