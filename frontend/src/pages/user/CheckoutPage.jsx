import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

function CheckoutPage() {
  const { cartItems, getTotal, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handlePlaceOrder = async () => {
    if (cartItems.length === 0) {
      toast.error('Your cart is empty');
      return;
    }
    
    setLoading(true);
    
    const orderData = {
      items: cartItems.map(item => ({
        id: item.id,
        name: item.name,
        quantity: item.quantity,
        price: item.price
      })),
      total_amount: getTotal()
    };
    
    console.log('Sending order:', orderData);
    
    try {
      const response = await axios.post(
        'http://localhost:5000/api/orders',
        orderData,
        { 
          headers: { 
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          } 
        }
      );
      
      console.log('Response:', response.data);
      
      if (response.data.success) {
        // Clear cart first
        clearCart();
        
        // Show success message
        toast.success('Order placed successfully!');
        
        // Redirect to my bookings page after 2 seconds
        setTimeout(() => {
          navigate('/my-bookings');
        }, 1500);
        
      } else {
        toast.error('Order failed');
      }
    } catch (error) {
      console.error('Error details:', error);
      
      if (error.response?.status === 401) {
        toast.error('Please login again');
        navigate('/login');
      } else {
        toast.error(error.response?.data?.error || 'Failed to place order');
      }
    } finally {
      setLoading(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <h2>🛒 Your Cart is Empty</h2>
        <button onClick={() => navigate('/menu')} style={{ background: '#4c1d95', color: 'white', padding: '10px 20px', border: 'none', borderRadius: '5px', marginTop: '20px', cursor: 'pointer' }}>
          Browse Menu
        </button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '40px' }}>
      <h1 style={{ textAlign: 'center', marginBottom: '30px' }}>Checkout</h1>
      
      {/* Demo Mode Banner */}
      <div style={{ 
        background: '#fef3c7', 
        border: '1px solid #f59e0b', 
        borderRadius: '10px', 
        padding: '15px', 
        marginBottom: '20px',
        textAlign: 'center'
      }}>
        <p style={{ margin: 0, color: '#92400e' }}>
          🎉 <strong>Demo Mode</strong> - No payment required!
        </p>
        <p style={{ margin: '5px 0 0', fontSize: '12px', color: '#92400e' }}>
          Click "Place Demo Order" to complete your order
        </p>
      </div>
      
      <div style={{ background: '#f3f4f6', padding: '20px', borderRadius: '10px', marginBottom: '20px' }}>
        <h3>Order Summary</h3>
        {cartItems.map(item => (
          <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #ddd' }}>
            <span>{item.name} x{item.quantity}</span>
            <span>${(item.price * item.quantity).toFixed(2)}</span>
          </div>
        ))}
        <div style={{ marginTop: '15px', paddingTop: '15px', borderTop: '2px solid #ddd', fontWeight: 'bold', display: 'flex', justifyContent: 'space-between' }}>
          <span>Total</span>
          <span>${getTotal().toFixed(2)}</span>
        </div>
      </div>
      
      <div style={{ background: 'white', padding: '20px', borderRadius: '10px', border: '1px solid #ddd' }}>
        <button
          onClick={handlePlaceOrder}
          disabled={loading}
          style={{
            width: '100%',
            background: loading ? '#9ca3af' : '#10b981',
            color: 'white',
            padding: '14px',
            border: 'none',
            borderRadius: '8px',
            fontSize: '16px',
            fontWeight: 'bold',
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          {loading ? 'Placing Order...' : `✅ Place Demo Order - $${getTotal().toFixed(2)}`}
        </button>
      </div>
      
      <div style={{ textAlign: 'center', marginTop: '20px' }}>
        <button onClick={() => navigate('/cart')} style={{ background: 'none', border: 'none', color: '#4c1d95', cursor: 'pointer' }}>
          ← Back to Cart
        </button>
      </div>
    </div>
  );
}

export default CheckoutPage;