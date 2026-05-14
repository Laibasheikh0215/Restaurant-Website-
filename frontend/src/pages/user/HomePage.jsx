import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { useCart } from '../../contexts/CartContext';
import ProfileDropdown from "../../components/ProfileDropdown";

// SCROLL ANIMATION HOOK
function useReveal(threshold = 0.15) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          obs.disconnect();
        }
      },
      { threshold },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, visible];
}

function Reveal({ children, variant = "fadeUp", delay = 0, style = {} }) {
  const [ref, visible] = useReveal();
  const base = {
    transition: `opacity 0.7s ease ${delay}ms, transform 0.7s cubic-bezier(0.22,1,0.36,1) ${delay}ms`,
  };
  const hidden = {
    fadeUp: { opacity: 0, transform: "translateY(48px)" },
    fadeLeft: { opacity: 0, transform: "translateX(-60px)" },
    fadeRight: { opacity: 0, transform: "translateX(60px)" },
    fadeIn: { opacity: 0, transform: "none" },
    scaleUp: { opacity: 0, transform: "scale(0.88)" },
  };
  const shown = { opacity: 1, transform: "none" };
  return (
    <div
      ref={ref}
      style={{ ...base, ...(visible ? shown : hidden[variant]), ...style }}
    >
      {children}
    </div>
  );
}

