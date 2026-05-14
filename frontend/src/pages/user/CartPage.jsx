import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../../contexts/CartContext";
import { useAuth } from "../../contexts/AuthContext";

/* ─────────────────────────────────────────────
   GLOBAL CSS
───────────────────────────────────────────────*/
const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;1,700&family=DM+Sans:wght@400;500;600;700&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  @keyframes fadeSlideUp {
    from { opacity: 0; transform: translateY(24px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes navSlideDown {
    from { opacity: 0; transform: translateY(-20px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes dropdownFadeIn {
    from { opacity: 0; transform: translateY(-8px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes spin { to { transform: rotate(360deg); } }
  @keyframes emptyFloat {
    0%, 100% { transform: translateY(0px); }
    50%       { transform: translateY(-10px); }
  }

  .nav-bar        { animation: navSlideDown 0.5s ease both; }
  .dropdown-menu  { animation: dropdownFadeIn 0.2s ease both; }
  .cart-header    { animation: fadeSlideUp 0.6s ease 0.1s both; }
  .cart-list      { animation: fadeSlideUp 0.6s ease 0.22s both; }
  .cart-summary   { animation: fadeSlideUp 0.6s ease 0.32s both; }
  .empty-anim     { animation: emptyFloat 3s ease-in-out infinite; }

  .nav-link:hover        { color: #fff !important; }
  .nav-cart:hover        { color: #E8441A !important; }
  .nav-avatar:hover      { opacity: 0.85; }
  .dropdown-item:hover   { background: rgba(232,68,26,0.08) !important; color: #E8441A !important; }
  .dropdown-logout:hover { background: rgba(232,68,26,0.12) !important; color: #E8441A !important; }
  .footer-link:hover     { color: rgba(255,255,255,0.7) !important; }

  .cart-row {
    display: flex; align-items: center;
    padding: 22px 28px; gap: 20px;
    border-bottom: 1px solid rgba(255,255,255,0.06);
    transition: background 0.2s;
  }
  .cart-row:last-child { border-bottom: none; }
  .cart-row:hover { background: rgba(255,255,255,0.02); }

  .qty-btn {
    width: 32px; height: 32px; border-radius: 50%;
    border: 1.5px solid rgba(255,255,255,0.12);
    background: rgba(255,255,255,0.04);
    color: #fff; font-size: 16px; cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    transition: border-color 0.2s, background 0.2s, transform 0.15s;
    font-family: 'DM Sans', sans-serif; font-weight: 600;
  }
  .qty-btn:hover {
    border-color: #E8441A;
    background: rgba(232,68,26,0.1);
    transform: scale(1.1);
  }

  .remove-btn {
    background: none; border: none; cursor: pointer;
    color: rgba(255,80,80,0.5); font-size: 14px;
    font-family: 'DM Sans', sans-serif; font-weight: 600;
    transition: color 0.2s; padding: 4px 10px;
    border-radius: 6px;
  }
  .remove-btn:hover { color: #ff5050; background: rgba(255,80,80,0.08); }

  .btn-primary-lg {
    display: inline-block; text-align: center;
    background: #E8441A; color: #fff;
    padding: 15px 32px; border-radius: 50px;
    textDecoration: none;
    font-family: 'DM Sans', sans-serif; font-size: 15px; font-weight: 700;
    box-shadow: 0 4px 20px rgba(232,68,26,0.35);
    cursor: pointer; border: none; width: 100%;
    transition: transform 0.2s, box-shadow 0.2s;
    letter-spacing: 0.3px;
  }
  .btn-primary-lg:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 28px rgba(232,68,26,0.5);
  }

  .btn-outline-lg {
    display: inline-block; text-align: center;
    background: transparent; color: rgba(255,80,80,0.8);
    padding: 13px 32px; border-radius: 50px;
    border: 1.5px solid rgba(255,80,80,0.3);
    font-family: 'DM Sans', sans-serif; font-size: 14px; font-weight: 600;
    cursor: pointer; width: 100%;
    transition: border-color 0.2s, background 0.2s, transform 0.2s;
  }
  .btn-outline-lg:hover {
    border-color: rgba(255,80,80,0.6);
    background: rgba(255,80,80,0.06);
    transform: translateY(-1px);
  }

  .browse-btn {
    display: inline-block; text-align: center;
    background: #E8441A; color: #fff;
    padding: 13px 36px; border-radius: 50px;
    text-decoration: none;
    font-family: 'DM Sans', sans-serif; font-size: 14px; font-weight: 700;
    box-shadow: 0 4px 20px rgba(232,68,26,0.35);
    transition: transform 0.2s, box-shadow 0.2s;
    margin-top: 24px; letter-spacing: 0.3px;
  }
  .browse-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 28px rgba(232,68,26,0.5);
  }

  .footer-bar {
    background: #0a0a0a; padding: 24px 60px;
    display: flex; align-items: center;
    justify-content: space-between; flex-wrap: wrap; gap: 12px;
    border-top: 1px solid rgba(255,255,255,0.05);
  }
`;

/* ── NAV DROPDOWN (same as MenuPage) ── */
function ProfileDropdown({ user, onLogout }) {
  const [open, setOpen] = useState(false);
  const ref = React.useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((w) => w[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : (user?.email?.[0]?.toUpperCase() ?? "U");

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <div
        className="nav-avatar"
        onClick={() => setOpen((p) => !p)}
        style={{
          width: "38px",
          height: "38px",
          borderRadius: "50%",
          background: "#E8441A",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "'DM Sans',sans-serif",
          fontSize: "14px",
          fontWeight: "700",
          color: "#fff",
          cursor: "pointer",
          userSelect: "none",
          transition: "opacity 0.2s",
        }}
      >
        {initials}
      </div>
      {open && (
        <div
          className="dropdown-menu"
          style={{
            position: "absolute",
            top: "calc(100% + 14px)",
            right: 0,
            background: "#1a1a1a",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: "14px",
            padding: "8px",
            minWidth: "200px",
            boxShadow: "0 16px 48px rgba(0,0,0,0.5)",
            zIndex: 200,
          }}
        >
          <div
            style={{
              position: "absolute",
              top: "-6px",
              right: "14px",
              width: "12px",
              height: "12px",
              background: "#1a1a1a",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRight: "none",
              borderBottom: "none",
              transform: "rotate(45deg)",
            }}
          />
          <div
            style={{
              padding: "10px 14px 12px",
              borderBottom: "1px solid rgba(255,255,255,0.07)",
              marginBottom: "6px",
            }}
          >
            <div
              style={{
                fontFamily: "'DM Sans',sans-serif",
                fontSize: "14px",
                fontWeight: "600",
                color: "#fff",
                marginBottom: "2px",
              }}
            >
              {user?.name || "My Account"}
            </div>
            {user?.email && (
              <div
                style={{
                  fontFamily: "'DM Sans',sans-serif",
                  fontSize: "12px",
                  color: "rgba(255,255,255,0.4)",
                }}
              >
                {user.email}
              </div>
            )}
          </div>
          {[
            { to: "/profile", label: "👤 \u00a0 My Profile" },
            { to: "/orders", label: "🧾 \u00a0 My Orders" },
            { to: "/table-booking", label: "📅 \u00a0 My Reservations" },
            { to: "/settings", label: "⚙️ \u00a0 Settings" },
          ].map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              className="dropdown-item"
              onClick={() => setOpen(false)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                padding: "10px 14px",
                borderRadius: "8px",
                textDecoration: "none",
                fontFamily: "'DM Sans',sans-serif",
                fontSize: "14px",
                color: "rgba(255,255,255,0.75)",
                transition: "background 0.15s, color 0.15s",
              }}
            >
              {label}
            </Link>
          ))}
          <div
            style={{
              height: "1px",
              background: "rgba(255,255,255,0.07)",
              margin: "6px 0",
            }}
          />
          <button
            className="dropdown-logout"
            onClick={() => {
              setOpen(false);
              onLogout();
            }}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              padding: "10px 14px",
              borderRadius: "8px",
              fontFamily: "'DM Sans',sans-serif",
              fontSize: "14px",
              color: "rgba(255,100,80,0.9)",
              transition: "background 0.15s, color 0.15s",
              cursor: "pointer",
              background: "none",
              border: "none",
              width: "100%",
            }}
          >
            🚪 &nbsp; Logout
          </button>
        </div>
      )}
    </div>
  );
}

/* ── MAIN COMPONENT ── */
function CartPage() {
  const { cartItems, removeFromCart, updateQuantity, getTotal, clearCart } =
    useCart();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (document.getElementById("epicure-cart-css")) return;
    const s = document.createElement("style");
    s.id = "epicure-cart-css";
    s.textContent = GLOBAL_CSS;
    document.head.appendChild(s);
    return () => {
      const el = document.getElementById("epicure-cart-css");
      if (el) el.remove();
    };
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  const cartCount = cartItems?.reduce((sum, i) => sum + i.quantity, 0) ?? 0;

  const NAV_LINKS = [
    { label: "Home", href: "/" },
    { label: "Menu", href: "/menu" },
    { label: "Book Tables", href: "/table-booking" },
    { label: "Events", href: "/event-booking" },
    { label: "My Bookings", href: "/my-bookings" },
  ];

  /* ── NAV shared markup ── */
  const Nav = (
    <nav
      className="nav-bar"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "18px 60px",
        background: "rgba(10,10,10,0.88)",
        backdropFilter: "blur(14px)",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      <a
        href="/"
        style={{
          fontSize: "22px",
          fontFamily: "'Playfair Display', serif",
          fontWeight: "700",
          letterSpacing: "2px",
          color: "#fff",
          textDecoration: "none",
        }}
      >
        <span style={{ color: "#E8441A" }}>美食家大廳</span> Epicure{" "}
        <span style={{ color: "#E8441A" }}>Hall</span>
      </a>

      {/* ── UPDATED NAV LINKS ── */}
      <ul
        style={{
          display: "flex",
          gap: "32px",
          listStyle: "none",
          fontFamily: "'DM Sans',sans-serif",
          fontSize: "14px",
          fontWeight: "500",
        }}
      >
        {NAV_LINKS.map(({ label, href }) => (
          <li key={label}>
            <a
              href={href}
              className="nav-link"
              style={{
                color: "rgba(255,255,255,0.7)",
                textDecoration: "none",
                transition: "color 0.2s",
              }}
            >
              {label}
            </a>
          </li>
        ))}
      </ul>

      {/* ── RIGHT SIDE — unchanged ── */}
      <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
        {user ? (
          <>
            <Link
              to="/cart"
              className="nav-cart"
              style={{
                fontSize: "20px",
                textDecoration: "none",
                color: "#E8441A",
                position: "relative",
                display: "flex",
                alignItems: "center",
                transition: "color 0.2s",
              }}
            >
              🛒
              {cartCount > 0 && (
                <span
                  style={{
                    position: "absolute",
                    top: "-6px",
                    right: "-8px",
                    background: "#E8441A",
                    color: "#fff",
                    width: "18px",
                    height: "18px",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontFamily: "'DM Sans',sans-serif",
                    fontSize: "11px",
                    fontWeight: "700",
                  }}
                >
                  {cartCount}
                </span>
              )}
            </Link>
            <ProfileDropdown user={user} onLogout={handleLogout} />
          </>
        ) : (
          <div>
            <Link
              to="/login"
              style={{
                background: "#E8441A",
                color: "#fff",
                padding: "10px 24px",
                borderRadius: "50px",
                textDecoration: "none",
                fontFamily: "'DM Sans',sans-serif",
                fontSize: "14px",
                fontWeight: "600",
              }}
            >
              Sign In
            </Link>
            <Link
              to="/register"
              style={{
                background: "transparent",
                border: "1px solid rgba(255,255,255,0.3)",
                color: "#fff",
                padding: "10px 24px",
                borderRadius: "50px",
                textDecoration: "none",
                fontFamily: "'DM Sans',sans-serif",
                fontSize: "14px",
                fontWeight: "600",
                marginLeft: "12px",
              }}
            >
              Sign Up
            </Link>
          </div>
        )}
      </div>
    </nav>
  );

  /* ── EMPTY STATE ── */
  if (cartItems.length === 0) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#0a0a0a",
          fontFamily: "'DM Sans', sans-serif",
          color: "#fff",
        }}
      >
        {Nav}
        <div
          style={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            paddingTop: "80px",
          }}
        >
          <div style={{ textAlign: "center" }}>
            <div
              className="empty-anim"
              style={{
                fontSize: "80px",
                marginBottom: "24px",
                display: "inline-block",
              }}
            >
              🛒
            </div>
            <h2
              style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: "32px",
                fontWeight: "700",
                color: "#fff",
                marginBottom: "12px",
              }}
            >
              Your Cart is{" "}
              <span style={{ color: "#E8441A", fontStyle: "italic" }}>
                Empty
              </span>
            </h2>
            <p
              style={{
                fontSize: "15px",
                color: "rgba(255,255,255,0.4)",
                lineHeight: "1.7",
                maxWidth: "320px",
                margin: "0 auto",
              }}
            >
              Looks like you haven't added anything yet. Explore our menu and
              find something you'll love.
            </p>
            <br />
            <Link to="/menu" className="browse-btn">
              Browse Menu →
            </Link>
          </div>
        </div>
        <footer className="footer-bar">
          <span
            style={{
              fontFamily: "'DM Sans',sans-serif",
              fontSize: "13px",
              color: "rgba(255,255,255,0.4)",
            }}
          >
            © 2026 Epicure Hall. All rights reserved.
          </span>
          <div style={{ display: "flex", gap: "24px" }}>
            {["Privacy Policy", "Terms", "Sitemap"].map((l) => (
              <a
                key={l}
                href="#"
                className="footer-link"
                style={{
                  fontFamily: "'DM Sans',sans-serif",
                  fontSize: "13px",
                  color: "rgba(255,255,255,0.4)",
                  textDecoration: "none",
                  transition: "color 0.2s",
                }}
              >
                {l}
              </a>
            ))}
          </div>
        </footer>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0a0a0a",
        fontFamily: "'DM Sans', sans-serif",
        color: "#fff",
      }}
    >
      {Nav}

      {/* Page header */}
      <div
        className="cart-header"
        style={{
          paddingTop: "120px",
          paddingBottom: "40px",
          textAlign: "center",
          background: "linear-gradient(180deg, #0f0f0f 0%, #0a0a0a 100%)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%,-50%)",
            width: "500px",
            height: "250px",
            background:
              "radial-gradient(ellipse, rgba(232,68,26,0.07) 0%, transparent 70%)",
            pointerEvents: "none",
          }}
        />
        <div style={{ position: "relative", zIndex: 1 }}>
          <div
            style={{
              fontSize: "12px",
              fontWeight: "700",
              letterSpacing: "4px",
              textTransform: "uppercase",
              color: "#E8441A",
              marginBottom: "12px",
            }}
          >
            Your Order
          </div>
          <h1
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: "clamp(32px,4vw,52px)",
              fontWeight: "700",
              color: "#fff",
              letterSpacing: "-0.5px",
            }}
          >
            Your{" "}
            <span style={{ color: "#E8441A", fontStyle: "italic" }}>Cart</span>
          </h1>
          <p
            style={{
              fontSize: "14px",
              color: "rgba(255,255,255,0.35)",
              marginTop: "10px",
            }}
          >
            {cartCount} item{cartCount !== 1 ? "s" : ""} in your order
          </p>
        </div>
      </div>

      {/* Main layout */}
      <div
        style={{
          maxWidth: "1100px",
          margin: "0 auto",
          padding: "0 40px 80px",
          display: "grid",
          gridTemplateColumns: "1fr 340px",
          gap: "28px",
          alignItems: "start",
        }}
      >
        {/* ── CART ITEMS ── */}
        <div className="cart-list">
          <div
            style={{
              background: "#141414",
              borderRadius: "20px",
              border: "1px solid rgba(255,255,255,0.06)",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                padding: "18px 28px",
                borderBottom: "1px solid rgba(255,255,255,0.06)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <h2
                style={{
                  fontFamily: "'Playfair Display', serif",
                  fontSize: "18px",
                  fontWeight: "700",
                  color: "#fff",
                }}
              >
                Order Items
              </h2>
              <button
                onClick={clearCart}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  fontFamily: "'DM Sans',sans-serif",
                  fontSize: "13px",
                  fontWeight: "600",
                  color: "rgba(255,80,80,0.55)",
                  transition: "color 0.2s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#ff5050")}
                onMouseLeave={(e) =>
                  (e.currentTarget.style.color = "rgba(255,80,80,0.55)")
                }
              >
                Clear all
              </button>
            </div>

            {cartItems.map((item) => (
              <div key={item.id} className="cart-row">
                <div
                  style={{
                    width: "64px",
                    height: "64px",
                    borderRadius: "14px",
                    flexShrink: 0,
                    background:
                      "linear-gradient(135deg, #1e0e06 0%, #2d1508 100%)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "28px",
                    border: "1px solid rgba(255,255,255,0.06)",
                  }}
                >
                  🍕
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h3
                    style={{
                      fontFamily: "'Playfair Display', serif",
                      fontSize: "16px",
                      fontWeight: "700",
                      color: "#fff",
                      marginBottom: "4px",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {item.name}
                  </h3>
                  <span
                    style={{
                      fontSize: "15px",
                      fontWeight: "700",
                      color: "#E8441A",
                    }}
                  >
                    ${parseFloat(item.price).toFixed(2)}
                  </span>
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    flexShrink: 0,
                  }}
                >
                  <button
                    className="qty-btn"
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                  >
                    −
                  </button>
                  <span
                    style={{
                      fontSize: "15px",
                      fontWeight: "700",
                      color: "#fff",
                      minWidth: "20px",
                      textAlign: "center",
                    }}
                  >
                    {item.quantity}
                  </span>
                  <button
                    className="qty-btn"
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                  >
                    +
                  </button>
                </div>
                <div
                  style={{ width: "72px", textAlign: "right", flexShrink: 0 }}
                >
                  <span
                    style={{
                      fontFamily: "'Playfair Display', serif",
                      fontSize: "16px",
                      fontWeight: "700",
                      color: "#fff",
                    }}
                  >
                    ${(parseFloat(item.price) * item.quantity).toFixed(2)}
                  </span>
                </div>
                <button
                  className="remove-btn"
                  onClick={() => removeFromCart(item.id)}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>

          <div style={{ marginTop: "16px" }}>
            <Link
              to="/menu"
              style={{
                fontFamily: "'DM Sans',sans-serif",
                fontSize: "13px",
                color: "rgba(255,255,255,0.35)",
                textDecoration: "none",
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                transition: "color 0.2s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#E8441A")}
              onMouseLeave={(e) =>
                (e.currentTarget.style.color = "rgba(255,255,255,0.35)")
              }
            >
              ← Continue browsing menu
            </Link>
          </div>
        </div>

        {/* ── ORDER SUMMARY ── */}
        <div
          className="cart-summary"
          style={{ position: "sticky", top: "100px" }}
        >
          <div
            style={{
              background: "#141414",
              borderRadius: "20px",
              border: "1px solid rgba(255,255,255,0.06)",
              padding: "28px",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                height: "3px",
                background: "#E8441A",
                borderRadius: "2px",
                margin: "-28px -28px 24px",
              }}
            />
            <h2
              style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: "18px",
                fontWeight: "700",
                color: "#fff",
                marginBottom: "20px",
              }}
            >
              Order Summary
            </h2>

            <div
              style={{
                borderBottom: "1px solid rgba(255,255,255,0.06)",
                paddingBottom: "16px",
                marginBottom: "16px",
              }}
            >
              {cartItems.map((item) => (
                <div
                  key={item.id}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: "10px",
                  }}
                >
                  <span
                    style={{
                      fontSize: "13px",
                      color: "rgba(255,255,255,0.5)",
                      maxWidth: "160px",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {item.name} × {item.quantity}
                  </span>
                  <span
                    style={{
                      fontSize: "13px",
                      fontWeight: "600",
                      color: "rgba(255,255,255,0.75)",
                      flexShrink: 0,
                    }}
                  >
                    ${(parseFloat(item.price) * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: "8px",
              }}
            >
              <span
                style={{ fontSize: "13px", color: "rgba(255,255,255,0.4)" }}
              >
                Subtotal
              </span>
              <span
                style={{
                  fontSize: "13px",
                  fontWeight: "600",
                  color: "rgba(255,255,255,0.6)",
                }}
              >
                ${getTotal().toFixed(2)}
              </span>
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: "8px",
              }}
            >
              <span
                style={{ fontSize: "13px", color: "rgba(255,255,255,0.4)" }}
              >
                Delivery
              </span>
              <span
                style={{
                  fontSize: "13px",
                  fontWeight: "600",
                  color: "#4ade80",
                }}
              >
                Free
              </span>
            </div>
            <div
              style={{
                height: "1px",
                background: "rgba(255,255,255,0.08)",
                margin: "16px 0",
              }}
            />
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "28px",
              }}
            >
              <span
                style={{
                  fontFamily: "'Playfair Display', serif",
                  fontSize: "17px",
                  fontWeight: "700",
                  color: "#fff",
                }}
              >
                Total
              </span>
              <span
                style={{
                  fontFamily: "'Playfair Display', serif",
                  fontSize: "24px",
                  fontWeight: "700",
                  color: "#E8441A",
                }}
              >
                ${getTotal().toFixed(2)}
              </span>
            </div>

            <div
              style={{ display: "flex", flexDirection: "column", gap: "12px" }}
            >
              <Link
                to="/checkout"
                className="btn-primary-lg"
                style={{ textDecoration: "none" }}
              >
                Proceed to Checkout →
              </Link>
              <button onClick={clearCart} className="btn-outline-lg">
                Clear Cart
              </button>
            </div>

            <p
              style={{
                textAlign: "center",
                marginTop: "20px",
                fontSize: "12px",
                color: "rgba(255,255,255,0.25)",
                lineHeight: "1.6",
              }}
            >
              🔒 Secure checkout · Free delivery on all orders
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="footer-bar">
        <span
          style={{
            fontFamily: "'DM Sans',sans-serif",
            fontSize: "13px",
            color: "rgba(255,255,255,0.4)",
          }}
        >
          © 2026 Epicure Hall. All rights reserved.
        </span>
        <div style={{ display: "flex", gap: "24px" }}>
          {["Privacy Policy", "Terms", "Sitemap"].map((l) => (
            <a
              key={l}
              href="#"
              className="footer-link"
              style={{
                fontFamily: "'DM Sans',sans-serif",
                fontSize: "13px",
                color: "rgba(255,255,255,0.4)",
                textDecoration: "none",
                transition: "color 0.2s",
              }}
            >
              {l}
            </a>
          ))}
        </div>
      </footer>
    </div>
  );
}

export default CartPage;
