import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { useCart } from "../../contexts/CartContext";
import { useAuth } from "../../contexts/AuthContext";

// GLOBAL CSS IN JS
const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;1,700&family=DM+Sans:wght@400;500;600;700&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  @keyframes fadeSlideUp {
    from { opacity: 0; transform: translateY(28px); }
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
  @keyframes pulse {
    0%, 100% { transform: scale(1); opacity: 1; }
    50%       { transform: scale(1.1); opacity: 0.75; }
  }
  @keyframes shimmer {
    0%   { background-position: -400px 0; }
    100% { background-position: 400px 0; }
  }
  @keyframes spin { to { transform: rotate(360deg); } }

  .nav-bar        { animation: navSlideDown 0.5s ease both; }
  .dropdown-menu  { animation: dropdownFadeIn 0.2s ease both; }
  .menu-hero      { animation: fadeSlideUp 0.7s ease 0.1s both; }
  .search-bar     { animation: fadeSlideUp 0.6s ease 0.25s both; }
  .cats-row       { animation: fadeSlideUp 0.6s ease 0.38s both; }

  .nav-link:hover        { color: #fff !important; }
  .nav-cart:hover        { color: #E8441A !important; }
  .nav-avatar:hover      { opacity: 0.85; }
  .dropdown-item:hover   { background: rgba(232,68,26,0.08) !important; color: #E8441A !important; }
  .dropdown-logout:hover { background: rgba(232,68,26,0.12) !important; color: #E8441A !important; }
  .footer-link:hover     { color: rgba(255,255,255,0.7) !important; }

  .menu-card {
    background: #141414;
    border: 1px solid rgba(255,255,255,0.06);
    border-radius: 20px;
    overflow: hidden;
    transition: transform 0.3s cubic-bezier(0.22,1,0.36,1), border-color 0.3s, box-shadow 0.3s;
    cursor: pointer;
  }
  .menu-card:hover {
    transform: translateY(-8px);
    border-color: rgba(232,68,26,0.3);
    box-shadow: 0 20px 48px rgba(0,0,0,0.4);
  }

  .cat-btn {
    padding: 9px 22px;
    border-radius: 50px;
    font-family: 'DM Sans', sans-serif;
    font-size: 13px;
    font-weight: 600;
    border: 1.5px solid rgba(255,255,255,0.1);
    cursor: pointer;
    transition: background 0.2s, border-color 0.2s, color 0.2s, transform 0.2s;
    letter-spacing: 0.3px;
  }
  .cat-btn:hover { transform: translateY(-1px); }
  .cat-btn.active {
    background: #E8441A;
    border-color: #E8441A;
    color: #fff;
    box-shadow: 0 4px 16px rgba(232,68,26,0.35);
  }
  .cat-btn.inactive {
    background: rgba(255,255,255,0.04);
    color: rgba(255,255,255,0.55);
  }
  .cat-btn.inactive:hover {
    background: rgba(255,255,255,0.08);
    border-color: rgba(255,255,255,0.2);
    color: #fff;
  }

  .add-btn {
    font-family: 'DM Sans', sans-serif;
    font-size: 13px;
    font-weight: 700;
    background: #E8441A;
    color: #fff;
    border: none;
    border-radius: 50px;
    padding: 9px 20px;
    cursor: pointer;
    transition: transform 0.2s, box-shadow 0.2s;
    white-space: nowrap;
    box-shadow: 0 3px 12px rgba(232,68,26,0.3);
  }
  .add-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(232,68,26,0.5);
  }

  .voice-btn {
    width: 42px; height: 42px; border-radius: 50%;
    border: none; cursor: pointer; display: flex;
    align-items: center; justify-content: center;
    font-size: 18px; transition: transform 0.2s, box-shadow 0.2s;
  }
  .voice-btn:hover { transform: scale(1.08); }

  .clear-btn {
    background: none; border: none; cursor: pointer;
    color: rgba(255,255,255,0.3); font-size: 16px;
    transition: color 0.2s; padding: 0 6px;
  }
  .clear-btn:hover { color: rgba(255,255,255,0.7); }

  .match-badge {
    position: absolute; top: 10px; right: 10px;
    background: #E8441A; color: #fff;
    padding: 3px 10px; border-radius: 50px;
    font-family: 'DM Sans', sans-serif; font-size: 11px; font-weight: 700;
    letter-spacing: 0.5px;
  }

  .footer-bar {
    background: #0a0a0a; padding: 24px 60px;
    display: flex; align-items: center;
    justify-content: space-between; flex-wrap: wrap; gap: 12px;
    border-top: 1px solid rgba(255,255,255,0.05);
  }
`;

/* ── NAV DROPDOWN ── */
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
function MenuPage() {
  const [menuItems, setMenuItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [isListening, setIsListening] = useState(false);
  const { addToCart, cartItems } = useCart();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  /* inject CSS */
  useEffect(() => {
    if (document.getElementById("epicure-menu-css")) return;
    const s = document.createElement("style");
    s.id = "epicure-menu-css";
    s.textContent = GLOBAL_CSS;
    document.head.appendChild(s);
    return () => {
      const el = document.getElementById("epicure-menu-css");
      if (el) el.remove();
    };
  }, []);

  useEffect(() => {
    fetchMenu();
  }, []);
  useEffect(() => {
    filterItems();
  }, [searchTerm, selectedCategory, menuItems]);

  const fetchMenu = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/menu");
      setMenuItems(response.data);
      const cats = [...new Set(response.data.map((item) => item.category))];
      setCategories(cats);
    } catch (error) {
      console.error("Error fetching menu:", error);
    } finally {
      setLoading(false);
    }
  };

  const filterItems = () => {
    let filtered = [...menuItems];
    if (selectedCategory !== "all")
      filtered = filtered.filter((item) => item.category === selectedCategory);
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (item) =>
          item.name.toLowerCase().includes(term) ||
          item.description.toLowerCase().includes(term),
      );
    }
    setFilteredItems(filtered);
  };

  const clearSearch = () => setSearchTerm("");

  const startVoiceSearch = () => {
    if (
      !("webkitSpeechRecognition" in window) &&
      !("SpeechRecognition" in window)
    ) {
      alert(
        "Your browser does not support voice recognition. Please use Chrome, Edge, or Safari.",
      );
      return;
    }
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    setIsListening(true);
    recognition.onresult = (event) => {
      setSearchTerm(event.results[0][0].transcript);
      setIsListening(false);
    };
    recognition.onerror = (event) => {
      setIsListening(false);
      if (event.error === "not-allowed")
        alert("Please allow microphone access to use voice search.");
      else if (event.error === "no-speech")
        alert("No speech detected. Please try again.");
    };
    recognition.onend = () => setIsListening(false);
    recognition.start();
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  const cartCount = cartItems?.reduce((sum, i) => sum + i.quantity, 0) ?? 0;

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#0a0a0a",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              width: "40px",
              height: "40px",
              border: "3px solid rgba(232,68,26,0.2)",
              borderTopColor: "#E8441A",
              borderRadius: "50%",
              animation: "spin 0.8s linear infinite",
              margin: "0 auto 16px",
            }}
          />
          <p
            style={{
              fontFamily: "'DM Sans',sans-serif",
              color: "rgba(255,255,255,0.4)",
              fontSize: "14px",
            }}
          >
            Loading menu…
          </p>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
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
      {/* ── NAV ── */}
      <nav
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

        <ul
          style={{
            display: "flex",
            gap: "32px",
            listStyle: "none",
            fontFamily: "'DM Sans', sans-serif",
            fontSize: "14px",
            fontWeight: "500",
            margin: 0,
            padding: 0,
          }}
        >
          {[
            { name: "Home", path: "/" },
            { name: "Menu", path: "/menu" },
            { name: "Book Tables", path: "/table-booking" },
            { name: "My Bookings", path: "/my-bookings" },
          ].map((link) => (
            <li key={link.name}>
              <a
                href={link.path}
                style={{
                  color:
                    link.path === window.location.pathname
                      ? "#fff"
                      : "rgba(255,255,255,0.7)",
                  textDecoration: "none",
                  transition: "color 0.2s",
                }}
              >
                {link.name}
              </a>
            </li>
          ))}
        </ul>

        {user ? (
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <Link
              to="/cart"
              style={{
                fontSize: "20px",
                textDecoration: "none",
                color: "rgba(255,255,255,0.8)",
                position: "relative",
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
                    fontSize: "11px",
                    fontWeight: "700",
                  }}
                >
                  {cartCount}
                </span>
              )}
            </Link>
            <ProfileDropdown user={user} onLogout={handleLogout} />
          </div>
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
                fontSize: "14px",
                fontWeight: "600",
                marginLeft: "12px",
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
                fontSize: "14px",
                fontWeight: "600",
              }}
            >
              Sign Up
            </Link>
          </div>
        )}
      </nav>

      {/* ── PAGE HEADER ── */}
      <div
        className="menu-hero"
        style={{
          paddingTop: "120px",
          paddingBottom: "48px",
          textAlign: "center",
          position: "relative",
          overflow: "hidden",
          background: "linear-gradient(180deg, #0f0f0f 0%, #0a0a0a 100%)",
        }}
      >
        {/* Decorative glow */}
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%,-50%)",
            width: "600px",
            height: "300px",
            background:
              "radial-gradient(ellipse, rgba(232,68,26,0.08) 0%, transparent 70%)",
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
              marginBottom: "16px",
            }}
          >
            Our Craft
          </div>
          <h1
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: "clamp(36px,5vw,60px)",
              fontWeight: "700",
              color: "#fff",
              marginBottom: "16px",
              letterSpacing: "-1px",
            }}
          >
            The Full{" "}
            <span style={{ color: "#E8441A", fontStyle: "italic" }}>Menu</span>
          </h1>
          <p
            style={{
              fontSize: "15px",
              color: "rgba(255,255,255,0.45)",
              maxWidth: "480px",
              margin: "0 auto",
              lineHeight: "1.7",
            }}
          >
            Every dish, crafted with intention — from our kitchen to your table.
          </p>
        </div>
      </div>

      <div
        style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 40px 80px" }}
      >
        {/* ── SEARCH BAR ── */}
        <div
          className="search-bar"
          style={{ maxWidth: "540px", margin: "0 auto 12px" }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0",
              background: "#141414",
              border: "1.5px solid rgba(255,255,255,0.08)",
              borderRadius: "50px",
              padding: "6px 6px 6px 22px",
              transition: "border-color 0.2s",
            }}
            onFocusCapture={(e) =>
              (e.currentTarget.style.borderColor = "rgba(232,68,26,0.5)")
            }
            onBlurCapture={(e) =>
              (e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)")
            }
          >
            <span
              style={{
                color: "rgba(255,255,255,0.25)",
                fontSize: "16px",
                marginRight: "10px",
              }}
            >
              🔍
            </span>
            <input
              type="text"
              placeholder="Search by name or description…"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                flex: 1,
                background: "transparent",
                border: "none",
                outline: "none",
                fontFamily: "'DM Sans', sans-serif",
                fontSize: "14px",
                color: "#fff",
                padding: "10px 0",
              }}
            />
            {searchTerm && (
              <button className="clear-btn" onClick={clearSearch}>
                ✕
              </button>
            )}
            <button
              className="voice-btn"
              onClick={startVoiceSearch}
              disabled={isListening}
              title="Voice search"
              style={{
                background: isListening ? "#22c55e" : "#E8441A",
                color: "#fff",
                boxShadow: isListening
                  ? "0 0 0 4px rgba(34,197,94,0.2)"
                  : "0 3px 12px rgba(232,68,26,0.3)",
                animation: isListening ? "pulse 1.5s infinite" : "none",
              }}
            >
              {isListening ? "🎤" : "🎙️"}
            </button>
          </div>

          {isListening && (
            <div
              style={{
                textAlign: "center",
                marginTop: "10px",
                padding: "8px 16px",
                background: "rgba(34,197,94,0.08)",
                borderRadius: "50px",
                color: "#4ade80",
                fontSize: "13px",
                fontWeight: "500",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
              }}
            >
              🎤 Listening… Speak now
            </div>
          )}

          {searchTerm && !isListening && (
            <div
              style={{
                textAlign: "center",
                marginTop: "10px",
                fontSize: "13px",
                color: "rgba(255,255,255,0.35)",
              }}
            >
              {filteredItems.length} result
              {filteredItems.length !== 1 ? "s" : ""} for{" "}
              <span style={{ color: "#E8441A" }}>"{searchTerm}"</span>
            </div>
          )}
        </div>

        {/* ── CATEGORY PILLS ── */}
        <div
          className="cats-row"
          style={{
            display: "flex",
            gap: "10px",
            justifyContent: "center",
            flexWrap: "wrap",
            margin: "28px 0 40px",
          }}
        >
          <button
            onClick={() => setSelectedCategory("all")}
            className={`cat-btn ${selectedCategory === "all" ? "active" : "inactive"}`}
          >
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`cat-btn ${selectedCategory === cat ? "active" : "inactive"}`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* ── NO RESULTS ── */}
        {filteredItems.length === 0 && (
          <div
            style={{
              textAlign: "center",
              padding: "80px 40px",
              background: "#141414",
              borderRadius: "20px",
              border: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            <div style={{ fontSize: "56px", marginBottom: "16px" }}>🍽️</div>
            <h3
              style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: "22px",
                color: "#fff",
                marginBottom: "8px",
              }}
            >
              Nothing found
            </h3>
            <p
              style={{
                color: "rgba(255,255,255,0.35)",
                fontSize: "14px",
                marginBottom: "24px",
              }}
            >
              Try different keywords or use voice search
            </p>
            <button
              onClick={clearSearch}
              style={{
                background: "#E8441A",
                color: "#fff",
                padding: "10px 28px",
                borderRadius: "50px",
                border: "none",
                cursor: "pointer",
                fontFamily: "'DM Sans',sans-serif",
                fontSize: "14px",
                fontWeight: "600",
                boxShadow: "0 4px 16px rgba(232,68,26,0.35)",
              }}
            >
              Clear Search
            </button>
          </div>
        )}

        {/* ── MENU GRID ── */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
            gap: "24px",
          }}
        >
          {filteredItems.map((item, i) => (
            <div
              key={item.id}
              className="menu-card"
              style={{ animationDelay: `${i * 0.05}s` }}
            >
              {/* Image */}
              <div
                style={{
                  height: "200px",
                  background:
                    "linear-gradient(135deg, #1e0e06 0%, #2d1508 100%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "60px",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                🍕
                {searchTerm &&
                  item.name
                    .toLowerCase()
                    .includes(searchTerm.toLowerCase()) && (
                    <span className="match-badge">Match</span>
                  )}
              </div>

              {/* Body */}
              <div style={{ padding: "22px 24px 24px" }}>
                {item.category && (
                  <div
                    style={{
                      fontSize: "11px",
                      fontWeight: "700",
                      letterSpacing: "3px",
                      textTransform: "uppercase",
                      color: "#E8441A",
                      marginBottom: "8px",
                    }}
                  >
                    {item.category}
                  </div>
                )}
                <h3
                  style={{
                    fontFamily: "'Playfair Display', serif",
                    fontSize: "19px",
                    fontWeight: "700",
                    color: "#fff",
                    marginBottom: "8px",
                  }}
                >
                  {item.name}
                </h3>
                <p
                  style={{
                    fontSize: "13px",
                    color: "rgba(255,255,255,0.45)",
                    lineHeight: "1.65",
                    marginBottom: "20px",
                    minHeight: "58px",
                  }}
                >
                  {item.description}
                </p>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <span
                    style={{
                      fontFamily: "'Playfair Display', serif",
                      fontSize: "22px",
                      fontWeight: "700",
                      color: "#E8441A",
                    }}
                  >
                    ${item.price}
                  </span>
                  <button className="add-btn" onClick={() => addToCart(item)}>
                    Add to Cart +
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── FOOTER ── */}
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

export default MenuPage;
