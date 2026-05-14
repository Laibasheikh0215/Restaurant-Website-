import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import axios from "axios";
import toast from "react-hot-toast";
import {
  requestNotificationPermission,
  testNotification,
} from "../services/notificationService";

/* ─────────────────────────────────────────────
   GLOBAL CSS
───────────────────────────────────────────────*/
const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;1,700&family=DM+Sans:wght@400;500;600;700&display=swap');
  *, *::before, *::after { box-sizing: border-box; }

  @keyframes pd-dropIn {
    from { opacity: 0; transform: translateY(-10px) scale(0.97); }
    to   { opacity: 1; transform: translateY(0)   scale(1);     }
  }
  @keyframes pd-modalIn {
    from { opacity: 0; transform: scale(0.95) translateY(12px); }
    to   { opacity: 1; transform: scale(1)    translateY(0);    }
  }
  @keyframes pd-overlayIn {
    from { opacity: 0; }
    to   { opacity: 1; }
  }
  @keyframes spin { to { transform: rotate(360deg); } }

  .pd-dropdown { animation: pd-dropIn  0.22s cubic-bezier(0.22,1,0.36,1) both; }
  .pd-modal    { animation: pd-modalIn 0.28s cubic-bezier(0.22,1,0.36,1) both; }
  .pd-overlay  { animation: pd-overlayIn 0.2s ease both; }

  .pd-avatar-btn {
    display: flex;
    align-items: center;
    gap: 10px;
    background: none;
    border: none;
    cursor: pointer;
    padding: 5px 8px;
    border-radius: 50px;
    transition: background 0.2s;
  }
  .pd-avatar-btn:hover { background: rgba(255,255,255,0.07); }

  .pd-menu-item {
    width: 100%;
    padding: 10px 14px;
    border: none;
    background: transparent;
    color: rgba(255,255,255,0.72);
    font-family: 'DM Sans', sans-serif;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 10px;
    border-radius: 8px;
    transition: background 0.15s, color 0.15s;
    text-align: left;
  }
  .pd-menu-item:hover {
    background: rgba(232,68,26,0.08);
    color: #fff;
  }
  .pd-menu-item.logout {
    color: rgba(248,113,113,0.9);
  }
  .pd-menu-item.logout:hover {
    background: rgba(239,68,68,0.1);
    color: #fca5a5;
  }
  .pd-menu-item:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  .pd-menu-item:disabled:hover {
    background: transparent;
    color: rgba(255,255,255,0.72);
  }

  .pd-input {
    width: 100%;
    padding: 13px 16px;
    background: rgba(255,255,255,0.04);
    border: 1.5px solid rgba(255,255,255,0.1);
    border-radius: 12px;
    color: #fff;
    font-family: 'DM Sans', sans-serif;
    font-size: 14px;
    outline: none;
    transition: border-color 0.2s, background 0.2s;
  }
  .pd-input::placeholder { color: rgba(255,255,255,0.28); }
  .pd-input:focus {
    border-color: #E8441A;
    background: rgba(232,68,26,0.06);
  }

  .pd-btn-save {
    flex: 1;
    background: #E8441A;
    color: #fff;
    padding: 13px;
    border: none;
    border-radius: 12px;
    font-family: 'DM Sans', sans-serif;
    font-size: 14px;
    font-weight: 700;
    cursor: pointer;
    transition: transform 0.2s, box-shadow 0.2s;
    box-shadow: 0 4px 16px rgba(232,68,26,0.35);
  }
  .pd-btn-save:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 6px 22px rgba(232,68,26,0.5);
  }
  .pd-btn-save:disabled { opacity: 0.5; cursor: not-allowed; }

  .pd-btn-cancel {
    flex: 1;
    background: rgba(255,255,255,0.06);
    color: rgba(255,255,255,0.6);
    padding: 13px;
    border: none;
    border-radius: 12px;
    font-family: 'DM Sans', sans-serif;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.2s, color 0.2s;
    border: 1.5px solid rgba(255,255,255,0.08);
  }
  .pd-btn-cancel:hover {
    background: rgba(255,255,255,0.1);
    color: #fff;
  }
