import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import ProfileDropdown from './ProfileDropdown';

function Navbar() {
  const { user } = useAuth();
  const { getCount } = useCart();

  const navLinks = user?.role === 'admin' ? [
    { path: '/admin', label: 'Dashboard' },
    { path: '/admin/menu', label: 'Menu' },
    { path: '/admin/locations', label: 'Locations' },
    { path: '/admin/bookings', label: 'Bookings' },
    { path: '/admin/users', label: 'Users' },
    { path: '/admin/reports', label: 'Reports' }
  ] : [
    { path: '/', label: 'Home' },
    { path: '/menu', label: 'Menu' },
    { path: '/table-booking', label: 'Book Table' },
    { path: '/event-booking', label: 'Events' },
    { path: '/my-bookings', label: 'My Bookings' }
  ];

  return (
    <nav style={{ 
      background: '#4c1d95', 
      color: 'white', 
      padding: '12px 20px', 
      position: 'sticky', 
      top: 0, 
      zIndex: 100,
      boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
    }}>
      <div style={{ 
        maxWidth: '1200px', 
        margin: '0 auto', 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        flexWrap: 'wrap', 
        gap: '15px' 
      }}>
        
        {/* Logo */}
        <Link to="/" style={{ 
          color: 'white', 
          textDecoration: 'none', 
          fontSize: '24px', 
          fontWeight: 'bold',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <span style={{ fontSize: '28px' }}>🍽️</span>
          <span>Gourmet 3D</span>
        </Link>
        
        {/* Navigation Links */}
        <div style={{ 
          display: 'flex', 
          gap: '20px', 
          alignItems: 'center', 
          flexWrap: 'wrap' 
        }}>
          {navLinks.map(link => (
            <Link 
              key={link.path} 
              to={link.path} 
              style={{ 
                color: 'white', 
                textDecoration: 'none', 
                fontSize: '14px',
                fontWeight: '500',
                transition: 'opacity 0.3s'
              }}
              onMouseEnter={(e) => e.target.style.opacity = '0.8'}
              onMouseLeave={(e) => e.target.style.opacity = '1'}
            >
              {link.label}
            </Link>
          ))}
        </div>
        
        {/* Right Side - Cart & Profile */}
        <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
          {user ? (
            <>
              {/* Cart Icon */}
              <Link to="/cart" style={{ 
                color: 'white', 
                textDecoration: 'none', 
                position: 'relative',
                fontSize: '20px'
              }}>
                🛒
                {getCount() > 0 && (
                  <span style={{
                    position: 'absolute',
                    top: '-10px',
                    right: '-15px',
                    background: '#ef4444',
                    borderRadius: '50%',
                    padding: '2px 6px',
                    fontSize: '11px',
                    fontWeight: 'bold',
                    minWidth: '18px',
                    textAlign: 'center'
                  }}>
                    {getCount()}
                  </span>
                )}
              </Link>
              
              {/* Profile Dropdown */}
              <ProfileDropdown />
            </>
          ) : (
            <div style={{ display: 'flex', gap: '15px' }}>
              <Link 
                to="/login" 
                style={{ 
                  color: 'white', 
                  textDecoration: 'none',
                  padding: '6px 15px',
                  borderRadius: '8px',
                  transition: 'background 0.3s'
                }}
                onMouseEnter={(e) => e.target.style.background = 'rgba(255,255,255,0.1)'}
                onMouseLeave={(e) => e.target.style.background = 'transparent'}
              >
                Login
              </Link>
              <Link 
                to="/register" 
                style={{ 
                  color: 'white', 
                  textDecoration: 'none',
                  background: 'rgba(255,255,255,0.2)',
                  padding: '6px 15px',
                  borderRadius: '8px',
                  transition: 'background 0.3s'
                }}
                onMouseEnter={(e) => e.target.style.background = 'rgba(255,255,255,0.3)'}
                onMouseLeave={(e) => e.target.style.background = 'rgba(255,255,255,0.2)'}
              >
                Register
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;