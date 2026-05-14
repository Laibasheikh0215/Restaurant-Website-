import React, { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";

// GLOBAL CSS
const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;1,700&family=DM+Sans:wght@400;500;600;700&display=swap');
  *, *::before, *::after { box-sizing: border-box; }

  @keyframes fadeSlideUp {
    from { opacity: 0; transform: translateY(24px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
  @keyframes spin { to { transform: rotate(360deg); } }

  .admin-bookings-page { animation: fadeIn 0.4s ease both; font-family: 'DM Sans', sans-serif; }

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

  .data-table { width: 100%; border-collapse: collapse; }
  .data-table th {
    font-family: 'DM Sans', sans-serif;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 1.5px;
    text-transform: uppercase;
    color: rgba(255,255,255,0.3);
    padding: 14px 18px;
    text-align: left;
    border-bottom: 1px solid rgba(255,255,255,0.06);
  }
  .data-table td {
    font-family: 'DM Sans', sans-serif;
    font-size: 14px;
    color: rgba(255,255,255,0.7);
    padding: 16px 18px;
    border-bottom: 1px solid rgba(255,255,255,0.04);
    transition: background 0.15s;
  }
  .data-table tr:hover td { background: rgba(255,255,255,0.02); }
  .data-table tr:last-child td { border-bottom: none; }

  .status-badge {
    font-family: 'DM Sans', sans-serif;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 1px;
    text-transform: uppercase;
    padding: 4px 12px;
    border-radius: 50px;
    display: inline-block;
  }

  .status-select {
    font-family: 'DM Sans', sans-serif;
    font-size: 12px;
    font-weight: 600;
    padding: 7px 12px;
    border-radius: 8px;
    border: 1px solid rgba(255,255,255,0.1);
    background: rgba(255,255,255,0.05);
    color: #fff;
    cursor: pointer;
    outline: none;
    transition: border-color 0.2s;
  }
  .status-select:focus { border-color: #E8441A; }
  .status-select option { background: #1a1a1a; color: #fff; }

  .empty-state {
    text-align: center;
    padding: 64px 40px;
    color: rgba(255,255,255,0.3);
    font-family: 'DM Sans', sans-serif;
    font-size: 14px;
  }

  .table-container {
    background: #141414;
    border: 1px solid rgba(255,255,255,0.06);
    border-radius: 20px;
    overflow: hidden;
    animation: fadeSlideUp 0.5s ease both;
    overflow-x: auto;
  }
`;

//STATUS HELPERS
const STATUS_STYLES = {
  pending: { bg: "rgba(245,158,11,0.12)", color: "#f59e0b" },
  confirmed: { bg: "rgba(59,130,246,0.12)", color: "#60a5fa" },
  preparing: { bg: "rgba(139,92,246,0.12)", color: "#a78bfa" },
  ready: { bg: "rgba(16,185,129,0.12)", color: "#34d399" },
  completed: { bg: "rgba(16,185,129,0.12)", color: "#34d399" },
  cancelled: { bg: "rgba(239,68,68,0.12)", color: "#f87171" },
};
const badgeStyle = (status) =>
  STATUS_STYLES[status] || {
    bg: "rgba(255,255,255,0.08)",
    color: "rgba(255,255,255,0.5)",
  };

//TABS CONFIG
const TABS = [
  { key: "table", icon: "🪑", label: "Table Bookings" },
  { key: "event", icon: "🎉", label: "Event Bookings" },
  { key: "order", icon: "🍽️", label: "Food Orders" },
];

//MAIN COMPONENT
function AdminBookings() {
  const [activeTab, setActiveTab] = useState("table");
  const [tableBookings, setTableBookings] = useState([]);
  const [eventBookings, setEventBookings] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!document.getElementById("admin-bookings-css")) {
      const s = document.createElement("style");
      s.id = "admin-bookings-css";
      s.textContent = GLOBAL_CSS;
      document.head.appendChild(s);
    }
    return () => {
      const el = document.getElementById("admin-bookings-css");
      if (el) el.remove();
    };
  }, []);

  useEffect(() => {
    fetchAllBookings();
  }, []);

  //original fetch logic
  const fetchAllBookings = async () => {
    try {
      const [tableRes, eventRes, orderRes] = await Promise.all([
        axios.get("http://localhost:5000/api/admin/table-bookings"),
        axios.get("http://localhost:5000/api/admin/event-bookings"),
        axios.get("http://localhost:5000/api/admin/orders"),
      ]);
      setTableBookings(tableRes.data);
      setEventBookings(eventRes.data);
      setOrders(orderRes.data);
    } catch (error) {
      console.error("Error fetching bookings:", error);
    } finally {
      setLoading(false);
    }
  };

  // original updateStatus logic
  const updateStatus = async (type, id, status) => {
    console.log(`Updating ${type} ${id} to ${status}`);
    try {
      let url = "";
      if (type === "orders")
        url = `http://localhost:5000/api/admin/orders/${id}/status`;
      else if (type === "table-bookings")
        url = `http://localhost:5000/api/admin/table-bookings/${id}/status`;
      else if (type === "event-bookings")
        url = `http://localhost:5000/api/admin/event-bookings/${id}/status`;

      console.log("Sending request to:", url);
      const response = await axios.put(
        url,
        { status },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json",
          },
        },
      );
      console.log("Response:", response.data);
      if (response.data.success) {
        toast.success(`Status updated to ${status}!`);
        fetchAllBookings();
      } else {
        toast.error("Failed to update status");
      }
    } catch (error) {
      console.error("Update error:", error);
      toast.error(error.response?.data?.error || "Failed to update status");
    }
  };

  const counts = {
    table: tableBookings.length,
    event: eventBookings.length,
    order: orders.length,
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
            Loading bookings…
          </p>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div
      className="admin-bookings-page"
      style={{ minHeight: "100vh", background: "#0a0a0a" }}
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
          style={{ maxWidth: "1200px", margin: "0 auto", position: "relative" }}
        >
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
            Admin Panel
          </div>
          <h1
            style={{
              fontFamily: "'Playfair Display',serif",
              fontSize: "clamp(36px,4vw,54px)",
              fontWeight: "700",
              color: "#fff",
              lineHeight: "1.08",
              marginBottom: "12px",
            }}
          >
            All{" "}
            <span style={{ color: "#E8441A", fontStyle: "italic" }}>
              Bookings
            </span>
          </h1>
          <p
            style={{
              fontSize: "15px",
              color: "rgba(255,255,255,0.4)",
              maxWidth: "420px",
              lineHeight: "1.7",
            }}
          >
            Manage table reservations, event bookings, and food orders from one
            place.
          </p>
        </div>
      </div>

      {/*BODY */}
      <div
        style={{ maxWidth: "1200px", margin: "0 auto", padding: "48px 60px" }}
      >
        {/* TABS */}
        <div
          style={{
            display: "flex",
            gap: "12px",
            marginBottom: "36px",
            flexWrap: "wrap",
          }}
        >
          {TABS.map((tab) => (
            <button
              key={tab.key}
              className={`tab-btn${activeTab === tab.key ? " active" : ""}`}
              onClick={() => setActiveTab(tab.key)}
            >
              {tab.icon}&nbsp; {tab.label}
              <span style={{ marginLeft: "8px", opacity: 0.7 }}>
                ({counts[tab.key]})
              </span>
            </button>
          ))}
        </div>

        {/* TABLE BOOKINGS */}
        {activeTab === "table" && (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Customer</th>
                  <th>Date &amp; Time</th>
                  <th>Party Size</th>
                  <th>Status</th>
                  <th>Update</th>
                </tr>
              </thead>
              <tbody>
                {tableBookings.map((booking) => {
                  const bs = badgeStyle(booking.status);
                  return (
                    <tr key={booking.id}>
                      <td style={{ color: "#E8441A", fontWeight: "700" }}>
                        #{booking.id}
                      </td>
                      <td style={{ color: "#fff", fontWeight: "600" }}>
                        {booking.full_name}
                      </td>
                      <td>
                        <span style={{ color: "rgba(255,255,255,0.8)" }}>
                          {booking.booking_date}
                        </span>
                        <span
                          style={{
                            color: "rgba(255,255,255,0.3)",
                            margin: "0 6px",
                          }}
                        >
                          ·
                        </span>
                        <span style={{ color: "rgba(255,255,255,0.5)" }}>
                          {booking.booking_time}
                        </span>
                      </td>
                      <td>
                        <span
                          style={{
                            background: "rgba(255,255,255,0.05)",
                            borderRadius: "6px",
                            padding: "4px 10px",
                            fontSize: "13px",
                          }}
                        >
                          👥 {booking.party_size}
                        </span>
                      </td>
                      <td>
                        <span
                          className="status-badge"
                          style={{ background: bs.bg, color: bs.color }}
                        >
                          {booking.status}
                        </span>
                      </td>
                      <td>
                        <select
                          className="status-select"
                          value={booking.status}
                          onChange={(e) =>
                            updateStatus(
                              "table-bookings",
                              booking.id,
                              e.target.value,
                            )
                          }
                        >
                          <option value="pending">Pending</option>
                          <option value="confirmed">Confirm</option>
                          <option value="cancelled">Cancel</option>
                        </select>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {tableBookings.length === 0 && (
              <div className="empty-state">🪑 No table bookings found</div>
            )}
          </div>
        )}

        {/* ── EVENT BOOKINGS ── */}
        {activeTab === "event" && (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Customer</th>
                  <th>Event</th>
                  <th>Date</th>
                  <th>Guests</th>
                  <th>Total</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {eventBookings.map((booking) => {
                  const bs = badgeStyle(booking.status);
                  return (
                    <tr key={booking.id}>
                      <td style={{ color: "#E8441A", fontWeight: "700" }}>
                        #{booking.id}
                      </td>
                      <td style={{ color: "#fff", fontWeight: "600" }}>
                        {booking.full_name}
                      </td>
                      <td>{booking.event_name || booking.location_name}</td>
                      <td>{booking.booking_date}</td>
                      <td>
                        <span
                          style={{
                            background: "rgba(255,255,255,0.05)",
                            borderRadius: "6px",
                            padding: "4px 10px",
                            fontSize: "13px",
                          }}
                        >
                          👥 {booking.number_of_guests}
                        </span>
                      </td>
                      <td style={{ color: "#E8441A", fontWeight: "700" }}>
                        ${booking.total_amount}
                      </td>
                      <td>
                        <span
                          className="status-badge"
                          style={{ background: bs.bg, color: bs.color }}
                        >
                          {booking.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {eventBookings.length === 0 && (
              <div className="empty-state">🎉 No event bookings found</div>
            )}
          </div>
        )}

        {/* ── FOOD ORDERS ── */}
        {activeTab === "order" && (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Total</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Update</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => {
                  const bs = badgeStyle(order.status);
                  return (
                    <tr key={order.id}>
                      <td style={{ color: "#E8441A", fontWeight: "700" }}>
                        #{order.id}
                      </td>
                      <td style={{ color: "#fff", fontWeight: "600" }}>
                        {order.full_name}
                      </td>
                      <td style={{ color: "#E8441A", fontWeight: "700" }}>
                        ${order.total_amount}
                      </td>
                      <td>
                        {new Date(order.created_at).toLocaleDateString(
                          "en-US",
                          { year: "numeric", month: "short", day: "numeric" },
                        )}
                      </td>
                      <td>
                        <span
                          className="status-badge"
                          style={{ background: bs.bg, color: bs.color }}
                        >
                          {order.status}
                        </span>
                      </td>
                      <td>
                        <select
                          className="status-select"
                          value={order.status}
                          onChange={(e) =>
                            updateStatus("orders", order.id, e.target.value)
                          }
                        >
                          <option value="pending">Pending</option>
                          <option value="confirmed">Confirm</option>
                          <option value="preparing">Preparing</option>
                          <option value="completed">Complete</option>
                          <option value="cancelled">Cancel</option>
                        </select>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {orders.length === 0 && (
              <div className="empty-state">🍽️ No orders found</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminBookings;
