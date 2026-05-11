import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

function ProfilePage() {
  const { user, updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: ''
  });
  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: ''
  });
  const [showPasswordForm, setShowPasswordForm] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        full_name: user.full_name || '',
        email: user.email || '',
        phone: user.phone || ''
      });
    }
  }, [user]);

  const getInitials = () => {
    if (!user?.full_name) return '?';
    return user.full_name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.put(
        'http://localhost:5000/api/auth/update-profile',
        formData,
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      
      if (response.data.success) {
        updateUser(response.data.user);
        toast.success('Profile updated successfully!');
        setIsEditing(false);
      }
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwordData.new_password !== passwordData.confirm_password) {
      toast.error('New passwords do not match');
      return;
    }
    if (passwordData.new_password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    
    setLoading(true);
    try {
      const response = await axios.post(
        'http://localhost:5000/api/auth/change-password',
        {
          current_password: passwordData.current_password,
          new_password: passwordData.new_password
        },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      
      if (response.data.success) {
        toast.success('Password changed successfully!');
        setPasswordData({ current_password: '', new_password: '', confirm_password: '' });
        setShowPasswordForm(false);
      }
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f3f4f6', padding: '40px 20px' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <div style={{ background: 'white', borderRadius: '20px', overflow: 'hidden', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
          
          {/* Header with Avatar */}
          <div style={{ 
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
            padding: '40px',
            textAlign: 'center',
            color: 'white'
          }}>
            <div style={{
              width: '100px',
              height: '100px',
              background: 'white',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px',
              fontSize: '40px',
              fontWeight: 'bold',
              color: '#4c1d95'
            }}>
              {getInitials()}
            </div>
            <h2 style={{ marginBottom: '5px' }}>{user?.full_name}</h2>
            <p style={{ opacity: 0.9 }}>{user?.email}</p>
          </div>
          
          {/* Profile Content */}
          <div style={{ padding: '30px' }}>
            {/* Profile Info Section */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ color: '#4c1d95' }}>Profile Information</h3>
              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  style={{ background: '#4c1d95', color: 'white', padding: '8px 20px', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
                >
                  Edit Profile
                </button>
              )}
            </div>
            
            {isEditing ? (
              <form onSubmit={handleUpdateProfile}>
                <div style={{ marginBottom: '15px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Full Name</label>
                  <input
                    type="text"
                    value={formData.full_name}
                    onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                    required
                    style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '8px' }}
                  />
                </div>
                <div style={{ marginBottom: '15px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    required
                    style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '8px' }}
                  />
                </div>
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Phone</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '8px' }}
                  />
                </div>
                <div style={{ display: 'flex', gap: '15px' }}>
                  <button type="submit" disabled={loading} style={{ background: '#10b981', color: 'white', padding: '12px 30px', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
                    {loading ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button type="button" onClick={() => setIsEditing(false)} style={{ background: '#6b7280', color: 'white', padding: '12px 30px', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div style={{ background: '#f3f4f6', borderRadius: '10px', padding: '20px' }}>
                <div style={{ marginBottom: '15px', display: 'flex', alignItems: 'center' }}>
                  <span style={{ width: '100px', fontWeight: 'bold' }}>👤 Full Name:</span>
                  <span>{formData.full_name}</span>
                </div>
                <div style={{ marginBottom: '15px', display: 'flex', alignItems: 'center' }}>
                  <span style={{ width: '100px', fontWeight: 'bold' }}>📧 Email:</span>
                  <span>{formData.email}</span>
                </div>
                <div style={{ marginBottom: '15px', display: 'flex', alignItems: 'center' }}>
                  <span style={{ width: '100px', fontWeight: 'bold' }}>📞 Phone:</span>
                  <span>{formData.phone || 'Not provided'}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <span style={{ width: '100px', fontWeight: 'bold' }}>📅 Joined:</span>
                  <span>{new Date(user?.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            )}
            
            {/* Password Change Section */}
            <div style={{ marginTop: '40px', borderTop: '1px solid #e5e7eb', paddingTop: '30px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 style={{ color: '#4c1d95' }}>Security</h3>
                {!showPasswordForm && (
                  <button
                    onClick={() => setShowPasswordForm(true)}
                    style={{ background: '#f59e0b', color: 'white', padding: '8px 20px', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
                  >
                    Change Password
                  </button>
                )}
              </div>
              
              {showPasswordForm && (
                <form onSubmit={handleChangePassword}>
                  <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Current Password</label>
                    <input
                      type="password"
                      value={passwordData.current_password}
                      onChange={(e) => setPasswordData({...passwordData, current_password: e.target.value})}
                      required
                      style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '8px' }}
                    />
                  </div>
                  <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>New Password</label>
                    <input
                      type="password"
                      value={passwordData.new_password}
                      onChange={(e) => setPasswordData({...passwordData, new_password: e.target.value})}
                      required
                      style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '8px' }}
                    />
                  </div>
                  <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Confirm New Password</label>
                    <input
                      type="password"
                      value={passwordData.confirm_password}
                      onChange={(e) => setPasswordData({...passwordData, confirm_password: e.target.value})}
                      required
                      style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '8px' }}
                    />
                  </div>
                  <div style={{ display: 'flex', gap: '15px' }}>
                    <button type="submit" disabled={loading} style={{ background: '#10b981', color: 'white', padding: '12px 30px', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
                      {loading ? 'Changing...' : 'Change Password'}
                    </button>
                    <button type="button" onClick={() => setShowPasswordForm(false)} style={{ background: '#6b7280', color: 'white', padding: '12px 30px', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProfilePage;