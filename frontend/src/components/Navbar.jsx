import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useCart } from "../contexts/CartContext";
import ProfileDropdown from "./ProfileDropdown";

//*GLOBAL CSS
const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;1,700&family=DM+Sans:wght@400;500;600;700&display=swap');
  *, *::before, *::after { box-sizing: border-box; }

  @keyframes nb-slideDown {
    from { opacity: 0; transform: translateY(-18px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes nb-fadeIn {
    from { opacity: 0; }
    to   { opacity: 1; }
  }

  .nb-bar { animation: nb-slideDown 0.5s cubic-bezier(0.22,1,0.36,1) both; }

  .nb-link {
    position: relative;
    font-family: 'DM Sans', sans-serif;
    font-size: 14px;
    font-weight: 500;
    color: rgba(255,255,255,0.6);
    text-decoration: none;
    letter-spacing: 0.3px;
    padding: 4px 0;
    transition: color 0.2s;
  }
  .nb-link::after {
    content: '';
    position: absolute;
    bottom: -2px;
    left: 0;
    width: 0;
    height: 2px;
    background: #E8441A;
    border-radius: 2px;
    transition: width 0.25s cubic-bezier(0.22,1,0.36,1);
  }
  .nb-link:hover { color: #fff; }
  .nb-link:hover::after { width: 100%; }
  .nb-link.active { color: #fff; }
  .nb-link.active::after { width: 100%; }

  .nb-btn-signin {
    background: #E8441A;
    color: #fff;
    padding: 9px 22px;
    border-radius: 50px;
    text-decoration: none;
    font-family: 'DM Sans', sans-serif;
    font-size: 13px;
    font-weight: 700;
    letter-spacing: 0.3px;
    transition: transform 0.2s, box-shadow 0.2s;
    box-shadow: 0 3px 14px rgba(232,68,26,0.35);
    white-space: nowrap;
  }
  .nb-btn-signin:hover {
    transform: translateY(-1px);
    box-shadow: 0 5px 20px rgba(232,68,26,0.5);
  }

  .nb-btn-register {
    background: transparent;
    border: 1.5px solid rgba(255,255,255,0.2);
    color: rgba(255,255,255,0.8);
    padding: 9px 22px;
    border-radius: 50px;
    text-decoration: none;
    font-family: 'DM Sans', sans-serif;
    font-size: 13px;
    font-weight: 600;
    letter-spacing: 0.3px;
    transition: border-color 0.2s, color 0.2s, background 0.2s;
    white-space: nowrap;
  }
  .nb-btn-register:hover {
    border-color: #E8441A;
    color: #fff;
    background: rgba(232,68,26,0.08);
  }

  .nb-cart {
    position: relative;
    font-size: 20px;
    text-decoration: none;
    color: rgba(255,255,255,0.75);
    display: flex;
    align-items: center;
    transition: color 0.2s, transform 0.2s;
  }
  .nb-cart:hover {
    color: #E8441A;
    transform: scale(1.1);
  }

  .nb-mobile-toggle {
    display: none;
    background: none;
    border: 1.5px solid rgba(255,255,255,0.15);
    border-radius: 8px;
    color: rgba(255,255,255,0.7);
    padding: 6px 10px;
    cursor: pointer;
    font-size: 18px;
    transition: border-color 0.2s, color 0.2s;
  }
  .nb-mobile-toggle:hover {
    border-color: #E8441A;
    color: #E8441A;
  }

  @media (max-width: 860px) {
    .nb-links-row { display: none !important; }
    .nb-mobile-toggle { display: flex !important; align-items: center; }
    .nb-mobile-menu {
      display: flex;
      flex-direction: column;
      gap: 2px;
      padding: 10px 0 14px;
      border-top: 1px solid rgba(255,255,255,0.07);
      animation: nb-fadeIn 0.2s ease both;
    }
    .nb-mobile-link {
      font-family: 'DM Sans', sans-serif;
      font-size: 14px;
      font-weight: 500;
      color: rgba(255,255,255,0.65);
      text-decoration: none;
      padding: 10px 16px;
      border-radius: 10px;
      transition: background 0.15s, color 0.15s;
    }
    .nb-mobile-link:hover, .nb-mobile-link.active {
      background: rgba(232,68,26,0.1);
      color: #fff;
    }
  }
  @media (min-width: 861px) {
    .nb-mobile-menu { display: none !important; }
  }
`;

function Navbar() {
  const { user } = useAuth();
  const { getCount } = useCart();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Inject CSS
  useEffect(() => {
    if (document.getElementById("nb-css")) return;
    const s = document.createElement("style");
    s.id = "nb-css";
    s.textContent = GLOBAL_CSS;
    document.head.appendChild(s);
    return () => {
      const el = document.getElementById("nb-css");
      if (el) el.remove();
    };
  }, []);

  // Scroll shadow
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const navLinks =
    user?.role === "admin"
      ? [
          { path: "/admin", label: "Dashboard" },
          { path: "/admin/menu", label: "Menu" },
          { path: "/admin/bookings", label: "Bookings" },
          { path: "/admin/users", label: "Users" },
          { path: "/admin/reports", label: "Reports" },
        ]
      : [
          { path: "/", label: "Home" },
          { path: "/menu", label: "Menu" },
          { path: "/table-booking", label: "Book Table" },
          { path: "/my-bookings", label: "My Bookings" },
        ];

  const isActive = (path) =>
    path === "/"
      ? location.pathname === "/"
      : location.pathname.startsWith(path);

  const cartCount = getCount();

  return (
    <nav
      className="nb-bar"
      style={{
        position: "sticky",
        top: 0,
        zIndex: 1000,
        background: "rgba(10,10,10,0.88)",
        backdropFilter: "blur(14px)",
        WebkitBackdropFilter: "blur(14px)",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        boxShadow: scrolled ? "0 4px 28px rgba(0,0,0,0.4)" : "none",
        transition: "box-shadow 0.3s",
        fontFamily: "'DM Sans', sans-serif",
      }}
    >
      <div
        style={{
          maxWidth: "1280px",
          margin: "0 auto",
          padding: "0 32px",
        }}
      >
        {/* ── MAIN ROW ── */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            height: "64px",
            gap: "24px",
          }}
        >
          {/* Logo */}
          <Link
            to="/"
            style={{
              textDecoration: "none",
              flexShrink: 0,
              display: "flex",
              alignItems: "center",
              gap: "10px",
            }}
          >
            <span
              style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: "20px",
                fontWeight: "700",
                letterSpacing: "1.5px",
                color: "#fff",
                whiteSpace: "nowrap",
              }}
            >
              <span style={{ color: "#E8441A" }}>美食家</span> Epicure{" "}
              <span style={{ color: "#E8441A" }}>Hall</span>
            </span>
          </Link>

          {/* Desktop links */}
          <div
            className="nb-links-row"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "28px",
              flex: 1,
              justifyContent: "center",
            }}
          >
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`nb-link${isActive(link.path) ? " active" : ""}`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right side */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "16px",
              flexShrink: 0,
            }}
          >
            {user ? (
              <>
                {/* Cart */}
                <Link to="/cart" className="nb-cart" title="My Cart">
                  🛒
                  {cartCount > 0 && (
                    <span
                      style={{
                        position: "absolute",
                        top: "-7px",
                        right: "-9px",
                        background: "#E8441A",
                        color: "#fff",
                        width: "18px",
                        height: "18px",
                        borderRadius: "50%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontFamily: "'DM Sans',sans-serif",
                        fontSize: "10px",
                        fontWeight: "700",
                        border: "2px solid #0a0a0a",
                      }}
                    >
                      {cartCount}
                    </span>
                  )}
                </Link>

                {/* Profile */}
                <ProfileDropdown />
              </>
            ) : (
              <div
                style={{ display: "flex", alignItems: "center", gap: "10px" }}
              >
                <Link to="/login" className="nb-btn-signin">
                  Sign In
                </Link>
                <Link to="/register" className="nb-btn-register">
                  Register
                </Link>
              </div>
            )}

            {/* Mobile hamburger */}
            <button
              className="nb-mobile-toggle"
              onClick={() => setMobileOpen((prev) => !prev)}
              aria-label="Toggle menu"
            >
              {mobileOpen ? "✕" : "☰"}
            </button>
          </div>
        </div>

        {/* ── MOBILE MENU ── */}
        {mobileOpen && (
          <div className="nb-mobile-menu">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`nb-mobile-link${isActive(link.path) ? " active" : ""}`}
              >
                {link.label}
              </Link>
            ))}

            {!user && (
              <div
                style={{
                  display: "flex",
                  gap: "10px",
                  padding: "10px 16px 4px",
                }}
              >
                <Link
                  to="/login"
                  className="nb-btn-signin"
                  style={{ flex: 1, textAlign: "center" }}
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="nb-btn-register"
                  style={{ flex: 1, textAlign: "center" }}
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
