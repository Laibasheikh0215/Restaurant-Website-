import React, { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";

//GLOBAL CSS
const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;1,700&family=DM+Sans:wght@400;500;600;700&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  @keyframes fadeSlideUp {
    from { opacity: 0; transform: translateY(18px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes formExpand {
    from { opacity: 0; transform: translateY(-10px); max-height: 0; }
    to   { opacity: 1; transform: translateY(0); max-height: 400px; }
  }
  @keyframes spin { to { transform: rotate(360deg); } }

  .egm-form-enter { animation: formExpand 0.3s cubic-bezier(0.22,1,0.36,1) both; overflow: hidden; }
  .egm-card       { animation: fadeSlideUp 0.4s ease both; }

  .egm-input {
    width: 100%;
    padding: 11px 14px;
    background: rgba(255,255,255,0.04);
    border: 1.5px solid rgba(255,255,255,0.09);
    border-radius: 10px;
    color: #fff;
    font-family: 'DM Sans', sans-serif;
    font-size: 13px;
    outline: none;
    transition: border-color 0.2s, background 0.2s;
    resize: vertical;
  }
  .egm-input::placeholder { color: rgba(255,255,255,0.25); }
  .egm-input:focus {
    border-color: #E8441A;
    background: rgba(232,68,26,0.05);
  }

  .egm-btn-add {
    padding: 9px 20px;
    border: none;
    border-radius: 50px;
    background: #E8441A;
    color: #fff;
    font-family: 'DM Sans', sans-serif;
    font-size: 13px;
    font-weight: 700;
    cursor: pointer;
    transition: transform 0.2s, box-shadow 0.2s;
    box-shadow: 0 3px 12px rgba(232,68,26,0.3);
    white-space: nowrap;
  }
  .egm-btn-add:hover { transform: translateY(-1px); box-shadow: 0 5px 18px rgba(232,68,26,0.45); }

  .egm-btn-submit {
    padding: 10px 22px;
    border: none;
    border-radius: 10px;
    background: rgba(16,185,129,0.15);
    color: #34d399;
    font-family: 'DM Sans', sans-serif;
    font-size: 13px;
    font-weight: 700;
    cursor: pointer;
    transition: background 0.2s, color 0.2s;
  }
  .egm-btn-submit:hover { background: rgba(16,185,129,0.28); color: #6ee7b7; }
  .egm-btn-submit:disabled { opacity: 0.5; cursor: not-allowed; }

  .egm-btn-cancel {
    padding: 10px 22px;
    border: none;
    border-radius: 10px;
    background: rgba(255,255,255,0.06);
    color: rgba(255,255,255,0.5);
    font-family: 'DM Sans', sans-serif;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.2s, color 0.2s;
  }
  .egm-btn-cancel:hover { background: rgba(255,255,255,0.1); color: rgba(255,255,255,0.8); }

  .egm-guest-card {
    background: rgba(255,255,255,0.03);
    border: 1px solid rgba(255,255,255,0.07);
    border-radius: 12px;
    padding: 14px 16px;
    position: relative;
    transition: border-color 0.2s, background 0.2s;
  }
  .egm-guest-card:hover {
    border-color: rgba(255,255,255,0.12);
    background: rgba(255,255,255,0.05);
  }

  .egm-delete-btn {
    position: absolute;
    top: 10px;
    right: 10px;
    width: 26px;
    height: 26px;
    border-radius: 50%;
    border: 1px solid rgba(239,68,68,0.25);
    background: rgba(239,68,68,0.1);
    color: #f87171;
    font-size: 14px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background 0.2s, border-color 0.2s;
    line-height: 1;
  }
  .egm-delete-btn:hover {
    background: rgba(239,68,68,0.25);
    border-color: rgba(239,68,68,0.5);
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

function EventGuestManagement({ bookingId, fetchData }) {
  const [guests, setGuests] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newGuest, setNewGuest] = useState({
    name: "",
    email: "",
    phone: "",
    dietary_restrictions: "",
  });
  const [loading, setLoading] = useState(false);

  // Inject CSS
  useEffect(() => {
    if (document.getElementById("egm-css")) return;
    const s = document.createElement("style");
    s.id = "egm-css";
    s.textContent = GLOBAL_CSS;
    document.head.appendChild(s);
    return () => {
      const el = document.getElementById("egm-css");
      if (el) el.remove();
    };
  }, []);

  useEffect(() => {
    if (bookingId) fetchGuests();
  }, [bookingId]);

  const fetchGuests = async () => {
    try {
      const response = await axios.get(
        `http://localhost:5000/api/event-bookings/${bookingId}/guests`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        },
      );
      setGuests(response.data);
    } catch (error) {
      console.error("Error fetching guests:", error);
    }
  };

  const handleAddGuest = async (e) => {
    e.preventDefault();
    if (!newGuest.name) {
      toast.error("Guest name is required");
      return;
    }
    setLoading(true);
    try {
      const response = await axios.post(
        `http://localhost:5000/api/event-bookings/${bookingId}/guests`,
        newGuest,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        },
      );
      if (response.data.success) {
        toast.success("Guest added successfully!");
        setNewGuest({
          name: "",
          email: "",
          phone: "",
          dietary_restrictions: "",
        });
        setShowAddForm(false);
        fetchGuests();
        if (fetchData) fetchData();
      }
    } catch (error) {
      toast.error("Failed to add guest");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteGuest = async (guestId) => {
    if (window.confirm("Are you sure you want to remove this guest?")) {
      try {
        await axios.delete(
          `http://localhost:5000/api/event-guests/${guestId}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          },
        );
        toast.success("Guest removed");
        fetchGuests();
        if (fetchData) fetchData();
      } catch (error) {
        toast.error("Failed to remove guest");
      }
    }
  };

  return (
    <div style={{ marginTop: "24px", fontFamily: "'DM Sans',sans-serif" }}>
      {/* Section header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "16px",
        }}
      >
        <div>
          <div
            style={{
              fontFamily: "'Playfair Display',serif",
              fontSize: "16px",
              fontWeight: "700",
              color: "#fff",
              marginBottom: "2px",
            }}
          >
            Guest List
          </div>
          <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.35)" }}>
            {guests.length} {guests.length === 1 ? "guest" : "guests"} added
          </div>
        </div>
        <button
          className="egm-btn-add"
          onClick={() => setShowAddForm(!showAddForm)}
        >
          {showAddForm ? "✕ Close" : "+ Add Guest"}
        </button>
      </div>

      {/* Add guest form */}
      {showAddForm && (
        <div
          className="egm-form-enter"
          style={{
            background: "rgba(232,68,26,0.05)",
            border: "1px solid rgba(232,68,26,0.15)",
            borderRadius: "14px",
            padding: "20px",
            marginBottom: "20px",
          }}
        >
          <div
            style={{
              fontFamily: "'DM Sans',sans-serif",
              fontSize: "13px",
              fontWeight: "700",
              color: "#E8441A",
              letterSpacing: "1px",
              textTransform: "uppercase",
              marginBottom: "16px",
            }}
          >
            New Guest
          </div>
          <form onSubmit={handleAddGuest}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "12px",
                marginBottom: "12px",
              }}
            >
              <div>
                <label style={labelStyle}>
                  Full Name <span style={{ color: "#E8441A" }}>*</span>
                </label>
                <input
                  type="text"
                  placeholder="Ali Khan"
                  value={newGuest.name}
                  onChange={(e) =>
                    setNewGuest({ ...newGuest, name: e.target.value })
                  }
                  className="egm-input"
                  required
                />
              </div>
              <div>
                <label style={labelStyle}>Email</label>
                <input
                  type="email"
                  placeholder="guest@example.com"
                  value={newGuest.email}
                  onChange={(e) =>
                    setNewGuest({ ...newGuest, email: e.target.value })
                  }
                  className="egm-input"
                />
              </div>
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "12px",
                marginBottom: "12px",
              }}
            >
              <div>
                <label style={labelStyle}>Phone</label>
                <input
                  type="tel"
                  placeholder="+92 300 0000000"
                  value={newGuest.phone}
                  onChange={(e) =>
                    setNewGuest({ ...newGuest, phone: e.target.value })
                  }
                  className="egm-input"
                />
              </div>
              <div>
                <label style={labelStyle}>Dietary Restrictions</label>
                <input
                  type="text"
                  placeholder="e.g. Vegetarian, Nut allergy"
                  value={newGuest.dietary_restrictions}
                  onChange={(e) =>
                    setNewGuest({
                      ...newGuest,
                      dietary_restrictions: e.target.value,
                    })
                  }
                  className="egm-input"
                />
              </div>
            </div>

            <div
              style={{
                display: "flex",
                gap: "10px",
                justifyContent: "flex-end",
                marginTop: "4px",
              }}
            >
              <button
                type="button"
                className="egm-btn-cancel"
                onClick={() => setShowAddForm(false)}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="egm-btn-submit"
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
                        width: "12px",
                        height: "12px",
                        border: "2px solid rgba(52,211,153,0.3)",
                        borderTopColor: "#34d399",
                        borderRadius: "50%",
                        display: "inline-block",
                        animation: "spin 0.7s linear infinite",
                      }}
                    />
                    Adding…
                  </span>
                ) : (
                  "✓ Add Guest"
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Guest list */}
      {guests.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "32px 20px",
            background: "rgba(255,255,255,0.02)",
            border: "1px solid rgba(255,255,255,0.06)",
            borderRadius: "14px",
          }}
        >
          <div style={{ fontSize: "32px", marginBottom: "10px" }}>👥</div>
          <div style={{ fontSize: "14px", color: "rgba(255,255,255,0.4)" }}>
            No guests added yet
          </div>
          <div
            style={{
              fontSize: "12px",
              color: "rgba(255,255,255,0.2)",
              marginTop: "4px",
            }}
          >
            Click "+ Add Guest" to start building the list
          </div>
        </div>
      ) : (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "10px",
            maxHeight: "340px",
            overflowY: "auto",
            paddingRight: "2px",
          }}
        >
          {guests.map((guest, i) => (
            <div
              key={guest.id}
              className="egm-guest-card egm-card"
              style={{ animationDelay: `${i * 0.05}s` }}
            >
              <button
                className="egm-delete-btn"
                onClick={() => handleDeleteGuest(guest.id)}
                title="Remove guest"
              >
                ×
              </button>

              {/* Avatar + name row */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  marginBottom: "8px",
                  paddingRight: "32px",
                }}
              >
                <div
                  style={{
                    width: "34px",
                    height: "34px",
                    borderRadius: "50%",
                    background: "rgba(232,68,26,0.15)",
                    border: "1px solid rgba(232,68,26,0.25)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontFamily: "'DM Sans',sans-serif",
                    fontSize: "13px",
                    fontWeight: "700",
                    color: "#E8441A",
                    flexShrink: 0,
                  }}
                >
                  {guest.name?.[0]?.toUpperCase() ?? "?"}
                </div>
                <span
                  style={{
                    fontFamily: "'DM Sans',sans-serif",
                    fontSize: "14px",
                    fontWeight: "700",
                    color: "#fff",
                  }}
                >
                  {guest.name}
                </span>
              </div>

              {/* Details */}
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "8px 20px",
                  paddingLeft: "2px",
                }}
              >
                {guest.email && (
                  <span
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "5px",
                      fontFamily: "'DM Sans',sans-serif",
                      fontSize: "12px",
                      color: "rgba(255,255,255,0.45)",
                    }}
                  >
                    <span style={{ fontSize: "13px" }}>📧</span> {guest.email}
                  </span>
                )}
                {guest.phone && (
                  <span
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "5px",
                      fontFamily: "'DM Sans',sans-serif",
                      fontSize: "12px",
                      color: "rgba(255,255,255,0.45)",
                    }}
                  >
                    <span style={{ fontSize: "13px" }}>📞</span> {guest.phone}
                  </span>
                )}
                {guest.dietary_restrictions && (
                  <span
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "5px",
                      fontFamily: "'DM Sans',sans-serif",
                      fontSize: "12px",
                      color: "rgba(251,191,36,0.8)",
                      background: "rgba(245,158,11,0.08)",
                      padding: "2px 8px",
                      borderRadius: "50px",
                      border: "1px solid rgba(245,158,11,0.15)",
                    }}
                  >
                    🍽️ {guest.dietary_restrictions}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default EventGuestManagement;
