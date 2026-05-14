import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";

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
  @keyframes pulse {
    0%, 100% { transform: scale(1); }
    50%       { transform: scale(1.04); }
  }

  .login-left  { animation: fadeInLeft  0.8s cubic-bezier(0.22,1,0.36,1) 0.1s both; }
  .login-right { animation: fadeInRight 0.8s cubic-bezier(0.22,1,0.36,1) 0.2s both; }
  .form-row-0  { animation: fadeSlideUp 0.6s ease 0.3s both; }
  .form-row-1  { animation: fadeSlideUp 0.6s ease 0.4s both; }
  .form-row-2  { animation: fadeSlideUp 0.6s ease 0.5s both; }
  .form-row-3  { animation: fadeSlideUp 0.6s ease 0.6s both; }
  .form-row-4  { animation: fadeSlideUp 0.6s ease 0.7s both; }
  .form-row-5  { animation: fadeSlideUp 0.6s ease 0.8s both; }

  .auth-input {
    width: 100%;
    padding: 14px 18px;
    background: rgba(255,255,255,0.04);
    border: 1.5px solid rgba(255,255,255,0.1);
    border-radius: 12px;
    color: #fff;
    font-family: 'DM Sans', sans-serif;
    font-size: 15px;
    outline: none;
    transition: border-color 0.2s, background 0.2s;
  }
  .auth-input::placeholder { color: rgba(255,255,255,0.3); }
  .auth-input:focus {
    border-color: #E8441A;
    background: rgba(232,68,26,0.06);
  }

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
    transition: transform 0.2s, box-shadow 0.2s, background 0.2s;
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

  .forgot-link { color: rgba(255,255,255,0.45); font-family: 'DM Sans',sans-serif; font-size: 13px; text-decoration: none; transition: color 0.2s; }
  .forgot-link:hover { color: #E8441A; }

  .feature-item { animation: fadeSlideUp 0.6s ease both; }
  .logo-pulse   { animation: pulse 3s ease-in-out infinite; }
`;

function LoginPage() {
  /* ── original state ── */
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

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

  /* ── original submit logic (unchanged) ── */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post(
        "http://localhost:5000/api/auth/login",
        {
          email,
          password,
        },
      );

      console.log("Login response:", response.data);

      if (response.data.success) {
        localStorage.setItem("token", response.data.token);
        toast.success("Login successful!");

        // ✅ SIRF YE LINE CHANGE KARO - UI nahi badlega
        setTimeout(() => {
          if (response.data.user.role === "admin") {
            window.location.href = "/admin";
          } else {
            window.location.href = "/";
          }
        }, 500);
      }
    } catch (error) {
      console.error("Login error:", error.response?.data);
      toast.error(error.response?.data?.error || "Login failed");
      setLoading(false);
    }
  };

  /* ── original Google logic (unchanged) ── */
  const handleGoogleLogin = async () => {
    try {
      const { auth, googleProvider, signInWithPopup } =
        await import("../../config/firebase");
      const result = await signInWithPopup(auth, googleProvider);
      const { email, displayName, uid } = result.user;
      const response = await axios.post(
        "http://localhost:5000/api/auth/social-login",
        {
          email,
          full_name: displayName || email.split("@")[0],
          provider: "google",
          provider_id: uid,
        },
      );
      if (response.data.success) {
        localStorage.setItem("token", response.data.token);
        toast.success(`Welcome ${response.data.user.full_name}!`);
        setTimeout(() => {
          window.location.href =
            response.data.user.role === "admin"
              ? "http://localhost:3000/admin"
              : "http://localhost:3000/";
        }, 500);
      }
    } catch (error) {
      console.error("Google login error:", error);
      toast.error("Google login failed");
    }
  };

  /* ── original Facebook logic (unchanged) ── */
  const handleFacebookLogin = async () => {
    try {
      const { auth, facebookProvider, signInWithPopup } =
        await import("../../config/firebase");
      const result = await signInWithPopup(auth, facebookProvider);
      const { email, displayName, uid } = result.user;
      const response = await axios.post(
        "http://localhost:5000/api/auth/social-login",
        {
          email,
          full_name: displayName || email.split("@")[0],
          provider: "facebook",
          provider_id: uid,
        },
      );
      if (response.data.success) {
        localStorage.setItem("token", response.data.token);
        toast.success(`Welcome ${response.data.user.full_name}!`);
        setTimeout(() => {
          window.location.href =
            response.data.user.role === "admin"
              ? "http://localhost:3000/admin"
              : "http://localhost:3000/";
        }, 500);
      }
    } catch (error) {
      console.error("Facebook login error:", error);
      toast.error("Facebook login failed");
    }
  };

  /* ── features list for left panel ── */
  const FEATURES = [
    { icon: "🍣", text: "Order from our chef-curated menu" },
    { icon: "📅", text: "Reserve your perfect table online" },
    { icon: "🎉", text: "Book events & private dining" },
    { icon: "⚡", text: "30-minute express delivery" },
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
        className="login-left"
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
        {/* Glow orb */}
        <div
          style={{
            position: "absolute",
            top: "20%",
            right: "-80px",
            width: "320px",
            height: "320px",
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(232,68,26,0.15) 0%, transparent 70%)",
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "10%",
            left: "-60px",
            width: "240px",
            height: "240px",
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(232,68,26,0.08) 0%, transparent 70%)",
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
            Welcome Back
          </div>
          <h1
            style={{
              fontSize: "clamp(32px, 3vw, 48px)",
              fontFamily: "'Playfair Display', serif",
              fontWeight: "700",
              color: "#fff",
              lineHeight: "1.1",
              marginBottom: "16px",
            }}
          >
            Your Table
            <br />
            <span style={{ color: "#E8441A", fontStyle: "italic" }}>
              Awaits You
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
            Sign in to order food, reserve tables, and enjoy an unforgettable
            dining experience.
          </p>
        </div>

        {/* Feature list */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {FEATURES.map((f, i) => (
            <div
              key={f.text}
              className="feature-item"
              style={{
                animationDelay: `${0.4 + i * 0.1}s`,
                display: "flex",
                alignItems: "center",
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
                  fontSize: "18px",
                  flexShrink: 0,
                }}
              >
                {f.icon}
              </div>
              <span
                style={{
                  fontSize: "14px",
                  color: "rgba(255,255,255,0.6)",
                  fontWeight: "500",
                }}
              >
                {f.text}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ── RIGHT PANEL — form ── */}
      <div
        className="login-right"
        style={{
          width: "480px",
          flexShrink: 0,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "60px 48px",
          background: "#0e0e0e",
        }}
      >
        {/* Form header */}
        <div style={{ marginBottom: "36px" }}>
          <div
            className="logo-pulse"
            style={{ fontSize: "42px", marginBottom: "16px" }}
          >
            🍽️
          </div>
          <h2
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: "28px",
              fontWeight: "700",
              color: "#fff",
              marginBottom: "8px",
            }}
          >
            Sign In
          </h2>
          <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.4)" }}>
            Don't have an account?{" "}
            <Link to="/register" className="auth-link">
              Create one
            </Link>
          </p>
        </div>

        {/* ── FORM (original logic) ── */}
        <form
          onSubmit={handleSubmit}
          style={{ display: "flex", flexDirection: "column", gap: "0" }}
        >
          {/* Email */}
          <div className="form-row-0" style={{ marginBottom: "14px" }}>
            <label
              style={{
                display: "block",
                fontSize: "12px",
                fontWeight: "600",
                letterSpacing: "1px",
                textTransform: "uppercase",
                color: "rgba(255,255,255,0.4)",
                marginBottom: "8px",
              }}
            >
              Email Address
            </label>
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="auth-input"
              required
            />
          </div>

          {/* Password */}
          <div
            className="form-row-1"
            style={{ marginBottom: "10px", position: "relative" }}
          >
            <label
              style={{
                display: "block",
                fontSize: "12px",
                fontWeight: "600",
                letterSpacing: "1px",
                textTransform: "uppercase",
                color: "rgba(255,255,255,0.4)",
                marginBottom: "8px",
              }}
            >
              Password
            </label>
            <div style={{ position: "relative" }}>
              <input
                type={showPass ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="auth-input"
                style={{ paddingRight: "48px" }}
                required
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                style={{
                  position: "absolute",
                  right: "14px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "16px",
                  color: "rgba(255,255,255,0.35)",
                }}
              >
                {showPass ? "🙈" : "👁️"}
              </button>
            </div>
          </div>

          {/* Forgot password */}
          <div
            className="form-row-2"
            style={{ textAlign: "right", marginBottom: "24px" }}
          >
            <Link to="/forgot-password" className="forgot-link">
              Forgot password?
            </Link>
          </div>

          {/* Submit */}
          <div className="form-row-3">
            <button
              type="submit"
              disabled={loading}
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
                  Signing in...
                </span>
              ) : (
                "Sign In"
              )}
            </button>
          </div>
        </form>

        {/* Divider */}
        <div
          className="form-row-4"
          style={{ display: "flex", alignItems: "center", margin: "28px 0" }}
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
              fontSize: "12px",
              fontWeight: "600",
              letterSpacing: "2px",
              color: "rgba(255,255,255,0.25)",
              textTransform: "uppercase",
            }}
          >
            or continue with
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
        <div className="form-row-5" style={{ display: "flex", gap: "12px" }}>
          <button
            onClick={handleGoogleLogin}
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
            onClick={handleFacebookLogin}
            className="social-btn"
            style={{ background: "#1877F2", color: "#fff" }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
            </svg>
            Facebook
          </button>
        </div>

        {/* Register link */}
        <p
          style={{
            textAlign: "center",
            marginTop: "32px",
            fontSize: "14px",
            color: "rgba(255,255,255,0.4)",
          }}
        >
          New here?{" "}
          <Link to="/register" className="auth-link">
            Create an account →
          </Link>
        </p>
      </div>

      {/* spinner keyframe */}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

export default LoginPage;
