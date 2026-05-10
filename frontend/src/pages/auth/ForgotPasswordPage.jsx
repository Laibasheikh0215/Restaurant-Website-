import React, { useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      toast.error('Please enter your email');
      return;
    }
    
    setLoading(true);
    try {
      const response = await axios.post('http://localhost:5000/api/auth/forgot-password', { email });
      
      if (response.data.success) {
        setSent(true);
        toast.success('Reset link sent to your email!');
      }
    } catch (error) {
      console.error('Forgot password error:', error);
      toast.error(error.response?.data?.error || 'Failed to send reset link');
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
        <div style={{ background: 'white', borderRadius: '20px', padding: '40px', textAlign: 'center', maxWidth: '450px', width: '100%' }}>
          <span style={{ fontSize: '60px' }}>📧</span>
          <h2 style={{ marginTop: '20px', color: '#4c1d95' }}>Check Your Email</h2>
          <p style={{ color: '#6b7280', marginTop: '10px' }}>
            We've sent a password reset link to <strong>{email}</strong>
          </p>
          <p style={{ color: '#6b7280', fontSize: '14px' }}>
            The link will expire in 1 hour.
          </p>
          <Link to="/login" style={{ display: 'inline-block', marginTop: '30px', background: '#4c1d95', color: 'white', padding: '12px 30px', textDecoration: 'none', borderRadius: '8px' }}>
            Back to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div style={{ background: 'white', borderRadius: '20px', padding: '40px', maxWidth: '450px', width: '100%' }}>
        <h1 style={{ textAlign: 'center', marginBottom: '10px', color: '#4c1d95' }}>Forgot Password?</h1>
        <p style={{ textAlign: 'center', marginBottom: '30px', color: '#6b7280' }}>
          Enter your email address and we'll send you a link to reset your password.
        </p>
        
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{ width: '100%', padding: '14px', marginBottom: '20px', border: '1px solid #ddd', borderRadius: '8px', fontSize: '16px' }}
            required
          />
          
          <button
            type="submit"
            disabled={loading}
            style={{ width: '100%', background: '#4c1d95', color: 'white', padding: '14px', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '16px', fontWeight: 'bold' }}
          >
            {loading ? 'Sending...' : 'Send Reset Link'}
          </button>
        </form>
        
        <p style={{ textAlign: 'center', marginTop: '20px' }}>
          <Link to="/login" style={{ color: '#4c1d95' }}>Back to Login</Link>
        </p>
      </div>
    </div>
  );
}

export default ForgotPasswordPage;