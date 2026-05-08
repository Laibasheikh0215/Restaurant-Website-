import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

function AdminBookings() {
  const [activeTab, setActiveTab] = useState('table');
  const [tableBookings, setTableBookings] = useState([]);
  const [eventBookings, setEventBookings] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAllBookings();
  }, []);

  const fetchAllBookings = async () => {
    try {
      const [tableRes, eventRes, orderRes] = await Promise.all([
        axios.get('http://localhost:5000/api/admin/table-bookings'),
        axios.get('http://localhost:5000/api/admin/event-bookings'),
        axios.get('http://localhost:5000/api/admin/orders')
      ]);
      setTableBookings(tableRes.data);
      setEventBookings(eventRes.data);
      setOrders(orderRes.data);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
    }
  };

 // Status change function with notification
// Status change function
const updateStatus = async (type, id, status) => {
    console.log(`Updating ${type} ${id} to ${status}`);
    
    try {
        let url = '';
        if (type === 'orders') {
            url = `http://localhost:5000/api/admin/orders/${id}/status`;
        } else if (type === 'table-bookings') {
            url = `http://localhost:5000/api/admin/table-bookings/${id}/status`;
        } else if (type === 'event-bookings') {
            url = `http://localhost:5000/api/admin/event-bookings/${id}/status`;
        }
        
        console.log('Sending request to:', url);
        
        const response = await axios.put(
            url,
            { status },
            { 
                headers: { 
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                } 
            }
        );
        
        console.log('Response:', response.data);
        
        if (response.data.success) {
            toast.success(`Status updated to ${status}!`);
            fetchAllBookings(); // Refresh the list
        } else {
            toast.error('Failed to update status');
        }
    } catch (error) {
        console.error('Update error:', error);
        console.error('Error response:', error.response?.data);
        toast.error(error.response?.data?.error || 'Failed to update status');
    }
};
  
  return (
    <div style={{ minHeight: '100vh', background: '#f3f4f6', padding: '40px 20px' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '32px', marginBottom: '30px' }}>All Bookings 📅</h1>
        
        {/* Tabs */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '30px' }}>
          <button onClick={() => setActiveTab('table')} style={{ padding: '10px 30px', background: activeTab === 'table' ? '#4c1d95' : '#e5e7eb', color: activeTab === 'table' ? 'white' : '#333', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>Table Bookings</button>
          <button onClick={() => setActiveTab('event')} style={{ padding: '10px 30px', background: activeTab === 'event' ? '#4c1d95' : '#e5e7eb', color: activeTab === 'event' ? 'white' : '#333', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>Event Bookings</button>
          <button onClick={() => setActiveTab('order')} style={{ padding: '10px 30px', background: activeTab === 'order' ? '#4c1d95' : '#e5e7eb', color: activeTab === 'order' ? 'white' : '#333', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>Food Orders</button>
        </div>
        
        {/* Table Bookings */}
        {activeTab === 'table' && (
          <div style={{ background: 'white', borderRadius: '15px', padding: '20px', overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
                  <th style={{ padding: '12px', textAlign: 'left' }}>ID</th>
                  <th style={{ padding: '12px', textAlign: 'left' }}>Customer</th>
                  <th style={{ padding: '12px', textAlign: 'left' }}>Date & Time</th>
                  <th style={{ padding: '12px', textAlign: 'left' }}>Party Size</th>
                  <th style={{ padding: '12px', textAlign: 'left' }}>Status</th>
                  <th style={{ padding: '12px', textAlign: 'left' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {tableBookings.map(booking => (
                  <tr key={booking.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                    <td style={{ padding: '12px' }}>#{booking.id}</td>
                    <td style={{ padding: '12px' }}>{booking.full_name}</td>
                    <td style={{ padding: '12px' }}>{booking.booking_date} at {booking.booking_time}</td>
                    <td style={{ padding: '12px' }}>{booking.party_size}</td>
                    <td style={{ padding: '12px' }}>
                      <span style={{ background: booking.status === 'confirmed' ? '#10b981' : '#f59e0b', color: 'white', padding: '4px 12px', borderRadius: '20px', fontSize: '12px' }}>{booking.status}</span>
                    </td>
                    <td style={{ padding: '12px' }}>
                      <select onChange={(e) => updateStatus('table-bookings', booking.id, e.target.value)} value={booking.status} style={{ padding: '5px', borderRadius: '5px' }}>
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirm</option>
                        <option value="cancelled">Cancel</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {tableBookings.length === 0 && <p style={{ textAlign: 'center', padding: '40px' }}>No table bookings found</p>}
          </div>
        )}
        
        {/* Event Bookings */}
        {activeTab === 'event' && (
          <div style={{ background: 'white', borderRadius: '15px', padding: '20px', overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
                  <th style={{ padding: '12px', textAlign: 'left' }}>ID</th>
                  <th style={{ padding: '12px', textAlign: 'left' }}>Customer</th>
                  <th style={{ padding: '12px', textAlign: 'left' }}>Event</th>
                  <th style={{ padding: '12px', textAlign: 'left' }}>Date</th>
                  <th style={{ padding: '12px', textAlign: 'left' }}>Guests</th>
                  <th style={{ padding: '12px', textAlign: 'left' }}>Total</th>
                  <th style={{ padding: '12px', textAlign: 'left' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {eventBookings.map(booking => (
                  <tr key={booking.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                    <td style={{ padding: '12px' }}>#{booking.id}</td>
                    <td style={{ padding: '12px' }}>{booking.full_name}</td>
                    <td style={{ padding: '12px' }}>{booking.event_name || booking.location_name}</td>
                    <td style={{ padding: '12px' }}>{booking.booking_date}</td>
                    <td style={{ padding: '12px' }}>{booking.number_of_guests}</td>
                    <td style={{ padding: '12px' }}>${booking.total_amount}</td>
                    <td style={{ padding: '12px' }}>
                      <span style={{ background: booking.status === 'confirmed' ? '#10b981' : '#f59e0b', color: 'white', padding: '4px 12px', borderRadius: '20px', fontSize: '12px' }}>{booking.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {eventBookings.length === 0 && <p style={{ textAlign: 'center', padding: '40px' }}>No event bookings found</p>}
          </div>
        )}
        
        {/* Food Orders */}
        {activeTab === 'order' && (
          <div style={{ background: 'white', borderRadius: '15px', padding: '20px', overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
                  <th style={{ padding: '12px', textAlign: 'left' }}>Order ID</th>
                  <th style={{ padding: '12px', textAlign: 'left' }}>Customer</th>
                  <th style={{ padding: '12px', textAlign: 'left' }}>Total</th>
                  <th style={{ padding: '12px', textAlign: 'left' }}>Status</th>
                  <th style={{ padding: '12px', textAlign: 'left' }}>Date</th>
                  <th style={{ padding: '12px', textAlign: 'left' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map(order => (
                  <tr key={order.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                    <td style={{ padding: '12px' }}>#{order.id}</td>
                    <td style={{ padding: '12px' }}>{order.full_name}</td>
                    <td style={{ padding: '12px' }}>${order.total_amount}</td>
                    <td style={{ padding: '12px' }}>
                      <span style={{ background: order.status === 'completed' ? '#10b981' : order.status === 'cancelled' ? '#ef4444' : '#f59e0b', color: 'white', padding: '4px 12px', borderRadius: '20px', fontSize: '12px' }}>{order.status}</span>
                    </td>
                    <td style={{ padding: '12px' }}>{new Date(order.created_at).toLocaleDateString()}</td>
                    <td style={{ padding: '12px' }}>
                      <select onChange={(e) => updateStatus('orders', order.id, e.target.value)} value={order.status} style={{ padding: '5px', borderRadius: '5px' }}>
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirm</option>
                        <option value="preparing">Preparing</option>
                        <option value="completed">Complete</option>
                        <option value="cancelled">Cancel</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {orders.length === 0 && <p style={{ textAlign: 'center', padding: '40px' }}>No orders found</p>}
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminBookings;