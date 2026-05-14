import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../../contexts/AuthContext";
import { useCart } from "../../contexts/CartContext";
import toast from "react-hot-toast";
import TableLayout from "../../components/TableLayout";

/* ─────────────────────────────────────────────
   GLOBAL CSS
───────────────────────────────────────────────*/
const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;1,700&family=DM+Sans:wght@400;500;600;700&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  @keyframes fadeSlideUp {
    from { opacity: 0; transform: translateY(28px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes fadeInLeft {
    from { opacity: 0; transform: translateX(-40px); }
    to   { opacity: 1; transform: translateX(0); }
  }
  @keyframes spin { to { transform: rotate(360deg); } }
  @keyframes pulse {
    0%, 100% { transform: scale(1); }
    50%       { transform: scale(1.06); }
  }
  @keyframes checkPop {
    0%   { transform: scale(0) rotate(-10deg); opacity: 0; }
    70%  { transform: scale(1.15) rotate(3deg); opacity: 1; }
    100% { transform: scale(1) rotate(0deg); opacity: 1; }
  }

  .tb-page       { animation: fadeSlideUp 0.7s ease 0.05s both; }
  .tb-panel      { animation: fadeInLeft  0.7s cubic-bezier(0.22,1,0.36,1) 0.15s both; }
  .tb-row-0      { animation: fadeSlideUp 0.55s ease 0.20s both; }
  .tb-row-1      { animation: fadeSlideUp 0.55s ease 0.30s both; }
  .tb-row-2      { animation: fadeSlideUp 0.55s ease 0.40s both; }
  .tb-row-3      { animation: fadeSlideUp 0.55s ease 0.50s both; }
  .tb-row-4      { animation: fadeSlideUp 0.55s ease 0.60s both; }
  .tb-success    { animation: checkPop 0.6s cubic-bezier(0.22,1,0.36,1) 0.2s both; }

  .tb-input {
    width: 100%;
    padding: 14px 18px;
    background: rgba(255,255,255,0.04);
    border: 1.5px solid rgba(255,255,255,0.1);
    border-radius: 12px;
    color: #fff;
    font-family: 'DM Sans', sans-serif;
    font-size: 15px;
    outline: none;
    transition: border-color 0.2s, background 0.2s;
    appearance: none;
    -webkit-appearance: none;
  }
  .tb-input::placeholder { color: rgba(255,255,255,0.28); }
  .tb-input:focus {
    border-color: #E8441A;
    background: rgba(232,68,26,0.06);
  }
  .tb-input option { background: #1a1a1a; color: #fff; }

  .tb-btn-primary {
    width: 100%;
    background: #E8441A;
    color: #fff;
    padding: 15px;
    border: none;
    border-radius: 12px;
    font-family: 'DM Sans', sans-serif;
    font-size: 15px;
    font-weight: 700;
    cursor: pointer;
    transition: transform 0.2s, box-shadow 0.2s, background 0.2s;
    box-shadow: 0 4px 20px rgba(232,68,26,0.35);
    letter-spacing: 0.3px;
  }
  .tb-btn-primary:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 8px 28px rgba(232,68,26,0.5);
  }
  .tb-btn-primary:disabled { opacity: 0.45; cursor: not-allowed; }

  .tb-btn-outline {
    flex: 1;
    padding: 13px;
    border: 1.5px solid rgba(255,255,255,0.15);
    background: transparent;
    color: rgba(255,255,255,0.7);
    border-radius: 12px;
    font-family: 'DM Sans', sans-serif;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: border-color 0.2s, color 0.2s, background 0.2s;
  }
  .tb-btn-outline:hover {
    border-color: #E8441A;
    color: #E8441A;
    background: rgba(232,68,26,0.06);
  }

  .tb-btn-confirm {
    flex: 1;
    padding: 13px;
    border: none;
    background: #E8441A;
    color: #fff;
    border-radius: 12px;
    font-family: 'DM Sans', sans-serif;
    font-size: 14px;
    font-weight: 700;
    cursor: pointer;
    transition: transform 0.2s, box-shadow 0.2s;
    box-shadow: 0 3px 14px rgba(232,68,26,0.3);
  }
  .tb-btn-confirm:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 6px 22px rgba(232,68,26,0.5);
  }
  .tb-btn-confirm:disabled { opacity: 0.45; cursor: not-allowed; }

  .menu-item-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 0;
    border-bottom: 1px solid rgba(255,255,255,0.06);
    transition: background 0.15s;
  }
  .menu-item-row:last-child { border-bottom: none; }

  .qty-btn {
    width: 28px; height: 28px;
    border-radius: 50%;
    border: 1.5px solid rgba(255,255,255,0.15);
    background: rgba(255,255,255,0.05);
    color: #fff;
    font-size: 16px;
    cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    transition: border-color 0.2s, background 0.2s;
    line-height: 1;
  }
  .qty-btn:hover {
    border-color: #E8441A;
    background: rgba(232,68,26,0.12);
    color: #E8441A;
  }

  .add-mini-btn {
    padding: 7px 18px;
    border: none;
    background: rgba(232,68,26,0.15);
    color: #E8441A;
    border-radius: 50px;
    font-family: 'DM Sans', sans-serif;
    font-size: 12px;
    font-weight: 700;
    cursor: pointer;
    transition: background 0.2s, transform 0.15s;
    letter-spacing: 0.3px;
    white-space: nowrap;
  }
  .add-mini-btn:hover {
    background: #E8441A;
    color: #fff;
    transform: translateY(-1px);
  }

  .step-indicator {
    display: flex;
    align-items: center;
    gap: 0;
    margin-bottom: 36px;
  }
  .step-dot {
    width: 32px; height: 32px;
    border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    font-family: 'DM Sans', sans-serif;
    font-size: 13px;
    font-weight: 700;
    transition: background 0.3s, color 0.3s;
    flex-shrink: 0;
  }
  .step-line {
    flex: 1;
    height: 2px;
    transition: background 0.3s;
  }

  .slot-radio { display: none; }
  .slot-label {
    display: inline-block;
    padding: 8px 16px;
    border-radius: 50px;
    border: 1.5px solid rgba(255,255,255,0.12);
    background: rgba(255,255,255,0.04);
    color: rgba(255,255,255,0.55);
    font-family: 'DM Sans', sans-serif;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
    user-select: none;
  }
  .slot-radio:checked + .slot-label {
    background: #E8441A;
    border-color: #E8441A;
    color: #fff;
    box-shadow: 0 4px 14px rgba(232,68,26,0.35);
  }
  .slot-label:hover {
    border-color: rgba(232,68,26,0.5);
    color: #fff;
    background: rgba(232,68,26,0.08);
  }

  .home-btn {
    background: #E8441A;
    color: #fff;
    padding: 14px 40px;
    border: none;
    border-radius: 50px;
    font-family: 'DM Sans', sans-serif;
    font-size: 15px;
    font-weight: 700;
    cursor: pointer;
    transition: transform 0.2s, box-shadow 0.2s;
    box-shadow: 0 4px 20px rgba(232,68,26,0.35);
  }
  .home-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 28px rgba(232,68,26,0.5);
  }
`;

const labelStyle = {
  display: "block",
  fontSize: "11px",
  fontWeight: "700",
  letterSpacing: "1.5px",
  textTransform: "uppercase",
  color: "rgba(255,255,255,0.38)",
  marginBottom: "8px",
  fontFamily: "'DM Sans', sans-serif",
};

const sectionCard = {
  background: "#141414",
  border: "1px solid rgba(255,255,255,0.07)",
  borderRadius: "20px",
  padding: "28px",
};

function StepIndicator({ current }) {
  const steps = ["Date & Time", "Pre-order Food", "Confirmed"];
  return (
    <div className="step-indicator">
      {steps.map((label, i) => {
        const num = i + 1;
        const active = num === current;
        const done = num < current;
        return (
          <React.Fragment key={label}>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "6px",
              }}
            >
              <div
                className="step-dot"
                style={{
                  background: done
                    ? "#E8441A"
                    : active
                      ? "#E8441A"
                      : "rgba(255,255,255,0.08)",
                  color: done || active ? "#fff" : "rgba(255,255,255,0.3)",
                  border: active ? "2px solid rgba(232,68,26,0.4)" : "none",
                  boxShadow: active ? "0 0 0 4px rgba(232,68,26,0.12)" : "none",
                }}
              >
                {done ? "✓" : num}
              </div>
              <span
                style={{
                  fontFamily: "'DM Sans',sans-serif",
                  fontSize: "11px",
                  fontWeight: "600",
                  color: active ? "#E8441A" : "rgba(255,255,255,0.3)",
                  whiteSpace: "nowrap",
                }}
              >
                {label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div
                className="step-line"
                style={{
                  background:
                    num < current ? "#E8441A" : "rgba(255,255,255,0.08)",
                  marginBottom: "18px",
                }}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

function TableBookingPage() {
  const { user } = useAuth();
  const { cartItems, getTotal } = useCart();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    booking_date: "",
    booking_time: "",
    party_size: 2,
    pre_order_food: [],
  });
  const [availableSlots, setAvailableSlots] = useState([]);
  const [preOrderItems, setPreOrderItems] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showLayout, setShowLayout] = useState(false);
  const [bookingsForDate, setBookingsForDate] = useState([]);
  const [selectedDate, setSelectedDate] = useState("");

  // Inject CSS
  useEffect(() => {
    if (document.getElementById("tb-css")) return;
    const s = document.createElement("style");
    s.id = "tb-css";
    s.textContent = GLOBAL_CSS;
    document.head.appendChild(s);
    return () => {
      const el = document.getElementById("tb-css");
      if (el) el.remove();
    };
  }, []);

  useEffect(() => {
    fetchMenu();
  }, []);
  useEffect(() => {
    if (formData.booking_date && formData.booking_date.includes("-"))
      fetchAvailableSlots();
  }, [formData.booking_date]);

  const fetchMenu = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/menu");
      setMenuItems(response.data);
    } catch (error) {
      console.error("Error fetching menu:", error);
    }
  };

  const fetchAvailableSlots = async () => {
    const date = formData.booking_date;
    if (!date || date.includes(":") || date.length < 10) return;
    try {
      const response = await axios.get(
        `http://localhost:5000/api/table-bookings/available-slots?date=${date}`,
      );
      setAvailableSlots(response.data.available);
    } catch (error) {
      console.error("Error fetching slots:", error);
    }
  };

  const fetchBookingsForDate = async (date) => {
    if (
      !date ||
      date.includes(":") ||
      date.length !== 10 ||
      !date.match(/^\d{4}-\d{2}-\d{2}$/)
    )
      return;
    try {
      const response = await axios.get(
        `http://localhost:5000/api/table-bookings/date/${date}`,
      );
      setBookingsForDate(response.data);
    } catch (error) {
      console.error("Error fetching bookings:", error);
    }
  };

  const handlePreOrderAdd = (item) => {
    const existing = preOrderItems.find((i) => i.id === item.id);
    if (existing) {
      setPreOrderItems(
        preOrderItems.map((i) =>
          i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i,
        ),
      );
    } else {
      setPreOrderItems([...preOrderItems, { ...item, quantity: 1 }]);
    }
  };

  const handlePreOrderRemove = (id) => {
    const existing = preOrderItems.find((i) => i.id === id);
    if (existing && existing.quantity > 1) {
      setPreOrderItems(
        preOrderItems.map((i) =>
          i.id === id ? { ...i, quantity: i.quantity - 1 } : i,
        ),
      );
    } else {
      setPreOrderItems(preOrderItems.filter((i) => i.id !== id));
    }
  };

  const getPreOrderTotal = () =>
    preOrderItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const bookingData = {
        ...formData,
        pre_ordered_food: preOrderItems,
        pre_order_total: getPreOrderTotal(),
      };
      const response = await axios.post(
        "http://localhost:5000/api/table-bookings",
        bookingData,
      );
      if (response.data.success) {
        toast.success("Table booked successfully! Check your email.");
        setStep(3);
      }
    } catch (error) {
      toast.error(error.response?.data?.error || "Booking failed");
    } finally {
      setLoading(false);
    }
  };

  const minDate = new Date().toISOString().split("T")[0];
  const maxDate = new Date();
  maxDate.setMonth(maxDate.getMonth() + 3);
  const maxDateStr = maxDate.toISOString().split("T")[0];

  const pageWrapper = {
    minHeight: "100vh",
    background: "#0a0a0a",
    fontFamily: "'DM Sans', sans-serif",
    color: "#fff",
    padding: "40px 20px 80px",
  };

  const innerWrapper = {
    maxWidth: "680px",
    margin: "0 auto",
  };

  /* ── STEP 1 ── */
  if (step === 1) {
    return (
      <div style={pageWrapper}>
        <div style={innerWrapper} className="tb-page">
          {/* Page header */}
          <div style={{ textAlign: "center", marginBottom: "40px" }}>
            <div
              style={{
                fontSize: "12px",
                fontWeight: "700",
                letterSpacing: "4px",
                textTransform: "uppercase",
                color: "#E8441A",
                marginBottom: "12px",
                fontFamily: "'DM Sans',sans-serif",
              }}
            >
              Table Reservations
            </div>
            <h1
              style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: "clamp(32px,5vw,52px)",
                fontWeight: "700",
                color: "#fff",
                lineHeight: "1.1",
                marginBottom: "10px",
              }}
            >
              Book Your{" "}
              <span style={{ color: "#E8441A", fontStyle: "italic" }}>
                Table
              </span>
            </h1>
            <p
              style={{
                fontSize: "15px",
                color: "rgba(255,255,255,0.4)",
                maxWidth: "400px",
                margin: "0 auto",
                lineHeight: "1.7",
              }}
            >
              Reserve your spot for an unforgettable dining experience.
            </p>
          </div>

          <StepIndicator current={1} />

          <div style={sectionCard} className="tb-panel">
            <div
              style={{
                marginBottom: "10px",
                paddingBottom: "18px",
                borderBottom: "1px solid rgba(255,255,255,0.07)",
              }}
            >
              <div
                style={{
                  fontFamily: "'Playfair Display',serif",
                  fontSize: "18px",
                  fontWeight: "700",
                  color: "#fff",
                }}
              >
                Select Date &amp; Time
              </div>
              <div
                style={{
                  fontSize: "13px",
                  color: "rgba(255,255,255,0.35)",
                  marginTop: "4px",
                }}
              >
                Choose your preferred date, time, and party size
              </div>
            </div>

            {/* Date */}
            <div
              className="tb-row-0"
              style={{ marginTop: "22px", marginBottom: "20px" }}
            >
              <label style={labelStyle}>Booking Date</label>
              <input
                type="date"
                min={minDate}
                max={maxDateStr}
                value={formData.booking_date}
                onChange={(e) => {
                  const newDate = e.target.value;
                  if (newDate && newDate.length === 10) {
                    setFormData({
                      ...formData,
                      booking_date: newDate,
                      booking_time: "",
                    });
                    setSelectedDate(newDate);
                    fetchBookingsForDate(newDate);
                    setShowLayout(true);
                  }
                }}
                className="tb-input"
                required
              />
              {formData.booking_date && (
                <p
                  style={{
                    fontSize: "12px",
                    color: "#E8441A",
                    marginTop: "6px",
                    fontFamily: "'DM Sans',sans-serif",
                  }}
                >
                  📅 {formData.booking_date}
                </p>
              )}
            </div>

            {/* Time slots */}
            {formData.booking_date && (
              <div className="tb-row-1" style={{ marginBottom: "20px" }}>
                <label style={labelStyle}>Available Time Slots</label>
                {availableSlots.length > 0 ? (
                  <div
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: "10px",
                      marginTop: "4px",
                    }}
                  >
                    {availableSlots.map((slot) => (
                      <React.Fragment key={slot}>
                        <input
                          type="radio"
                          name="slot"
                          id={`slot-${slot}`}
                          value={slot}
                          checked={formData.booking_time === slot}
                          onChange={() =>
                            setFormData({ ...formData, booking_time: slot })
                          }
                          className="slot-radio"
                        />
                        <label htmlFor={`slot-${slot}`} className="slot-label">
                          {slot}
                        </label>
                      </React.Fragment>
                    ))}
                  </div>
                ) : (
                  <div
                    style={{
                      padding: "14px 18px",
                      background: "rgba(255,255,255,0.03)",
                      borderRadius: "10px",
                      fontSize: "13px",
                      color: "rgba(255,255,255,0.35)",
                    }}
                  >
                    ⏰ Loading available slots…
                  </div>
                )}
              </div>
            )}

            {/* Party size */}
            <div className="tb-row-2" style={{ marginBottom: "24px" }}>
              <label style={labelStyle}>Party Size</label>
              <select
                value={formData.party_size}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    party_size: parseInt(e.target.value),
                  })
                }
                className="tb-input"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 12, 15, 20].map((n) => (
                  <option key={n} value={n}>
                    {n} {n === 1 ? "Guest" : "Guests"}
                  </option>
                ))}
              </select>
            </div>

            {/* Table Layout */}
            {showLayout && selectedDate && (
              <div
                className="tb-row-3"
                style={{
                  marginBottom: "24px",
                  padding: "20px",
                  background: "rgba(255,255,255,0.02)",
                  borderRadius: "14px",
                  border: "1px solid rgba(255,255,255,0.06)",
                }}
              >
                <TableLayout
                  bookings={bookingsForDate}
                  selectedDate={selectedDate}
                  selectedTime={formData.booking_time}
                />
              </div>
            )}

            <div className="tb-row-4">
              <button
                onClick={() => setStep(2)}
                disabled={!formData.booking_date || !formData.booking_time}
                className="tb-btn-primary"
              >
                Continue to Pre-order Food →
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ── STEP 2 ── */
  if (step === 2) {
    return (
      <div style={pageWrapper}>
        <div
          style={{ maxWidth: "960px", margin: "0 auto" }}
          className="tb-page"
        >
          {/* Page header */}
          <div style={{ textAlign: "center", marginBottom: "40px" }}>
            <div
              style={{
                fontSize: "12px",
                fontWeight: "700",
                letterSpacing: "4px",
                textTransform: "uppercase",
                color: "#E8441A",
                marginBottom: "12px",
                fontFamily: "'DM Sans',sans-serif",
              }}
            >
              Table Reservations
            </div>
            <h1
              style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: "clamp(28px,4vw,46px)",
                fontWeight: "700",
                color: "#fff",
                lineHeight: "1.1",
                marginBottom: "10px",
              }}
            >
              Pre-order{" "}
              <span style={{ color: "#E8441A", fontStyle: "italic" }}>
                Food
              </span>
            </h1>
            <p
              style={{
                fontSize: "14px",
                color: "rgba(255,255,255,0.4)",
                lineHeight: "1.7",
              }}
            >
              Optional — add dishes to your booking so they're ready when you
              arrive.
            </p>
          </div>

          <StepIndicator current={2} />

          {/* Booking summary pill */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              flexWrap: "wrap",
              background: "rgba(232,68,26,0.08)",
              border: "1px solid rgba(232,68,26,0.2)",
              borderRadius: "12px",
              padding: "12px 20px",
              marginBottom: "28px",
              fontFamily: "'DM Sans',sans-serif",
              fontSize: "13px",
              color: "rgba(255,255,255,0.7)",
            }}
          >
            <span style={{ color: "#E8441A", fontSize: "16px" }}>📅</span>
            <span>
              <strong style={{ color: "#fff" }}>{formData.booking_date}</strong>
            </span>
            <span style={{ color: "rgba(255,255,255,0.25)" }}>·</span>
            <span>
              <strong style={{ color: "#fff" }}>{formData.booking_time}</strong>
            </span>
            <span style={{ color: "rgba(255,255,255,0.25)" }}>·</span>
            <span>
              {formData.party_size}{" "}
              {formData.party_size === 1 ? "Guest" : "Guests"}
            </span>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "24px",
            }}
          >
            {/* Menu list */}
            <div
              style={{ ...sectionCard, maxHeight: "520px", overflowY: "auto" }}
            >
              <div
                style={{
                  fontFamily: "'Playfair Display',serif",
                  fontSize: "17px",
                  fontWeight: "700",
                  color: "#fff",
                  marginBottom: "18px",
                }}
              >
                🍽️ &nbsp;Menu
              </div>
              {menuItems.map((item) => (
                <div key={item.id} className="menu-item-row">
                  <div>
                    <div
                      style={{
                        fontFamily: "'DM Sans',sans-serif",
                        fontSize: "14px",
                        fontWeight: "600",
                        color: "#fff",
                        marginBottom: "3px",
                      }}
                    >
                      {item.name}
                    </div>
                    <div
                      style={{
                        fontFamily: "'DM Sans',sans-serif",
                        fontSize: "13px",
                        color: "#E8441A",
                        fontWeight: "700",
                      }}
                    >
                      ${item.price}
                    </div>
                  </div>
                  <button
                    className="add-mini-btn"
                    onClick={() => handlePreOrderAdd(item)}
                  >
                    + Add
                  </button>
                </div>
              ))}
            </div>

            {/* Pre-order cart */}
            <div style={sectionCard}>
              <div
                style={{
                  fontFamily: "'Playfair Display',serif",
                  fontSize: "17px",
                  fontWeight: "700",
                  color: "#fff",
                  marginBottom: "18px",
                }}
              >
                🛒 &nbsp;Your Pre-order
              </div>

              {preOrderItems.length === 0 ? (
                <div style={{ textAlign: "center", padding: "40px 20px" }}>
                  <div style={{ fontSize: "40px", marginBottom: "12px" }}>
                    🍽️
                  </div>
                  <div
                    style={{
                      fontFamily: "'DM Sans',sans-serif",
                      fontSize: "14px",
                      color: "rgba(255,255,255,0.3)",
                    }}
                  >
                    No items added yet
                  </div>
                </div>
              ) : (
                <>
                  <div
                    style={{
                      maxHeight: "260px",
                      overflowY: "auto",
                      marginBottom: "20px",
                    }}
                  >
                    {preOrderItems.map((item) => (
                      <div
                        key={item.id}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          padding: "10px 0",
                          borderBottom: "1px solid rgba(255,255,255,0.06)",
                        }}
                      >
                        <div>
                          <div
                            style={{
                              fontFamily: "'DM Sans',sans-serif",
                              fontSize: "13px",
                              fontWeight: "600",
                              color: "#fff",
                            }}
                          >
                            {item.name}
                          </div>
                          <div
                            style={{
                              fontFamily: "'DM Sans',sans-serif",
                              fontSize: "12px",
                              color: "rgba(255,255,255,0.35)",
                              marginTop: "2px",
                            }}
                          >
                            ${item.price} each
                          </div>
                        </div>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "10px",
                          }}
                        >
                          <button
                            className="qty-btn"
                            onClick={() => handlePreOrderRemove(item.id)}
                          >
                            −
                          </button>
                          <span
                            style={{
                              fontFamily: "'DM Sans',sans-serif",
                              fontSize: "14px",
                              fontWeight: "700",
                              color: "#fff",
                              minWidth: "16px",
                              textAlign: "center",
                            }}
                          >
                            {item.quantity}
                          </span>
                          <button
                            className="qty-btn"
                            onClick={() => handlePreOrderAdd(item)}
                          >
                            +
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Total */}
                  <div
                    style={{
                      padding: "14px 18px",
                      background: "rgba(232,68,26,0.08)",
                      border: "1px solid rgba(232,68,26,0.15)",
                      borderRadius: "12px",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: "20px",
                    }}
                  >
                    <span
                      style={{
                        fontFamily: "'DM Sans',sans-serif",
                        fontSize: "13px",
                        fontWeight: "600",
                        color: "rgba(255,255,255,0.6)",
                      }}
                    >
                      Pre-order Total
                    </span>
                    <span
                      style={{
                        fontFamily: "'Playfair Display',serif",
                        fontSize: "20px",
                        fontWeight: "700",
                        color: "#E8441A",
                      }}
                    >
                      ${getPreOrderTotal().toFixed(2)}
                    </span>
                  </div>
                </>
              )}

              <div
                style={{
                  display: "flex",
                  gap: "12px",
                  marginTop: preOrderItems.length === 0 ? "20px" : "0",
                }}
              >
                <button className="tb-btn-outline" onClick={() => setStep(1)}>
                  ← Back
                </button>
                <button
                  className="tb-btn-confirm"
                  onClick={handleSubmit}
                  disabled={loading}
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
                      Booking…
                    </span>
                  ) : (
                    "✅ Confirm Booking"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ── STEP 3: SUCCESS ── */
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0a0a0a",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
        fontFamily: "'DM Sans',sans-serif",
      }}
    >
      <div style={{ textAlign: "center", maxWidth: "460px" }}>
        {/* Big checkmark */}
        <div
          className="tb-success"
          style={{
            width: "100px",
            height: "100px",
            borderRadius: "50%",
            background: "rgba(232,68,26,0.12)",
            border: "2px solid rgba(232,68,26,0.3)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 28px",
            fontSize: "48px",
          }}
        >
          ✅
        </div>

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
          Booking Confirmed
        </div>
        <h2
          style={{
            fontFamily: "'Playfair Display',serif",
            fontSize: "clamp(28px,4vw,40px)",
            fontWeight: "700",
            color: "#fff",
            marginBottom: "14px",
            lineHeight: "1.1",
          }}
        >
          Your Table is{" "}
          <span style={{ color: "#E8441A", fontStyle: "italic" }}>
            Reserved!
          </span>
        </h2>
        <p
          style={{
            fontSize: "15px",
            color: "rgba(255,255,255,0.45)",
            lineHeight: "1.7",
            marginBottom: "10px",
          }}
        >
          A confirmation email has been sent to your email address.
        </p>
        <p
          style={{
            fontSize: "13px",
            color: "rgba(232,68,26,0.8)",
            marginBottom: "32px",
          }}
        >
          📍 Your table has been assigned automatically!
        </p>

        {/* Booking details pill */}
        <div
          style={{
            display: "inline-flex",
            gap: "20px",
            background: "#141414",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: "14px",
            padding: "14px 28px",
            marginBottom: "32px",
            flexWrap: "wrap",
            justifyContent: "center",
          }}
        >
          {[
            ["📅", formData.booking_date],
            ["🕐", formData.booking_time],
            ["👥", `${formData.party_size} Guests`],
          ].map(([icon, val]) => (
            <div key={val} style={{ textAlign: "center" }}>
              <div style={{ fontSize: "20px", marginBottom: "4px" }}>
                {icon}
              </div>
              <div
                style={{ fontSize: "13px", fontWeight: "600", color: "#fff" }}
              >
                {val}
              </div>
            </div>
          ))}
        </div>

        <div>
          <button
            className="home-btn"
            onClick={() => (window.location.href = "/")}
          >
            Go to Home
          </button>
        </div>
      </div>
    </div>
  );
}

export default TableBookingPage;
