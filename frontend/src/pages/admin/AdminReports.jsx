import React, { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";

/* ─── GLOBAL CSS ─────────────────────────────────────────────────────────── */
const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;1,700&family=DM+Sans:wght@400;500;600;700&display=swap');
  *, *::before, *::after { box-sizing: border-box; }

  @keyframes fadeSlideUp {
    from { opacity: 0; transform: translateY(24px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
  @keyframes spin   { to { transform: rotate(360deg); } }

  .admin-reports { animation: fadeIn 0.4s ease both; font-family: 'DM Sans', sans-serif; }

  .export-select {
    font-family: 'DM Sans', sans-serif;
    font-size: 13px;
    font-weight: 600;
    padding: 11px 18px;
    border-radius: 12px;
    border: 1.5px solid rgba(255,255,255,0.1);
    background: rgba(255,255,255,0.04);
    color: #fff;
    outline: none;
    cursor: pointer;
    transition: border-color 0.2s;
  }
  .export-select:focus { border-color: #E8441A; }
  .export-select option { background: #1a1a1a; color: #fff; }

  .export-btn {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    font-family: 'DM Sans', sans-serif;
    font-size: 13px;
    font-weight: 700;
    padding: 11px 24px;
    border-radius: 50px;
    border: none;
    cursor: pointer;
    background: #34d399;
    color: #0a0a0a;
    transition: transform 0.2s, box-shadow 0.2s, opacity 0.2s;
    box-shadow: 0 4px 16px rgba(52,211,153,0.3);
  }
  .export-btn:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(52,211,153,0.45); }
  .export-btn:disabled { opacity: 0.55; cursor: not-allowed; }

  .stat-card {
    background: #141414;
    border: 1px solid rgba(255,255,255,0.06);
    border-radius: 20px;
    padding: 28px;
    transition: border-color 0.2s, transform 0.2s;
    animation: fadeSlideUp 0.5s ease both;
  }
  .stat-card:hover { border-color: rgba(232,68,26,0.2); transform: translateY(-3px); }

  .data-table { width: 100%; border-collapse: collapse; }
  .data-table th {
    font-family: 'DM Sans', sans-serif;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 1.5px;
    text-transform: uppercase;
    color: rgba(255,255,255,0.3);
    padding: 14px 20px;
    text-align: left;
    border-bottom: 1px solid rgba(255,255,255,0.06);
  }
  .data-table td {
    font-family: 'DM Sans', sans-serif;
    font-size: 14px;
    color: rgba(255,255,255,0.65);
    padding: 16px 20px;
    border-bottom: 1px solid rgba(255,255,255,0.04);
    transition: background 0.15s;
  }
  .data-table tr:hover td { background: rgba(255,255,255,0.02); }
  .data-table tr:last-child td { border-bottom: none; }

  .rank-badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 26px;
    height: 26px;
    border-radius: 8px;
    font-size: 12px;
    font-weight: 700;
    font-family: 'DM Sans', sans-serif;
  }

  .section-card {
    background: #141414;
    border: 1px solid rgba(255,255,255,0.06);
    border-radius: 20px;
    overflow: hidden;
    animation: fadeSlideUp 0.5s ease both;
  }
  .section-card-header {
    padding: 24px 28px 20px;
    border-bottom: 1px solid rgba(255,255,255,0.05);
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .bar-track {
    height: 6px;
    background: rgba(255,255,255,0.05);
    border-radius: 3px;
    overflow: hidden;
    margin-top: 6px;
    width: 100%;
  }
  .bar-fill {
    height: 100%;
    border-radius: 3px;
    background: linear-gradient(90deg, #E8441A, #ff6b3d);
    transition: width 0.8s cubic-bezier(0.22,1,0.36,1);
  }

  .empty-state {
    padding: 56px 40px;
    text-align: center;
    color: rgba(255,255,255,0.25);
    font-size: 14px;
  }
`;

/* ─── MAIN COMPONENT ─────────────────────────────────────────────────────── */
function AdminReports() {
  const [analytics, setAnalytics] = useState({
    top_items: [],
    revenue_by_category: [],
  });
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [exportType, setExportType] = useState("orders");

  useEffect(() => {
    if (!document.getElementById("admin-reports-css")) {
      const s = document.createElement("style");
      s.id = "admin-reports-css";
      s.textContent = GLOBAL_CSS;
      document.head.appendChild(s);
    }
    return () => {
      const el = document.getElementById("admin-reports-css");
      if (el) el.remove();
    };
  }, []);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  /* ── original logic (unchanged) ── */
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
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
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

  const calculateTotalRevenue = () =>
    analytics.revenue_by_category.reduce(
      (sum, item) => sum + parseFloat(item.revenue || 0),
      0,
    );

  /* ── derived values for bar chart ── */
  const maxRevenue = Math.max(
    ...analytics.top_items.map((i) => parseFloat(i.total_revenue || 0)),
    1,
  );

  const RANK_STYLES = [
    { bg: "rgba(232,68,26,0.2)", color: "#E8441A" },
    { bg: "rgba(96,165,250,0.15)", color: "#60a5fa" },
    { bg: "rgba(52,211,153,0.15)", color: "#34d399" },
  ];

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
            Loading analytics…
          </p>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div
      className="admin-reports"
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
          style={{
            maxWidth: "1200px",
            margin: "0 auto",
            position: "relative",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            flexWrap: "wrap",
            gap: "24px",
          }}
        >
          <div>
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
                fontSize: "clamp(34px,4vw,52px)",
                fontWeight: "700",
                color: "#fff",
                lineHeight: "1.08",
                marginBottom: "12px",
              }}
            >
              Reports &amp;{" "}
              <span style={{ color: "#E8441A", fontStyle: "italic" }}>
                Analytics
              </span>
            </h1>
            <p
              style={{
                fontSize: "15px",
                color: "rgba(255,255,255,0.4)",
                maxWidth: "400px",
                lineHeight: "1.7",
              }}
            >
              Sales performance, top items, and data exports — all in one place.
            </p>
          </div>

          {/* Export Controls */}
          <div
            style={{
              display: "flex",
              gap: "10px",
              alignItems: "center",
              flexWrap: "wrap",
            }}
          >
            <select
              className="export-select"
              value={exportType}
              onChange={(e) => setExportType(e.target.value)}
            >
              <option value="orders">Export Orders</option>
              <option value="users">Export Users</option>
              <option value="bookings">Export Bookings</option>
            </select>
            <button
              className="export-btn"
              onClick={handleExport}
              disabled={exporting}
            >
              {exporting ? (
                <>
                  <span
                    style={{
                      width: "14px",
                      height: "14px",
                      border: "2px solid rgba(0,0,0,0.2)",
                      borderTopColor: "#0a0a0a",
                      borderRadius: "50%",
                      display: "inline-block",
                      animation: "spin 0.7s linear infinite",
                    }}
                  />
                  Exporting…
                </>
              ) : (
                <>📥 Export CSV</>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* ── BODY ── */}
      <div
        style={{ maxWidth: "1200px", margin: "0 auto", padding: "48px 60px" }}
      >
        {/* STAT CARDS */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))",
            gap: "20px",
            marginBottom: "40px",
          }}
        >
          {/* Total Revenue */}
          <div className="stat-card" style={{ animationDelay: "0.05s" }}>
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
                  Total Revenue
                </div>
                <div
                  style={{
                    fontFamily: "'Playfair Display',serif",
                    fontSize: "38px",
                    fontWeight: "700",
                    color: "#fff",
                    lineHeight: 1,
                  }}
                >
                  ${calculateTotalRevenue().toFixed(2)}
                </div>
              </div>
              <div
                style={{
                  width: "50px",
                  height: "50px",
                  borderRadius: "14px",
                  background: "rgba(52,211,153,0.1)",
                  border: "1px solid rgba(52,211,153,0.2)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "22px",
                }}
              >
                💰
              </div>
            </div>
            <div
              style={{
                marginTop: "18px",
                height: "3px",
                borderRadius: "2px",
                background: "linear-gradient(90deg, #34d399, transparent)",
              }}
            />
          </div>

          {/* Products Selling */}
          <div className="stat-card" style={{ animationDelay: "0.10s" }}>
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
                  Products Selling
                </div>
                <div
                  style={{
                    fontFamily: "'Playfair Display',serif",
                    fontSize: "38px",
                    fontWeight: "700",
                    color: "#fff",
                    lineHeight: 1,
                  }}
                >
                  {analytics.top_items.length}
                </div>
              </div>
              <div
                style={{
                  width: "50px",
                  height: "50px",
                  borderRadius: "14px",
                  background: "rgba(232,68,26,0.1)",
                  border: "1px solid rgba(232,68,26,0.2)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "22px",
                }}
              >
                📦
              </div>
            </div>
            <div
              style={{
                marginTop: "18px",
                height: "3px",
                borderRadius: "2px",
                background: "linear-gradient(90deg, #E8441A, transparent)",
              }}
            />
          </div>
        </div>

        {/* TOP SELLING ITEMS TABLE */}
        <div className="section-card" style={{ animationDelay: "0.15s" }}>
          <div className="section-card-header">
            <div>
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
                Performance
              </div>
              <div
                style={{
                  fontFamily: "'Playfair Display',serif",
                  fontSize: "20px",
                  fontWeight: "700",
                  color: "#fff",
                }}
              >
                🔥 Top Selling Items
              </div>
            </div>
            <div
              style={{
                fontFamily: "'DM Sans',sans-serif",
                fontSize: "13px",
                color: "rgba(255,255,255,0.3)",
                fontWeight: "600",
              }}
            >
              {analytics.top_items.length} items
            </div>
          </div>

          {analytics.top_items.length > 0 ? (
            <table className="data-table">
              <thead>
                <tr>
                  <th style={{ width: "48px" }}>#</th>
                  <th>Item</th>
                  <th>Orders</th>
                  <th>Revenue</th>
                  <th>Share</th>
                </tr>
              </thead>
              <tbody>
                {analytics.top_items.map((item, idx) => {
                  const rank = RANK_STYLES[idx] || {
                    bg: "rgba(255,255,255,0.05)",
                    color: "rgba(255,255,255,0.3)",
                  };
                  const pct = (
                    (parseFloat(item.total_revenue || 0) / maxRevenue) *
                    100
                  ).toFixed(0);
                  return (
                    <tr key={idx}>
                      <td>
                        <span
                          className="rank-badge"
                          style={{ background: rank.bg, color: rank.color }}
                        >
                          {idx + 1}
                        </span>
                      </td>
                      <td style={{ color: "#fff", fontWeight: "600" }}>
                        {item.name}
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
                          {item.order_count}
                        </span>
                      </td>
                      <td
                        style={{
                          color: "#E8441A",
                          fontWeight: "700",
                          fontFamily: "'Playfair Display',serif",
                          fontSize: "16px",
                        }}
                      >
                        ${parseFloat(item.total_revenue).toFixed(2)}
                      </td>
                      <td style={{ width: "160px" }}>
                        <div
                          style={{
                            fontSize: "11px",
                            color: "rgba(255,255,255,0.3)",
                            marginBottom: "4px",
                          }}
                        >
                          {pct}%
                        </div>
                        <div className="bar-track">
                          <div
                            className="bar-fill"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <div className="empty-state">
              <div style={{ fontSize: "48px", marginBottom: "14px" }}>📊</div>
              <p>No sales data available yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminReports;