`;

const labelStyle = {
  display: "block",
  fontSize: "11px",
  fontWeight: "700",
  letterSpacing: "1.5px",
  textTransform: "uppercase",
  color: "rgba(255,255,255,0.35)",
  marginBottom: "7px",
  fontFamily: "'DM Sans', sans-serif",
};

function ProfileDropdown() {
  const { user, logout, updateUser } = useAuth();
  const navigate = useNavigate();
  const wrapperRef = useRef(null);

  const [isOpen, setIsOpen] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    phone: "",
  });
  const [loading, setLoading] = useState(false);

  // Inject CSS
  useEffect(() => {
    if (document.getElementById("pd-css")) return;
    const s = document.createElement("style");
    s.id = "pd-css";
    s.textContent = GLOBAL_CSS;
    document.head.appendChild(s);
    return () => {
      const el = document.getElementById("pd-css");
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
    if (Notification.permission === "granted") setNotificationsEnabled(true);
  }, [user]);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target))
        setIsOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

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
        setShowModal(false);
        setIsOpen(false);
      }
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const enableNotifications = async () => {
    const granted = await requestNotificationPermission();
    setNotificationsEnabled(granted);
    if (granted) {
      toast.success("Notifications enabled!");
      testNotification();
    } else {
      toast.error("Notification permission denied");
    }
  };

  return (
    <>
      {/* ── AVATAR + DROPDOWN ── */}
      <div ref={wrapperRef} style={{ position: "relative" }}>
        {/* Avatar button */}
        <button className="pd-avatar-btn" onClick={() => setIsOpen(!isOpen)}>
          {/* Circle avatar */}
          <div
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
              flexShrink: 0,
              userSelect: "none",
            }}
          >
            {getInitials()}
          </div>

          {/* Name */}
          <span
            style={{
              fontFamily: "'DM Sans',sans-serif",
              fontSize: "14px",
              fontWeight: "600",
              color: "rgba(255,255,255,0.8)",
            }}
          >
            {user?.full_name?.split(" ")[0]}
          </span>

          {/* Chevron */}
          <span
            style={{
              fontSize: "10px",
              color: "rgba(255,255,255,0.35)",
              transition: "transform 0.2s",
              transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
            }}
          >
            ▼
          </span>
        </button>

        {/* Dropdown panel */}
        {isOpen && (
          <div
            className="pd-dropdown"
            style={{
              position: "absolute",
              top: "calc(100% + 12px)",
              right: 0,
              background: "#1a1a1a",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: "16px",
              padding: "8px",
              minWidth: "220px",
              boxShadow: "0 16px 48px rgba(0,0,0,0.55)",
              zIndex: 1000,
            }}
          >
            {/* Arrow */}
            <div
              style={{
                position: "absolute",
                top: "-6px",
                right: "16px",
                width: "12px",
                height: "12px",
                background: "#1a1a1a",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRight: "none",
                borderBottom: "none",
                transform: "rotate(45deg)",
              }}
            />

            {/* User info header */}
            <div
              style={{
                padding: "12px 14px 14px",
                borderBottom: "1px solid rgba(255,255,255,0.07)",
                marginBottom: "6px",
              }}
            >
              <div
                style={{ display: "flex", alignItems: "center", gap: "10px" }}
              >
                <div
                  style={{
                    width: "40px",
                    height: "40px",
                    borderRadius: "50%",
                    background: "#E8441A",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontFamily: "'DM Sans',sans-serif",
                    fontSize: "15px",
                    fontWeight: "700",
                    color: "#fff",
                    flexShrink: 0,
                  }}
                >
                  {getInitials()}
                </div>
                <div style={{ minWidth: 0 }}>
                  <div
                    style={{
                      fontFamily: "'DM Sans',sans-serif",
                      fontSize: "14px",
                      fontWeight: "700",
                      color: "#fff",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {user?.full_name}
                  </div>
                  <div
                    style={{
                      fontFamily: "'DM Sans',sans-serif",
                      fontSize: "11px",
                      color: "rgba(255,255,255,0.38)",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {user?.email}
                  </div>
                </div>
              </div>
            </div>

            {/* Menu items */}
            <button
              className="pd-menu-item"
              onClick={() => {
                setIsOpen(false);
                setShowModal(true);
              }}
            >
              <span style={{ fontSize: "16px" }}>✏️</span>
              Edit Profile
            </button>

            <button
              className="pd-menu-item"
              onClick={enableNotifications}
              disabled={notificationsEnabled}
            >
              <span style={{ fontSize: "16px" }}>
                {notificationsEnabled ? "🔔" : "🔕"}
              </span>
              {notificationsEnabled
                ? "Notifications On"
                : "Enable Notifications"}
              {notificationsEnabled && (
                <span
                  style={{
                    marginLeft: "auto",
                    fontSize: "10px",
                    background: "rgba(16,185,129,0.15)",
                    color: "#34d399",
                    padding: "2px 7px",
                    borderRadius: "50px",
                    fontWeight: "700",
                    letterSpacing: "0.5px",
                  }}
                >
                  ON
                </span>
              )}
            </button>

            <div
              style={{
                height: "1px",
                background: "rgba(255,255,255,0.07)",
                margin: "6px 0",
              }}
            />

            <button className="pd-menu-item logout" onClick={handleLogout}>
              <span style={{ fontSize: "16px" }}>🚪</span>
              Logout
            </button>
          </div>
        )}
      </div>

      {/* ── EDIT PROFILE MODAL ── */}
      {showModal && (
        <div
          className="pd-overlay"
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.7)",
            backdropFilter: "blur(6px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 2000,
            padding: "20px",
          }}
          onClick={() => setShowModal(false)}
        >
          <div
            className="pd-modal"
            style={{
              background: "#141414",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: "22px",
              width: "100%",
              maxWidth: "460px",
              maxHeight: "90vh",
              overflowY: "auto",
              boxShadow: "0 24px 64px rgba(0,0,0,0.6)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal header */}
            <div
              style={{
                padding: "22px 26px 20px",
                borderBottom: "1px solid rgba(255,255,255,0.07)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: "11px",
                    fontWeight: "700",
                    letterSpacing: "3px",
                    textTransform: "uppercase",
                    color: "#E8441A",
                    marginBottom: "4px",
                  }}
                >
                  Your Account
                </div>
                <div
                  style={{
                    fontFamily: "'Playfair Display',serif",
                    fontSize: "20px",
                    fontWeight: "700",
                    color: "#fff",
                  }}
                >
                  Edit Profile
                </div>
              </div>
              <button
                onClick={() => setShowModal(false)}
                style={{
                  width: "34px",
                  height: "34px",
                  borderRadius: "50%",
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  color: "rgba(255,255,255,0.5)",
                  fontSize: "18px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "background 0.2s, color 0.2s",
                  lineHeight: 1,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(232,68,26,0.12)";
                  e.currentTarget.style.color = "#E8441A";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "rgba(255,255,255,0.06)";
                  e.currentTarget.style.color = "rgba(255,255,255,0.5)";
                }}
              >
                ×
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleUpdateProfile} style={{ padding: "26px" }}>
              <div style={{ marginBottom: "18px" }}>
                <label style={labelStyle}>
                  Full Name <span style={{ color: "#E8441A" }}>*</span>
                </label>
                <input
                  type="text"
                  value={formData.full_name}
                  onChange={(e) =>
                    setFormData({ ...formData, full_name: e.target.value })
                  }
                  className="pd-input"
                  placeholder="Ali Khan"
                  required
                />
              </div>

              <div style={{ marginBottom: "18px" }}>
                <label style={labelStyle}>
                  Email Address <span style={{ color: "#E8441A" }}>*</span>
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="pd-input"
                  placeholder="you@example.com"
                  required
                />
              </div>

              <div style={{ marginBottom: "26px" }}>
                <label style={labelStyle}>
                  Phone Number{" "}
                  <span
                    style={{ color: "rgba(255,255,255,0.25)", fontWeight: 400 }}
                  >
                    (optional)
                  </span>
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  className="pd-input"
                  placeholder="+92 300 0000000"
                />
              </div>

              <div style={{ display: "flex", gap: "12px" }}>
                <button
                  type="submit"
                  disabled={loading}
                  className="pd-btn-save"
                >
                  {loading ? (
                    <span
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
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
                          animation: "spin 0.7s linear infinite",
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
                  className="pd-btn-cancel"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

export default ProfileDropdown;
