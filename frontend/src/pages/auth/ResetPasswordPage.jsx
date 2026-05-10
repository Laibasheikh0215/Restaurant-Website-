import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';

function ResetPasswordPage() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetDone, setResetDone] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    
    setLoading(true);
    try {
      const response = await axios.post(`http://localhost:5000/api/auth/reset-password/${token}`, {
        new_password: password
      });
      
      if (response.data.success) {
        setResetDone(true);
        toast.success('Password reset successful!');
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      }
    } catch (error) {
      console.error('Reset error:', error);
      toast.error(error.response?.data?.error || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  if (resetDone) {
    return (
      <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
        <div style={{ background: 'white', borderRadius: '20px', padding: '40px', textAlign: 'center', maxWidth: '450px', width: '100%' }}>
          <span style={{ fontSize: '60px' }}>✅</span>
          <h2 style={{ marginTop: '20px', color: '#4c1d95' }}>Password Reset Successful!</h2>
          <p style={{ color: '#6b7280', marginTop: '10px' }}>
            Your password has been changed successfully.
          </p>
          <p style={{ color: '#6b7280' }}>
            Redirecting you to login page...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div style={{ background: 'white', borderRadius: '20px', padding: '40px', maxWidth: '450px', width: '100%' }}>
        <h1 style={{ textAlign: 'center', marginBottom: '30px', color: '#4c1d95' }}>Create New Password</h1>
        
        <form onSubmit={handleSubmit}>
          <input
            type="password"
            placeholder="New Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ width: '100%', padding: '14px', marginBottom: '15px', border: '1px solid #ddd', borderRadius: '8px', fontSize: '16px' }}
            required
          />
          
          <input
            type="password"
            placeholder="Confirm New Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            style={{ width: '100%', padding: '14px', marginBottom: '20px', border: '1px solid #ddd', borderRadius: '8px', fontSize: '16px' }}
            required
          />
          
          <button
            type="submit"
            disabled={loading}
            style={{ width: '100%', background: '#4c1d95', color: 'white', padding: '14px', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '16px', fontWeight: 'bold' }}
          >
            {loading ? 'Resetting...' : 'Reset Password'}
          </button>
        </form>
        
        <p style={{ textAlign: 'center', marginTop: '20px' }}>
          <a href="/login" style={{ color: '#4c1d95' }}>Back to Login</a>
        </p>
      </div>
    </div>
  );
}

export default ResetPasswordPage;