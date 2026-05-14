import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../../contexts/AuthContext";
import toast from "react-hot-toast";

/* ─────────────────────────────────────────────
   GLOBAL CSS
───────────────────────────────────────────────*/
const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;1,700&family=DM+Sans:wght@400;500;600;700&display=swap');
  *, *::before, *::after { box-sizing: border-box; }

  @keyframes fadeSlideUp {
    from { opacity: 0; transform: translateY(28px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes navSlideDown {
    from { opacity: 0; transform: translateY(-20px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes avatarPulse {
    0%, 100% { box-shadow: 0 0 0 0 rgba(232,68,26,0.3); }
    50%       { box-shadow: 0 0 0 12px rgba(232,68,26,0); }
  }
  @keyframes spin { to { transform: rotate(360deg); } }

  .nav-bar       { animation: navSlideDown 0.5s ease both; }
  .profile-card  { animation: fadeSlideUp 0.6s ease 0.1s both; }
  .nav-link:hover      { color: #fff !important; }
  .footer-link:hover   { color: rgba(255,255,255,0.7) !important; }

  .form-input {
    width: 100%;
    background: #1a1a1a;
    border: 1.5px solid rgba(255,255,255,0.08);
    border-radius: 12px;
    padding: 14px 18px;
    font-family: 'DM Sans', sans-serif;
    font-size: 14px;
    color: #fff;
    outline: none;
    transition: border-color 0.2s;
  }
  .form-input:focus { border-color: rgba(232,68,26,0.5); }
  .form-input::placeholder { color: rgba(255,255,255,0.2); }

  .btn-primary-p {
    background: #E8441A;
    color: #fff;
    padding: 12px 28px;
    border-radius: 50px;
    border: none;
    font-family: 'DM Sans', sans-serif;
    font-size: 14px;
    font-weight: 700;
    cursor: pointer;
    box-shadow: 0 4px 20px rgba(232,68,26,0.35);
    transition: transform 0.2s, box-shadow 0.2s;
    white-space: nowrap;
  }
  .btn-primary-p:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 8px 28px rgba(232,68,26,0.5);
  }
  .btn-primary-p:disabled {
    background: #3a3a3a;
    box-shadow: none;
    cursor: not-allowed;
    color: rgba(255,255,255,0.3);
  }

  .btn-outline-p {
    background: transparent;
    color: rgba(255,255,255,0.55);
    padding: 12px 28px;
    border-radius: 50px;
    border: 1.5px solid rgba(255,255,255,0.12);
    font-family: 'DM Sans', sans-serif;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: border-color 0.2s, color 0.2s, background 0.2s;
    white-space: nowrap;
  }
  .btn-outline-p:hover {
    border-color: rgba(255,255,255,0.28);
    color: #fff;
    background: rgba(255,255,255,0.04);
  }

  .btn-amber-p {
    background: rgba(251,191,36,0.1);
    color: #fbbf24;
    padding: 10px 22px;
    border-radius: 50px;
    border: 1.5px solid rgba(251,191,36,0.25);
    font-family: 'DM Sans', sans-serif;
    font-size: 13px;
    font-weight: 700;
    cursor: pointer;
    transition: background 0.2s, border-color 0.2s;
  }
  .btn-amber-p:hover {
    background: rgba(251,191,36,0.18);
    border-color: rgba(251,191,36,0.45);
  }

  .btn-ghost-p {
    background: rgba(232,68,26,0.08);
    color: #E8441A;
    padding: 10px 22px;
    border-radius: 50px;
    border: 1.5px solid rgba(232,68,26,0.2);
    font-family: 'DM Sans', sans-serif;
    font-size: 13px;
    font-weight: 700;
    cursor: pointer;
    transition: background 0.2s, border-color 0.2s;
  }
  .btn-ghost-p:hover {
    background: rgba(232,68,26,0.14);
    border-color: rgba(232,68,26,0.4);
  }

  .info-row {
    display: flex;
    align-items: center;
    gap: 14px;
    padding: 14px 0;
    border-bottom: 1px solid rgba(255,255,255,0.05);
  }
  .info-row:last-child { border-bottom: none; }

  .section-divider {
    height: 1px;
    background: rgba(255,255,255,0.06);
    margin: 36px 0;
  }

  .tab-btn {
    padding: 8px 20px;
    border-radius: 50px;
    border: 1.5px solid rgba(255,255,255,0.08);
    font-family: 'DM Sans', sans-serif;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
    letter-spacing: 0.3px;
  }
  .tab-btn.active {
    background: #E8441A;
    border-color: #E8441A;
    color: #fff;
    box-shadow: 0 4px 14px rgba(232,68,26,0.35);
  }
  .tab-btn.inactive {
    background: transparent;
    color: rgba(255,255,255,0.4);
  }
  .tab-btn.inactive:hover {
    color: #fff;
    border-color: rgba(255,255,255,0.2);
    background: rgba(255,255,255,0.04);
  }

  .footer-bar {
    background: #0a0a0a;
    padding: 24px 60px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 12px;
    border-top: 1px solid rgba(255,255,255,0.05);
  }
`;

function ProfilePage() {
  const { user, updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeSection, setActiveSection] = useState("profile"); // 'profile' | 'security'
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    phone: "",
  });
  const [passwordData, setPasswordData] = useState({
    current_password: "",
    new_password: "",
    confirm_password: "",
  });
  const [showPasswordForm, setShowPasswordForm] = useState(false);

  /* inject CSS */
  useEffect(() => {
    if (document.getElementById("epicure-profile-css")) return;
    const s = document.createElement("style");
    s.id = "epicure-profile-css";
    s.textContent = GLOBAL_CSS;
    document.head.appendChild(s);
    return () => {
      const el = document.getElementById("epicure-profile-css");
      if (el) el.remove();
    };
  }, []);

  useEffect(() => {
    if (user) {
      setFormData({
        full_name: user.full_name || "",
        email: user.email || "",
        phone: user.phone || "",
      });
    }
  }, [user]);

  const getInitials = () => {
    if (!user?.full_name) return "?";
    return user.full_name
      .split(" ")
      .map((w) => w[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.put(
        "http://localhost:5000/api/auth/update-profile",
        formData,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        },
      );
      if (response.data.success) {
        updateUser(response.data.user);
        toast.success("Profile updated successfully!");
        setIsEditing(false);
      }
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwordData.new_password !== passwordData.confirm_password) {
      toast.error("New passwords do not match");
      return;
    }
    if (passwordData.new_password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    setLoading(true);
    try {
      const response = await axios.post(
        "http://localhost:5000/api/auth/change-password",
        {
          current_password: passwordData.current_password,
          new_password: passwordData.new_password,
        },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        },
      );
      if (response.data.success) {
        toast.success("Password changed successfully!");
        setPasswordData({
          current_password: "",
          new_password: "",
          confirm_password: "",
        });
        setShowPasswordForm(false);
      }
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to change password");
    } finally {
      setLoading(false);
    }
  };

  const FormLabel = ({ children }) => (
    <label
      style={{
        display: "block",
        fontFamily: "'DM Sans',sans-serif",
        fontSize: "11px",
        fontWeight: "700",
        letterSpacing: "1.5px",
        textTransform: "uppercase",
        color: "rgba(255,255,255,0.35)",
        marginBottom: "10px",
      }}
    >
      {children}
    </label>
  );

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0a0a0a",
        color: "#fff",
        fontFamily: "'DM Sans',sans-serif",
      }}
    >
      {/* ── NAV ── */}
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

      {/* ── PAGE HEADER ── */}
      <div
        style={{
          paddingTop: "130px",
          paddingBottom: "48px",
          textAlign: "center",
          background: "linear-gradient(180deg,#0f0f0f 0%,#0a0a0a 100%)",
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
            width: "600px",
            height: "300px",
            background:
              "radial-gradient(ellipse,rgba(232,68,26,0.07) 0%,transparent 70%)",
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
            Your Account
          </div>
          <h1
            style={{
              fontFamily: "'Playfair Display',serif",
              fontSize: "clamp(32px,4vw,52px)",
              fontWeight: "700",
              color: "#fff",
              marginBottom: "14px",
              letterSpacing: "-1px",
            }}
          >
            My{" "}
            <span style={{ color: "#E8441A", fontStyle: "italic" }}>
              Profile
            </span>
          </h1>
          <p
            style={{
              fontSize: "15px",
              color: "rgba(255,255,255,0.4)",
              maxWidth: "380px",
              margin: "0 auto",
              lineHeight: "1.7",
            }}
          >
            Manage your personal information and account security.
          </p>
        </div>
      </div>

      {/* ── MAIN ── */}
      <div
        className="profile-card"
        style={{ maxWidth: "720px", margin: "0 auto", padding: "0 40px 80px" }}
      >
        {/* Avatar Hero Card */}
        <div
          style={{
            background: "#141414",
            border: "1px solid rgba(255,255,255,0.07)",
            borderRadius: "24px",
            padding: "36px",
            marginBottom: "20px",
            display: "flex",
            alignItems: "center",
            gap: "28px",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Background glow */}
          <div
            style={{
              position: "absolute",
              top: "-40px",
              left: "-40px",
              width: "200px",
              height: "200px",
              background:
                "radial-gradient(circle,rgba(232,68,26,0.07) 0%,transparent 70%)",
              pointerEvents: "none",
            }}
          />

          {/* Avatar */}
          <div
            style={{
              width: "88px",
              height: "88px",
              borderRadius: "50%",
              background: "linear-gradient(135deg,#E8441A 0%,#c73515 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: "'Playfair Display',serif",
              fontSize: "28px",
              fontWeight: "700",
              color: "#fff",
              flexShrink: 0,
              boxShadow: "0 8px 28px rgba(232,68,26,0.4)",
              animation: "avatarPulse 3s ease-in-out infinite",
              position: "relative",
              zIndex: 1,
            }}
          >
            {getInitials()}
          </div>

          <div style={{ position: "relative", zIndex: 1 }}>
            <h2
              style={{
                fontFamily: "'Playfair Display',serif",
                fontSize: "22px",
                fontWeight: "700",
                color: "#fff",
                marginBottom: "4px",
              }}
            >
              {user?.full_name || "Guest"}
            </h2>
            <p
              style={{
                fontSize: "14px",
                color: "rgba(255,255,255,0.4)",
                marginBottom: "14px",
              }}
            >
              {user?.email}
            </p>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                background: "rgba(74,222,128,0.08)",
                border: "1px solid rgba(74,222,128,0.2)",
                borderRadius: "50px",
                padding: "4px 12px",
              }}
            >
              <span
                style={{
                  width: "7px",
                  height: "7px",
                  borderRadius: "50%",
                  background: "#4ade80",
                  display: "inline-block",
                }}
              />
              <span
                style={{
                  fontSize: "12px",
                  fontWeight: "600",
                  color: "#4ade80",
                }}
              >
                Active Member
              </span>
            </div>
          </div>
        </div>

        {/* Section Tabs */}
        <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
          {[
            ["profile", "👤", "Profile Info"],
            ["security", "🔒", "Security"],
          ].map(([key, icon, label]) => (
            <button
              key={key}
              className={`tab-btn ${activeSection === key ? "active" : "inactive"}`}
              onClick={() => setActiveSection(key)}
            >
              {icon} {label}
            </button>
          ))}
        </div>

        {/* ── PROFILE INFO SECTION ── */}
        {activeSection === "profile" && (
          <div
            style={{
              background: "#141414",
              border: "1px solid rgba(255,255,255,0.07)",
              borderRadius: "20px",
              padding: "32px",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "28px",
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: "12px",
                    fontWeight: "700",
                    letterSpacing: "3px",
                    textTransform: "uppercase",
                    color: "#E8441A",
                    marginBottom: "6px",
                  }}
                >
                  Profile Information
                </div>
                <h3
                  style={{
                    fontFamily: "'Playfair Display',serif",
                    fontSize: "20px",
                    fontWeight: "700",
                    color: "#fff",
                    margin: 0,
                  }}
                >
                  Personal Details
                </h3>
              </div>
              {!isEditing && (
                <button
                  className="btn-ghost-p"
                  onClick={() => setIsEditing(true)}
                >
                  ✏️ Edit
                </button>
              )}
            </div>

            {isEditing ? (
              <form onSubmit={handleUpdateProfile}>
                <div style={{ marginBottom: "20px" }}>
                  <FormLabel>Full Name</FormLabel>
                  <input
                    className="form-input"
                    type="text"
                    value={formData.full_name}
                    onChange={(e) =>
                      setFormData({ ...formData, full_name: e.target.value })
                    }
                    required
                    placeholder="Your full name"
                  />
                </div>
                <div style={{ marginBottom: "20px" }}>
                  <FormLabel>Email Address</FormLabel>
                  <input
                    className="form-input"
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    required
                    placeholder="your@email.com"
                  />
                </div>
                <div style={{ marginBottom: "28px" }}>
                  <FormLabel>Phone Number</FormLabel>
                  <input
                    className="form-input"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    placeholder="+92 300 0000000"
                  />
                </div>
                <div style={{ display: "flex", gap: "12px" }}>
                  <button
                    type="submit"
                    className="btn-primary-p"
                    disabled={loading}
                  >
                    {loading ? (
                      <span
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                        }}
                      >
                        <span
                          style={{
                            width: "14px",
                            height: "14px",
                            border: "2px solid rgba(255,255,255,0.3)",
                            borderTopColor: "#fff",
                            borderRadius: "50%",
                            display: "inline-block",
                            animation: "spin 0.8s linear infinite",
                          }}
                        />
                        Saving…
                      </span>
                    ) : (
                      "Save Changes"
                    )}
                  </button>
                  <button
                    type="button"
                    className="btn-outline-p"
                    onClick={() => setIsEditing(false)}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div
                style={{
                  background: "#0f0f0f",
                  border: "1px solid rgba(255,255,255,0.05)",
                  borderRadius: "14px",
                  padding: "6px 20px",
                }}
              >
                {[
                  ["👤", "Full Name", formData.full_name || "—"],
                  ["✉️", "Email", formData.email || "—"],
                  ["📞", "Phone", formData.phone || "Not provided"],
                  [
                    "📅",
                    "Member Since",
                    user?.created_at
                      ? new Date(user.created_at).toLocaleDateString("en-US", {
                          month: "long",
                          day: "numeric",
                          year: "numeric",
                        })
                      : "—",
                  ],
                ].map(([icon, label, value]) => (
                  <div key={label} className="info-row">
                    <div
                      style={{
                        width: "36px",
                        height: "36px",
                        borderRadius: "10px",
                        background: "rgba(232,68,26,0.07)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "16px",
                        flexShrink: 0,
                      }}
                    >
                      {icon}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div
                        style={{
                          fontSize: "11px",
                          fontWeight: "700",
                          letterSpacing: "1px",
                          textTransform: "uppercase",
                          color: "rgba(255,255,255,0.28)",
                          marginBottom: "2px",
                        }}
                      >
                        {label}
                      </div>
                      <div
                        style={{
                          fontSize: "14px",
                          fontWeight: "500",
                          color:
                            value === "Not provided"
                              ? "rgba(255,255,255,0.25)"
                              : "rgba(255,255,255,0.85)",
                        }}
                      >
                        {value}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── SECURITY SECTION ── */}
        {activeSection === "security" && (
          <div
            style={{
              background: "#141414",
              border: "1px solid rgba(255,255,255,0.07)",
              borderRadius: "20px",
              padding: "32px",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "28px",
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: "12px",
                    fontWeight: "700",
                    letterSpacing: "3px",
                    textTransform: "uppercase",
                    color: "#E8441A",
                    marginBottom: "6px",
                  }}
                >
                  Account Security
                </div>
                <h3
                  style={{
                    fontFamily: "'Playfair Display',serif",
                    fontSize: "20px",
                    fontWeight: "700",
                    color: "#fff",
                    margin: 0,
                  }}
                >
                  Password &amp; Access
                </h3>
              </div>
              {!showPasswordForm && (
                <button
                  className="btn-amber-p"
                  onClick={() => setShowPasswordForm(true)}
                >
                  🔑 Change Password
                </button>
              )}
            </div>

            {!showPasswordForm ? (
              /* Password status */
              <div
                style={{
                  background: "#0f0f0f",
                  border: "1px solid rgba(255,255,255,0.05)",
                  borderRadius: "14px",
                  padding: "24px",
                }}
              >
                <div
                  style={{ display: "flex", alignItems: "center", gap: "14px" }}
                >
                  <div
                    style={{
                      width: "44px",
                      height: "44px",
                      borderRadius: "12px",
                      background: "rgba(74,222,128,0.08)",
                      border: "1px solid rgba(74,222,128,0.15)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "20px",
                    }}
                  >
                    🔒
                  </div>
                  <div>
                    <div
                      style={{
                        fontSize: "14px",
                        fontWeight: "600",
                        color: "#fff",
                        marginBottom: "3px",
                      }}
                    >
                      Password Protected
                    </div>
                    <div
                      style={{
                        fontSize: "13px",
                        color: "rgba(255,255,255,0.35)",
                      }}
                    >
                      Your account is secured with a password. Click "Change
                      Password" to update it.
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <form onSubmit={handleChangePassword}>
                <div style={{ marginBottom: "20px" }}>
                  <FormLabel>Current Password</FormLabel>
                  <input
                    className="form-input"
                    type="password"
                    value={passwordData.current_password}
                    onChange={(e) =>
                      setPasswordData({
                        ...passwordData,
                        current_password: e.target.value,
                      })
                    }
                    required
                    placeholder="Enter current password"
                  />
                </div>
                <div style={{ marginBottom: "20px" }}>
                  <FormLabel>New Password</FormLabel>
                  <input
                    className="form-input"
                    type="password"
                    value={passwordData.new_password}
                    onChange={(e) =>
                      setPasswordData({
                        ...passwordData,
                        new_password: e.target.value,
                      })
                    }
                    required
                    placeholder="Minimum 6 characters"
                  />
                  {/* Strength indicator */}
                  {passwordData.new_password && (
                    <div style={{ marginTop: "10px" }}>
                      <div
                        style={{
                          display: "flex",
                          gap: "4px",
                          marginBottom: "4px",
                        }}
                      >
                        {[1, 2, 3, 4].map((i) => {
                          const strength = Math.min(
                            Math.floor(passwordData.new_password.length / 3),
                            4,
                          );
                          return (
                            <div
                              key={i}
                              style={{
                                flex: 1,
                                height: "3px",
                                borderRadius: "99px",
                                background:
                                  i <= strength
                                    ? strength <= 1
                                      ? "#ef4444"
                                      : strength === 2
                                        ? "#f59e0b"
                                        : strength === 3
                                          ? "#3b82f6"
                                          : "#4ade80"
                                    : "rgba(255,255,255,0.08)",
                                transition: "background 0.3s",
                              }}
                            />
                          );
                        })}
                      </div>
                      <div
                        style={{
                          fontSize: "11px",
                          color: "rgba(255,255,255,0.3)",
                        }}
                      >
                        {passwordData.new_password.length < 3
                          ? "Weak"
                          : passwordData.new_password.length < 6
                            ? "Fair"
                            : passwordData.new_password.length < 9
                              ? "Good"
                              : "Strong"}
                      </div>
                    </div>
                  )}
                </div>
                <div style={{ marginBottom: "28px" }}>
                  <FormLabel>Confirm New Password</FormLabel>
                  <input
                    className="form-input"
                    type="password"
                    value={passwordData.confirm_password}
                    onChange={(e) =>
                      setPasswordData({
                        ...passwordData,
                        confirm_password: e.target.value,
                      })
                    }
                    required
                    placeholder="Repeat new password"
                  />
                  {passwordData.confirm_password &&
                    passwordData.new_password !==
                      passwordData.confirm_password && (
                      <div
                        style={{
                          marginTop: "8px",
                          fontSize: "12px",
                          color: "#f87171",
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                        }}
                      >
                        ⚠️ Passwords do not match
                      </div>
                    )}
                  {passwordData.confirm_password &&
                    passwordData.new_password ===
                      passwordData.confirm_password && (
                      <div
                        style={{
                          marginTop: "8px",
                          fontSize: "12px",
                          color: "#4ade80",
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                        }}
                      >
                        ✓ Passwords match
                      </div>
                    )}
                </div>
                <div style={{ display: "flex", gap: "12px" }}>
                  <button
                    type="submit"
                    className="btn-primary-p"
                    disabled={loading}
                  >
                    {loading ? (
                      <span
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                        }}
                      >
                        <span
                          style={{
                            width: "14px",
                            height: "14px",
                            border: "2px solid rgba(255,255,255,0.3)",
                            borderTopColor: "#fff",
                            borderRadius: "50%",
                            display: "inline-block",
                            animation: "spin 0.8s linear infinite",
                          }}
                        />
                        Changing…
                      </span>
                    ) : (
                      "Change Password"
                    )}
                  </button>
                  <button
                    type="button"
                    className="btn-outline-p"
                    onClick={() => setShowPasswordForm(false)}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
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

export default ProfilePage;
