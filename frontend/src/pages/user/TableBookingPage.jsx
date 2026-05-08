import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';
import toast from 'react-hot-toast';

function TableBookingPage() {
  const { user } = useAuth();
  const { cartItems, getTotal } = useCart();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    booking_date: '',
    booking_time: '',
    party_size: 2,
    pre_order_food: []
  });
  const [availableSlots, setAvailableSlots] = useState([]);
  const [preOrderItems, setPreOrderItems] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchMenu();
  }, []);

  useEffect(() => {
    if (formData.booking_date) {
      fetchAvailableSlots();
    }
  }, [formData.booking_date]);

  const fetchMenu = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/menu');
      setMenuItems(response.data);
    } catch (error) {
      console.error('Error fetching menu:', error);
    }
  };

  const fetchAvailableSlots = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/table-bookings/available-slots?date=${formData.booking_date}`);
      setAvailableSlots(response.data.available);
    } catch (error) {
      console.error('Error fetching slots:', error);
    }
  };

  const handlePreOrderAdd = (item) => {
    const existing = preOrderItems.find(i => i.id === item.id);
    if (existing) {
      setPreOrderItems(preOrderItems.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i));
    } else {
      setPreOrderItems([...preOrderItems, { ...item, quantity: 1 }]);
    }
  };

  const handlePreOrderRemove = (id) => {
    const existing = preOrderItems.find(i => i.id === id);
    if (existing && existing.quantity > 1) {
      setPreOrderItems(preOrderItems.map(i => i.id === id ? { ...i, quantity: i.quantity - 1 } : i));
    } else {
      setPreOrderItems(preOrderItems.filter(i => i.id !== id));
    }
  };

  const getPreOrderTotal = () => {
    return preOrderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const bookingData = {
        ...formData,
        pre_ordered_food: preOrderItems,
        pre_order_total: getPreOrderTotal()
      };
      
      const response = await axios.post('http://localhost:5000/api/table-bookings', bookingData);
      
      if (response.data.success) {
        toast.success('Table booked successfully! Check your email.');
        setStep(3);
      }
    } catch (error) {
      toast.error(error.response?.data?.error || 'Booking failed');
    } finally {
      setLoading(false);
    }
  };

  if (step === 1) {
    const minDate = new Date().toISOString().split('T')[0];
    
    return (
      <div style={{ minHeight: '100vh', background: '#f3f4f6', padding: '40px 20px' }}>
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          <h1 style={{ fontSize: '36px', textAlign: 'center', marginBottom: '30px' }}>Book a Table 🪑</h1>
          
          <div style={{ background: 'white', borderRadius: '15px', padding: '30px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
            <h3 style={{ marginBottom: '20px' }}>Step 1: Select Date & Time</h3>
            
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Select Date</label>
              <input
                type="date"
                min={minDate}
                value={formData.booking_date}
                onChange={(e) => setFormData({ ...formData, booking_date: e.target.value })}
                style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '8px' }}
                required
              />
            </div>
            
            {formData.booking_date && (
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Select Time</label>
                <select
                  value={formData.booking_time}
                  onChange={(e) => setFormData({ ...formData, booking_time: e.target.value })}
                  style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '8px' }}
                >
                  <option value="">Select time</option>
                  {availableSlots.map(slot => (
                    <option key={slot} value={slot}>{slot}</option>
                  ))}
                </select>
              </div>
            )}
            
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Party Size</label>
              <select
                value={formData.party_size}
                onChange={(e) => setFormData({ ...formData, party_size: parseInt(e.target.value) })}
                style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '8px' }}
              >
                {[1,2,3,4,5,6,7,8,9,10].map(n => (
                  <option key={n} value={n}>{n} {n === 1 ? 'Guest' : 'Guests'}</option>
                ))}
              </select>
            </div>
            
            <button
              onClick={() => setStep(2)}
              disabled={!formData.booking_date || !formData.booking_time}
              style={{ width: '100%', background: '#4c1d95', color: 'white', padding: '15px', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
            >
              Continue to Pre-order Food →
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (step === 2) {
    return (
      <div style={{ minHeight: '100vh', background: '#f3f4f6', padding: '40px 20px' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <h1 style={{ fontSize: '36px', textAlign: 'center', marginBottom: '30px' }}>Pre-order Food for Your Table 🍽️</h1>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
            {/* Menu Items */}
            <div style={{ background: 'white', borderRadius: '15px', padding: '20px', maxHeight: '500px', overflowY: 'auto' }}>
              <h3 style={{ marginBottom: '15px' }}>Menu</h3>
              {menuItems.map(item => (
                <div key={item.id} style={{ padding: '10px', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: 'bold' }}>{item.name}</div>
                    <div style={{ fontSize: '14px', color: '#6b7280' }}>${item.price}</div>
                  </div>
                  <button onClick={() => handlePreOrderAdd(item)} style={{ background: '#4c1d95', color: 'white', padding: '5px 15px', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>Add</button>
                </div>
              ))}
            </div>
            
            {/* Pre-order Cart */}
            <div style={{ background: 'white', borderRadius: '15px', padding: '20px' }}>
              <h3 style={{ marginBottom: '15px' }}>Your Pre-order</h3>
              {preOrderItems.length === 0 ? (
                <p style={{ color: '#6b7280', textAlign: 'center', padding: '40px' }}>No items selected</p>
              ) : (
                <>
                  {preOrderItems.map(item => (
                    <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px', borderBottom: '1px solid #e5e7eb' }}>
                      <div>
                        <div>{item.name}</div>
                        <div style={{ fontSize: '12px', color: '#6b7280' }}>${item.price} each</div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <button onClick={() => handlePreOrderRemove(item.id)} style={{ width: '25px', height: '25px', borderRadius: '50%', border: '1px solid #ddd', background: 'white', cursor: 'pointer' }}>-</button>
                        <span>{item.quantity}</span>
                        <button onClick={() => handlePreOrderAdd(item)} style={{ width: '25px', height: '25px', borderRadius: '50%', border: '1px solid #ddd', background: 'white', cursor: 'pointer' }}>+</button>
                      </div>
                    </div>
                  ))}
                  <div style={{ marginTop: '20px', padding: '15px', background: '#f3f4f6', borderRadius: '10px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span><strong>Total Pre-order:</strong></span>
                      <span><strong>${getPreOrderTotal().toFixed(2)}</strong></span>
                    </div>
                  </div>
                </>
              )}
              
              <div style={{ marginTop: '20px', display: 'flex', gap: '15px' }}>
                <button onClick={() => setStep(1)} style={{ flex: 1, padding: '12px', border: '1px solid #4c1d95', background: 'white', color: '#4c1d95', borderRadius: '8px', cursor: 'pointer' }}>Back</button>
                <button onClick={handleSubmit} disabled={loading} style={{ flex: 1, background: '#4c1d95', color: 'white', padding: '12px', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
                  {loading ? 'Booking...' : 'Confirm Booking'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div style={{ background: 'white', borderRadius: '15px', padding: '40px', textAlign: 'center', maxWidth: '500px' }}>
        <span style={{ fontSize: '60px' }}>✅</span>
        <h2 style={{ marginTop: '20px' }}>Table Booked Successfully!</h2>
        <p style={{ color: '#6b7280', marginTop: '10px' }}>A confirmation email has been sent to your email address.</p>
        <button onClick={() => window.location.href = '/'} style={{ marginTop: '30px', background: '#4c1d95', color: 'white', padding: '12px 30px', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>Go to Home</button>
      </div>
    </div>
  );
}

export default TableBookingPage;