import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../../contexts/AuthContext";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

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
    fetchDashboardData();
    fetchChartData();
  }, []);

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

  // Food Orders Pie Chart Data
  const foodOrdersChartData = {
    labels: chartData.food_orders.map((item) => item.category || "Other"),
    datasets: [
      {
        label: "Number of Orders",
        data: chartData.food_orders.map((item) => parseInt(item.order_count)),
        backgroundColor: [
          "#FF6384",
          "#36A2EB",
          "#FFCE56",
          "#4BC0C0",
          "#9966FF",
          "#FF9F40",
          "#8B4513",
          "#2ECC71",
        ],
        borderWidth: 2,
      },
    ],
  };

  // Table Bookings Pie Chart Data
  const tableBookingsChartData = {
    labels: chartData.table_bookings.map((item) => item.table_type),
    datasets: [
      {
        label: "Number of Bookings",
        data: chartData.table_bookings.map((item) =>
          parseInt(item.booking_count),
        ),
        backgroundColor: ["#4BC0C0", "#FFCE56", "#FF6384", "#36A2EB"],
        borderWidth: 2,
      },
    ],
  };

  // Event Bookings Pie Chart Data
  const eventBookingsChartData = {
    labels: chartData.event_bookings.map((item) => item.location_name),
    datasets: [
      {
        label: "Number of Bookings",
        data: chartData.event_bookings.map((item) =>
          parseInt(item.booking_count),
        ),
        backgroundColor: [
          "#9966FF",
          "#FF9F40",
          "#8B4513",
          "#2ECC71",
          "#E74C3C",
          "#3498DB",
        ],
        borderWidth: 2,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        position: "bottom",
        labels: {
          font: {
            size: 12,
          },
        },
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            const label = context.label || "";
            const value = context.raw || 0;
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = ((value / total) * 100).toFixed(1);
            return `${label}: ${value} (${percentage}%)`;
          },
        },
      },
    },
  };

  const statsCards = [
    {
      title: "Total Orders",
      value: stats.total_orders,
      icon: "📦",
      color: "#3b82f6",
    },
    {
      title: "Total Users",
      value: stats.total_users,
      icon: "👥",
      color: "#10b981",
    },
    {
      title: "Table Bookings",
      value: stats.total_table_bookings,
      icon: "🪑",
      color: "#f59e0b",
    },
    {
      title: "Event Bookings",
      value: stats.total_event_bookings,
      icon: "🎉",
      color: "#ef4444",
    },
  ];

  if (loading)
    return (
      <div style={{ textAlign: "center", padding: "50px" }}>
        Loading dashboard...
      </div>
    );

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f3f4f6",
        padding: "40px 20px",
      }}
    >
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        {/* Welcome Header */}
        <div style={{ marginBottom: "30px" }}>
          <h1 style={{ fontSize: "32px" }}>Admin Dashboard</h1>
          <p style={{ color: "#6b7280" }}>Welcome back, {user?.full_name}!</p>
        </div>

        {/* Stats Cards */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
            gap: "20px",
            marginBottom: "40px",
          }}
        >
          {statsCards.map((stat, idx) => (
            <div
              key={idx}
              style={{
                background: "white",
                borderRadius: "15px",
                padding: "20px",
                boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div>
                  <p style={{ color: "#6b7280", fontSize: "14px" }}>
                    {stat.title}
                  </p>
                  <p
                    style={{
                      fontSize: "32px",
                      fontWeight: "bold",
                      marginTop: "5px",
                    }}
                  >
                    {stat.value}
                  </p>
                </div>
                <div style={{ fontSize: "40px" }}>{stat.icon}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "15px",
            marginBottom: "40px",
          }}
        >
          <a
            href="/admin/menu"
            style={{
              background: "#4c1d95",
              color: "white",
              padding: "15px",
              textAlign: "center",
              borderRadius: "10px",
              textDecoration: "none",
            }}
          >
            🍕 Manage Menu
          </a>
          <a
            href="/admin/locations"
            style={{
              background: "#4c1d95",
              color: "white",
              padding: "15px",
              textAlign: "center",
              borderRadius: "10px",
              textDecoration: "none",
            }}
          >
            📍 Manage Locations
          </a>
          <a
            href="/admin/bookings"
            style={{
              background: "#4c1d95",
              color: "white",
              padding: "15px",
              textAlign: "center",
              borderRadius: "10px",
              textDecoration: "none",
            }}
          >
            📅 View All Bookings
          </a>
        </div>

        {/* Pie Charts Section */}
        <h2 style={{ fontSize: "24px", marginBottom: "20px" }}>
          📊 Analytics Dashboard
        </h2>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))",
            gap: "25px",
          }}
        >
          {/* Chart 1: Food Orders by Category */}
          <div
            style={{
              background: "white",
              borderRadius: "15px",
              padding: "20px",
              boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
            }}
          >
            <h3
              style={{
                textAlign: "center",
                marginBottom: "20px",
                color: "#4c1d95",
              }}
            >
              🍕 Food Orders by Category
            </h3>
            {chartData.food_orders.length > 0 ? (
              <div style={{ height: "300px" }}>
                <Pie data={foodOrdersChartData} options={chartOptions} />
              </div>
            ) : (
              <p
                style={{
                  textAlign: "center",
                  color: "#6b7280",
                  padding: "50px",
                }}
              >
                No food orders data available
              </p>
            )}
            <div
              style={{
                marginTop: "15px",
                textAlign: "center",
                fontSize: "12px",
                color: "#6b7280",
              }}
            >
              Total Items Sold:{" "}
              {chartData.food_orders.reduce(
                (sum, item) => sum + parseInt(item.total_items || 0),
                0,
              )}
            </div>
          </div>

          {/* Chart 2: Table Bookings by Size */}
          <div
            style={{
              background: "white",
              borderRadius: "15px",
              padding: "20px",
              boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
            }}
          >
            <h3
              style={{
                textAlign: "center",
                marginBottom: "20px",
                color: "#4c1d95",
              }}
            >
              🪑 Table Bookings by Size
            </h3>
            {chartData.table_bookings.length > 0 ? (
              <div style={{ height: "300px" }}>
                <Pie data={tableBookingsChartData} options={chartOptions} />
              </div>
            ) : (
              <p
                style={{
                  textAlign: "center",
                  color: "#6b7280",
                  padding: "50px",
                }}
              >
                No table bookings data available
              </p>
            )}
            <div
              style={{
                marginTop: "15px",
                textAlign: "center",
                fontSize: "12px",
                color: "#6b7280",
              }}
            >
              Total Bookings:{" "}
              {chartData.table_bookings.reduce(
                (sum, item) => sum + parseInt(item.booking_count),
                0,
              )}
            </div>
          </div>

          {/* Chart 3: Event Bookings by Location */}
          <div
            style={{
              background: "white",
              borderRadius: "15px",
              padding: "20px",
              boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
            }}
          >
            <h3
              style={{
                textAlign: "center",
                marginBottom: "20px",
                color: "#4c1d95",
              }}
            >
              🎉 Event Bookings by Location
            </h3>
            {chartData.event_bookings.length > 0 ? (
              <div style={{ height: "300px" }}>
                <Pie data={eventBookingsChartData} options={chartOptions} />
              </div>
            ) : (
              <p
                style={{
                  textAlign: "center",
                  color: "#6b7280",
                  padding: "50px",
                }}
              >
                No event bookings data available
              </p>
            )}
            <div
              style={{
                marginTop: "15px",
                textAlign: "center",
                fontSize: "12px",
                color: "#6b7280",
              }}
            >
              Total Guests:{" "}
              {chartData.event_bookings.reduce(
                (sum, item) => sum + parseInt(item.total_guests || 0),
                0,
              )}
            </div>
          </div>
        </div>

        {/* Additional Stats Summary */}
        <div
          style={{
            marginTop: "30px",
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            borderRadius: "15px",
            padding: "20px",
            color: "white",
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: "20px",
              textAlign: "center",
            }}
          >
            <div>
              <div style={{ fontSize: "28px", fontWeight: "bold" }}>
                {stats.total_orders || 0}
              </div>
              <div style={{ fontSize: "14px", opacity: 0.9 }}>Total Orders</div>
            </div>
            <div>
              <div style={{ fontSize: "28px", fontWeight: "bold" }}>
                {stats.total_users || 0}
              </div>
              <div style={{ fontSize: "14px", opacity: 0.9 }}>
                Registered Users
              </div>
            </div>
            <div>
              <div style={{ fontSize: "28px", fontWeight: "bold" }}>
                {stats.total_table_bookings || 0}
              </div>
              <div style={{ fontSize: "14px", opacity: 0.9 }}>
                Table Reservations
              </div>
            </div>
            <div>
              <div style={{ fontSize: "28px", fontWeight: "bold" }}>
                {stats.total_event_bookings || 0}
              </div>
              <div style={{ fontSize: "14px", opacity: 0.9 }}>
                Event Bookings
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
