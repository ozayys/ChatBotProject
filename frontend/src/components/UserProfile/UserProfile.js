import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUser, FaEnvelope, FaCalendar, FaIdCard, FaEdit, FaSave, FaTimes, FaSignOutAlt, FaDatabase } from 'react-icons/fa';
import './UserProfile.css';

const UserProfile = ({ user, onLogout, isDarkMode, onUpdateUser }) => {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/users/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ name })
      });

      const data = await response.json();

      if (response.ok) {
        onUpdateUser({ ...user, name });
        setIsEditing(false);
      } else {
        setError(data.message || 'Güncelleme başarısız');
      }
    } catch (err) {
      setError('Sunucu hatası. Lütfen daha sonra tekrar deneyin.');
      console.error('Profile update error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    onLogout();
    navigate('/login');
  };

  // Format date or show a placeholder if invalid
  const formatDate = (dateString) => {
    if (!dateString || dateString === 'Invalid Date') {
      return 'Bilgi yok';
    }
    try {
      return new Date(dateString).toLocaleDateString('tr-TR');
    } catch (e) {
      return 'Bilgi yok';
    }
  };

  if (!user) return null;

  return (
    <div className={`profile-container ${isDarkMode ? 'dark' : 'light'}`}>
      <div className="profile-box">
        <h2>Profil Bilgileri</h2>
        {error && <div className="error-message">{error}</div>}
        
        <div className="profile-info">
          <div className="info-group">
            <label><FaIdCard /> Kullanıcı ID</label>
            <p className="info-value">{user.id}</p>
          </div>
          
          <div className="info-group">
            <label><FaEnvelope /> E-posta</label>
            <p className="info-value">{user.email}</p>
          </div>
          
          <div className="info-group">
            {isEditing ? (
              <form onSubmit={handleSubmit} className="edit-form">
                <label htmlFor="name"><FaUser /> İsim</label>
                <div className="edit-name-container">
                  <input
                    type="text"
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="name-input"
                    placeholder="İsminizi girin"
                  />
                  <div className="edit-buttons">
                    <button 
                      type="submit" 
                      className="save-button"
                      disabled={loading}
                      title="Kaydet"
                    >
                      {loading ? 'Kaydediliyor...' : <FaSave />}
                    </button>
                    <button 
                      type="button"
                      className="cancel-button"
                      onClick={() => {
                        setIsEditing(false);
                        setName(user.name);
                      }}
                      title="İptal"
                    >
                      <FaTimes />
                    </button>
                  </div>
                </div>
              </form>
            ) : (
              <>
                <label><FaUser /> İsim</label>
                <div className="name-container">
                  <p className="info-value">{user.name}</p>
                  <button 
                    className="edit-button"
                    onClick={() => setIsEditing(true)}
                    title="İsim düzenle"
                  >
                    <FaEdit />
                  </button>
                </div>
              </>
            )}
          </div>
          
          <div className="info-group">
            <label><FaCalendar /> Katılma Tarihi</label>
            <p className="info-value">{formatDate(user.createdAt)}</p>
          </div>

          {/* Veritabanı Durumu */}
          <div className="info-group">
            <label><FaDatabase /> Veritabanı Durumu</label>
            <div className={`database-status-badge ${user.database_connected ? 'connected' : 'demo'}`}>
              {user.database_connected 
                ? 'Veritabanına bağlı (SQL Server)' 
                : 'Demo mod (veritabanı bağlantısı yok)'}
            </div>
          </div>
        </div>

        <div className="profile-actions">
          <button 
            className="logout-button"
            onClick={handleLogout}
          >
            <FaSignOutAlt /> Çıkış Yap
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserProfile; 