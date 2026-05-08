import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import { Link } from 'react-router-dom';

function AdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    total_orders: 0,
    total_users: 0,
    total_table_bookings: 0,
    total_event_bookings: 0
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [recentTableBookings, setRecentTableBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/admin/stats');
      setStats(response.data.stats);
      setRecentOrders(response.data.recent_orders);
      setRecentTableBookings(response.data.recent_table_bookings);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const statsCards = [
    { title: 'Total Orders', value: stats.total_orders, icon: '📦', color: '#3b82f6' },
    { title: 'Total Users', value: stats.total_users, icon: '👥', color: '#10b981' },
    { title: 'Table Bookings', value: stats.total_table_bookings, icon: '🪑', color: '#f59e0b' },
    { title: 'Event Bookings', value: stats.total_event_bookings, icon: '🎉', color: '#ef4444' },
  ];

  if (loading) return <div style={{ textAlign: 'center', padding: '50px' }}>Loading dashboard...</div>;

  return (
    <div style={{ minHeight: '100vh', background: '#f3f4f6', padding: '40px 20px' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ marginBottom: '30px' }}>
          <h1 style={{ fontSize: '32px' }}>Admin Dashboard</h1>
          <p style={{ color: '#6b7280' }}>Welcome back, {user?.full_name}!</p>
        </div>
        
        {/* Stats Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '40px' }}>
          {statsCards.map((stat, idx) => (
            <div key={idx} style={{ background: 'white', borderRadius: '15px', padding: '20px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <p style={{ color: '#6b7280', fontSize: '14px' }}>{stat.title}</p>
                  <p style={{ fontSize: '32px', fontWeight: 'bold', marginTop: '5px' }}>{stat.value}</p>
                </div>
                <div style={{ fontSize: '40px' }}>{stat.icon}</div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Quick Actions */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', marginBottom: '40px' }}>
          <Link to="/admin/menu" style={{ background: '#4c1d95', color: 'white', padding: '15px', textAlign: 'center', borderRadius: '10px', textDecoration: 'none' }}>🍕 Manage Menu</Link>
          <Link to="/admin/locations" style={{ background: '#4c1d95', color: 'white', padding: '15px', textAlign: 'center', borderRadius: '10px', textDecoration: 'none' }}>📍 Manage Locations</Link>
          <Link to="/admin/bookings" style={{ background: '#4c1d95', color: 'white', padding: '15px', textAlign: 'center', borderRadius: '10px', textDecoration: 'none' }}>📅 View All Bookings</Link>
        </div>
        
        {/* Recent Orders */}
        <div style={{ background: 'white', borderRadius: '15px', padding: '20px', marginBottom: '30px' }}>
          <h2 style={{ marginBottom: '20px' }}>Recent Orders</h2>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
                  <th style={{ padding: '12px', textAlign: 'left' }}>Order ID</th>
                  <th style={{ padding: '12px', textAlign: 'left' }}>Customer</th>
                  <th style={{ padding: '12px', textAlign: 'left' }}>Total</th>
                  <th style={{ padding: '12px', textAlign: 'left' }}>Status</th>
                  <th style={{ padding: '12px', textAlign: 'left' }}>Date</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map(order => (
                  <tr key={order.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                    <td style={{ padding: '12px' }}>#{order.id}</td>
                    <td style={{ padding: '12px' }}>{order.full_name}</td>
                    <td style={{ padding: '12px' }}>${order.total_amount}</td>
                    <td style={{ padding: '12px' }}>
                      <span style={{ background: order.status === 'completed' ? '#10b981' : '#f59e0b', color: 'white', padding: '4px 12px', borderRadius: '20px', fontSize: '12px' }}>
                        {order.status}
                      </span>
                    </td>
                    <td style={{ padding: '12px' }}>{new Date(order.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        
        {/* Recent Table Bookings */}
        <div style={{ background: 'white', borderRadius: '15px', padding: '20px' }}>
          <h2 style={{ marginBottom: '20px' }}>Recent Table Bookings</h2>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
                  <th style={{ padding: '12px', textAlign: 'left' }}>Booking ID</th>
                  <th style={{ padding: '12px', textAlign: 'left' }}>Customer</th>
                  <th style={{ padding: '12px', textAlign: 'left' }}>Date & Time</th>
                  <th style={{ padding: '12px', textAlign: 'left' }}>Party Size</th>
                  <th style={{ padding: '12px', textAlign: 'left' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentTableBookings.map(booking => (
                  <tr key={booking.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                    <td style={{ padding: '12px' }}>#{booking.id}</td>
                    <td style={{ padding: '12px' }}>{booking.full_name}</td>
                    <td style={{ padding: '12px' }}>{booking.booking_date} {booking.booking_time}</td>
                    <td style={{ padding: '12px' }}>{booking.party_size}</td>
                    <td style={{ padding: '12px' }}>
                      <span style={{ background: booking.status === 'confirmed' ? '#10b981' : '#f59e0b', color: 'white', padding: '4px 12px', borderRadius: '20px', fontSize: '12px' }}>
                        {booking.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;