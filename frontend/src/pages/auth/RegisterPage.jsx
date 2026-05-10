import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

function RegisterPage() {
  const [formData, setFormData] = useState({ full_name: '', email: '', password: '', confirmPassword: '', phone: '' });
  const [loading, setLoading] = useState(false);
  const { register, loginWithGoogle, loginWithFacebook } = useAuth();  // ✅ YEH LINE FIX KIYA
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      alert('Passwords do not match');
      return;
    }
    setLoading(true);
    const { confirmPassword, ...data } = formData;
    const success = await register(data);
    if (success) navigate('/');
    setLoading(false);
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div style={{ background: 'white', borderRadius: '20px', padding: '40px', maxWidth: '450px', width: '100%' }}>
        <h1 style={{ textAlign: 'center', marginBottom: '30px' }}>Create Account</h1>
        
        <form onSubmit={handleSubmit}>
          <input type="text" placeholder="Full Name" value={formData.full_name} onChange={(e) => setFormData({...formData, full_name: e.target.value})} style={{ width: '100%', padding: '12px', marginBottom: '15px', border: '1px solid #ddd', borderRadius: '8px' }} required />
          <input type="email" placeholder="Email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} style={{ width: '100%', padding: '12px', marginBottom: '15px', border: '1px solid #ddd', borderRadius: '8px' }} required />
          <input type="tel" placeholder="Phone" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} style={{ width: '100%', padding: '12px', marginBottom: '15px', border: '1px solid #ddd', borderRadius: '8px' }} />
          <input type="password" placeholder="Password" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} style={{ width: '100%', padding: '12px', marginBottom: '15px', border: '1px solid #ddd', borderRadius: '8px' }} required />
          <input type="password" placeholder="Confirm Password" value={formData.confirmPassword} onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})} style={{ width: '100%', padding: '12px', marginBottom: '20px', border: '1px solid #ddd', borderRadius: '8px' }} required />
          
          <button type="submit" disabled={loading} style={{ width: '100%', background: '#4c1d95', color: 'white', padding: '12px', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
            {loading ? 'Creating...' : 'Register'}
          </button>
        </form>
         
        {/* Divider */}
        <div style={{ display: 'flex', alignItems: 'center', margin: '25px 0' }}>
          <div style={{ flex: 1, height: '1px', background: '#ddd' }}></div>
          <span style={{ padding: '0 15px', color: '#6b7280' }}>OR</span>
          <div style={{ flex: 1, height: '1px', background: '#ddd' }}></div>
        </div>
        
        {/* Social Login Buttons */}
        <div style={{ display: 'flex', gap: '15px' }}>
          <button 
            onClick={loginWithGoogle}
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
            onClick={loginWithFacebook}
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
        
        <p style={{ textAlign: 'center', marginTop: '20px' }}>
          Already have an account? <Link to="/login" style={{ color: '#4c1d95' }}>Login</Link>
        </p>
      </div>
    </div>
  );
}

export default RegisterPage;