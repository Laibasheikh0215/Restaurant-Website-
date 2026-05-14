import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../../contexts/AuthContext";
import toast from "react-hot-toast";

// GLOBAL CSS IN JS
const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;1,700&family=DM+Sans:wght@400;500;600;700&display=swap');
  *, *::before, *::after { box-sizing: border-box; }

  @keyframes fadeSlideUp {
    from { opacity: 0; transform: translateY(28px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes fadeIn {
    from { opacity: 0; }
    to   { opacity: 1; }
  }
  @keyframes spin { to { transform: rotate(360deg); } }
  @keyframes pulse-dot {
    0%, 100% { opacity: 1; transform: scale(1); }
    50%       { opacity: 0.5; transform: scale(0.8); }
  }

  .bookings-page { animation: fadeIn 0.5s ease both; }
  .tab-btn {
    font-family: 'DM Sans', sans-serif;
    font-size: 13px;
    font-weight: 600;
    letter-spacing: 0.5px;
    padding: 10px 24px;
    border: 1.5px solid rgba(255,255,255,0.1);
    border-radius: 50px;
    cursor: pointer;
    transition: all 0.2s ease;
    background: transparent;
    color: rgba(255,255,255,0.5);
  }
  .tab-btn:hover { border-color: rgba(232,68,26,0.4); color: rgba(255,255,255,0.8); }
  .tab-btn.active {
    background: #E8441A;
    border-color: #E8441A;
    color: #fff;
    box-shadow: 0 4px 20px rgba(232,68,26,0.4);
  }

  .booking-card {
    background: #141414;
    border: 1px solid rgba(255,255,255,0.06);
    border-radius: 20px;
    padding: 28px 32px;
    margin-bottom: 20px;
    transition: border-color 0.2s, transform 0.2s;
    animation: fadeSlideUp 0.5s ease both;
  }
  .booking-card:hover {
    border-color: rgba(232,68,26,0.2);
    transform: translateY(-2px);
  }

  .track-btn {
    font-family: 'DM Sans', sans-serif;
    font-size: 13px;
    font-weight: 600;
    padding: 10px 22px;
    border-radius: 50px;
    border: none;
    cursor: pointer;
    background: #E8441A;
    color: #fff;
    transition: transform 0.2s, box-shadow 0.2s;
    box-shadow: 0 4px 16px rgba(232,68,26,0.3);
  }
  .track-btn:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(232,68,26,0.45); }

  .ghost-btn {
    font-family: 'DM Sans', sans-serif;
    font-size: 13px;
    font-weight: 600;
    padding: 10px 22px;
    border-radius: 50px;
    border: 1.5px solid rgba(255,255,255,0.15);
    cursor: pointer;
    background: transparent;
    color: rgba(255,255,255,0.7);
    transition: border-color 0.2s, color 0.2s;
  }
  .ghost-btn:hover { border-color: #E8441A; color: #fff; }

  .status-badge {
    font-family: 'DM Sans', sans-serif;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 1.5px;
    text-transform: uppercase;
    padding: 5px 14px;
    border-radius: 50px;
  }

  .empty-card {
    background: #141414;
    border: 1px dashed rgba(255,255,255,0.1);
    border-radius: 24px;
    padding: 72px 40px;
    text-align: center;
    animation: fadeSlideUp 0.5s ease both;
  }

  .item-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid rgba(255,255,255,0.05); }
  .item-row:last-child { border-bottom: none; }

  .divider { height: 1px; background: rgba(255,255,255,0.06); margin: 16px 0; }
`;

//STATUS HELPERS
const STATUS_COLORS = {
  pending: { bg: "rgba(245,158,11,0.15)", color: "#f59e0b" },
  confirmed: { bg: "rgba(59,130,246,0.15)", color: "#60a5fa" },
  preparing: { bg: "rgba(139,92,246,0.15)", color: "#a78bfa" },
  ready: { bg: "rgba(16,185,129,0.15)", color: "#34d399" },
  completed: { bg: "rgba(16,185,129,0.15)", color: "#34d399" },
  cancelled: { bg: "rgba(239,68,68,0.15)", color: "#f87171" },
};
const statusStyle = (status) =>
  STATUS_COLORS[status] || {
    bg: "rgba(255,255,255,0.08)",
    color: "rgba(255,255,255,0.5)",
  };

// TABS CONFIG
const TABS = [
  { key: "orders", icon: "🍽️", label: "Food Orders" },
  { key: "tables", icon: "🪑", label: "Table Bookings" },
  { key: "events", icon: "🎉", label: "Event Bookings" },
];

// COMPONENT
function MyBookingsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [tableBookings, setTableBookings] = useState([]);
  const [eventBookings, setEventBookings] = useState([]);
  const [activeTab, setActiveTab] = useState("orders");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    /* inject CSS */
    if (!document.getElementById("bookings-css")) {
      const s = document.createElement("style");
      s.id = "bookings-css";
      s.textContent = GLOBAL_CSS;
      document.head.appendChild(s);
    }
    return () => {
      const el = document.getElementById("bookings-css");
      if (el) el.remove();
    };
  }, []);

  useEffect(() => {
    fetchAllData();
  }, []);

  /* ── original fetch logic (unchanged) ── */
  const fetchAllData = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      };
      const ordersResponse = await axios.get(
        "http://localhost:5000/api/orders/my-orders",
        config,
      );
      setOrders(ordersResponse.data || []);
      const tableResponse = await axios.get(
        "http://localhost:5000/api/table-bookings/my-bookings",
        config,
      );
      setTableBookings(tableResponse.data || []);
      const eventResponse = await axios.get(
        "http://localhost:5000/api/event-bookings/my-bookings",
        config,
      );
      setEventBookings(eventResponse.data || []);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to load bookings");
    } finally {
      setLoading(false);
    }
  };

  /* ── counts per tab ── */
  const counts = {
    orders: orders.length,
    tables: tableBookings.length,
    events: eventBookings.length,
  };

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
            Loading your bookings…
          </p>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div
      className="bookings-page"
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
          padding: "80px 60px 60px",
          position: "relative",
          overflow: "hidden",
          borderBottom: "1px solid rgba(255,255,255,0.05)",
        }}
      >
        {/* glow orb */}
        <div
          style={{
            position: "absolute",
            top: "-60px",
            right: "10%",
            width: "360px",
            height: "360px",
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(232,68,26,0.12) 0%, transparent 70%)",
            pointerEvents: "none",
          }}
        />
        <div
          style={{ maxWidth: "1100px", margin: "0 auto", position: "relative" }}
        >
          <div
            style={{
              fontSize: "12px",
              fontWeight: "700",
              letterSpacing: "4px",
              textTransform: "uppercase",
              color: "#E8441A",
              marginBottom: "14px",
              fontFamily: "'DM Sans',sans-serif",
            }}
          >
            Your Account
          </div>
          <h1
            style={{
              fontFamily: "'Playfair Display',serif",
              fontSize: "clamp(36px,4vw,56px)",
              fontWeight: "700",
              color: "#fff",
              lineHeight: "1.08",
              marginBottom: "12px",
            }}
          >
            My{" "}
            <span style={{ color: "#E8441A", fontStyle: "italic" }}>
              Bookings
            </span>
          </h1>
          <p
            style={{
              fontFamily: "'DM Sans',sans-serif",
              fontSize: "15px",
              color: "rgba(255,255,255,0.45)",
              maxWidth: "420px",
              lineHeight: "1.7",
            }}
          >
            Track your orders, reservations, and event bookings all in one
            place.
          </p>
        </div>
      </div>

      {/* ── BODY ── */}
      <div
        style={{ maxWidth: "1100px", margin: "0 auto", padding: "48px 60px" }}
      >
        {/* TABS */}
        <div
          style={{
            display: "flex",
            gap: "12px",
            marginBottom: "40px",
            flexWrap: "wrap",
          }}
        >
          {TABS.map((tab) => (
            <button
              key={tab.key}
              className={`tab-btn${activeTab === tab.key ? " active" : ""}`}
              onClick={() => setActiveTab(tab.key)}
            >
              {tab.icon}&nbsp; {tab.label}{" "}
              <span style={{ marginLeft: "6px", opacity: 0.7 }}>
                ({counts[tab.key]})
              </span>
            </button>
          ))}
        </div>

        {/* ── FOOD ORDERS ── */}
        {activeTab === "orders" && (
          <>
            {orders.length === 0 ? (
              <EmptyState
                icon="🍽️"
                title="No Orders Yet"
                desc="You haven't placed any food orders yet."
                btnLabel="Browse Menu"
                onAction={() => navigate("/menu")}
              />
            ) : (
              orders.map((order, i) => {
                const st = statusStyle(order.status);
                return (
                  <div
                    key={order.id || i}
                    className="booking-card"
                    style={{ animationDelay: `${i * 0.06}s` }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        flexWrap: "wrap",
                        gap: "12px",
                        marginBottom: "20px",
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
                          Order #{order.id}
                        </div>
                        <div
                          style={{
                            fontSize: "13px",
                            color: "rgba(255,255,255,0.35)",
                          }}
                        >
                          {order.created_at
                            ? new Date(order.created_at).toLocaleDateString(
                                "en-US",
                                {
                                  weekday: "short",
                                  year: "numeric",
                                  month: "short",
                                  day: "numeric",
                                },
                              )
                            : "Date not available"}
                        </div>
                      </div>
                      <span
                        className="status-badge"
                        style={{ background: st.bg, color: st.color }}
                      >
                        {order.status || "pending"}
                      </span>
                    </div>

                    <div className="divider" />

                    <div style={{ marginBottom: "20px" }}>
                      {order.items && order.items.length > 0 ? (
                        order.items.map((item, idx) => (
                          <div key={idx} className="item-row">
                            <span
                              style={{
                                color: "rgba(255,255,255,0.75)",
                                fontSize: "14px",
                              }}
                            >
                              {item.name}{" "}
                              <span style={{ color: "rgba(255,255,255,0.3)" }}>
                                ×{item.quantity}
                              </span>
                            </span>
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
                        ))
                      ) : (
                        <p
                          style={{
                            color: "rgba(255,255,255,0.25)",
                            fontSize: "13px",
                            textAlign: "center",
                            padding: "12px 0",
                          }}
                        >
                          No items found
                        </p>
                      )}
                    </div>

                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
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
                        Total &nbsp;
                        <span style={{ color: "#E8441A" }}>
                          ${order.total_amount}
                        </span>
                      </div>
                      <button
                        className="track-btn"
                        onClick={() => navigate(`/track-order/${order.id}`)}
                      >
                        📍 Track Order
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </>
        )}

        {/* ── TABLE BOOKINGS ── */}
        {activeTab === "tables" && (
          <>
            {tableBookings.length === 0 ? (
              <EmptyState
                icon="🪑"
                title="No Table Bookings"
                desc="You haven't reserved any tables yet."
                btnLabel="Reserve a Table"
                onAction={() => navigate("/table-booking")}
              />
            ) : (
              tableBookings.map((booking, i) => {
                const st = statusStyle(booking.status);
                return (
                  <div
                    key={booking.id}
                    className="booking-card"
                    style={{ animationDelay: `${i * 0.06}s` }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        flexWrap: "wrap",
                        gap: "12px",
                        marginBottom: "20px",
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
                          Reservation #{booking.id}
                        </div>
                        <div
                          style={{
                            fontSize: "13px",
                            color: "rgba(255,255,255,0.35)",
                          }}
                        >
                          Table for {booking.party_size}
                        </div>
                      </div>
                      <span
                        className="status-badge"
                        style={{ background: st.bg, color: st.color }}
                      >
                        {booking.status}
                      </span>
                    </div>
                    <div className="divider" />
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns:
                          "repeat(auto-fit,minmax(160px,1fr))",
                        gap: "16px",
                        marginBottom: "20px",
                      }}
                    >
                      <InfoPill
                        icon="📅"
                        label="Date"
                        value={booking.booking_date}
                      />
                      <InfoPill
                        icon="🕐"
                        label="Time"
                        value={booking.booking_time}
                      />
                      <InfoPill
                        icon="👥"
                        label="Guests"
                        value={booking.party_size}
                      />
                    </div>
                    <div
                      style={{ display: "flex", justifyContent: "flex-end" }}
                    >
                      <button
                        className="ghost-btn"
                        onClick={() => navigate("/table-booking")}
                      >
                        Modify Booking
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </>
        )}

        {/* ── EVENT BOOKINGS ── */}
        {activeTab === "events" && (
          <>
            {eventBookings.length === 0 ? (
              <EmptyState
                icon="🎉"
                title="No Event Bookings"
                desc="You haven't booked any events yet."
                btnLabel="Book an Event"
                onAction={() => navigate("/event-booking")}
              />
            ) : (
              eventBookings.map((booking, i) => (
                <div
                  key={booking.id}
                  className="booking-card"
                  style={{ animationDelay: `${i * 0.06}s` }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      flexWrap: "wrap",
                      gap: "12px",
                      marginBottom: "20px",
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
                        {booking.event_name ||
                          booking.location_name ||
                          `Event #${booking.id}`}
                      </div>
                      <div
                        style={{
                          fontSize: "13px",
                          color: "rgba(255,255,255,0.35)",
                        }}
                      >
                        {booking.booking_date}
                      </div>
                    </div>
                    <div
                      style={{
                        fontFamily: "'Playfair Display',serif",
                        fontSize: "20px",
                        fontWeight: "700",
                        color: "#E8441A",
                      }}
                    >
                      ${booking.total_amount}
                    </div>
                  </div>
                  <div className="divider" />
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))",
                      gap: "16px",
                    }}
                  >
                    <InfoPill
                      icon="📅"
                      label="Date"
                      value={booking.booking_date}
                    />
                    <InfoPill
                      icon="👥"
                      label="Guests"
                      value={booking.number_of_guests}
                    />
                  </div>
                </div>
              ))
            )}
          </>
        )}
      </div>
    </div>
  );
}

