import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useCart } from "../contexts/CartContext";

function Navbar() {
  const { user, logout } = useAuth();
  const { getCount } = useCart();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = React.useState(false);

  const navLinks =
    user?.role === "admin"
      ? [
          { path: "/admin", label: "Dashboard" },
          { path: "/admin/menu", label: "Menu" },
          { path: "/admin/locations", label: "Locations" },
          { path: "/admin/bookings", label: "Bookings" },
        ]
      : [
          { path: "/", label: "Home" },
          { path: "/menu", label: "Menu" },
          { path: "/table-booking", label: "Book Table" },
          { path: "/event-booking", label: "Events" },
          { path: "/my-bookings", label: "My Bookings" },
        ];

  return (
    <nav
      style={{
        background: "#4c1d95",
        color: "white",
        padding: "15px 20px",
        position: "sticky",
        top: 0,
        zIndex: 100,
      }}
    >
      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
        }}
      >
        <Link
          to="/"
          style={{
            color: "white",
            textDecoration: "none",
            fontSize: "24px",
            fontWeight: "bold",
          }}
        >
          🍽️ Gourmet 3D
        </Link>

        <div
          style={{
            display: "flex",
            gap: "25px",
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              style={{ color: "white", textDecoration: "none" }}
            >
              {link.label}
            </Link>
          ))}

          {/* ✅ YAHAN ADD KARO - Admin extra links */}
          {user?.role === "admin" && (
            <>
              <Link
                to="/admin/users"
                style={{ color: "white", textDecoration: "none" }}
              >
                👥 Users
              </Link>
              <Link
                to="/admin/reports"
                style={{ color: "white", textDecoration: "none" }}
              >
                📊 Reports
              </Link>
            </>
          )}

          {user ? (
            <>
              <Link
                to="/cart"
                style={{
                  color: "white",
                  textDecoration: "none",
                  position: "relative",
                }}
              >
                🛒 Cart{" "}
                {getCount() > 0 && (
                  <span
                    style={{
                      background: "red",
                      borderRadius: "50%",
                      padding: "2px 6px",
                      fontSize: "12px",
                      marginLeft: "5px",
                    }}
                  >
                    {getCount()}
                  </span>
                )}
              </Link>
              <button
                onClick={logout}
                style={{
                  background: "#dc2626",
                  color: "white",
                  padding: "5px 15px",
                  border: "none",
                  borderRadius: "5px",
                  cursor: "pointer",
                }}
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" style={{ color: "white" }}>
                Login
              </Link>
              <Link to="/register" style={{ color: "white" }}>
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
