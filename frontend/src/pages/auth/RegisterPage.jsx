import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

// GLOBAL CSS IN JS
const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;1,700&family=DM+Sans:wght@400;500;600;700&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  @keyframes fadeSlideUp {
    from { opacity: 0; transform: translateY(32px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes fadeInLeft {
    from { opacity: 0; transform: translateX(-40px); }
    to   { opacity: 1; transform: translateX(0); }
  }
  @keyframes fadeInRight {
    from { opacity: 0; transform: translateX(40px); }
    to   { opacity: 1; transform: translateX(0); }
  }
  @keyframes spin { to { transform: rotate(360deg); } }
  @keyframes pulse {
    0%, 100% { transform: scale(1); }
    50%       { transform: scale(1.04); }
  }

  .reg-left  { animation: fadeInLeft  0.8s cubic-bezier(0.22,1,0.36,1) 0.1s both; }
  .reg-right { animation: fadeInRight 0.8s cubic-bezier(0.22,1,0.36,1) 0.2s both; }
  .form-row-0 { animation: fadeSlideUp 0.6s ease 0.30s both; }
  .form-row-1 { animation: fadeSlideUp 0.6s ease 0.38s both; }
  .form-row-2 { animation: fadeSlideUp 0.6s ease 0.46s both; }
  .form-row-3 { animation: fadeSlideUp 0.6s ease 0.54s both; }
  .form-row-4 { animation: fadeSlideUp 0.6s ease 0.62s both; }
  .form-row-5 { animation: fadeSlideUp 0.6s ease 0.70s both; }
  .form-row-6 { animation: fadeSlideUp 0.6s ease 0.78s both; }
  .form-row-7 { animation: fadeSlideUp 0.6s ease 0.86s both; }

  .auth-input {
    width: 100%;
    padding: 13px 18px;
    background: rgba(255,255,255,0.04);
    border: 1.5px solid rgba(255,255,255,0.1);
    border-radius: 12px;
    color: #fff;
    font-family: 'DM Sans', sans-serif;
    font-size: 14px;
    outline: none;
    transition: border-color 0.2s, background 0.2s;
  }
  .auth-input::placeholder { color: rgba(255,255,255,0.28); }
  .auth-input:focus {
    border-color: #E8441A;
    background: rgba(232,68,26,0.06);
  }
  .auth-input.input-error { border-color: #ff4d4d !important; }

  .auth-btn-primary {
    width: 100%;
    background: #E8441A;
    color: #fff;
    padding: 15px;
    border: none;
    border-radius: 12px;
    font-family: 'DM Sans', sans-serif;
    font-size: 15px;
    font-weight: 700;
    cursor: pointer;
    transition: transform 0.2s, box-shadow 0.2s;
    box-shadow: 0 4px 20px rgba(232,68,26,0.35);
    letter-spacing: 0.3px;
  }
  .auth-btn-primary:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 8px 28px rgba(232,68,26,0.5);
  }
  .auth-btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }

  .social-btn {
    flex: 1;
    padding: 12px 16px;
    border: none;
    border-radius: 12px;
    cursor: pointer;
    font-family: 'DM Sans', sans-serif;
    font-size: 14px;
    font-weight: 600;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    transition: transform 0.2s, opacity 0.2s;
  }
  .social-btn:hover { transform: translateY(-2px); opacity: 0.9; }

  .auth-link { color: #E8441A; text-decoration: none; font-weight: 600; transition: opacity 0.2s; }
  .auth-link:hover { opacity: 0.75; }

  .step-dot {
    width: 8px; height: 8px; border-radius: 50%;
    transition: background 0.3s, transform 0.3s;
  }
  .feature-item { animation: fadeSlideUp 0.6s ease both; }
  .logo-pulse   { animation: pulse 3s ease-in-out infinite; }
`;

function RegisterPage() {
  /* ── original state (unchanged) ── */
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
  });
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [pwMatch, setPwMatch] = useState(null); // null | true | false

  /* ── original hooks (unchanged) ── */
  const { register, loginWithGoogle, loginWithFacebook } = useAuth();
  const navigate = useNavigate();

  /* inject CSS */
  useEffect(() => {
    if (document.getElementById("auth-css")) return;
    const s = document.createElement("style");
    s.id = "auth-css";
    s.textContent = GLOBAL_CSS;
    document.head.appendChild(s);
    return () => {
      const el = document.getElementById("auth-css");
      if (el) el.remove();
    };
  }, []);

  /* live password match check */
  const handleChange = (field, value) => {
    const next = { ...formData, [field]: value };
    setFormData(next);
    if (field === "confirmPassword" || field === "password") {
      const pw = field === "password" ? value : next.password;
      const cpw = field === "confirmPassword" ? value : next.confirmPassword;
      setPwMatch(cpw === "" ? null : pw === cpw);
    }
  };

  /* ── original submit logic (unchanged) ── */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match");
      return;
    }
    setLoading(true);
    const { confirmPassword, ...data } = formData;
    const success = await register(data);
    if (success) navigate("/");
    setLoading(false);
  };

  const STEPS = [
    { label: "Personal Info", fields: ["full_name", "phone"] },
    { label: "Account", fields: ["email", "password", "confirmPassword"] },
  ];

  const PERKS = [
    {
      icon: "🍣",
      title: "Exclusive Menu Access",
      desc: "Order seasonal chef specials before anyone else.",
    },
    {
      icon: "📅",
      title: "Priority Reservations",
      desc: "Skip the queue with member-first table booking.",
    },
    {
      icon: "🎁",
      title: "Member Rewards",
      desc: "Earn points on every order and redeem for perks.",
    },
    {
      icon: "⚡",
      title: "Express Delivery",
      desc: "Guaranteed delivery in 30 minutes or less.",
    },
  ];

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0a0a0a",
        display: "flex",
        fontFamily: "'DM Sans', sans-serif",
      }}
    >
      {/* ── LEFT PANEL — branding ── */}
      <div
        className="reg-left"
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "60px",
          position: "relative",
          overflow: "hidden",
          background:
            "linear-gradient(145deg, #0f0f0f 0%, #1a0a04 60%, #0a0a0a 100%)",
          borderRight: "1px solid rgba(255,255,255,0.05)",
        }}
      >
        {/* Glow orbs */}
        <div
          style={{
            position: "absolute",
            top: "15%",
            right: "-80px",
            width: "340px",
            height: "340px",
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(232,68,26,0.14) 0%, transparent 70%)",
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "15%",
            left: "-60px",
            width: "260px",
            height: "260px",
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(232,68,26,0.07) 0%, transparent 70%)",
            pointerEvents: "none",
          }}
        />

        {/* Logo */}
        <div style={{ marginBottom: "48px" }}>
          <a href="/" style={{ textDecoration: "none" }}>
            <div
              style={{
                fontSize: "22px",
                fontFamily: "'Playfair Display', serif",
                fontWeight: "700",
                letterSpacing: "2px",
                color: "#fff",
                marginBottom: "6px",
              }}
            >
              <span style={{ color: "#E8441A" }}>美食家大廳</span> Epicure{" "}
              <span style={{ color: "#E8441A" }}>Hall</span>
            </div>
          </a>
          <div
            style={{ width: "40px", height: "2px", background: "#E8441A" }}
          />
        </div>

        {/* Headline */}
        <div style={{ marginBottom: "40px" }}>
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
            Join the Experience
          </div>
          <h1
            style={{
              fontSize: "clamp(30px, 3vw, 46px)",
              fontFamily: "'Playfair Display', serif",
              fontWeight: "700",
              color: "#fff",
              lineHeight: "1.12",
              marginBottom: "16px",
            }}
          >
            Start Your
            <br />
            <span style={{ color: "#E8441A", fontStyle: "italic" }}>
              Culinary Journey
            </span>
          </h1>
          <p
            style={{
              fontSize: "15px",
              color: "rgba(255,255,255,0.5)",
              lineHeight: "1.7",
              maxWidth: "340px",
            }}
          >
            Create a free account and unlock exclusive dining privileges at
            Epicure Hall.
          </p>
        </div>

        {/* Perks */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {PERKS.map((p, i) => (
            <div
              key={p.title}
              className="feature-item"
              style={{
                animationDelay: `${0.4 + i * 0.08}s`,
                display: "flex",
                alignItems: "flex-start",
                gap: "14px",
              }}
            >
              <div
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "10px",
                  background: "rgba(232,68,26,0.1)",
                  border: "1px solid rgba(232,68,26,0.2)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "17px",
                  flexShrink: 0,
                  marginTop: "2px",
                }}
              >
                {p.icon}
              </div>
              <div>
                <div
                  style={{
                    fontSize: "14px",
                    fontWeight: "600",
                    color: "rgba(255,255,255,0.85)",
                    marginBottom: "2px",
                  }}
                >
                  {p.title}
                </div>
                <div
                  style={{
                    fontSize: "12px",
                    color: "rgba(255,255,255,0.4)",
                    lineHeight: "1.5",
                  }}
                >
                  {p.desc}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── RIGHT PANEL — form ── */}
      <div
        className="reg-right"
        style={{
          width: "500px",
          flexShrink: 0,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "48px 48px",
          background: "#0e0e0e",
          overflowY: "auto",
        }}
      >
        {/* Form header */}
        <div style={{ marginBottom: "28px" }}>
          <div
            className="logo-pulse"
            style={{ fontSize: "38px", marginBottom: "14px" }}
          >
            🍽️
          </div>
          <h2
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: "26px",
              fontWeight: "700",
              color: "#fff",
              marginBottom: "8px",
            }}
          >
            Create Account
          </h2>
          <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.4)" }}>
            Already have an account?{" "}
            <Link to="/login" className="auth-link">
              Sign in
            </Link>
          </p>
        </div>

        {/* ── FORM (original logic, all fields same) ── */}
        <form
          onSubmit={handleSubmit}
          style={{ display: "flex", flexDirection: "column" }}
        >
          {/* Full Name */}
          <div className="form-row-0" style={{ marginBottom: "14px" }}>
            <label style={labelStyle}>Full Name</label>
            <input
              type="text"
              placeholder="Ali Khan"
              value={formData.full_name}
              onChange={(e) => handleChange("full_name", e.target.value)}
              className="auth-input"
              required
            />
          </div>

          {/* Email */}
          <div className="form-row-1" style={{ marginBottom: "14px" }}>
            <label style={labelStyle}>Email Address</label>
            <input
              type="email"
              placeholder="you@example.com"
              value={formData.email}
              onChange={(e) => handleChange("email", e.target.value)}
              className="auth-input"
              required
            />
          </div>

          {/* Phone */}
          <div className="form-row-2" style={{ marginBottom: "14px" }}>
            <label style={labelStyle}>
              Phone{" "}
              <span
                style={{ color: "rgba(255,255,255,0.25)", fontWeight: 400 }}
              >
                (optional)
              </span>
            </label>
            <input
              type="tel"
              placeholder="+92 300 0000000"
              value={formData.phone}
              onChange={(e) => handleChange("phone", e.target.value)}
              className="auth-input"
            />
          </div>

          {/* Password */}
          <div className="form-row-3" style={{ marginBottom: "14px" }}>
            <label style={labelStyle}>Password</label>
            <div style={{ position: "relative" }}>
              <input
                type={showPass ? "text" : "password"}
                placeholder="Min 8 characters"
                value={formData.password}
                onChange={(e) => handleChange("password", e.target.value)}
                className="auth-input"
                style={{ paddingRight: "48px" }}
                required
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                style={eyeBtn}
              >
                {showPass ? "🙈" : "👁️"}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div className="form-row-4" style={{ marginBottom: "6px" }}>
            <label style={labelStyle}>Confirm Password</label>
            <div style={{ position: "relative" }}>
              <input
                type={showConfirm ? "text" : "password"}
                placeholder="Re-enter password"
                value={formData.confirmPassword}
                onChange={(e) =>
                  handleChange("confirmPassword", e.target.value)
                }
                className={`auth-input ${pwMatch === false ? "input-error" : ""}`}
                style={{ paddingRight: "48px" }}
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                style={eyeBtn}
              >
                {showConfirm ? "🙈" : "👁️"}
              </button>
            </div>
            {/* live match feedback */}
            {pwMatch === false && (
              <p
                style={{
                  fontSize: "12px",
                  color: "#ff4d4d",
                  marginTop: "6px",
                  fontFamily: "'DM Sans',sans-serif",
                }}
              >
                ✕ Passwords do not match
              </p>
            )}
            {pwMatch === true && (
              <p
                style={{
                  fontSize: "12px",
                  color: "#4ade80",
                  marginTop: "6px",
                  fontFamily: "'DM Sans',sans-serif",
                }}
              >
                ✓ Passwords match
              </p>
            )}
          </div>

          {/* Submit */}
          <div className="form-row-5" style={{ marginTop: "22px" }}>
            <button
              type="submit"
              disabled={loading || pwMatch === false}
              className="auth-btn-primary"
            >
              {loading ? (
                <span
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "10px",
                  }}
                >
                  <span
                    style={{
                      width: "16px",
                      height: "16px",
                      border: "2px solid rgba(255,255,255,0.3)",
                      borderTopColor: "#fff",
                      borderRadius: "50%",
                      display: "inline-block",
                      animation: "spin 0.7s linear infinite",
                    }}
                  />
                  Creating account...
                </span>
              ) : (
                "Create Account"
              )}
            </button>
          </div>
        </form>

        {/* Divider */}
        <div
          className="form-row-6"
          style={{ display: "flex", alignItems: "center", margin: "24px 0" }}
        >
          <div
            style={{
              flex: 1,
              height: "1px",
              background: "rgba(255,255,255,0.08)",
            }}
          />
          <span
            style={{
              padding: "0 16px",
              fontSize: "11px",
              fontWeight: "600",
              letterSpacing: "2px",
              color: "rgba(255,255,255,0.22)",
              textTransform: "uppercase",
            }}
          >
            or sign up with
          </span>
          <div
            style={{
              flex: 1,
              height: "1px",
              background: "rgba(255,255,255,0.08)",
            }}
          />
        </div>

        {/* Social buttons (original handlers) */}
        <div className="form-row-7" style={{ display: "flex", gap: "12px" }}>
          <button
            onClick={loginWithGoogle}
            className="social-btn"
            style={{ background: "#fff", color: "#111" }}
          >
            <svg width="18" height="18" viewBox="0 0 48 48">
              <path
                fill="#EA4335"
                d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
              />
              <path
                fill="#4285F4"
                d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
              />
              <path
                fill="#FBBC05"
                d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
              />
              <path
                fill="#34A853"
                d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
              />
            </svg>
            Google
          </button>
          <button
            onClick={loginWithFacebook}
            className="social-btn"
            style={{ background: "#1877F2", color: "#fff" }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
            </svg>
            Facebook
          </button>
        </div>

        {/* Login link */}
        <p
          style={{
            textAlign: "center",
            marginTop: "28px",
            fontSize: "14px",
            color: "rgba(255,255,255,0.35)",
          }}
        >
          Already a member?{" "}
          <Link to="/login" className="auth-link">
            Sign in →
          </Link>
        </p>
      </div>
    </div>
  );
}

/* shared mini styles */
const labelStyle = {
  display: "block",
  fontSize: "11px",
  fontWeight: "600",
  letterSpacing: "1px",
  textTransform: "uppercase",
  color: "rgba(255,255,255,0.38)",
  marginBottom: "7px",
};
const eyeBtn = {
  position: "absolute",
  right: "14px",
  top: "50%",
  transform: "translateY(-50%)",
  background: "none",
  border: "none",
  cursor: "pointer",
  fontSize: "15px",
  color: "rgba(255,255,255,0.3)",
};

export default RegisterPage;
