import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../../contexts/CartContext';

function CartPage() {
  const { cartItems, removeFromCart, updateQuantity, getTotal, clearCart } = useCart();

  if (cartItems.length === 0) {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '50px' }}>
        <div style={{ textAlign: 'center' }}>
          <h2>Your Cart is Empty 🛒</h2>
          <Link to="/menu" style={{ color: '#4c1d95', marginTop: '20px', display: 'inline-block' }}>Browse Menu</Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f3f4f6', padding: '40px 20px' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '36px', textAlign: 'center', marginBottom: '30px' }}>Your Cart</h1>
        
        <div style={{ background: 'white', borderRadius: '15px', padding: '20px', marginBottom: '20px' }}>
          {cartItems.map(item => (
            <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px', borderBottom: '1px solid #e5e7eb' }}>
              <div>
                <h3>{item.name}</h3>
                <p style={{ color: '#4c1d95', fontWeight: 'bold' }}>${item.price}</p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                <button onClick={() => updateQuantity(item.id, item.quantity - 1)} style={{ width: '30px', height: '30px', borderRadius: '50%', border: '1px solid #ddd', background: 'white', cursor: 'pointer' }}>-</button>
                <span>{item.quantity}</span>
                <button onClick={() => updateQuantity(item.id, item.quantity + 1)} style={{ width: '30px', height: '30px', borderRadius: '50%', border: '1px solid #ddd', background: 'white', cursor: 'pointer' }}>+</button>
                <button onClick={() => removeFromCart(item.id)} style={{ background: '#dc2626', color: 'white', padding: '5px 15px', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>Remove</button>
              </div>
            </div>
          ))}
          
          <div style={{ marginTop: '20px', textAlign: 'right' }}>
            <h3>Total: ${getTotal().toFixed(2)}</h3>
            <div style={{ marginTop: '20px', display: 'flex', gap: '15px', justifyContent: 'flex-end' }}>
              <button onClick={clearCart} style={{ padding: '10px 20px', border: '1px solid #dc2626', background: 'white', color: '#dc2626', borderRadius: '8px', cursor: 'pointer' }}>Clear Cart</button>
              <Link to="/checkout" style={{ background: '#4c1d95', color: 'white', padding: '10px 30px', borderRadius: '8px', textDecoration: 'none' }}>Proceed to Checkout</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CartPage;