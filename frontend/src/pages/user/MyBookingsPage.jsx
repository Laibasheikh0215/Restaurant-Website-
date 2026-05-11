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

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    const token = localStorage.getItem('token');
    
    if (!token) {
      console.log('No token found');
      setLoading(false);
      return;
    }
    
    try {
      const config = {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      };
      
      console.log('Fetching data with token...');
      
      // Fetch orders
      const ordersResponse = await axios.get('http://localhost:5000/api/orders/my-orders', config);
      console.log('Orders API response:', ordersResponse.data);
      setOrders(ordersResponse.data || []);
      
      // Fetch table bookings
      const tableResponse = await axios.get('http://localhost:5000/api/table-bookings/my-bookings', config);
      console.log('Table bookings response:', tableResponse.data);
      setTableBookings(tableResponse.data || []);
      
      // Fetch event bookings
      const eventResponse = await axios.get('http://localhost:5000/api/event-bookings/my-bookings', config);
      console.log('Event bookings response:', eventResponse.data);
      setEventBookings(eventResponse.data || []);
      
    } catch (error) {
      console.error('Error fetching data:', error);
      console.error('Error response:', error.response?.data);
      toast.error('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', background: '#f3f4f6' }}>
        <div style={{ textAlign: 'center' }}>
          <div className="spinner"></div>
          <p style={{ marginTop: '20px', color: '#6b7280' }}>Loading your bookings...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f3f4f6', padding: '40px 20px' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '32px', textAlign: 'center', marginBottom: '30px', color: '#4c1d95' }}>
          My Bookings
        </h1>
        
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
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            🍽️ Food Orders ({orders.length})
          </button>
          <button 
            onClick={() => setActiveTab('tables')} 
            style={{ 
              padding: '10px 30px', 
              background: activeTab === 'tables' ? '#4c1d95' : '#e5e7eb', 
              color: activeTab === 'tables' ? 'white' : '#333', 
              border: 'none', 
              borderRadius: '8px', 
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            🪑 Table Bookings ({tableBookings.length})
          </button>
          <button 
            onClick={() => setActiveTab('events')} 
            style={{ 
              padding: '10px 30px', 
              background: activeTab === 'events' ? '#4c1d95' : '#e5e7eb', 
              color: activeTab === 'events' ? 'white' : '#333', 
              border: 'none', 
              borderRadius: '8px', 
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            🎉 Event Bookings ({eventBookings.length})
          </button>
        </div>
        
        {/* Food Orders Tab */}
        {activeTab === 'orders' && (
          <div>
            {orders.length === 0 ? (
              <div style={{ background: 'white', borderRadius: '15px', padding: '60px 40px', textAlign: 'center' }}>
                <span style={{ fontSize: '60px' }}>🍽️</span>
                <h3 style={{ marginTop: '20px', color: '#4c1d95' }}>No Orders Yet</h3>
                <p style={{ color: '#6b7280', marginBottom: '20px' }}>You haven't placed any orders yet.</p>
                <button 
                  onClick={() => navigate('/menu')} 
                  style={{ background: '#4c1d95', color: 'white', padding: '12px 30px', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
                >
                  Browse Menu
                </button>
              </div>
            ) : (
              orders.map((order, index) => (
                <div key={order.id || index} style={{ background: 'white', borderRadius: '15px', padding: '20px', marginBottom: '20px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', flexWrap: 'wrap', gap: '10px' }}>
                    <div>
                      <strong style={{ fontSize: '16px', color: '#4c1d95' }}>Order #{order.id}</strong>
                    </div>
                    <div style={{ color: '#6b7280' }}>
                      {order.created_at ? new Date(order.created_at).toLocaleDateString() : 'Date not available'}
                    </div>
                  </div>
                  
                  <div style={{ borderBottom: '1px solid #e5e7eb', marginBottom: '10px', paddingBottom: '10px' }}>
                    {order.items && order.items.length > 0 ? (
                      order.items.map((item, idx) => (
                        <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0' }}>
                          <span>{item.name} x{item.quantity}</span>
                          <span>${(item.price * item.quantity).toFixed(2)}</span>
                        </div>
                      ))
                    ) : (
                      <p style={{ color: '#6b7280', textAlign: 'center', padding: '10px' }}>No items found</p>
                    )}
                  </div>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px', flexWrap: 'wrap', gap: '10px' }}>
                    <div>
                      <span style={{ 
                        background: order.status === 'completed' ? '#10b981' : 
                                   order.status === 'confirmed' ? '#3b82f6' : 
                                   order.status === 'cancelled' ? '#ef4444' : '#f59e0b', 
                        color: 'white', 
                        padding: '4px 12px', 
                        borderRadius: '20px', 
                        fontSize: '12px',
                        marginRight: '10px'
                      }}>
                        {order.status || 'pending'}
                      </span>
                      <span style={{ fontWeight: 'bold' }}>Total: ${order.total_amount}</span>
                    </div>
                    
                    <button 
                      onClick={() => navigate(`/track-order/${order.id}`)} 
                      style={{ background: '#3b82f6', color: 'white', padding: '8px 15px', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
                    >
                      📍 Track Order
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
        
        {/* Table Bookings Tab */}
        {activeTab === 'tables' && (
          <div>
            {tableBookings.length === 0 ? (
              <div style={{ background: 'white', borderRadius: '15px', padding: '60px 40px', textAlign: 'center' }}>
                <span style={{ fontSize: '60px' }}>🪑</span>
                <h3 style={{ marginTop: '20px', color: '#4c1d95' }}>No Table Bookings</h3>
                <p style={{ color: '#6b7280', marginBottom: '20px' }}>You haven't booked any tables yet.</p>
                <button 
                  onClick={() => navigate('/table-booking')} 
                  style={{ background: '#4c1d95', color: 'white', padding: '12px 30px', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
                >
                  Book a Table
                </button>
              </div>
            ) : (
              tableBookings.map(booking => (
                <div key={booking.id} style={{ background: 'white', borderRadius: '15px', padding: '20px', marginBottom: '20px' }}>
                  <h3>Table Booking #{booking.id}</h3>
                  <p>Date: {booking.booking_date}</p>
                  <p>Time: {booking.booking_time}</p>
                  <p>Party Size: {booking.party_size}</p>
                  <p>Status: {booking.status}</p>
                </div>
              ))
            )}
          </div>
        )}
        
        {/* Event Bookings Tab */}
        {activeTab === 'events' && (
          <div>
            {eventBookings.length === 0 ? (
              <div style={{ background: 'white', borderRadius: '15px', padding: '60px 40px', textAlign: 'center' }}>
                <span style={{ fontSize: '60px' }}>🎉</span>
                <h3 style={{ marginTop: '20px', color: '#4c1d95' }}>No Event Bookings</h3>
                <p style={{ color: '#6b7280', marginBottom: '20px' }}>You haven't booked any events yet.</p>
                <button 
                  onClick={() => navigate('/event-booking')} 
                  style={{ background: '#4c1d95', color: 'white', padding: '12px 30px', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
                >
                  Book an Event
                </button>
              </div>
            ) : (
              eventBookings.map(booking => (
                <div key={booking.id} style={{ background: 'white', borderRadius: '15px', padding: '20px', marginBottom: '20px' }}>
                  <h3>{booking.event_name || booking.location_name}</h3>
                  <p>Date: {booking.booking_date}</p>
                  <p>Guests: {booking.number_of_guests}</p>
                  <p>Total: ${booking.total_amount}</p>
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