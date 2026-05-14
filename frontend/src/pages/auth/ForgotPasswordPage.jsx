import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
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
  @keyframes spin { to { transform: rotate(360deg); } }
  @keyframes pulse {
    0%, 100% { transform: scale(1); }
    50%       { transform: scale(1.04); }
  }
  @keyframes successPop {
    0%   { opacity: 0; transform: scale(0.7); }
    70%  { transform: scale(1.08); }
    100% { opacity: 1; transform: scale(1); }
  }

  .fp-left  { animation: fadeInLeft  0.8s cubic-bezier(0.22,1,0.36,1) 0.1s both; }
  .fp-right { animation: fadeInRight 0.8s cubic-bezier(0.22,1,0.36,1) 0.2s both; }
  .form-row-0 { animation: fadeSlideUp 0.6s ease 0.30s both; }
  .form-row-1 { animation: fadeSlideUp 0.6s ease 0.42s both; }
  .form-row-2 { animation: fadeSlideUp 0.6s ease 0.54s both; }

  .success-icon { animation: successPop 0.6s cubic-bezier(0.22,1,0.36,1) 0.2s both; }
  .success-title { animation: fadeSlideUp 0.6s ease 0.45s both; }
  .success-desc  { animation: fadeSlideUp 0.6s ease 0.58s both; }
  .success-btn   { animation: fadeSlideUp 0.6s ease 0.7s  both; }

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
    transition: transform 0.2s, box-shadow 0.2s;
    box-shadow: 0 4px 20px rgba(232,68,26,0.35);
    letter-spacing: 0.3px;
  }
  .auth-btn-primary:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 8px 28px rgba(232,68,26,0.5);
  }
  .auth-btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }

  .auth-link { color: #E8441A; text-decoration: none; font-weight: 600; transition: opacity 0.2s; }
  .auth-link:hover { opacity: 0.75; }

  .feature-item { animation: fadeSlideUp 0.6s ease both; }
  .logo-pulse   { animation: pulse 3s ease-in-out infinite; }

  .back-link {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    color: rgba(255,255,255,0.4);
    font-family: 'DM Sans', sans-serif;
    font-size: 13px;
    text-decoration: none;
    transition: color 0.2s;
  }
  .back-link:hover { color: #E8441A; }

  .btn-white-outline {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    background: transparent;
    border: 2px solid rgba(232,68,26,0.5);
    color: #E8441A;
    padding: 13px 32px;
    border-radius: 12px;
    font-family: 'DM Sans', sans-serif;
    font-size: 14px;
    font-weight: 700;
    text-decoration: none;
    cursor: pointer;
    transition: background 0.2s, border-color 0.2s, transform 0.2s;
    letter-spacing: 0.3px;
  }
  .btn-white-outline:hover {
    background: rgba(232,68,26,0.08);
    border-color: #E8441A;
    transform: translateY(-2px);
  }
`;

const TIPS = [
  { icon: "🔒", text: "Reset link is valid for 1 hour only" },
  { icon: "📧", text: "Check your spam folder if not received" },
  { icon: "🛡️", text: "We never store your password in plain text" },
  { icon: "🔄", text: "You can request a new link after it expires" },
];

function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      toast.error("Please enter your email");
      return;
    }
    setLoading(true);
    try {
      const response = await axios.post(
        "http://localhost:5000/api/auth/forgot-password",
        { email },
      );
      if (response.data.success) {
        setSent(true);
        toast.success("Reset link sent to your email!");
      }
    } catch (error) {
      console.error("Forgot password error:", error);
      toast.error(error.response?.data?.error || "Failed to send reset link");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0a0a0a",
        display: "flex",
        fontFamily: "'DM Sans', sans-serif",
      }}
    >
      {/* ── LEFT PANEL ── */}
      <div
        className="fp-left"
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
            Account Recovery
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
            Forgot Your
            <br />
            <span style={{ color: "#E8441A", fontStyle: "italic" }}>
              Password?
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
            No worries — it happens to everyone. Enter your email and we'll send
            you a secure reset link instantly.
          </p>
        </div>

        {/* Tips */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {TIPS.map((t, i) => (
            <div
              key={t.text}
              className="feature-item"
              style={{
                animationDelay: `${0.4 + i * 0.08}s`,
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
                {t.icon}
              </div>
              <span
                style={{
                  fontSize: "14px",
                  color: "rgba(255,255,255,0.6)",
                  fontWeight: "500",
                }}
              >
                {t.text}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ── RIGHT PANEL ── */}
      <div
        className="fp-right"
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
        {sent ? (
          /* ── SUCCESS STATE ── */
          <div style={{ textAlign: "center" }}>
            <div
              className="success-icon"
              style={{
                fontSize: "64px",
                marginBottom: "24px",
                display: "inline-block",
              }}
            >
              📧
            </div>
            <h2
              className="success-title"
              style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: "26px",
                fontWeight: "700",
                color: "#fff",
                marginBottom: "12px",
              }}
            >
              Check Your Inbox
            </h2>
            <p
              className="success-desc"
              style={{
                fontSize: "14px",
                color: "rgba(255,255,255,0.45)",
                lineHeight: "1.7",
                marginBottom: "8px",
              }}
            >
              We've sent a password reset link to
            </p>
            <p
              className="success-desc"
              style={{
                fontSize: "15px",
                fontWeight: "600",
                color: "#E8441A",
                marginBottom: "28px",
                wordBreak: "break-all",
              }}
            >
              {email}
            </p>
            <div
              style={{
                background: "rgba(232,68,26,0.06)",
                border: "1px solid rgba(232,68,26,0.15)",
                borderRadius: "12px",
                padding: "16px 20px",
                marginBottom: "32px",
              }}
            >
              <p
                style={{
                  fontSize: "13px",
                  color: "rgba(255,255,255,0.5)",
                  lineHeight: "1.6",
                }}
              >
                ⏰ &nbsp;The link will expire in{" "}
                <strong style={{ color: "rgba(255,255,255,0.75)" }}>
                  1 hour
                </strong>
                . Check your spam folder if you don't see it.
              </p>
            </div>
            <div className="success-btn">
              <Link
                to="/login"
                className="auth-btn-primary"
                style={{
                  display: "inline-block",
                  width: "100%",
                  textAlign: "center",
                  background: "#E8441A",
                  color: "#fff",
                  padding: "15px",
                  borderRadius: "12px",
                  textDecoration: "none",
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: "15px",
                  fontWeight: "700",
                  boxShadow: "0 4px 20px rgba(232,68,26,0.35)",
                  transition: "transform 0.2s, box-shadow 0.2s",
                }}
              >
                ← Back to Sign In
              </Link>
            </div>
          </div>
        ) : (
          /* ── FORM STATE ── */
          <>
            <div style={{ marginBottom: "36px" }}>
              <div
                className="logo-pulse"
                style={{ fontSize: "42px", marginBottom: "16px" }}
              >
                🔑
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
                Reset Password
              </h2>
              <p
                style={{
                  fontSize: "14px",
                  color: "rgba(255,255,255,0.4)",
                  lineHeight: "1.6",
                }}
              >
                Enter the email associated with your account and we'll send you
                a reset link.
              </p>
            </div>

            <form
              onSubmit={handleSubmit}
              style={{ display: "flex", flexDirection: "column" }}
            >
              <div className="form-row-0" style={{ marginBottom: "24px" }}>
                <label style={labelStyle}>Email Address</label>
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="auth-input"
                  required
                />
              </div>

              <div className="form-row-1">
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
                      Sending Reset Link...
                    </span>
                  ) : (
                    "Send Reset Link"
                  )}
                </button>
              </div>
            </form>

            <div
              className="form-row-2"
              style={{ textAlign: "center", marginTop: "28px" }}
            >
              <Link to="/login" className="back-link">
                ← Back to Sign In
              </Link>
            </div>

            <p
              style={{
                textAlign: "center",
                marginTop: "20px",
                fontSize: "14px",
                color: "rgba(255,255,255,0.3)",
              }}
            >
              Don't have an account?{" "}
              <Link to="/register" className="auth-link">
                Create one
              </Link>
            </p>
          </>
        )}
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

const labelStyle = {
  display: "block",
  fontSize: "12px",
  fontWeight: "600",
  letterSpacing: "1px",
  textTransform: "uppercase",
  color: "rgba(255,255,255,0.4)",
  marginBottom: "8px",
};

export default ForgotPasswordPage;
