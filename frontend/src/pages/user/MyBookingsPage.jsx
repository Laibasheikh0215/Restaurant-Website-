import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

function MyBookingsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [tableBookings, setTableBookings] = useState([]);
  const [eventBookings, setEventBookings] = useState([]);
  const [activeTab, setActiveTab] = useState('orders');
  const [loading, setLoading] = useState(true);
  const [processingPayment, setProcessingPayment] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [ordersRes, tableRes, eventRes] = await Promise.all([
        axios.get('http://localhost:5000/api/orders/my-orders'),
        axios.get('http://localhost:5000/api/table-bookings/my-bookings'),
        axios.get('http://localhost:5000/api/event-bookings/my-bookings')
      ]);
      setOrders(ordersRes.data);
      setTableBookings(tableRes.data);
      setEventBookings(eventRes.data);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmOrder = async (order) => {
    setProcessingPayment(order.id);
    
    try {
      // Demo confirmation
      const response = await axios.put(
        `http://localhost:5000/api/orders/${order.id}/confirm`,
        {},
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      
      if (response.data.success) {
        toast.success('Order confirmed! (Demo Mode)');
        fetchData(); // Refresh the list
      }
    } catch (error) {
      console.error('Confirmation error:', error);
      toast.error('Failed to confirm order');
    } finally {
      setProcessingPayment(null);
    }
  };

  if (loading) return <div style={{ textAlign: 'center', padding: '50px' }}>Loading...</div>;

  return (
    <div style={{ minHeight: '100vh', background: '#f3f4f6', padding: '40px 20px' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '32px', textAlign: 'center', marginBottom: '30px' }}>My Bookings</h1>
        
        {/* Tabs */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '30px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button 
            onClick={() => setActiveTab('orders')} 
            style={{ 
              padding: '10px 30px', 
              background: activeTab === 'orders' ? '#4c1d95' : '#e5e7eb', 
              color: activeTab === 'orders' ? 'white' : '#333', 
              border: 'none', 
              borderRadius: '8px', 
              cursor: 'pointer' 
            }}
          >
            Food Orders
          </button>
          <button 
            onClick={() => setActiveTab('tables')} 
            style={{ 
              padding: '10px 30px', 
              background: activeTab === 'tables' ? '#4c1d95' : '#e5e7eb', 
              color: activeTab === 'tables' ? 'white' : '#333', 
              border: 'none', 
              borderRadius: '8px', 
              cursor: 'pointer' 
            }}
          >
            Table Bookings
          </button>
          <button 
            onClick={() => setActiveTab('events')} 
            style={{ 
              padding: '10px 30px', 
              background: activeTab === 'events' ? '#4c1d95' : '#e5e7eb', 
              color: activeTab === 'events' ? 'white' : '#333', 
              border: 'none', 
              borderRadius: '8px', 
              cursor: 'pointer' 
            }}
          >
            Event Bookings
          </button>
          {booking.status === 'confirmed' && (
    <button
        onClick={() => navigate(`/event-guests/${booking.id}`)}
        style={{
            background: '#8b5cf6',
            color: 'white',
            padding: '8px 15px',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer'
        }}
    >
        👥 Manage Guests
    </button>
)}
        </div>
        
        {/* Food Orders */}
        {activeTab === 'orders' && (
          <div>
            {orders.length === 0 ? (
              <div style={{ background: 'white', borderRadius: '15px', padding: '40px', textAlign: 'center' }}>
                <p>No orders yet</p>
                <button 
                  onClick={() => navigate('/menu')}
                  style={{ 
                    marginTop: '15px', 
                    background: '#4c1d95', 
                    color: 'white', 
                    padding: '10px 20px', 
                    border: 'none', 
                    borderRadius: '8px', 
                    cursor: 'pointer' 
                  }}
                >
                  Browse Menu
                </button>
              </div>
            ) : (
              orders.map(order => (
                <div key={order.id} style={{ background: 'white', borderRadius: '15px', padding: '20px', marginBottom: '20px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', flexWrap: 'wrap', gap: '10px' }}>
                    <div><strong style={{ fontSize: '16px' }}>Order #{order.id}</strong></div>
                    <div style={{ color: '#6b7280' }}>{new Date(order.created_at).toLocaleDateString()}</div>
                  </div>
                  
                  <div style={{ borderBottom: '1px solid #e5e7eb', marginBottom: '10px', paddingBottom: '10px' }}>
                    {order.items?.map((item, idx) => (
                      <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0' }}>
                        <span>{item.name} x{item.quantity}</span>
                        <span>${(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px', flexWrap: 'wrap', gap: '10px' }}>
                    <div>
                      <span style={{ 
                        background: order.status === 'completed' || order.status === 'confirmed' ? '#10b981' : 
                                   order.status === 'cancelled' ? '#ef4444' : '#f59e0b', 
                        color: 'white', 
                        padding: '4px 12px', 
                        borderRadius: '20px', 
                        fontSize: '12px', 
                        marginRight: '10px' 
                      }}>
                        {order.status === 'confirmed' ? 'Confirmed' : order.status}
                      </span>
                      <span style={{ fontWeight: 'bold' }}>Total: ${order.total_amount}</span>
                    </div>
                    
                    {/* TRACK ORDER BUTTON */}
                    <button
                      onClick={() => navigate(`/track-order/${order.id}`)}
                      style={{
                        background: '#3b82f6',
                        color: 'white',
                        padding: '8px 15px',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '5px'
                      }}
                    >
                      📍 Track Order
                    </button>
                    
                    {/* Confirm Button - Show only for pending orders */}
                    {order.status === 'pending' && (
                      <button
                        onClick={() => handleConfirmOrder(order)}
                        disabled={processingPayment === order.id}
                        style={{
                          background: '#10b981',
                          color: 'white',
                          padding: '8px 20px',
                          border: 'none',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          fontWeight: 'bold'
                        }}
                      >
                        {processingPayment === order.id ? 'Confirming...' : '✅ Confirm Order'}
                      </button>
                    )}
                    
                    {order.status === 'confirmed' && (
                      <span style={{ color: '#10b981', fontWeight: 'bold' }}>✓ Order Confirmed</span>
                    )}
                    
                    {order.status === 'completed' && (
                      <span style={{ color: '#10b981', fontWeight: 'bold' }}>✓ Completed</span>
                    )}
                    
                    {order.status === 'cancelled' && (
                      <span style={{ color: '#ef4444', fontWeight: 'bold' }}>✗ Cancelled</span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
        
        {/* Table Bookings */}
        {activeTab === 'tables' && (
          <div>
            {tableBookings.length === 0 ? (
              <div style={{ background: 'white', borderRadius: '15px', padding: '40px', textAlign: 'center' }}>
                <p>No table bookings yet</p>
                <button 
                  onClick={() => navigate('/table-booking')}
                  style={{ 
                    marginTop: '15px', 
                    background: '#4c1d95', 
                    color: 'white', 
                    padding: '10px 20px', 
                    border: 'none', 
                    borderRadius: '8px', 
                    cursor: 'pointer' 
                  }}
                >
                  Book a Table
                </button>
              </div>
            ) : (
              tableBookings.map(booking => (
                <div key={booking.id} style={{ background: 'white', borderRadius: '15px', padding: '20px', marginBottom: '20px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', flexWrap: 'wrap', gap: '10px' }}>
                    <div><strong style={{ fontSize: '16px' }}>Table Booking #{booking.id}</strong></div>
                    <div style={{ color: '#6b7280' }}>{booking.booking_date}</div>
                  </div>
                  <div style={{ marginBottom: '10px' }}>
                    <div><strong>Time:</strong> {booking.booking_time}</div>
                    <div><strong>Party Size:</strong> {booking.party_size} guests</div>
                    {booking.table_number && <div><strong>Table Number:</strong> {booking.table_number}</div>}
                    {booking.pre_order_total > 0 && <div><strong>Pre-order Total:</strong> ${booking.pre_order_total}</div>}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' }}>
                    <span style={{ 
                      background: booking.status === 'confirmed' ? '#10b981' : 
                                 booking.status === 'cancelled' ? '#ef4444' : '#f59e0b', 
                      color: 'white', 
                      padding: '4px 12px', 
                      borderRadius: '20px', 
                      fontSize: '12px' 
                    }}>
                      {booking.status}
                    </span>
                    
                    {booking.status === 'pending' && (
                      <button
                        onClick={() => toast.info('Table booking will be confirmed by admin')}
                        style={{ background: '#f59e0b', color: 'white', padding: '8px 20px', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
                      >
                        ⏳ Pending Confirmation
                      </button>
                    )}
                    
                    {booking.status === 'confirmed' && (
                      <span style={{ color: '#10b981', fontWeight: 'bold' }}>✓ Table Confirmed</span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
        
        {/* Event Bookings */}
        {activeTab === 'events' && (
          <div>
            {eventBookings.length === 0 ? (
              <div style={{ background: 'white', borderRadius: '15px', padding: '40px', textAlign: 'center' }}>
                <p>No event bookings yet</p>
                <button 
                  onClick={() => navigate('/event-booking')}
                  style={{ 
                    marginTop: '15px', 
                    background: '#4c1d95', 
                    color: 'white', 
                    padding: '10px 20px', 
                    border: 'none', 
                    borderRadius: '8px', 
                    cursor: 'pointer' 
                  }}
                >
                  Book an Event
                </button>
              </div>
            ) : (
              eventBookings.map(booking => (
                <div key={booking.id} style={{ background: 'white', borderRadius: '15px', padding: '20px', marginBottom: '20px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', flexWrap: 'wrap', gap: '10px' }}>
                    <div><strong style={{ fontSize: '16px' }}>{booking.event_name || booking.location_name}</strong></div>
                    <div style={{ color: '#6b7280' }}>{booking.booking_date}</div>
                  </div>
                  <div style={{ marginBottom: '10px' }}>
                    <div><strong>Location:</strong> {booking.location_name}</div>
                    <div><strong>Guests:</strong> {booking.number_of_guests}</div>
                    <div><strong>Total:</strong> ${booking.total_amount}</div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' }}>
                    <span style={{ 
                      background: booking.status === 'confirmed' ? '#10b981' : 
                                 booking.status === 'cancelled' ? '#ef4444' : '#f59e0b', 
                      color: 'white', 
                      padding: '4px 12px', 
                      borderRadius: '20px', 
                      fontSize: '12px' 
                    }}>
                      {booking.status}
                    </span>
                    
                    {booking.status === 'pending' && (
                      <button
                        onClick={() => toast.info('Event booking will be confirmed by admin')}
                        style={{ background: '#f59e0b', color: 'white', padding: '8px 20px', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
                      >
                        ⏳ Pending Confirmation
                      </button>
                    )}
                    
                    {booking.status === 'confirmed' && (
                      <span style={{ color: '#10b981', fontWeight: 'bold' }}>✓ Event Confirmed</span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default MyBookingsPage;