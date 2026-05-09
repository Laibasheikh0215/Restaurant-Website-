import React, { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";

function AdminReports() {
  const [analytics, setAnalytics] = useState({
    top_items: [],
    revenue_by_category: [],
  });
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [exportType, setExportType] = useState("orders");

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const response = await axios.get(
        "http://localhost:5000/api/admin/sales-analytics",
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        },
      );
      setAnalytics(response.data);
    } catch (error) {
      console.error("Error fetching analytics:", error);
      toast.error("Failed to load analytics");
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const response = await axios.get(
        `http://localhost:5000/api/admin/export/${exportType}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          responseType: "blob",
        },
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `${exportType}_export_${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast.success("Export completed!");
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Failed to export data");
    } finally {
      setExporting(false);
    }
  };

  const calculateTotalRevenue = () => {
    return analytics.revenue_by_category.reduce(
      (sum, item) => sum + parseFloat(item.revenue || 0),
      0,
    );
  };

  if (loading)
    return (
      <div style={{ textAlign: "center", padding: "50px" }}>
        Loading analytics...
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
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "30px",
            flexWrap: "wrap",
            gap: "15px",
          }}
        >
          <h1 style={{ fontSize: "32px" }}>📊 Reports & Analytics</h1>

          <div style={{ display: "flex", gap: "10px" }}>
            <select
              value={exportType}
              onChange={(e) => setExportType(e.target.value)}
              style={{
                padding: "10px",
                borderRadius: "8px",
                border: "1px solid #ddd",
              }}
            >
              <option value="orders">Export Orders</option>
              <option value="users">Export Users</option>
              <option value="bookings">Export Bookings</option>
            </select>
            <button
              onClick={handleExport}
              disabled={exporting}
              style={{
                background: exporting ? "#9ca3af" : "#10b981",
                color: "white",
                padding: "10px 20px",
                border: "none",
                borderRadius: "8px",
                cursor: exporting ? "not-allowed" : "pointer",
              }}
            >
              {exporting ? "⏳ Exporting..." : "📥 Export CSV"}
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
            gap: "20px",
            marginBottom: "30px",
          }}
        >
          <div
            style={{
              background: "white",
              borderRadius: "15px",
              padding: "20px",
            }}
          >
            <div style={{ fontSize: "24px" }}>💰</div>
            <div
              style={{ fontSize: "28px", fontWeight: "bold", color: "#4c1d95" }}
            >
              ${calculateTotalRevenue().toFixed(2)}
            </div>
            <div style={{ color: "#6b7280" }}>Total Revenue</div>
          </div>
          <div
            style={{
              background: "white",
              borderRadius: "15px",
              padding: "20px",
            }}
          >
            <div style={{ fontSize: "24px" }}>📦</div>
            <div
              style={{ fontSize: "28px", fontWeight: "bold", color: "#4c1d95" }}
            >
              {analytics.top_items.length}
            </div>
            <div style={{ color: "#6b7280" }}>Products Selling</div>
          </div>
        </div>

        {/* Top Selling Items */}
        <div
          style={{
            background: "white",
            borderRadius: "15px",
            padding: "20px",
            marginBottom: "30px",
          }}
        >
          <h2>🔥 Top Selling Items</h2>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "2px solid #e5e7eb" }}>
                <th style={{ padding: "12px", textAlign: "left" }}>Item</th>
                <th style={{ padding: "12px", textAlign: "left" }}>Orders</th>
                <th style={{ padding: "12px", textAlign: "left" }}>Revenue</th>
              </tr>
            </thead>
            <tbody>
              {analytics.top_items.map((item, idx) => (
                <tr key={idx}>
                  <td style={{ padding: "12px" }}>{item.name}</td>
                  <td style={{ padding: "12px" }}>{item.order_count}</td>
                  <td style={{ padding: "12px" }}>
                    ${parseFloat(item.total_revenue).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default AdminReports;