// GLOBAL CSS
const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;1,700&family=DM+Sans:wght@400;500;600;700&display=swap');
  *, *::before, *::after { box-sizing: border-box; }

  @keyframes heroSlideUp {
    from { opacity: 0; transform: translateY(36px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes statCount {
    from { opacity: 0; transform: translateY(20px); }
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

  .hero-eyebrow { animation: heroSlideUp  0.7s ease 0.1s  both; }
  .hero-title   { animation: heroSlideUp  0.7s ease 0.25s both; }
  .hero-desc    { animation: heroSlideUp  0.7s ease 0.4s  both; }
  .hero-btns    { animation: heroSlideUp  0.7s ease 0.55s both; }
  .hero-stat-0  { animation: statCount   0.6s ease 0.6s  both; }
  .hero-stat-1  { animation: statCount   0.6s ease 0.75s both; }
  .hero-stat-2  { animation: statCount   0.6s ease 0.9s  both; }
  .nav-bar      { animation: navSlideDown 0.5s ease 0s    both; }
  .dropdown-menu { animation: dropdownFadeIn 0.2s ease both; }

  .btn-primary:hover   { transform: translateY(-2px) !important; box-shadow: 0 8px 32px rgba(232,68,26,0.55) !important; }
  .btn-outline:hover   { border-color: #E8441A !important; background: rgba(232,68,26,0.08) !important; }
  .btn-white:hover     { transform: translateY(-2px) !important; }
  .nav-link:hover      { color: #fff !important; }
  .footer-link:hover   { color: rgba(255,255,255,0.7) !important; }
  .menu-card-btn:hover { background: rgba(232,68,26,0.15) !important; color: #E8441A !important; }
  .nav-cart:hover      { color: #E8441A !important; transform: scale(1.15); }
  .nav-avatar:hover    { opacity: 0.85; }
  .dropdown-item:hover { background: rgba(232,68,26,0.08) !important; color: #E8441A !important; }
  .dropdown-logout:hover { background: rgba(232,68,26,0.12) !important; color: #E8441A !important; }
  .why-card:hover  { transform: translateY(-6px) !important; box-shadow: 0 20px 48px rgba(0,0,0,0.12) !important; }
  .menu-card:hover { transform: translateY(-8px) !important; border-color: rgba(232,68,26,0.3) !important; }
`;

// STYLES
const S = {
  root: {
    fontFamily: "'Playfair Display','Georgia',serif",
    background: "#0a0a0a",
    color: "#fff",
    overflowX: "hidden",
  },

  /* NAV */
  nav: {
  position: "fixed",
  top: 0,
  left: 0,
  right: 0,
  zIndex: 1000,
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: "18px 60px",
  background: "#0a0a0a",
  backdropFilter: "blur(0px)",
  borderBottom: "1px solid rgba(255,255,255,0.08)",
},
  navLogo: {
    fontSize: "26px",
    fontWeight: "700",
    letterSpacing: "2px",
    color: "#fff",
    textDecoration: "none",
  },
  navLogoAccent: { color: "#E8441A" },
  navLinks: {
    display: "flex",
    gap: "32px",
    listStyle: "none",
    fontFamily: "'DM Sans',sans-serif",
    fontSize: "14px",
    fontWeight: "500",
    letterSpacing: "0.5px",
  },
  navLink: {
    color: "rgba(255,255,255,0.7)",
    textDecoration: "none",
    transition: "color 0.2s",
  },

  /* Logged OUT */
  navCta: {
    background: "#E8441A",
    color: "#fff",
    padding: "10px 24px",
    borderRadius: "50px",
    textDecoration: "none",
    fontFamily: "'DM Sans',sans-serif",
    fontSize: "14px",
    fontWeight: "600",
  },
  navCtaOutline: {
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
  },

  /* Logged IN */
  navRight: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
    position: "relative",
  },
  navCart: {
    fontSize: "20px",
    textDecoration: "none",
    color: "rgba(255,255,255,0.8)",
    display: "flex",
    alignItems: "center",
    transition: "color 0.2s, transform 0.2s",
    position: "relative",
  },
  navAvatar: {
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
  },
  navAvatarWrapper: { position: "relative" },

  /* Dropdown */
  dropdown: {
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
  },
  dropdownArrow: {
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
  },
  dropdownHeader: {
    padding: "10px 14px 12px",
    borderBottom: "1px solid rgba(255,255,255,0.07)",
    marginBottom: "6px",
  },
  dropdownName: {
    fontFamily: "'DM Sans',sans-serif",
    fontSize: "14px",
    fontWeight: "600",
    color: "#fff",
    marginBottom: "2px",
  },
  dropdownEmail: {
    fontFamily: "'DM Sans',sans-serif",
    fontSize: "12px",
    color: "rgba(255,255,255,0.4)",
  },
  dropdownItem: {
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
    cursor: "pointer",
  },
  dropdownDivider: {
    height: "1px",
    background: "rgba(255,255,255,0.07)",
    margin: "6px 0",
  },
  dropdownLogout: {
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
  },

  /* HERO */
  hero: {
    position: "relative",
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    padding: "0 60px",
    overflow: "hidden",
    backgroundImage: `url('/Assets/Hero image.jpeg')`,
    backgroundSize: "cover",
    backgroundPosition: "center",
  },
  heroOverlay: {
    position: "absolute",
    inset: 0,
    background:
      "linear-gradient(90deg, rgba(0,0,0,0.80) 0%, rgba(0,0,0,0.50) 60%, rgba(0,0,0,0.15) 100%)",
    pointerEvents: "none",
  },
  heroBrushStroke: {
    position: "absolute",
    bottom: "-2px",
    left: 0,
    right: 0,
    height: "120px",
    background: "#fff",
    clipPath:
      "polygon(0 60%, 25% 30%, 50% 70%, 75% 20%, 100% 50%, 100% 100%, 0 100%)",
  },
  heroContent: { position: "relative", zIndex: 2, maxWidth: "560px" },
  heroEyebrow: {
    fontFamily: "'DM Sans',sans-serif",
    fontSize: "13px",
    fontWeight: "600",
    letterSpacing: "4px",
    textTransform: "uppercase",
    color: "#E8441A",
    marginBottom: "20px",
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
  heroEyebrowLine: {
    width: "40px",
    height: "2px",
    background: "#E8441A",
    display: "inline-block",
  },
  heroTitle: {
    fontSize: "clamp(42px,5vw,72px)",
    fontWeight: "700",
    lineHeight: "1.08",
    marginBottom: "24px",
    letterSpacing: "-1px",
  },
  heroTitleAccent: { color: "#E8441A", fontStyle: "italic" },
  heroDesc: {
    fontFamily: "'DM Sans',sans-serif",
    fontSize: "16px",
    lineHeight: "1.75",
    color: "rgba(255,255,255,0.7)",
    marginBottom: "40px",
    maxWidth: "420px",
  },
  heroBtns: { display: "flex", gap: "16px", flexWrap: "wrap" },
  btnPrimary: {
    background: "#E8441A",
    color: "#fff",
    padding: "14px 36px",
    borderRadius: "50px",
    textDecoration: "none",
    fontFamily: "'DM Sans',sans-serif",
    fontSize: "15px",
    fontWeight: "600",
    boxShadow: "0 4px 24px rgba(232,68,26,0.4)",
    display: "inline-block",
    transition: "transform 0.2s, box-shadow 0.2s",
  },
  btnOutline: {
    background: "transparent",
    border: "2px solid rgba(255,255,255,0.3)",
    color: "#fff",
    padding: "14px 36px",
    borderRadius: "50px",
    textDecoration: "none",
    fontFamily: "'DM Sans',sans-serif",
    fontSize: "15px",
    fontWeight: "500",
    display: "inline-block",
    transition: "border-color 0.2s, background 0.2s",
  },
  heroStats: {
    position: "absolute",
    bottom: "120px",
    left: "60px",
    display: "flex",
    gap: "48px",
    zIndex: 2,
  },
  statItem: { textAlign: "center" },
  statNum: {
    fontSize: "36px",
    fontWeight: "700",
    color: "#E8441A",
    lineHeight: 1,
    marginBottom: "6px",
  },
  statLabel: {
    fontFamily: "'DM Sans',sans-serif",
    fontSize: "12px",
    letterSpacing: "2px",
    textTransform: "uppercase",
    color: "rgba(255,255,255,0.5)",
  },

  /* WHY */
  whySection: { background: "#fff", color: "#111", padding: "80px 60px" },
  sectionHeader: { textAlign: "center", marginBottom: "56px" },
  sectionTag: {
    fontFamily: "'DM Sans',sans-serif",
    fontSize: "12px",
    fontWeight: "700",
    letterSpacing: "4px",
    textTransform: "uppercase",
    color: "#E8441A",
    marginBottom: "12px",
  },
  sectionTitle: {
    fontSize: "clamp(28px,3vw,42px)",
    fontWeight: "700",
    color: "#111",
    marginBottom: "12px",
  },
  sectionSub: {
    fontFamily: "'DM Sans',sans-serif",
    fontSize: "15px",
    color: "rgba(0,0,0,0.5)",
    maxWidth: "480px",
    margin: "0 auto",
    lineHeight: "1.6",
  },
  whyGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))",
    gap: "24px",
    maxWidth: "1200px",
    margin: "0 auto",
  },
  whyCard: {
    background: "#f8f5f2",
    borderRadius: "16px",
    padding: "32px 28px",
    transition: "transform 0.25s, box-shadow 0.25s",
    cursor: "default",
  },
  whyIcon: {
    width: "52px",
    height: "52px",
    background: "rgba(232,68,26,0.1)",
    borderRadius: "14px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "24px",
    marginBottom: "20px",
  },
  whyCardTitle: {
    fontSize: "17px",
    fontWeight: "700",
    color: "#111",
    marginBottom: "10px",
  },
  whyCardDesc: {
    fontFamily: "'DM Sans',sans-serif",
    fontSize: "14px",
    lineHeight: "1.65",
    color: "rgba(0,0,0,0.55)",
  },

  /* MENU */
  menuSection: { background: "#0a0a0a", padding: "80px 60px" },
  menuSectionTitle: { color: "#fff" },
  menuSectionSub: { color: "rgba(255,255,255,0.45)" },
  menuGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))",
    gap: "24px",
    maxWidth: "1200px",
    margin: "0 auto",
  },
  menuCard: {
    background: "#141414",
    borderRadius: "20px",
    overflow: "hidden",
    border: "1px solid rgba(255,255,255,0.06)",
    transition: "transform 0.25s, border-color 0.25s",
    cursor: "pointer",
  },
  menuCardImgFallback: {
    width: "100%",
    height: "200px",
    background: "linear-gradient(135deg,#1e0e06 0%,#3d1a0a 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "64px",
  },
  menuCardBody: { padding: "20px 24px 24px" },
  menuCardTag: {
    fontFamily: "'DM Sans',sans-serif",
    fontSize: "11px",
    fontWeight: "600",
    letterSpacing: "3px",
    textTransform: "uppercase",
    color: "#E8441A",
    marginBottom: "8px",
  },
  menuCardTitle: {
    fontSize: "18px",
    fontWeight: "700",
    color: "#fff",
    marginBottom: "8px",
  },
  menuCardDesc: {
    fontFamily: "'DM Sans',sans-serif",
    fontSize: "13px",
    color: "rgba(255,255,255,0.45)",
    lineHeight: "1.6",
    marginBottom: "16px",
  },
  menuCardFooter: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  menuCardPrice: { fontSize: "20px", fontWeight: "700", color: "#E8441A" },
  menuCardBtn: {
    fontFamily: "'DM Sans',sans-serif",
    fontSize: "12px",
    fontWeight: "600",
    color: "rgba(255,255,255,0.6)",
    background: "rgba(255,255,255,0.06)",
    padding: "6px 14px",
    borderRadius: "50px",
    textDecoration: "none",
    letterSpacing: "0.5px",
    transition: "background 0.2s, color 0.2s",
  },

  /* BOOKING */
  bookSection: {
    background: "#E8441A",
    padding: "72px 60px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "40px",
    flexWrap: "wrap",
  },
  bookEyebrow: {
    fontFamily: "'DM Sans',sans-serif",
    fontSize: "12px",
    fontWeight: "700",
    letterSpacing: "4px",
    textTransform: "uppercase",
    color: "rgba(255,255,255,0.7)",
    marginBottom: "16px",
  },
  bookTitle: {
    fontSize: "clamp(28px,3vw,48px)",
    fontWeight: "700",
    lineHeight: "1.1",
    color: "#fff",
    marginBottom: "16px",
  },
  bookDesc: {
    fontFamily: "'DM Sans',sans-serif",
    fontSize: "15px",
    color: "rgba(255,255,255,0.75)",
    lineHeight: "1.65",
  },
  bookImg: {
    width: "100%",
    borderRadius: "24px",
    objectFit: "cover",
    maxHeight: "320px",
  },
  bookImgFallback: {
    width: "100%",
    height: "280px",
    borderRadius: "24px",
    background: "linear-gradient(135deg,#fff0e6 0%,#ffd4b3 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "80px",
  },
  btnWhite: {
    background: "#fff",
    color: "#E8441A",
    padding: "14px 36px",
    borderRadius: "50px",
    textDecoration: "none",
    fontFamily: "'DM Sans',sans-serif",
    fontSize: "15px",
    fontWeight: "700",
    display: "inline-block",
    transition: "transform 0.2s",
    marginTop: "24px",
    marginRight: "12px",
  },
  btnWhiteOutline: {
    background: "transparent",
    border: "2px solid rgba(255,255,255,0.5)",
    color: "#fff",
    padding: "14px 36px",
    borderRadius: "50px",
    textDecoration: "none",
    fontFamily: "'DM Sans',sans-serif",
    fontSize: "15px",
    fontWeight: "600",
    display: "inline-block",
    transition: "border-color 0.2s",
    marginTop: "24px",
  },

  /* CONTACT */
  contactSection: { background: "#fff", padding: "80px 60px", color: "#111" },
  contactInfoTitle: {
    fontSize: "28px",
    fontWeight: "700",
    color: "#111",
    marginBottom: "8px",
  },
  contactInfoSub: {
    fontFamily: "'DM Sans',sans-serif",
    fontSize: "14px",
    color: "rgba(0,0,0,0.5)",
    marginBottom: "32px",
    lineHeight: "1.6",
  },
  contactRow: {
    display: "flex",
    alignItems: "center",
    gap: "14px",
    marginBottom: "18px",
  },
  contactText: {
    fontFamily: "'DM Sans',sans-serif",
    fontSize: "14px",
    color: "#333",
  },
  contactHours: {
    background: "#f8f5f2",
    borderRadius: "14px",
    padding: "24px",
    marginTop: "24px",
  },
  contactHoursTitle: {
    fontSize: "16px",
    fontWeight: "700",
    color: "#111",
    marginBottom: "14px",
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },

  /* FOOTER */
  footerBar: {
    background: "#0a0a0a",
    padding: "24px 60px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: "12px",
  },
  footerText: {
    fontFamily: "'DM Sans',sans-serif",
    fontSize: "13px",
    color: "rgba(255,255,255,0.4)",
  },
  footerLinks: { display: "flex", gap: "24px" },
  footerLink: {
    fontFamily: "'DM Sans',sans-serif",
    fontSize: "13px",
    color: "rgba(255,255,255,0.4)",
    textDecoration: "none",
    transition: "color 0.2s",
  },
};

// HOVER CARD
function HoverCard({ style, hoverStyle, children }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      style={{ ...style, ...(hovered ? hoverStyle : {}) }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {children}
    </div>
  );
}

// DATA
const WHY_CARDS = [
  {
    icon: "🍣",
    title: "Premium Fresh Food",
    desc: "Sourced daily from Tsukiji-style markets — only the freshest cuts make it to your plate.",
  },
  {
    icon: "👨‍🍳",
    title: "Master Chefs",
    desc: "Over 15 years of authentic multi-tradition cuisine behind every dish we serve.",
  },
  {
    icon: "🌿",
    title: "Organic Ingredients",
    desc: "Local organic vegetables and sustainable seafood for an eco-conscious dining experience.",
  },
  {
    icon: "🚴‍♂️",
    title: "Express Delivery",
    desc: "From our kitchen to your table — or your door — in 30 minutes or less, guaranteed.",
  },
];

const MENU_ITEMS = [
  {
    tag: "Chef's Special",
    title: "Omakase Nigiri Set",
    desc: "Eight-piece chef's selection of the finest seasonal nigiri, served with house ponzu.",
    price: "$38",
    image:
      "https://images.pexels.com/photos/2098085/pexels-photo-2098085.jpeg?auto=compress&cs=tinysrgb&w=600",
  },
  {
    tag: "Fan Favourite",
    title: "Midnight Aroma Platter",
    desc: "Bold, smoky, indulgent flavors in a messy double patty burger experience.",
    price: "$22",
    image: "https://images.unsplash.com/photo-1551782450-a2132b4ba21d?w=600",
  },
  {
    tag: "New Arrival",
    title: "Messy Double Patty Burger",
    desc: "Soft buns loaded with double patties, dripping sauce, and smoky flavor in every bite.",
    price: "$28",
    image:
      "https://images.pexels.com/photos/2983101/pexels-photo-2983101.jpeg?auto=compress&cs=tinysrgb&w=600",
  },
];

// ─── MAIN COMPONENT ────────────────────────────────────────────────────────────
function HomePage() {
  const { user, logout, updateUser } = useAuth();
  const navigate = useNavigate();
const { getCount } = useCart();  

  // Inject global CSS once
  useEffect(() => {
    if (document.getElementById("gourmet-animations")) return;
    const style = document.createElement("style");
    style.id = "gourmet-animations";
    style.textContent = GLOBAL_CSS;
    document.head.appendChild(style);
    return () => {
      const el = document.getElementById("gourmet-animations");
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

  return (
    <div style={S.root}>
      {/* ════════════════════════════════════════
          NAV
      ════════════════════════════════════════ */}
<nav style={{
  position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000,
  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
  padding: '18px 60px',
  background: 'rgba(10,10,10,0.88)', backdropFilter: 'blur(14px)',
  borderBottom: '1px solid rgba(255,255,255,0.06)',
}}>
  <a href="/" style={{ fontSize: '22px', fontFamily: "'Playfair Display', serif", fontWeight: '700', letterSpacing: '2px', color: '#fff', textDecoration: 'none' }}>
    <span style={{ color: '#E8441A' }}>美食家大廳</span> Epicure <span style={{ color: '#E8441A' }}>Hall</span>
  </a>

  <ul style={{ display: 'flex', gap: '32px', listStyle: 'none', fontFamily: "'DM Sans', sans-serif", fontSize: '14px', fontWeight: '500', margin: 0, padding: 0 }}>
    {[
      { name: "Home", path: "/" },
      { name: "Menu", path: "/menu" },
      { name: "Book Tables", path: "/table-booking" },
      { name: "Events", path: "/event-booking" },
      { name: "My Bookings", path: "/my-bookings" },
    ].map((link) => (
      <li key={link.name}>
        <a href={link.path} style={{ color: link.path === window.location.pathname ? '#fff' : 'rgba(255,255,255,0.7)', textDecoration: 'none', transition: 'color 0.2s' }}>
          {link.name}
        </a>
      </li>
    ))}
  </ul>

  {user ? (
    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
      <Link to="/cart" style={{ fontSize: '20px', textDecoration: 'none', color: 'rgba(255,255,255,0.8)', position: 'relative' }}>
        🛒
        {cartCount > 0 && <span style={{ position: 'absolute', top: '-6px', right: '-8px', background: '#E8441A', color: '#fff', width: '18px', height: '18px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: '700' }}>{cartCount}</span>}
      </Link>
      <ProfileDropdown user={user} onLogout={handleLogout} />
    </div>
  ) : (
    <div>
      <Link to="/login" style={{ background: '#E8441A', color: '#fff', padding: '10px 24px', borderRadius: '50px', textDecoration: 'none', fontSize: '14px', fontWeight: '600', marginLeft: '12px' }}>Sign In</Link>
      <Link to="/register" style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.3)', color: '#fff', padding: '10px 24px', borderRadius: '50px', textDecoration: 'none', fontSize: '14px', fontWeight: '600' }}>Sign Up</Link>
    </div>
  )}
</nav>

      {/* ════════════════════════════════════════
          HERO
      ════════════════════════════════════════ */}
      <section style={S.hero}>
        <div style={S.heroOverlay} />
        <div style={S.heroContent}>
          <div className="hero-eyebrow" style={S.heroEyebrow}>
            <span style={S.heroEyebrowLine} />A world of flavors under one roof
          </div>
          <h1 className="hero-title" style={S.heroTitle}>
            Epicure Hall
            <br />
            <span style={S.heroTitleAccent}>Restaurant</span>
          </h1>
          <p className="hero-desc" style={S.heroDesc}>
            A transcendent dining journey — where centuries-old Japanese
            craftsmanship meets contemporary elegance in every single bite.
          </p>

          {/* Same logic as the 33-line original code */}
          <div className="hero-btns" style={S.heroBtns}>
            {user ? (
              <>
                <Link to="/menu" className="btn-primary" style={S.btnPrimary}>
                  Order Food
                </Link>
                <Link
                  to="/table-booking"
                  className="btn-outline"
                  style={S.btnOutline}
                >
                  Book Table
                </Link>
              </>
            ) : (
              <>
                <Link
                  to="/register"
                  className="btn-primary"
                  style={S.btnPrimary}
                >
                  Get Started
                </Link>
                <Link to="/login" className="btn-outline" style={S.btnOutline}>
                  Login
                </Link>
              </>
            )}
          </div>
        </div>

        <div style={S.heroStats}>
          {[
            ["500+", "Dishes Served Daily"],
            ["15+", "Years of Craft"],
            ["98%", "Happy Guests"],
          ].map(([n, l], i) => (
            <div key={l} className={`hero-stat-${i}`} style={S.statItem}>
              <div style={S.statNum}>{n}</div>
              <div style={S.statLabel}>{l}</div>
            </div>
          ))}
        </div>
        <div style={S.heroBrushStroke} />
      </section>

      {/* ════════════════════════════════════════
          WHY CHOOSE US
      ════════════════════════════════════════ */}
      <section style={S.whySection}>
        <Reveal variant="fadeUp">
          <div style={S.sectionHeader}>
            <div style={S.sectionTag}>Why Choose Us</div>
            <h2 style={S.sectionTitle}>The Epicure Hall Difference</h2>
            <p style={S.sectionSub}>
              Every detail, every flavour, every moment — crafted to exceed your
              expectations.
            </p>
          </div>
        </Reveal>
        <div style={S.whyGrid}>
          {WHY_CARDS.map((c, i) => (
            <Reveal key={c.title} variant="fadeUp" delay={i * 100}>
              <HoverCard
                style={S.whyCard}
                hoverStyle={{
                  transform: "translateY(-6px)",
                  boxShadow: "0 20px 48px rgba(0,0,0,0.12)",
                }}
              >
                <div style={S.whyIcon}>{c.icon}</div>
                <div style={S.whyCardTitle}>{c.title}</div>
                <div style={S.whyCardDesc}>{c.desc}</div>
              </HoverCard>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ════════════════════════════════════════
          MENU
      ════════════════════════════════════════ */}
      <section style={S.menuSection}>
        <Reveal variant="fadeUp">
          <div style={S.sectionHeader}>
            <div style={S.sectionTag}>Our Craft</div>
            <h2 style={{ ...S.sectionTitle, ...S.menuSectionTitle }}>
              Our Chef's May Sushi
            </h2>
            <p style={{ ...S.sectionSub, ...S.menuSectionSub }}>
              Seasonal specials curated by our head chef — only available this
              month.
            </p>
          </div>
        </Reveal>
        <div style={S.menuGrid}>
          {MENU_ITEMS.map((item, i) => (
            <Reveal key={item.title} variant="scaleUp" delay={i * 120}>
              <HoverCard
                style={S.menuCard}
                hoverStyle={{
                  transform: "translateY(-8px)",
                  borderColor: "rgba(232,68,26,0.3)",
                }}
              >
                <div style={S.menuCardImgFallback}>
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={item.title}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />
                  ) : (
                    <span style={{ fontSize: "64px" }}>{item.emoji}</span>
                  )}
                </div>
                <div style={S.menuCardBody}>
                  <div style={S.menuCardTag}>{item.tag}</div>
                  <div style={S.menuCardTitle}>{item.title}</div>
                  <div style={S.menuCardDesc}>{item.desc}</div>
                  <div style={S.menuCardFooter}>
                    <span style={S.menuCardPrice}>{item.price}</span>
                    <Link
                      to={user ? "/menu" : "/register"}
                      className="menu-card-btn"
                      style={S.menuCardBtn}
                    >
                      Order Now →
                    </Link>
                  </div>
                </div>
              </HoverCard>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ════════════════════════════════════════
          BOOKING BANNER
      ════════════════════════════════════════ */}
      <section style={S.bookSection}>
        <Reveal variant="fadeRight" style={{ maxWidth: "45%", order: 1 }}>
          <img
            src="https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600"
            alt="Restaurant interior"
            style={S.bookImg}
            onError={(e) => {
              e.target.style.display = "none";
              e.target.nextSibling.style.display = "flex";
            }}
          />
          <div style={{ ...S.bookImgFallback, display: "none" }}>🍽️</div>
        </Reveal>

        <Reveal variant="fadeLeft" style={{ maxWidth: "50%", order: 2 }}>
          <div>
            <div style={S.bookEyebrow}>Table Reservations</div>
            <h2 style={S.bookTitle}>
              Make Your Booking,
              <br />
              Your food Counts
            </h2>
            <p style={S.bookDesc}>
              Reserve your table online in seconds. Special occasions, intimate
              dinners, or large group events — we handle every detail with care.
            </p>
            {user ? (
              <>
                <Link
                  to="/table-booking"
                  className="btn-white"
                  style={S.btnWhite}
                >
                  Reserve a Table
                </Link>
                <Link
                  to="/menu"
                  className="btn-white"
                  style={S.btnWhiteOutline}
                >
                  Order Online
                </Link>
              </>
            ) : (
              <>
                <Link to="/register" className="btn-white" style={S.btnWhite}>
                  Get Started
                </Link>
                <Link
                  to="/login"
                  className="btn-white"
                  style={S.btnWhiteOutline}
                >
                  Login
                </Link>
              </>
            )}
          </div>
        </Reveal>
      </section>

      {/* ════════════════════════════════════════
          CONTACT
      ════════════════════════════════════════ */}
      <section style={S.contactSection}>
        <Reveal variant="fadeUp">
          <div style={S.sectionHeader}>
            <div style={S.sectionTag}>Find Us</div>
            <h2 style={S.sectionTitle}>Contact &amp; Details</h2>
            <p style={S.sectionSub}>
              We'd love to have you. Here's everything you need to visit or
              reach us.
            </p>
          </div>
        </Reveal>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "60px",
            maxWidth: "1200px",
            margin: "0 auto",
            alignItems: "center",
          }}
        >
          <Reveal variant="fadeLeft">
            <div
              style={{
                width: "100%",
                overflow: "hidden",
                boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
              }}
            >
              <video
                src="/Assets/CC video.mp4"
                autoPlay
                loop
                playsInline
                style={{
                  width: "100%",
                  height: "350px",
                  objectFit: "cover",
                  display: "block",
                }}
              />
            </div>
          </Reveal>

          <Reveal variant="fadeRight" delay={150}>
            <div>
              <div style={S.contactInfoTitle}>Epicure Hall · Main Branch</div>
              <div style={S.contactInfoSub}>
                A welcoming space where great food and warm hospitality come
                together.
              </div>
              <div style={{ marginBottom: "30px" }}>
                {[
                  ["📍", "12 Sakura Lane, Karachi, PK"],
                  ["📞", "+92 21 3456 7890"],
                  ["✉️", "hello@epicurehall.com"],
                  ["🌐", "www.epicurehall.com"],
                ].map(([icon, text]) => (
                  <div key={text} style={S.contactRow}>
                    <span style={{ fontSize: "20px", width: "30px" }}>
                      {icon}
                    </span>
                    <span style={S.contactText}>{text}</span>
                  </div>
                ))}
              </div>
              <div style={S.contactHours}>
                <div style={S.contactHoursTitle}>
                  <span style={{ color: "#E8441A", fontSize: "20px" }}>🕐</span>
                  <span style={{ marginLeft: "8px" }}>Opening Hours</span>
                </div>
                {[
                  ["Monday – Thursday", "11:30 – 22:00"],
                  ["Friday – Saturday", "11:30 – 23:30"],
                  ["Sunday", "12:00 – 21:00"],
                ].map(([day, time], i, arr) => (
                  <div
                    key={day}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      fontFamily: "'DM Sans',sans-serif",
                      fontSize: "14px",
                      color: "rgba(0,0,0,0.6)",
                      padding: "10px 0",
                      borderBottom:
                        i === arr.length - 1
                          ? "none"
                          : "1px solid rgba(0,0,0,0.06)",
                    }}
                  >
                    <span style={{ fontWeight: "500" }}>{day}</span>
                    <span style={{ fontWeight: "600", color: "#111" }}>
                      {time}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ════════════════════════════════════════
          FOOTER
      ════════════════════════════════════════ */}
      <Reveal variant="fadeIn">
        <footer style={S.footerBar}>
          <span style={S.footerText}>
            © 2026 Epicure Hall. All rights reserved.
          </span>
          <div style={S.footerLinks}>
            {["Privacy Policy", "Terms", "Sitemap"].map((l) => (
              <a key={l} href="#" className="footer-link" style={S.footerLink}>
                {l}
              </a>
            ))}
          </div>
        </footer>
      </Reveal>
    </div>
  );
}

export default HomePage;
