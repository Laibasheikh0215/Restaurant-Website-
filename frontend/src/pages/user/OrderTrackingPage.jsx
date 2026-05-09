import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import io from 'socket.io-client';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

function OrderTrackingPage() {
    const { orderId } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [socket, setSocket] = useState(null);
    const [lastUpdate, setLastUpdate] = useState(null);

    useEffect(() => {
        // Connect to socket
        const newSocket = io('http://localhost:5000');
        setSocket(newSocket);
        
        // Register user with socket
        if (user) {
            newSocket.emit('register-user', user.id);
        }
        
        // Listen for order updates
        newSocket.on('order-update', (data) => {
            if (data.orderId == orderId) {
                toast.success(data.message);
                fetchOrderDetails();
                setLastUpdate(new Date());
            }
        });
        
        fetchOrderDetails();
        
        return () => {
            newSocket.disconnect();
        };
    }, [orderId, user]);

    const fetchOrderDetails = async () => {
        try {
            const response = await axios.get(
                `http://localhost:5000/api/orders/track/${orderId}`,
                { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
            );
            setOrder(response.data);
        } catch (error) {
            console.error('Error fetching order:', error);
            toast.error('Order not found');
            navigate('/my-bookings');
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status) => {
        const colors = {
            'pending': '#f59e0b',
            'confirmed': '#3b82f6',
            'preparing': '#8b5cf6',
            'ready': '#10b981',
            'completed': '#10b981',
            'cancelled': '#ef4444'
        };
        return colors[status] || '#6b7280';
    };

    const getStatusIcon = (status) => {
        const icons = {
            'pending': '⏳',
            'confirmed': '✅',
            'preparing': '🍳',
            'ready': '🎉',
            'completed': '🏁',
            'cancelled': '❌'
        };
        return icons[status] || '📦';
    };

    if (loading) {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f3f4f6' }}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '40px', marginBottom: '20px' }}>🔄</div>
                    <p>Loading order details...</p>
                </div>
            </div>
        );
    }

    if (!order) {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f3f4f6' }}>
                <div style={{ textAlign: 'center', background: 'white', padding: '40px', borderRadius: '15px' }}>
                    <h2>Order not found</h2>
                    <button onClick={() => navigate('/my-bookings')} style={{ marginTop: '20px', padding: '10px 20px', background: '#4c1d95', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
                        Back to My Orders
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div style={{ minHeight: '100vh', background: '#f3f4f6', padding: '40px 20px' }}>
            <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                {/* Header */}
                <div style={{ background: 'white', borderRadius: '15px', padding: '20px', marginBottom: '20px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                        <div>
                            <h1 style={{ fontSize: '24px', marginBottom: '5px' }}>Order #{order.id}</h1>
                            <p style={{ color: '#6b7280' }}>{new Date(order.created_at).toLocaleString()}</p>
                        </div>
                        <div style={{ 
                            background: getStatusColor(order.status), 
                            color: 'white', 
                            padding: '8px 20px', 
                            borderRadius: '30px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                        }}>
                            <span>{getStatusIcon(order.status)}</span>
                            <span style={{ fontWeight: 'bold' }}>{order.status.toUpperCase()}</span>
                        </div>
                    </div>
                </div>

                {/* Live Tracking Progress Bar */}
                <div style={{ background: 'white', borderRadius: '15px', padding: '30px', marginBottom: '20px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                        <h3>📍 Live Order Tracking</h3>
                        {lastUpdate && (
                            <span style={{ fontSize: '12px', color: '#6b7280' }}>
                                Last updated: {lastUpdate.toLocaleTimeString()}
                            </span>
                        )}
                    </div>
                    
                    {/* Progress Bar */}
                    <div style={{ marginBottom: '30px' }}>
                        <div style={{ 
                            height: '10px', 
                            background: '#e5e7eb', 
                            borderRadius: '5px', 
                            overflow: 'hidden' 
                        }}>
                            <div style={{ 
                                width: `${order.tracking?.percent || 0}%`, 
                                height: '100%', 
                                background: order.status === 'cancelled' ? '#ef4444' : '#10b981',
                                transition: 'width 0.5s ease-in-out'
                            }} />
                        </div>
                        <div style={{ 
                            display: 'flex', 
                            justifyContent: 'space-between', 
                            marginTop: '15px',
                            flexWrap: 'wrap'
                        }}>
                            <div style={{ textAlign: 'center', flex: 1 }}>
                                <div style={{ fontSize: '24px' }}>📝</div>
                                <div style={{ fontSize: '12px', fontWeight: 'bold' }}>Order Placed</div>
                            </div>
                            <div style={{ textAlign: 'center', flex: 1 }}>
                                <div style={{ fontSize: '24px' }}>✅</div>
                                <div style={{ fontSize: '12px', fontWeight: 'bold' }}>Confirmed</div>
                            </div>
                            <div style={{ textAlign: 'center', flex: 1 }}>
                                <div style={{ fontSize: '24px' }}>🍳</div>
                                <div style={{ fontSize: '12px', fontWeight: 'bold' }}>Preparing</div>
                            </div>
                            <div style={{ textAlign: 'center', flex: 1 }}>
                                <div style={{ fontSize: '24px' }}>🎉</div>
                                <div style={{ fontSize: '12px', fontWeight: 'bold' }}>Ready</div>
                            </div>
                            <div style={{ textAlign: 'center', flex: 1 }}>
                                <div style={{ fontSize: '24px' }}>🏁</div>
                                <div style={{ fontSize: '12px', fontWeight: 'bold' }}>Completed</div>
                            </div>
                        </div>
                    </div>
                    
                    {/* Current Status Message */}
                    <div style={{ 
                        background: '#f3f4f6', 
                        borderRadius: '10px', 
                        padding: '15px',
                        textAlign: 'center'
                    }}>
                        <p style={{ fontSize: '18px', marginBottom: '5px' }}>
                            {order.tracking?.icon} {order.tracking?.label}
                        </p>
                        <p style={{ color: '#6b7280' }}>
                            {order.tracking?.percent}% Complete
                        </p>
                    </div>
                </div>

                {/* Order Items */}
                <div style={{ background: 'white', borderRadius: '15px', padding: '20px', marginBottom: '20px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}>
                    <h3 style={{ marginBottom: '15px' }}>🍽️ Order Items</h3>
                    {order.items?.map((item, idx) => (
                        <div key={idx} style={{ 
                            display: 'flex', 
                            justifyContent: 'space-between', 
                            padding: '10px 0',
                            borderBottom: idx < order.items.length - 1 ? '1px solid #e5e7eb' : 'none'
                        }}>
                            <div>
                                <span style={{ fontWeight: 'bold' }}>{item.name}</span>
                                <span style={{ color: '#6b7280', marginLeft: '10px' }}>x{item.quantity}</span>
                            </div>
                            <span>${(item.price * item.quantity).toFixed(2)}</span>
                        </div>
                    ))}
                    <div style={{ 
                        marginTop: '15px', 
                        paddingTop: '15px', 
                        borderTop: '2px solid #e5e7eb',
                        display: 'flex',
                        justifyContent: 'space-between',
                        fontWeight: 'bold',
                        fontSize: '18px'
                    }}>
                        <span>Total</span>
                        <span>${order.total_amount}</span>
                    </div>
                </div>

                {/* Real-time Update Animation */}
                {order.status !== 'completed' && order.status !== 'cancelled' && (
                    <div style={{ 
                        background: '#ecfdf5', 
                        borderRadius: '15px', 
                        padding: '20px',
                        textAlign: 'center',
                        border: '1px solid #10b981'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                            <div style={{ 
                                width: '10px', 
                                height: '10px', 
                                background: '#10b981', 
                                borderRadius: '50%',
                                animation: 'pulse 1.5s infinite'
                            }} />
                            <p style={{ margin: 0, color: '#10b981' }}>
                                🔴 Live tracking active - Updates will appear automatically
                            </p>
                        </div>
                    </div>
                )}

                {/* Action Buttons */}
                <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', marginTop: '20px' }}>
                    <button 
                        onClick={() => navigate('/my-bookings')}
                        style={{ padding: '12px 30px', background: '#4c1d95', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
                    >
                        ← Back to My Orders
                    </button>
                </div>
            </div>
        </div>
    );
}

export default OrderTrackingPage;