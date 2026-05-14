import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../../contexts/AuthContext";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

// GLOBAL CSS IN JS
const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;1,700&family=DM+Sans:wght@400;500;600;700&display=swap');
  *, *::before, *::after { box-sizing: border-box; }

  @keyframes fadeSlideUp {
    from { opacity: 0; transform: translateY(24px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
  @keyframes spin { to { transform: rotate(360deg); } }
  @keyframes countUp {
    from { opacity: 0; transform: translateY(12px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  .admin-dash { animation: fadeIn 0.4s ease both; font-family: 'DM Sans', sans-serif; }

  .stat-card {
    background: #141414;
    border: 1px solid rgba(255,255,255,0.06);
    border-radius: 20px;
    padding: 28px 28px 24px;
    transition: border-color 0.2s, transform 0.2s;
    animation: fadeSlideUp 0.5s ease both;
    cursor: default;
  }
  .stat-card:hover {
    border-color: rgba(232,68,26,0.25);
    transform: translateY(-3px);
  }

  .quick-action {
    display: flex;
    align-items: center;
    gap: 12px;
    background: #141414;
    border: 1px solid rgba(255,255,255,0.06);
    border-radius: 14px;
    padding: 18px 22px;
    text-decoration: none;
    font-family: 'DM Sans', sans-serif;
    font-size: 14px;
    font-weight: 600;
    color: rgba(255,255,255,0.7);
    transition: all 0.2s;
    animation: fadeSlideUp 0.5s ease both;
  }
  .quick-action:hover {
    border-color: rgba(232,68,26,0.3);
    background: rgba(232,68,26,0.06);
    color: #fff;
    transform: translateY(-2px);
  }

  .chart-card {
    background: #141414;
    border: 1px solid rgba(255,255,255,0.06);
    border-radius: 20px;
    padding: 28px;
    animation: fadeSlideUp 0.5s ease both;
  }

  .summary-band {
    background: linear-gradient(135deg, #1a0a04 0%, #141414 100%);
    border: 1px solid rgba(232,68,26,0.15);
    border-radius: 20px;
    padding: 32px 40px;
    animation: fadeSlideUp 0.5s ease 0.4s both;
  }

  .section-tag {
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 4px;
    text-transform: uppercase;
    color: #E8441A;
    margin-bottom: 8px;
  }
`;

// CHART OPTIONS
const makeChartOptions = () => ({
  responsive: true,
  maintainAspectRatio: true,
  plugins: {
    legend: {
      position: "bottom",
      labels: {
        font: { size: 12, family: "'DM Sans', sans-serif" },
        color: "rgba(255,255,255,0.5)",
        padding: 16,
        usePointStyle: true,
        pointStyleWidth: 8,
      },
    },
    tooltip: {
      backgroundColor: "#1a1a1a",
      borderColor: "rgba(255,255,255,0.08)",
      borderWidth: 1,
      titleColor: "#fff",
      bodyColor: "rgba(255,255,255,0.6)",
      titleFont: { family: "'DM Sans', sans-serif", size: 13, weight: "700" },
      bodyFont: { family: "'DM Sans', sans-serif", size: 12 },
      callbacks: {
        label(context) {
          const value = context.raw || 0;
          const total = context.dataset.data.reduce((a, b) => a + b, 0);
          const pct = ((value / total) * 100).toFixed(1);
          return `  ${context.label}: ${value} (${pct}%)`;
        },
      },
    },
  },
});

// STAT CARD COMPONENT
function StatCard({ icon, title, value, accentColor, delay }) {
  return (
    <div className="stat-card" style={{ animationDelay: delay }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
        }}
      >
        <div>
          <div
            style={{
              fontSize: "12px",
              fontWeight: "700",
              letterSpacing: "2px",
              textTransform: "uppercase",
              color: "rgba(255,255,255,0.3)",
              marginBottom: "14px",
            }}
          >
            {title}
          </div>
          <div
            style={{
              fontFamily: "'Playfair Display',serif",
              fontSize: "42px",
              fontWeight: "700",
              color: "#fff",
              lineHeight: 1,
              animation: "countUp 0.6s ease both",
            }}
          >
            {value}
          </div>
        </div>
        <div
          style={{
            width: "52px",
            height: "52px",
            borderRadius: "14px",
            background: `${accentColor}18`,
            border: `1px solid ${accentColor}30`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "22px",
          }}
        >
          {icon}
        </div>
      </div>
      <div
        style={{
          marginTop: "20px",
          height: "3px",
          borderRadius: "2px",
          background: `linear-gradient(90deg, ${accentColor}, transparent)`,
        }}
      />
    </div>
  );
}

//CHART CARD COMPONENT
function ChartCard({
  icon,
  title,
  chartData,
  footerLabel,
  footerValue,
  delay,
}) {
  const options = makeChartOptions();
  return (
    <div className="chart-card" style={{ animationDelay: delay }}>
      <div style={{ marginBottom: "22px" }}>
        <div
          style={{
            fontSize: "11px",
            fontWeight: "700",
            letterSpacing: "3px",
            textTransform: "uppercase",
            color: "#E8441A",
            marginBottom: "6px",
          }}
        >
          Analytics
        </div>
        <div
          style={{
            fontFamily: "'Playfair Display',serif",
            fontSize: "18px",
            fontWeight: "700",
            color: "#fff",
          }}
        >
          {icon} {title}
        </div>
      </div>
      {chartData.datasets[0]?.data?.length > 0 ? (
        <div
          style={{
            maxHeight: "280px",
            display: "flex",
            justifyContent: "center",
          }}
        >
          <Pie data={chartData} options={options} />
        </div>
      ) : (
        <div
          style={{
            textAlign: "center",
            padding: "60px 0",
            color: "rgba(255,255,255,0.2)",
            fontSize: "14px",
          }}
        >
          No data available yet
        </div>
      )}
      <div
        style={{
          marginTop: "18px",
          paddingTop: "16px",
          borderTop: "1px solid rgba(255,255,255,0.06)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <span
          style={{
            fontSize: "12px",
            color: "rgba(255,255,255,0.3)",
            fontWeight: "600",
            letterSpacing: "0.5px",
          }}
        >
          {footerLabel}
        </span>
        <span
          style={{
            fontFamily: "'Playfair Display',serif",
            fontSize: "18px",
            fontWeight: "700",
            color: "#E8441A",
          }}
        >
          {footerValue}
        </span>
      </div>
    </div>
  );
}

/* ─── MAIN COMPONENT ─────────────────────────────────────────────────────── */
function AdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    total_orders: 0,
    total_users: 0,
    total_table_bookings: 0,
    total_event_bookings: 0,
  });
  const [chartData, setChartData] = useState({
    food_orders: [],
    table_bookings: [],
    event_bookings: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!document.getElementById("admin-dash-css")) {
      const s = document.createElement("style");
      s.id = "admin-dash-css";
      s.textContent = GLOBAL_CSS;
      document.head.appendChild(s);
    }
    return () => {
      const el = document.getElementById("admin-dash-css");
      if (el) el.remove();
    };
  }, []);

  useEffect(() => {
    fetchDashboardData();
    fetchChartData();
  }, []);

  /* ── original fetch logic (unchanged) ── */
  const fetchDashboardData = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/admin/stats");
      setStats(response.data.stats);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    }
  };

  const fetchChartData = async () => {
    try {
      const response = await axios.get(
        "http://localhost:5000/api/admin/chart-data",
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        },
      );
      setChartData(response.data);
    } catch (error) {
      console.error("Error fetching chart data:", error);
    } finally {
      setLoading(false);
    }
  };

  /* ── chart data objects (original logic unchanged) ── */
  const CHART_COLORS = [
    "#E8441A",
    "#60a5fa",
    "#f59e0b",
    "#34d399",
    "#a78bfa",
    "#f87171",
    "#fb923c",
    "#4ade80",
  ];

  const foodOrdersChartData = {
    labels: chartData.food_orders.map((item) => item.category || "Other"),
    datasets: [
      {
        label: "Number of Orders",
        data: chartData.food_orders.map((item) => parseInt(item.order_count)),
        backgroundColor: CHART_COLORS,
        borderColor: "#141414",
        borderWidth: 3,
      },
    ],
  };

  const tableBookingsChartData = {
    labels: chartData.table_bookings.map((item) => item.table_type),
    datasets: [
      {
        label: "Number of Bookings",
        data: chartData.table_bookings.map((item) =>
          parseInt(item.booking_count),
        ),
        backgroundColor: CHART_COLORS,
        borderColor: "#141414",
        borderWidth: 3,
      },
    ],
  };

  const eventBookingsChartData = {
    labels: chartData.event_bookings.map((item) => item.location_name),
    datasets: [
      {
        label: "Number of Bookings",
        data: chartData.event_bookings.map((item) =>
          parseInt(item.booking_count),
        ),
        backgroundColor: CHART_COLORS,
        borderColor: "#141414",
        borderWidth: 3,
      },
    ],
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
            Loading dashboard…
          </p>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  const STATS_CARDS = [
    {
      icon: "📦",
      title: "Total Orders",
      value: stats.total_orders,
      accentColor: "#60a5fa",
      delay: "0.05s",
    },
    {
      icon: "👥",
      title: "Total Users",
      value: stats.total_users,
      accentColor: "#34d399",
      delay: "0.10s",
    },
    {
      icon: "🪑",
      title: "Table Bookings",
      value: stats.total_table_bookings,
      accentColor: "#f59e0b",
      delay: "0.15s",
    },
    {
      icon: "🎉",
      title: "Event Bookings",
      value: stats.total_event_bookings,
      accentColor: "#E8441A",
      delay: "0.20s",
    },
  ];

  const QUICK_ACTIONS = [
    { href: "/admin/menu", icon: "🍕", label: "Manage Menu" },
    { href: "/admin/locations", icon: "📍", label: "Manage Locations" },
    { href: "/admin/bookings", icon: "📅", label: "View All Bookings" },
  ];

  return (
    <div
      className="admin-dash"
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
            right: "8%",
            width: "400px",
            height: "400px",
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(232,68,26,0.12) 0%, transparent 70%)",
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "-40px",
            left: "5%",
            width: "240px",
            height: "240px",
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(232,68,26,0.06) 0%, transparent 70%)",
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
            Welcome back,{" "}
            <span style={{ color: "#E8441A", fontStyle: "italic" }}>
              {user?.full_name?.split(" ")[0] || "Admin"}
            </span>
          </h1>
          <p
            style={{
              fontSize: "15px",
              color: "rgba(255,255,255,0.4)",
              maxWidth: "440px",
              lineHeight: "1.7",
            }}
          >
            Here's a full overview of Epicure Hall's operations today.
          </p>
        </div>
      </div>

      {/* ── BODY ── */}
      <div
        style={{ maxWidth: "1200px", margin: "0 auto", padding: "48px 60px" }}
      >
        {/* STATS GRID */}
        <div style={{ marginBottom: "16px" }}>
          <div className="section-tag">Overview</div>
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit,minmax(230px,1fr))",
            gap: "20px",
            marginBottom: "48px",
          }}
        >
          {STATS_CARDS.map((card) => (
            <StatCard key={card.title} {...card} />
          ))}
        </div>

        {/* QUICK ACTIONS */}
        <div style={{ marginBottom: "16px" }}>
          <div className="section-tag">Quick Actions</div>
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))",
            gap: "14px",
            marginBottom: "48px",
          }}
        >
          {QUICK_ACTIONS.map((action, i) => (
            <a
              key={action.href}
              href={action.href}
              className="quick-action"
              style={{ animationDelay: `${i * 0.07}s` }}
            >
              <span style={{ fontSize: "20px" }}>{action.icon}</span>
              {action.label}
            </a>
          ))}
        </div>

        {/* CHARTS */}
        <div style={{ marginBottom: "16px" }}>
          <div className="section-tag">Analytics</div>
          <h2
            style={{
              fontFamily: "'Playfair Display',serif",
              fontSize: "clamp(24px,3vw,34px)",
              fontWeight: "700",
              color: "#fff",
              marginBottom: "0",
            }}
          >
            Performance{" "}
            <span style={{ color: "#E8441A", fontStyle: "italic" }}>
              Dashboard
            </span>
          </h2>
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit,minmax(320px,1fr))",
            gap: "24px",
            marginBottom: "40px",
          }}
        >
          <ChartCard
            icon="🍕"
            title="Food Orders by Category"
            chartData={foodOrdersChartData}
            footerLabel="Total Items Sold"
            footerValue={chartData.food_orders.reduce(
              (sum, item) => sum + parseInt(item.total_items || 0),
              0,
            )}
            delay="0.1s"
          />
          <ChartCard
            icon="🪑"
            title="Table Bookings by Size"
            chartData={tableBookingsChartData}
            footerLabel="Total Bookings"
            footerValue={chartData.table_bookings.reduce(
              (sum, item) => sum + parseInt(item.booking_count),
              0,
            )}
            delay="0.18s"
          />
          <ChartCard
            icon="🎉"
            title="Event Bookings by Location"
            chartData={eventBookingsChartData}
            footerLabel="Total Guests"
            footerValue={chartData.event_bookings.reduce(
              (sum, item) => sum + parseInt(item.total_guests || 0),
              0,
            )}
            delay="0.26s"
          />
        </div>

        {/* SUMMARY BAND */}
        <div className="summary-band">
          <div style={{ marginBottom: "24px" }}>
            <div className="section-tag">Summary</div>
            <div
              style={{
                fontFamily: "'Playfair Display',serif",
                fontSize: "20px",
                fontWeight: "700",
                color: "#fff",
              }}
            >
              At a Glance
            </div>
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))",
              gap: "24px",
            }}
          >
            {[
              { label: "Total Orders", value: stats.total_orders || 0 },
              { label: "Registered Users", value: stats.total_users || 0 },
              {
                label: "Table Reservations",
                value: stats.total_table_bookings || 0,
              },
              {
                label: "Event Bookings",
                value: stats.total_event_bookings || 0,
              },
            ].map((item) => (
              <div
                key={item.label}
                style={{
                  textAlign: "center",
                  padding: "20px 0",
                  borderRight: "1px solid rgba(255,255,255,0.06)",
                }}
              >
                <div
                  style={{
                    fontFamily: "'Playfair Display',serif",
                    fontSize: "36px",
                    fontWeight: "700",
                    color: "#E8441A",
                    lineHeight: 1,
                    marginBottom: "8px",
                  }}
                >
                  {item.value}
                </div>
                <div
                  style={{
                    fontSize: "12px",
                    fontWeight: "600",
                    letterSpacing: "1px",
                    textTransform: "uppercase",
                    color: "rgba(255,255,255,0.3)",
                  }}
                >
                  {item.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
