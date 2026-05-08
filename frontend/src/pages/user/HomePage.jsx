import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

function HomePage() {
  const { user } = useAuth();

  return (
    <div>
      <div style={{ minHeight: '80vh', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', color: 'white', padding: '20px' }}>
        <div>
          <h1 style={{ fontSize: '48px', marginBottom: '20px' }}>Welcome to Gourmet 3D 🍽️</h1>
          <p style={{ fontSize: '20px', marginBottom: '30px', maxWidth: '600px' }}>Experience fine dining with easy table booking, food ordering, and event management.</p>
          <div style={{ display: 'flex', gap: '20px', justifyContent: 'center' }}>
            {user ? (
              <>
                <Link to="/menu" style={{ background: 'white', color: '#4c1d95', padding: '12px 30px', borderRadius: '30px', textDecoration: 'none', fontWeight: 'bold' }}>Order Food</Link>
                <Link to="/table-booking" style={{ background: 'transparent', border: '2px solid white', color: 'white', padding: '12px 30px', borderRadius: '30px', textDecoration: 'none' }}>Book Table</Link>
              </>
            ) : (
              <>
                <Link to="/register" style={{ background: 'white', color: '#4c1d95', padding: '12px 30px', borderRadius: '30px', textDecoration: 'none', fontWeight: 'bold' }}>Get Started</Link>
                <Link to="/login" style={{ background: 'transparent', border: '2px solid white', color: 'white', padding: '12px 30px', borderRadius: '30px', textDecoration: 'none' }}>Login</Link>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default HomePage;