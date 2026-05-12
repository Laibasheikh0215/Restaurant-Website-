import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await axios.post('http://localhost:5000/api/auth/login', { 
        email, 
        password 
      });
      
      if (response.data.success) {
        localStorage.setItem('token', response.data.token);
        toast.success('Login successful!');
        
        // Use navigate instead of window.location
        if (response.data.user.role === 'admin') {
          navigate('/admin');
        } else {
          navigate('/');
        }
      }
    } catch (error) {
      toast.error(error.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  // Google Login Handler
  const handleGoogleLogin = async () => {
    try {
      const { auth, googleProvider, signInWithPopup } = await import('../../config/firebase');
      const result = await signInWithPopup(auth, googleProvider);
      const { email, displayName, uid } = result.user;
      
      const response = await axios.post('http://localhost:5000/api/auth/social-login', {
        email: email,
        full_name: displayName || email.split('@')[0],
        provider: 'google',
        provider_id: uid
      });
      
      if (response.data.success) {
        localStorage.setItem('token', response.data.token);
        toast.success(`Welcome ${response.data.user.full_name}!`);
        
        if (response.data.user.role === 'admin') {
          navigate('/admin');
        } else {
          navigate('/');
        }
      }
    } catch (error) {
      console.error('Google login error:', error);
      toast.error('Google login failed');
    }
  };

  // Facebook Login Handler
  const handleFacebookLogin = async () => {
    try {
      const { auth, facebookProvider, signInWithPopup } = await import('../../config/firebase');
      const result = await signInWithPopup(auth, facebookProvider);
      const { email, displayName, uid } = result.user;
      
      const response = await axios.post('http://localhost:5000/api/auth/social-login', {
        email: email,
        full_name: displayName || email.split('@')[0],
        provider: 'facebook',
        provider_id: uid
      });
      
      if (response.data.success) {
        localStorage.setItem('token', response.data.token);
        toast.success(`Welcome ${response.data.user.full_name}!`);
        
        if (response.data.user.role === 'admin') {
          navigate('/admin');
        } else {
          navigate('/');
        }
      }
    } catch (error) {
      console.error('Facebook login error:', error);
      toast.error('Facebook login failed');
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div style={{ background: 'white', borderRadius: '20px', padding: '40px', maxWidth: '400px', width: '100%', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>
        
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <span style={{ fontSize: '50px' }}>🍽️</span>
          <h1 style={{ marginTop: '10px', color: '#4c1d95' }}>Welcome Back</h1>
        </div>
        
        <form onSubmit={handleSubmit}>
          <input 
            type="email" 
            placeholder="Email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            style={{ width: '100%', padding: '14px', marginBottom: '15px', border: '1px solid #ddd', borderRadius: '10px', fontSize: '16px' }} 
            required 
          />
          <input 
            type="password" 
            placeholder="Password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            style={{ width: '100%', padding: '14px', marginBottom: '20px', border: '1px solid #ddd', borderRadius: '10px', fontSize: '16px' }} 
            required 
          />
          <button 
            type="submit" 
            disabled={loading} 
            style={{ width: '100%', background: '#4c1d95', color: 'white', padding: '14px', border: 'none', borderRadius: '10px', cursor: 'pointer', fontSize: '16px', fontWeight: 'bold' }}
          >
            {loading ? 'Loading...' : 'Login'}
          </button>
        </form>
        
        <div style={{ textAlign: 'center', marginTop: '15px' }}>
          <Link to="/forgot-password" style={{ color: '#4c1d95', fontSize: '14px' }}>Forgot Password?</Link>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', margin: '25px 0' }}>
          <div style={{ flex: 1, height: '1px', background: '#ddd' }}></div>
          <span style={{ padding: '0 15px', color: '#6b7280' }}>OR</span>
          <div style={{ flex: 1, height: '1px', background: '#ddd' }}></div>
        </div>
        
        <div style={{ display: 'flex', gap: '15px' }}>
          <button 
            onClick={handleGoogleLogin}
            style={{ 
              flex: 1, 
              background: '#db4437', 
              color: 'white', 
              padding: '12px', 
              border: 'none', 
              borderRadius: '10px', 
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              fontSize: '14px',
              fontWeight: 'bold'
            }}
          >
            <span style={{ fontSize: '18px' }}>G</span> Google
          </button>
          <button 
            onClick={handleFacebookLogin}
            style={{ 
              flex: 1, 
              background: '#4267B2', 
              color: 'white', 
              padding: '12px', 
              border: 'none', 
              borderRadius: '10px', 
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              fontSize: '14px',
              fontWeight: 'bold'
            }}
          >
            <span style={{ fontSize: '18px' }}>f</span> Facebook
          </button>
        </div>
        
        <p style={{ textAlign: 'center', marginTop: '25px', color: '#6b7280' }}>
          Don't have an account? <Link to="/register" style={{ color: '#4c1d95', fontWeight: 'bold' }}>Register</Link>
        </p>
      </div>
    </div>
  );
}

export default LoginPage;