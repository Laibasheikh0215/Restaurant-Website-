import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";

/* ─────────────────────────────────────────────
   GLOBAL CSS (idempotent — same id as other auth pages)
───────────────────────────────────────────────*/
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
    70%  { transform: scale(1.1); }
    100% { opacity: 1; transform: scale(1); }
  }
  @keyframes progressBar {
    from { width: 100%; }
    to   { width: 0%; }
  }

  .rp-left  { animation: fadeInLeft  0.8s cubic-bezier(0.22,1,0.36,1) 0.1s both; }
  .rp-right { animation: fadeInRight 0.8s cubic-bezier(0.22,1,0.36,1) 0.2s both; }
  .form-row-0 { animation: fadeSlideUp 0.6s ease 0.30s both; }
  .form-row-1 { animation: fadeSlideUp 0.6s ease 0.42s both; }
  .form-row-2 { animation: fadeSlideUp 0.6s ease 0.54s both; }
  .form-row-3 { animation: fadeSlideUp 0.6s ease 0.66s both; }

  .success-icon  { animation: successPop  0.6s cubic-bezier(0.22,1,0.36,1) 0.2s both; }
  .success-title { animation: fadeSlideUp 0.6s ease 0.45s both; }
  .success-desc  { animation: fadeSlideUp 0.6s ease 0.58s both; }
  .success-bar   { animation: fadeSlideUp 0.6s ease 0.70s both; }

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

  .auth-link { color: #E8441A; text-decoration: none; font-weight: 600; transition: opacity 0.2s; }
  .auth-link:hover { opacity: 0.75; }

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

  .feature-item { animation: fadeSlideUp 0.6s ease both; }
  .logo-pulse   { animation: pulse 3s ease-in-out infinite; }

  .strength-bar-fill { transition: width 0.4s ease, background 0.4s ease; }
`;

/* Password strength helper */
function getStrength(pw) {
  if (!pw) return { score: 0, label: "", color: "transparent" };
  let score = 0;
  if (pw.length >= 8) score++;
  if (pw.length >= 12) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  if (score <= 1) return { score, label: "Weak", color: "#ff4d4d", pct: 20 };
  if (score <= 2) return { score, label: "Fair", color: "#f59e0b", pct: 40 };
  if (score <= 3) return { score, label: "Good", color: "#3b82f6", pct: 65 };
  if (score <= 4) return { score, label: "Strong", color: "#22c55e", pct: 85 };
  return { score, label: "Very Strong", color: "#E8441A", pct: 100 };
}

const SECURITY_TIPS = [
  {
    icon: "🔑",
    title: "Use a unique password",
    desc: "Don't reuse passwords across different sites.",
  },
  {
    icon: "🔢",
    title: "Mix characters",
    desc: "Combine letters, numbers, and symbols.",
  },
  {
    icon: "📏",
    title: "Length matters",
    desc: "Aim for at least 12 characters for better security.",
  },
  {
    icon: "🛡️",
    title: "Stay protected",
    desc: "Consider a password manager for safety.",
  },
];

function ResetPasswordPage() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resetDone, setResetDone] = useState(false);
  const [countdown, setCountdown] = useState(3);
  const [pwMatch, setPwMatch] = useState(null); // null | true | false

  const strength = getStrength(password);

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

  /* Countdown after success */
  useEffect(() => {
    if (!resetDone) return;
    const interval = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          clearInterval(interval);
          navigate("/login");
          return 0;
        }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [resetDone, navigate]);

  const handlePasswordChange = (val) => {
    setPassword(val);
    if (confirmPassword) setPwMatch(val === confirmPassword);
  };

  const handleConfirmChange = (val) => {
    setConfirmPassword(val);
    setPwMatch(val === "" ? null : password === val);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    setLoading(true);
    try {
      const response = await axios.post(
        `http://localhost:5000/api/auth/reset-password/${token}`,
        {
          new_password: password,
        },
      );
      if (response.data.success) {
        setResetDone(true);
        toast.success("Password reset successful!");
      }
    } catch (error) {
      console.error("Reset error:", error);
      toast.error(error.response?.data?.error || "Failed to reset password");
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
        className="rp-left"
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
            Create New Password
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
            Secure Your
            <br />
            <span style={{ color: "#E8441A", fontStyle: "italic" }}>
              Account Again
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
            Choose a strong, unique password to keep your Epicure Hall account
            protected.
          </p>
        </div>

        {/* Security tips */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {SECURITY_TIPS.map((t, i) => (
            <div
              key={t.title}
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
                {t.icon}
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
                  {t.title}
                </div>
                <div
                  style={{
                    fontSize: "12px",
                    color: "rgba(255,255,255,0.4)",
                    lineHeight: "1.5",
                  }}
                >
                  {t.desc}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── RIGHT PANEL ── */}
      <div
        className="rp-right"
        style={{
          width: "500px",
          flexShrink: 0,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "60px 48px",
          background: "#0e0e0e",
          overflowY: "auto",
        }}
      >
        {resetDone ? (
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
              ✅
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
              Password Reset!
            </h2>
            <p
              className="success-desc"
              style={{
                fontSize: "14px",
                color: "rgba(255,255,255,0.45)",
                lineHeight: "1.7",
                marginBottom: "28px",
              }}
            >
              Your password has been changed successfully. You can now sign in
              with your new credentials.
            </p>

            {/* Countdown bar */}
            <div
              className="success-bar"
              style={{
                background: "rgba(255,255,255,0.05)",
                borderRadius: "12px",
                padding: "16px 20px",
                marginBottom: "28px",
              }}
            >
              <p
                style={{
                  fontSize: "13px",
                  color: "rgba(255,255,255,0.5)",
                  marginBottom: "10px",
                }}
              >
                Redirecting to login in{" "}
                <strong style={{ color: "#E8441A" }}>{countdown}s</strong>…
              </p>
              <div
                style={{
                  height: "4px",
                  background: "rgba(255,255,255,0.08)",
                  borderRadius: "2px",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    height: "100%",
                    borderRadius: "2px",
                    background: "#E8441A",
                    width: `${(countdown / 3) * 100}%`,
                    transition: "width 1s linear",
                  }}
                />
              </div>
            </div>

            <Link
              to="/login"
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
              }}
            >
              Go to Sign In →
            </Link>
          </div>
        ) : (
          /* ── FORM STATE ── */
          <>
            <div style={{ marginBottom: "32px" }}>
              <div
                className="logo-pulse"
                style={{ fontSize: "42px", marginBottom: "16px" }}
              >
                🔒
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
                New Password
              </h2>
              <p
                style={{
                  fontSize: "14px",
                  color: "rgba(255,255,255,0.4)",
                  lineHeight: "1.6",
                }}
              >
                Choose a strong password for your Epicure Hall account.
              </p>
            </div>

            <form
              onSubmit={handleSubmit}
              style={{ display: "flex", flexDirection: "column" }}
            >
              {/* New Password */}
              <div className="form-row-0" style={{ marginBottom: "14px" }}>
                <label style={labelStyle}>New Password</label>
                <div style={{ position: "relative" }}>
                  <input
                    type={showPass ? "text" : "password"}
                    placeholder="Min 6 characters"
                    value={password}
                    onChange={(e) => handlePasswordChange(e.target.value)}
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

                {/* Strength meter */}
                {password && (
                  <div style={{ marginTop: "10px" }}>
                    <div
                      style={{
                        height: "4px",
                        background: "rgba(255,255,255,0.08)",
                        borderRadius: "2px",
                        overflow: "hidden",
                        marginBottom: "6px",
                      }}
                    >
                      <div
                        className="strength-bar-fill"
                        style={{
                          height: "100%",
                          borderRadius: "2px",
                          width: `${strength.pct}%`,
                          background: strength.color,
                        }}
                      />
                    </div>
                    <span
                      style={{
                        fontSize: "11px",
                        fontWeight: "600",
                        color: strength.color,
                        letterSpacing: "0.5px",
                      }}
                    >
                      {strength.label}
                    </span>
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              <div className="form-row-1" style={{ marginBottom: "6px" }}>
                <label style={labelStyle}>Confirm Password</label>
                <div style={{ position: "relative" }}>
                  <input
                    type={showConfirm ? "text" : "password"}
                    placeholder="Re-enter your new password"
                    value={confirmPassword}
                    onChange={(e) => handleConfirmChange(e.target.value)}
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
                {pwMatch === false && (
                  <p
                    style={{
                      fontSize: "12px",
                      color: "#ff4d4d",
                      marginTop: "6px",
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
                    }}
                  >
                    ✓ Passwords match
                  </p>
                )}
              </div>

              {/* Submit */}
              <div className="form-row-2" style={{ marginTop: "24px" }}>
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
                      Resetting Password...
                    </span>
                  ) : (
                    "Reset Password"
                  )}
                </button>
              </div>
            </form>

            <div
              className="form-row-3"
              style={{ textAlign: "center", marginTop: "28px" }}
            >
              <Link to="/login" className="back-link">
                ← Back to Sign In
              </Link>
            </div>
          </>
        )}
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        .rp-right { animation: fadeInRight 0.8s cubic-bezier(0.22,1,0.36,1) 0.2s both; }
        .back-link {
          display: inline-flex; align-items: center; gap: 6px;
          color: rgba(255,255,255,0.4); font-family: 'DM Sans', sans-serif;
          font-size: 13px; text-decoration: none; transition: color 0.2s;
        }
        .back-link:hover { color: #E8441A; }
      `}</style>
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

export default ResetPasswordPage;
