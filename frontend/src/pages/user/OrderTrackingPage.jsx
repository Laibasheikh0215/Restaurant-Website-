import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import io from "socket.io-client";
import { useAuth } from "../../contexts/AuthContext";
import toast from "react-hot-toast";

// GLOBAL CSS 
const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;1,700&family=DM+Sans:wght@400;500;600;700&display=swap');
  *, *::before, *::after { box-sizing: border-box; }

  @keyframes fadeSlideUp {
    from { opacity: 0; transform: translateY(24px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes spin { to { transform: rotate(360deg); } }
  @keyframes live-pulse {
    0%, 100% { opacity: 1; transform: scale(1); box-shadow: 0 0 0 0 rgba(16,185,129,0.6); }
    50%       { opacity: 0.8; transform: scale(1.1); box-shadow: 0 0 0 6px rgba(16,185,129,0); }
  }
  @keyframes progress-shine {
    from { background-position: -200% center; }
    to   { background-position: 200% center; }
  }
  @keyframes stepGlow {
    0%, 100% { box-shadow: 0 0 0 0 rgba(232,68,26,0.4); }
    50%       { box-shadow: 0 0 0 8px rgba(232,68,26,0); }
  }

  .tracking-card {
    background: #141414;
    border: 1px solid rgba(255,255,255,0.06);
    border-radius: 20px;
    padding: 28px 32px;
    margin-bottom: 20px;
    animation: fadeSlideUp 0.5s ease both;
  }

  .back-btn {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    font-family: 'DM Sans', sans-serif;
    font-size: 13px;
    font-weight: 600;
    color: rgba(255,255,255,0.5);
    background: rgba(255,255,255,0.05);
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 50px;
    padding: 9px 20px;
    cursor: pointer;
    transition: all 0.2s;
    text-decoration: none;
  }
  .back-btn:hover { background: rgba(232,68,26,0.1); border-color: rgba(232,68,26,0.3); color: #fff; }

  .item-row { display: flex; justify-content: space-between; padding: 11px 0; border-bottom: 1px solid rgba(255,255,255,0.05); }
  .item-row:last-child { border-bottom: none; }

  .divider { height: 1px; background: rgba(255,255,255,0.06); margin: 18px 0; }

  .step-node {
    width: 44px; height: 44px; border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    font-size: 18px; position: relative; z-index: 2;
    transition: all 0.3s;
    flex-shrink: 0;
  }
  .step-node.done {
    background: #E8441A;
    box-shadow: 0 4px 16px rgba(232,68,26,0.45);
  }
  .step-node.current {
    background: #E8441A;
    animation: stepGlow 1.5s ease-in-out infinite;
    box-shadow: 0 4px 20px rgba(232,68,26,0.55);
  }
  .step-node.pending {
    background: rgba(255,255,255,0.05);
    border: 1.5px solid rgba(255,255,255,0.1);
  }

  .live-indicator {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    background: rgba(16,185,129,0.08);
    border: 1px solid rgba(16,185,129,0.2);
    border-radius: 50px;
    padding: 8px 18px;
  }
  .live-dot {
    width: 8px; height: 8px; border-radius: 50%;
    background: #10b981;
    animation: live-pulse 2s ease-in-out infinite;
  }
`;

// STEP CONFIG
const STEPS = [
  { key: "pending", icon: "📝", label: "Placed" },
  { key: "confirmed", icon: "✅", label: "Confirmed" },
  { key: "preparing", icon: "🍳", label: "Preparing" },
  { key: "ready", icon: "🎉", label: "Ready" },
  { key: "completed", icon: "🏁", label: "Done" },
];
const STEP_ORDER = ["pending", "confirmed", "preparing", "ready", "completed"];

const STATUS_COLORS = {
  pending: { bg: "rgba(245,158,11,0.12)", color: "#f59e0b" },
  confirmed: { bg: "rgba(59,130,246,0.12)", color: "#60a5fa" },
  preparing: { bg: "rgba(139,92,246,0.12)", color: "#a78bfa" },
  ready: { bg: "rgba(16,185,129,0.12)", color: "#34d399" },
  completed: { bg: "rgba(16,185,129,0.12)", color: "#34d399" },
  cancelled: { bg: "rgba(239,68,68,0.12)", color: "#f87171" },
};

// COMPONENT
function OrderTrackingPage() {
  const { orderId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [socket, setSocket] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);

  useEffect(() => {
    if (!document.getElementById("tracking-css")) {
      const s = document.createElement("style");
      s.id = "tracking-css";
      s.textContent = GLOBAL_CSS;
      document.head.appendChild(s);
    }
    return () => {
      const el = document.getElementById("tracking-css");
      if (el) el.remove();
    };
  }, []);

  /* ── original socket + fetch logic (unchanged) ── */
  useEffect(() => {
    const newSocket = io("http://localhost:5000");
    setSocket(newSocket);
    if (user) newSocket.emit("register-user", user.id);
    newSocket.on("order-update", (data) => {
      if (data.orderId == orderId) {
        toast.success(data.message);
        fetchOrderDetails();
        setLastUpdate(new Date());
      }
    });
    fetchOrderDetails();
    return () => {
      newSocket.disconnect();
    };
  }, [orderId, user]);

  const fetchOrderDetails = async () => {
    try {
      const response = await axios.get(
        `http://localhost:5000/api/orders/track/${orderId}`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        },
      );
      setOrder(response.data);
    } catch (error) {
      console.error("Error fetching order:", error);
      toast.error("Order not found");
      navigate("/my-bookings");
    } finally {
      setLoading(false);
    }
  };

  /* ── computed step state ── */
  const currentStepIdx = order ? STEP_ORDER.indexOf(order.status) : -1;

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
              margin: "0 auto 20px",
            }}
          />
          <p
            style={{
              fontFamily: "'DM Sans',sans-serif",
              color: "rgba(255,255,255,0.4)",
              fontSize: "14px",
            }}
          >
            Loading order details…
          </p>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!order) {
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
        <div
          style={{
            textAlign: "center",
            background: "#141414",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: "24px",
            padding: "56px 48px",
          }}
        >
          <div style={{ fontSize: "48px", marginBottom: "16px" }}>🔍</div>
          <h2
            style={{
              fontFamily: "'Playfair Display',serif",
              color: "#fff",
              fontSize: "24px",
              marginBottom: "12px",
            }}
          >
            Order Not Found
          </h2>
          <p
            style={{
              fontFamily: "'DM Sans',sans-serif",
              color: "rgba(255,255,255,0.4)",
              marginBottom: "28px",
              fontSize: "14px",
            }}
          >
            We couldn't locate this order.
          </p>
          <button
            onClick={() => navigate("/my-bookings")}
            style={{
              background: "#E8441A",
              color: "#fff",
              border: "none",
              padding: "12px 28px",
              borderRadius: "50px",
              cursor: "pointer",
              fontFamily: "'DM Sans',sans-serif",
              fontWeight: "700",
              fontSize: "14px",
            }}
          >
            ← Back to My Orders
          </button>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  const st = STATUS_COLORS[order.status] || STATUS_COLORS.pending;
  const isCancelled = order.status === "cancelled";
  const isFinished = order.status === "completed" || isCancelled;

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0a0a0a",
        fontFamily: "'DM Sans',sans-serif",
      }}
    >
      {/* ── HERO HEADER ── */}
      <div
        style={{
          background:
            "linear-gradient(135deg,#0f0f0f 0%,#1a0a04 60%,#0a0a0a 100%)",
          padding: "80px 60px 52px",
          position: "relative",
          overflow: "hidden",
          borderBottom: "1px solid rgba(255,255,255,0.05)",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: "-80px",
            right: "8%",
            width: "400px",
            height: "400px",
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(232,68,26,0.10) 0%, transparent 70%)",
            pointerEvents: "none",
          }}
        />
        <div
          style={{ maxWidth: "900px", margin: "0 auto", position: "relative" }}
        >
          <button
            className="back-btn"
            onClick={() => navigate("/my-bookings")}
            style={{ marginBottom: "28px" }}
          >
            ← My Bookings
          </button>
          <div
            style={{
              fontSize: "12px",
              fontWeight: "700",
              letterSpacing: "4px",
              textTransform: "uppercase",
              color: "#E8441A",
              marginBottom: "14px",
            }}
          >
            Live Tracking
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: "16px",
            }}
          >
            <h1
              style={{
                fontFamily: "'Playfair Display',serif",
                fontSize: "clamp(32px,4vw,52px)",
                fontWeight: "700",
                color: "#fff",
                lineHeight: "1.08",
              }}
            >
              Order{" "}
              <span style={{ color: "#E8441A", fontStyle: "italic" }}>
                #{order.id}
              </span>
            </h1>
            <span
              style={{
                fontFamily: "'DM Sans',sans-serif",
                fontSize: "11px",
                fontWeight: "700",
                letterSpacing: "1.5px",
                textTransform: "uppercase",
                padding: "7px 18px",
                borderRadius: "50px",
                background: st.bg,
                color: st.color,
              }}
            >
              {order.status}
            </span>
          </div>
          <div
            style={{
              fontSize: "13px",
              color: "rgba(255,255,255,0.35)",
              marginTop: "8px",
            }}
          >
            Placed{" "}
            {new Date(order.created_at).toLocaleString("en-US", {
              weekday: "short",
              year: "numeric",
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </div>
        </div>
      </div>

      {/* ── BODY ── */}
      <div
        style={{ maxWidth: "900px", margin: "0 auto", padding: "40px 60px" }}
      >
        {/* ── PROGRESS TRACKER ── */}
        <div className="tracking-card" style={{ animationDelay: "0.1s" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "32px",
              flexWrap: "wrap",
              gap: "12px",
            }}
          >
            <div
              style={{
                fontFamily: "'Playfair Display',serif",
                fontSize: "20px",
                fontWeight: "700",
                color: "#fff",
              }}
            >
              📍 Order Progress
            </div>
            {lastUpdate && (
              <span
                style={{
                  fontFamily: "'DM Sans',sans-serif",
                  fontSize: "12px",
                  color: "rgba(255,255,255,0.3)",
                }}
              >
                Updated {lastUpdate.toLocaleTimeString()}
              </span>
            )}
          </div>

          {/* Step Nodes */}
          {!isCancelled && (
            <div style={{ position: "relative", marginBottom: "28px" }}>
              {/* Connector line */}
              <div
                style={{
                  position: "absolute",
                  top: "22px",
                  left: "22px",
                  right: "22px",
                  height: "2px",
                  background: "rgba(255,255,255,0.06)",
                  zIndex: 1,
                }}
              />
              {/* Filled connector */}
              <div
                style={{
                  position: "absolute",
                  top: "22px",
                  left: "22px",
                  height: "2px",
                  zIndex: 1,
                  background:
                    "linear-gradient(90deg, #E8441A, rgba(232,68,26,0.4))",
                  width: `${currentStepIdx >= 0 ? Math.min((currentStepIdx / (STEPS.length - 1)) * 100, 100) : 0}%`,
                  transition: "width 0.6s ease",
                }}
              />

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  position: "relative",
                }}
              >
                {STEPS.map((step, i) => {
                  const nodeClass =
                    i < currentStepIdx
                      ? "done"
                      : i === currentStepIdx
                        ? "current"
                        : "pending";
                  return (
                    <div
                      key={step.key}
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: "10px",
                        flex: 1,
                      }}
                    >
                      <div className={`step-node ${nodeClass}`}>
                        {step.icon}
                      </div>
                      <div
                        style={{
                          fontFamily: "'DM Sans',sans-serif",
                          fontSize: "11px",
                          fontWeight: "600",
                          color:
                            i <= currentStepIdx
                              ? "rgba(255,255,255,0.85)"
                              : "rgba(255,255,255,0.25)",
                          textAlign: "center",
                        }}
                      >
                        {step.label}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Progress Bar */}
          <div
            style={{
              background: "rgba(255,255,255,0.05)",
              borderRadius: "8px",
              height: "8px",
              overflow: "hidden",
              marginBottom: "20px",
            }}
          >
            <div
              style={{
                height: "100%",
                width: `${order.tracking?.percent || 0}%`,
                background: isCancelled
                  ? "#ef4444"
                  : "linear-gradient(90deg, #E8441A, #ff6b3d)",
                borderRadius: "8px",
                transition: "width 0.6s ease-in-out",
              }}
            />
          </div>

          {/* Status Message */}
          <div
            style={{
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.06)",
              borderRadius: "14px",
              padding: "20px 24px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: "12px",
            }}
          >
            <div>
              <div
                style={{
                  fontFamily: "'Playfair Display',serif",
                  fontSize: "18px",
                  fontWeight: "700",
                  color: "#fff",
                  marginBottom: "4px",
                }}
              >
                {order.tracking?.icon} {order.tracking?.label}
              </div>
              <div
                style={{
                  fontFamily: "'DM Sans',sans-serif",
                  fontSize: "13px",
                  color: "rgba(255,255,255,0.35)",
                }}
              >
                {order.tracking?.percent}% complete
              </div>
            </div>
            {!isFinished && (
              <div className="live-indicator">
                <span className="live-dot" />
                <span
                  style={{
                    fontFamily: "'DM Sans',sans-serif",
                    fontSize: "12px",
                    fontWeight: "600",
                    color: "#34d399",
                  }}
                >
                  Live
                </span>
              </div>
            )}
          </div>
        </div>

        {/* ── ORDER ITEMS ── */}
        <div className="tracking-card" style={{ animationDelay: "0.2s" }}>
          <div
            style={{
              fontFamily: "'Playfair Display',serif",
              fontSize: "20px",
              fontWeight: "700",
              color: "#fff",
              marginBottom: "20px",
            }}
          >
            🍽️ Your Order
          </div>
          {order.items?.map((item, idx) => (
            <div key={idx} className="item-row">
              <div
                style={{ color: "rgba(255,255,255,0.75)", fontSize: "14px" }}
              >
                {item.name}{" "}
                <span style={{ color: "rgba(255,255,255,0.3)" }}>
                  ×{item.quantity}
                </span>
              </div>
              <span
                style={{
                  color: "#E8441A",
                  fontWeight: "600",
                  fontSize: "14px",
                }}
              >
                ${(item.price * item.quantity).toFixed(2)}
              </span>
            </div>
          ))}
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
            }}
          >
            <span
              style={{
                fontFamily: "'DM Sans',sans-serif",
                fontSize: "14px",
                color: "rgba(255,255,255,0.4)",
                fontWeight: "600",
                letterSpacing: "0.5px",
              }}
            >
              TOTAL
            </span>
            <span
              style={{
                fontFamily: "'Playfair Display',serif",
                fontSize: "22px",
                fontWeight: "700",
                color: "#E8441A",
              }}
            >
              ${order.total_amount}
            </span>
          </div>
        </div>

        {/* ── LIVE NOTICE (only for active orders) ── */}
        {!isFinished && (
          <div
            style={{
              background: "rgba(16,185,129,0.06)",
              border: "1px solid rgba(16,185,129,0.18)",
              borderRadius: "16px",
              padding: "20px 28px",
              display: "flex",
              alignItems: "center",
              gap: "16px",
              marginBottom: "20px",
              animation: "fadeSlideUp 0.5s ease 0.3s both",
            }}
          >
            <span
              className="live-dot"
              style={{
                width: "10px",
                height: "10px",
                borderRadius: "50%",
                background: "#10b981",
                animation: "live-pulse 2s ease-in-out infinite",
                display: "block",
                flexShrink: 0,
              }}
            />
            <p
              style={{
                fontFamily: "'DM Sans',sans-serif",
                fontSize: "14px",
                color: "#34d399",
                margin: 0,
                fontWeight: "500",
              }}
            >
              Live tracking active — updates will appear automatically when your
              order status changes.
            </p>
          </div>
        )}

        {/* ── ACTIONS ── */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            animation: "fadeSlideUp 0.5s ease 0.35s both",
          }}
        >
          <button
            onClick={() => navigate("/my-bookings")}
            style={{
              background: "#E8441A",
              color: "#fff",
              border: "none",
              padding: "13px 36px",
              borderRadius: "50px",
              cursor: "pointer",
              fontFamily: "'DM Sans',sans-serif",
              fontWeight: "700",
              fontSize: "14px",
              boxShadow: "0 4px 20px rgba(232,68,26,0.35)",
              transition: "transform 0.2s, box-shadow 0.2s",
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow =
                "0 8px 28px rgba(232,68,26,0.5)";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = "";
              e.currentTarget.style.boxShadow =
                "0 4px 20px rgba(232,68,26,0.35)";
            }}
          >
            ← Back to My Orders
          </button>
        </div>
      </div>
    </div>
  );
}

export default OrderTrackingPage;
