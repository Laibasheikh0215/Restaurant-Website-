import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { CartProvider } from "./contexts/CartContext";
import Navbar from "./components/Navbar";

// Import all pages
const HomePage = lazy(() => import("./pages/user/HomePage"));
const MenuPage = lazy(() => import("./pages/user/MenuPage"));
const CartPage = lazy(() => import("./pages/user/CartPage"));
const CheckoutPage = lazy(() => import("./pages/user/CheckoutPage"));
const TableBookingPage = lazy(() => import("./pages/user/TableBookingPage"));
const EventBookingPage = lazy(() => import("./pages/user/EventBookingPage"));
const MyBookingsPage = lazy(() => import("./pages/user/MyBookingsPage"));
const LoginPage = lazy(() => import("./pages/auth/LoginPage"));
const RegisterPage = lazy(() => import("./pages/auth/RegisterPage"));
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const AdminMenu = lazy(() => import("./pages/admin/AdminMenu"));
const AdminLocations = lazy(() => import("./pages/admin/AdminLocations"));
const AdminBookings = lazy(() => import("./pages/admin/AdminBookings"));
const OrderTrackingPage = lazy(() => import("./pages/user/OrderTrackingPage"));
const AdminUsers = lazy(() => import("./pages/admin/AdminUsers"));
const AdminReports = lazy(() => import("./pages/admin/AdminReports"));
const ForgotPasswordPage = lazy(
  () => import("./pages/auth/ForgotPasswordPage"),
);
const ResetPasswordPage = lazy(() => import("./pages/auth/ResetPasswordPage"));

// Loading component
const LoadingSpinner = () => (
  <div
    style={{
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      height: "100vh",
    }}
  >
    <div style={{ textAlign: "center" }}>
      <div style={{ fontSize: "40px" }}>🍽️</div>
      <p>Loading...</p>
    </div>
  </div>
);

// Protected route wrapper
const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { user, loading } = useAuth();

  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  if (adminOnly && user.role !== "admin") return <Navigate to="/" />;

  return children;
};

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <Navbar />
          <Routes>
            <Route
              path="/"
              element={
                <Suspense fallback={<LoadingSpinner />}>
                  <HomePage />
                </Suspense>
              }
            />
            {/* Public Routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route
              path="/track-order/:orderId"
              element={
                <ProtectedRoute>
                  <OrderTrackingPage />
                </ProtectedRoute>
              }
            />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route
              path="/reset-password/:token"
              element={<ResetPasswordPage />}
            />
            {/* User Routes */}
            <Route
              path="/menu"
              element={
                <ProtectedRoute>
                  <MenuPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/cart"
              element={
                <ProtectedRoute>
                  <CartPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/checkout"
              element={
                <ProtectedRoute>
                  <CheckoutPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/table-booking"
              element={
                <ProtectedRoute>
                  <TableBookingPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/event-booking"
              element={
                <ProtectedRoute>
                  <EventBookingPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/my-bookings"
              element={
                <ProtectedRoute>
                  <MyBookingsPage />
                </ProtectedRoute>
              }
            />

            {/* Admin Routes */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute adminOnly={true}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/menu"
              element={
                <ProtectedRoute adminOnly={true}>
                  <AdminMenu />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/locations"
              element={
                <ProtectedRoute adminOnly={true}>
                  <AdminLocations />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/bookings"
              element={
                <ProtectedRoute adminOnly={true}>
                  <AdminBookings />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/users"
              element={
                <ProtectedRoute adminOnly={true}>
                  <AdminUsers />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/reports"
              element={
                <ProtectedRoute adminOnly={true}>
                  <AdminReports />
                </ProtectedRoute>
              }
            />
          </Routes>
          <Toaster position="top-right" />
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