/* ─── SUB-COMPONENTS ─────────────────────────────────────────────────────── */
function EmptyState({ icon, title, desc, btnLabel, onAction }) {
  return (
    <div className="empty-card">
      <div style={{ fontSize: "56px", marginBottom: "20px" }}>{icon}</div>
      <h3
        style={{
          fontFamily: "'Playfair Display',serif",
          fontSize: "22px",
          color: "#fff",
          marginBottom: "10px",
        }}
      >
        {title}
      </h3>
      <p
        style={{
          fontFamily: "'DM Sans',sans-serif",
          fontSize: "14px",
          color: "rgba(255,255,255,0.35)",
          marginBottom: "28px",
          lineHeight: "1.6",
        }}
      >
        {desc}
      </p>
      <button className="track-btn" onClick={onAction}>
        {btnLabel}
      </button>
    </div>
  );
}

function InfoPill({ icon, label, value }) {
  return (
    <div
      style={{
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(255,255,255,0.07)",
        borderRadius: "12px",
        padding: "14px 18px",
      }}
    >
      <div
        style={{
          fontSize: "11px",
          fontWeight: "600",
          letterSpacing: "1.5px",
          textTransform: "uppercase",
          color: "rgba(255,255,255,0.3)",
          marginBottom: "6px",
        }}
      >
        {icon} {label}
      </div>
      <div style={{ fontSize: "15px", fontWeight: "600", color: "#fff" }}>
        {value}
      </div>
    </div>
  );
}

export default MyBookingsPage;
