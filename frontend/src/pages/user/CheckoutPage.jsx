import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

// GLOBAL CSS IN JS
const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;1,700&family=DM+Sans:wght@400;500;600;700&display=swap');
  *, *::before, *::after { box-sizing: border-box; }

  @keyframes fadeSlideUp {
    from { opacity: 0; transform: translateY(28px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes navSlideDown {
    from { opacity: 0; transform: translateY(-20px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes spin { to { transform: rotate(360deg); } }
  @keyframes successPop {
    0%   { opacity: 0; transform: scale(0.85); }
    70%  { transform: scale(1.03); }
    100% { opacity: 1; transform: scale(1); }
  }
  @keyframes checkDraw {
    from { stroke-dashoffset: 100; }
    to   { stroke-dashoffset: 0; }
  }

  .nav-bar     { animation: navSlideDown 0.5s ease both; }
  .checkout-content { animation: fadeSlideUp 0.6s ease 0.1s both; }
  .nav-link:hover    { color: #fff !important; }
  .footer-link:hover { color: rgba(255,255,255,0.7) !important; }

  .order-item-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 14px 0;
    border-bottom: 1px solid rgba(255,255,255,0.05);
    transition: background 0.15s;
  }
  .order-item-row:last-child { border-bottom: none; }

  .btn-place-order {
    width: 100%;
    background: #E8441A;
    color: #fff;
    padding: 16px;
    border: none;
    border-radius: 50px;
    font-family: 'DM Sans', sans-serif;
    font-size: 16px;
    font-weight: 700;
    cursor: pointer;
    box-shadow: 0 4px 24px rgba(232,68,26,0.4);
    transition: transform 0.2s, box-shadow 0.2s;
    letter-spacing: 0.3px;
  }
  .btn-place-order:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 8px 36px rgba(232,68,26,0.55);
  }
  .btn-place-order:disabled {
    background: #3a3a3a;
    box-shadow: none;
    cursor: not-allowed;
    color: rgba(255,255,255,0.3);
  }

  .btn-back-link {
    background: none;
    border: none;
    font-family: 'DM Sans', sans-serif;
    font-size: 14px;
    color: rgba(255,255,255,0.4);
    cursor: pointer;
    transition: color 0.2s;
    padding: 0;
    text-decoration: none;
    display: inline-flex;
    align-items: center;
    gap: 6px;
  }
  .btn-back-link:hover { color: rgba(255,255,255,0.8); }

  .demo-badge {
    display: flex;
    align-items: center;
    gap: 10px;
    background: rgba(251,191,36,0.06);
    border: 1px solid rgba(251,191,36,0.2);
    border-radius: 14px;
    padding: 14px 18px;
    font-family: 'DM Sans', sans-serif;
    font-size: 13px;
    color: #fbbf24;
    margin-bottom: 24px;
  }

  .empty-cart-card {
    text-align: center;
    padding: 80px 40px;
    background: #141414;
    border: 1px solid rgba(255,255,255,0.07);
    border-radius: 28px;
    max-width: 480px;
    margin: 0 auto;
  }

  .browse-menu-btn {
    background: #E8441A;
    color: #fff;
    padding: 14px 36px;
    border-radius: 50px;
    border: none;
    font-family: 'DM Sans', sans-serif;
    font-size: 15px;
    font-weight: 700;
    cursor: pointer;
    box-shadow: 0 4px 20px rgba(232,68,26,0.4);
    transition: transform 0.2s, box-shadow 0.2s;
    margin-top: 24px;
  }
  .browse-menu-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 32px rgba(232,68,26,0.55);
  }

  .footer-bar {
    background: #0a0a0a;
    padding: 24px 60px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 12px;
    border-top: 1px solid rgba(255,255,255,0.05);
  }
`;

/* ── NAV ── */
function Nav() {
  return (
    <nav className="nav-bar" style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '18px 60px',
      background: 'rgba(10,10,10,0.88)', backdropFilter: 'blur(14px)',
      borderBottom: '1px solid rgba(255,255,255,0.06)',
    }}>
      <a href="/" style={{ fontSize: '22px', fontFamily: "'Playfair Display',serif", fontWeight: '700', letterSpacing: '2px', color: '#fff', textDecoration: 'none' }}>
        <span style={{ color: '#E8441A' }}>美食家大廳</span> Epicure <span style={{ color: '#E8441A' }}>Hall</span>
      </a>
      <ul style={{ display: 'flex', gap: '32px', listStyle: 'none', fontFamily: "'DM Sans',sans-serif", fontSize: '14px', fontWeight: '500' }}>
        {['Home', 'Menu', 'Reservations', 'Events', 'Contact'].map(l => (
          <li key={l}><a href={l === 'Home' ? '/' : l === 'Menu' ? '/menu' : '#'} className="nav-link" style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none', transition: 'color 0.2s' }}>{l}</a></li>
        ))}
      </ul>
      <div />
    </nav>
  );
}

/* ── FOOTER ── */
function Footer() {
  return (
    <footer className="footer-bar">
      <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: '13px', color: 'rgba(255,255,255,0.4)' }}>© 2026 Epicure Hall. All rights reserved.</span>
      <div style={{ display: 'flex', gap: '24px' }}>
        {['Privacy Policy', 'Terms', 'Sitemap'].map(l => (
          <a key={l} href="#" className="footer-link" style={{ fontFamily: "'DM Sans',sans-serif", fontSize: '13px', color: 'rgba(255,255,255,0.4)', textDecoration: 'none', transition: 'color 0.2s' }}>{l}</a>
        ))}
      </div>
    </footer>
  );
}

function CheckoutPage() {
  const { cartItems, getTotal, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  /* inject CSS */
  React.useEffect(() => {
    if (document.getElementById('epicure-checkout-css')) return;
    const s = document.createElement('style');
    s.id = 'epicure-checkout-css';
    s.textContent = GLOBAL_CSS;
    document.head.appendChild(s);
    return () => {
      const el = document.getElementById('epicure-checkout-css');
      if (el) el.remove();
    };
  }, []);

  const handlePlaceOrder = async () => {
    if (cartItems.length === 0) { toast.error('Your cart is empty'); return; }
    setLoading(true);
    const orderData = {
      items: cartItems.map(item => ({ id: item.id, name: item.name, quantity: item.quantity, price: item.price })),
      total_amount: getTotal()
    };
    console.log('Sending order:', orderData);
    try {
      const response = await axios.post(
        'http://localhost:5000/api/orders',
        orderData,
        { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}`, 'Content-Type': 'application/json' } }
      );
      console.log('Response:', response.data);
      if (response.data.success) {
        clearCart();
        toast.success('Order placed successfully!');
        setTimeout(() => { navigate('/my-bookings'); }, 1500);
      } else {
        toast.error('Order failed');
      }
    } catch (error) {
      console.error('Error details:', error);
      if (error.response?.status === 401) { toast.error('Please login again'); navigate('/login'); }
      else { toast.error(error.response?.data?.error || 'Failed to place order'); }
    } finally {
      setLoading(false);
    }
  };

  /* ── EMPTY CART ── */
  if (cartItems.length === 0) {
    return (
      <div style={{ minHeight: '100vh', background: '#0a0a0a', color: '#fff' }}>
        <Nav />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', padding: '120px 40px 80px' }}>
          <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 50% 50%, rgba(232,68,26,0.05) 0%, transparent 65%)', pointerEvents: 'none' }} />
          <div className="empty-cart-card checkout-content">
            <div style={{ fontSize: '64px', marginBottom: '20px' }}>🛒</div>
            <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: '28px', fontWeight: '700', color: '#fff', marginBottom: '10px' }}>Your Cart is Empty</h2>
            <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: '14px', color: 'rgba(255,255,255,0.4)', lineHeight: '1.65', margin: 0 }}>Looks like you haven't added anything yet. Browse our menu and find something delicious.</p>
            <button className="browse-menu-btn" onClick={() => navigate('/menu')}>Browse Menu →</button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  /* ── CHECKOUT ── */
  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a', color: '#fff', fontFamily: "'DM Sans',sans-serif" }}>
      <Nav />

      {/* Page Header */}
      <div style={{
        paddingTop: '130px', paddingBottom: '48px', textAlign: 'center',
        background: 'linear-gradient(180deg,#0f0f0f 0%,#0a0a0a 100%)', position: 'relative', overflow: 'hidden'
      }}>
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: '600px', height: '300px', background: 'radial-gradient(ellipse,rgba(232,68,26,0.07) 0%,transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ fontSize: '12px', fontWeight: '700', letterSpacing: '4px', textTransform: 'uppercase', color: '#E8441A', marginBottom: '16px' }}>Almost There</div>
          <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: 'clamp(32px,4vw,52px)', fontWeight: '700', color: '#fff', marginBottom: '14px', letterSpacing: '-1px' }}>
            Review &amp; <span style={{ color: '#E8441A', fontStyle: 'italic' }}>Checkout</span>
          </h1>
          <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.4)', maxWidth: '420px', margin: '0 auto', lineHeight: '1.7' }}>
            Confirm your order and we'll have it ready in no time.
          </p>
        </div>
      </div>

      <div className="checkout-content" style={{ maxWidth: '620px', margin: '0 auto', padding: '0 40px 80px' }}>

        {/* Demo Banner */}
        <div className="demo-badge">
          <span style={{ fontSize: '18px' }}>🎉</span>
          <div>
            <strong style={{ color: '#fde68a' }}>Demo Mode</strong> — No payment required!
            <br />
            <span style={{ color: 'rgba(251,191,36,0.6)', fontSize: '12px' }}>Click "Place Demo Order" to complete your purchase</span>
          </div>
        </div>

        {/* Order Summary */}
        <div style={{ background: '#141414', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '20px', padding: '28px', marginBottom: '20px' }}>
          <div style={{ fontSize: '12px', fontWeight: '700', letterSpacing: '3px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', marginBottom: '18px' }}>Order Summary</div>

          {cartItems.map(item => (
            <div key={item.id} className="order-item-row">
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: 1 }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(232,68,26,0.08)', border: '1px solid rgba(232,68,26,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', flexShrink: 0 }}>🍽️</div>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: '600', color: '#fff', marginBottom: '2px' }}>{item.name}</div>
                  <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.3)' }}>
                    ${parseFloat(item.price).toFixed(2)} × {item.quantity}
                  </div>
                </div>
              </div>
              <span style={{ fontFamily: "'Playfair Display',serif", fontSize: '16px', fontWeight: '700', color: '#E8441A', marginLeft: '16px' }}>
                ${(item.price * item.quantity).toFixed(2)}
              </span>
            </div>
          ))}

          {/* Total */}
          <div style={{ marginTop: '18px', paddingTop: '18px', borderTop: '1px solid rgba(232,68,26,0.15)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.3)', marginBottom: '4px', letterSpacing: '1px', textTransform: 'uppercase' }}>Total Amount</div>
              <div style={{ fontFamily: "'Playfair Display',serif", fontSize: '30px', fontWeight: '700', color: '#E8441A', lineHeight: 1 }}>${getTotal().toFixed(2)}</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.3)', marginBottom: '4px' }}>{cartItems.reduce((sum, i) => sum + i.quantity, 0)} items</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#4ade80', fontSize: '12px', fontWeight: '600' }}>
                <span>✓</span> Demo — No charge
              </div>
            </div>
          </div>
        </div>

        {/* Delivery Info (decorative) */}
        <div style={{ background: '#141414', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '20px', padding: '20px 24px', marginBottom: '20px' }}>
          <div style={{ fontSize: '12px', fontWeight: '700', letterSpacing: '3px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', marginBottom: '14px' }}>Delivery Details</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'rgba(232,68,26,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>👤</div>
            <div>
              <div style={{ fontSize: '14px', fontWeight: '600', color: '#fff' }}>{user?.name || 'Guest'}</div>
              <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.35)' }}>{user?.email || 'No email on file'}</div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div style={{ background: '#141414', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '20px', padding: '24px' }}>
          <button
            className="btn-place-order"
            onClick={handlePlaceOrder}
            disabled={loading}
          >
            {loading ? (
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                <span style={{ width: '18px', height: '18px', border: '2.5px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.8s linear infinite' }} />
                Placing Order…
              </span>
            ) : `✅ Place Demo Order — $${getTotal().toFixed(2)}`}
          </button>
          <div style={{ textAlign: 'center', marginTop: '16px' }}>
            <button className="btn-back-link" onClick={() => navigate('/cart')}>← Back to Cart</button>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default CheckoutPage;