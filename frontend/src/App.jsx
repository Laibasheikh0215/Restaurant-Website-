import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import Navbar from './components/Navbar';

// Normal imports (no lazy loading for now)
import HomePage from './pages/user/HomePage';
import MenuPage from './pages/user/MenuPage';
import CartPage from './pages/user/CartPage';
import CheckoutPage from './pages/user/CheckoutPage';
import TableBookingPage from './pages/user/TableBookingPage';
import EventBookingPage from './pages/user/EventBookingPage';
import MyBookingsPage from './pages/user/MyBookingsPage';
import OrderTrackingPage from './pages/user/OrderTrackingPage';
import ProfilePage from './pages/user/ProfilePage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import ResetPasswordPage from './pages/auth/ResetPasswordPage';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminMenu from './pages/admin/AdminMenu';
import AdminLocations from './pages/admin/AdminLocations';
import AdminBookings from './pages/admin/AdminBookings';
import AdminUsers from './pages/admin/AdminUsers';
import AdminReports from './pages/admin/AdminReports';

// Protected route wrapper - ONLY for authenticated pages
const ProtectedRoute = ({ children, adminOnly = false }) => {
    const { user, loading } = useAuth();
    
    if (loading) return <div style={{ textAlign: 'center', padding: '50px' }}>Loading...</div>;
    
    // Not logged in - redirect to login
    if (!user) return <Navigate to="/login" />;
    
    // Admin only page but user is not admin
    if (adminOnly && user.role !== 'admin') return <Navigate to="/" />;
    
    return children;
};

function App() {
    return (
        <AuthProvider>
            <CartProvider>
                <Router>
                    <Navbar />
                    <Routes>
                        {/* Public Routes - Anyone can access */}
                        <Route path="/" element={<HomePage />} />
                        <Route path="/login" element={<LoginPage />} />
                        <Route path="/register" element={<RegisterPage />} />
                        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                        <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
                        
                        {/* Protected Routes - Need to be logged in */}
                        <Route path="/menu" element={<ProtectedRoute><MenuPage /></ProtectedRoute>} />
                        <Route path="/cart" element={<ProtectedRoute><CartPage /></ProtectedRoute>} />
                        <Route path="/checkout" element={<ProtectedRoute><CheckoutPage /></ProtectedRoute>} />
                        <Route path="/table-booking" element={<ProtectedRoute><TableBookingPage /></ProtectedRoute>} />
                        <Route path="/event-booking" element={<ProtectedRoute><EventBookingPage /></ProtectedRoute>} />
                        <Route path="/my-bookings" element={<ProtectedRoute><MyBookingsPage /></ProtectedRoute>} />
                        <Route path="/track-order/:orderId" element={<ProtectedRoute><OrderTrackingPage /></ProtectedRoute>} />
                        <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
                        
                        {/* Admin Routes - Need admin role */}
                        <Route path="/admin" element={<ProtectedRoute adminOnly={true}><AdminDashboard /></ProtectedRoute>} />
                        <Route path="/admin/menu" element={<ProtectedRoute adminOnly={true}><AdminMenu /></ProtectedRoute>} />
                        <Route path="/admin/locations" element={<ProtectedRoute adminOnly={true}><AdminLocations /></ProtectedRoute>} />
                        <Route path="/admin/bookings" element={<ProtectedRoute adminOnly={true}><AdminBookings /></ProtectedRoute>} />
                        <Route path="/admin/users" element={<ProtectedRoute adminOnly={true}><AdminUsers /></ProtectedRoute>} />
                        <Route path="/admin/reports" element={<ProtectedRoute adminOnly={true}><AdminReports /></ProtectedRoute>} />
                    </Routes>
                    <Toaster position="top-right" />
                </Router>
            </CartProvider>
        </AuthProvider>
    );
}

export default App;