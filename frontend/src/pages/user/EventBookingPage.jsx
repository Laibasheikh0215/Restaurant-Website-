import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../../contexts/AuthContext";
import toast from "react-hot-toast";
import EventCalendar from "../../components/EventCalendar";

// GLOBAL CSS IN JS
const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;1,700&family=DM+Sans:wght@400;500;600;700&display=swap');
  *, *::before, *::after { box-sizing: border-box; }

  @keyframes fadeSlideUp {
    from { opacity: 0; transform: translateY(28px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes navSlideDown {
    from { opacity: 0; transform: translateY(-20px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes spin { to { transform: rotate(360deg); } }
  @keyframes successPop {
    0%   { opacity: 0; transform: scale(0.8); }
    70%  { transform: scale(1.05); }
    100% { opacity: 1; transform: scale(1); }
  }
  @keyframes confetti {
    0%   { opacity: 1; transform: translateY(0) rotate(0deg); }
    100% { opacity: 0; transform: translateY(60px) rotate(360deg); }
  }

  .nav-bar       { animation: navSlideDown 0.5s ease both; }
  .page-header   { animation: fadeSlideUp 0.7s ease 0.1s both; }
  .step-content  { animation: fadeSlideUp 0.5s ease both; }
  .success-card  { animation: successPop 0.6s cubic-bezier(0.22,1,0.36,1) both; }

  .nav-link:hover        { color: #fff !important; }
  .footer-link:hover     { color: rgba(255,255,255,0.7) !important; }

  .location-card {
    background: #141414;
    border: 1.5px solid rgba(255,255,255,0.07);
    border-radius: 20px;
    padding: 28px;
    cursor: pointer;
    transition: transform 0.25s cubic-bezier(0.22,1,0.36,1), border-color 0.25s, box-shadow 0.25s;
  }
  .location-card:hover {
    transform: translateY(-4px);
    border-color: rgba(232,68,26,0.35);
    box-shadow: 0 16px 40px rgba(0,0,0,0.4);
  }
  .location-card.selected {
    border-color: #E8441A;
    background: rgba(232,68,26,0.06);
    box-shadow: 0 0 0 1px rgba(232,68,26,0.3), 0 16px 40px rgba(0,0,0,0.4);
  }

  .step-pill {
    display: flex; align-items: center; gap: 10px;
    font-family: 'DM Sans', sans-serif; font-size: 13px; font-weight: 600;
    letter-spacing: 0.5px;
  }
  .step-circle {
    width: 32px; height: 32px; border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    font-size: 13px; font-weight: 700;
    transition: background 0.3s, color 0.3s, box-shadow 0.3s;
  }
  .step-connector {
    flex: 1; height: 1.5px;
    background: rgba(255,255,255,0.08);
    transition: background 0.3s;
  }
  .step-connector.done { background: #E8441A; }

  .form-input {
    width: 100%;
    background: #1a1a1a;
    border: 1.5px solid rgba(255,255,255,0.08);
    border-radius: 12px;
    padding: 14px 18px;
    font-family: 'DM Sans', sans-serif;
    font-size: 14px;
    color: #fff;
    outline: none;
    transition: border-color 0.2s;
  }
  .form-input:focus { border-color: rgba(232,68,26,0.5); }
  .form-input::placeholder { color: rgba(255,255,255,0.25); }
  .form-input::-webkit-inner-spin-button { opacity: 0; }

  .btn-primary-event {
    background: #E8441A;
    color: #fff;
    padding: 14px 36px;
    border-radius: 50px;
    border: none;
    font-family: 'DM Sans', sans-serif;
    font-size: 15px;
    font-weight: 700;
    cursor: pointer;
    box-shadow: 0 4px 20px rgba(232,68,26,0.4);
    transition: transform 0.2s, box-shadow 0.2s;
    letter-spacing: 0.3px;
  }
  .btn-primary-event:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 8px 32px rgba(232,68,26,0.55);
  }
  .btn-primary-event:disabled {
    background: #3a3a3a;
    box-shadow: none;
    cursor: not-allowed;
    color: rgba(255,255,255,0.3);
  }

  .btn-outline-event {
    background: transparent;
    color: rgba(255,255,255,0.7);
    padding: 14px 36px;
    border-radius: 50px;
    border: 1.5px solid rgba(255,255,255,0.15);
    font-family: 'DM Sans', sans-serif;
    font-size: 15px;
    font-weight: 600;
    cursor: pointer;
    transition: border-color 0.2s, color 0.2s, background 0.2s;
  }
  .btn-outline-event:hover {
    border-color: rgba(255,255,255,0.35);
    color: #fff;
    background: rgba(255,255,255,0.04);
  }

  .summary-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 0;
    border-bottom: 1px solid rgba(255,255,255,0.06);
    font-family: 'DM Sans', sans-serif;
    font-size: 14px;
  }
  .summary-row:last-child { border-bottom: none; }

  .date-badge {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    background: rgba(232,68,26,0.1);
    border: 1px solid rgba(232,68,26,0.25);
    border-radius: 50px;
    padding: 8px 18px;
    font-family: 'DM Sans', sans-serif;
    font-size: 13px;
    font-weight: 600;
    color: #E8441A;
  }

  .warn-banner {
    display: flex;
    align-items: center;
    gap: 10px;
    background: rgba(239,68,68,0.08);
    border: 1px solid rgba(239,68,68,0.25);
    border-radius: 12px;
    padding: 14px 18px;
    font-family: 'DM Sans', sans-serif;
    font-size: 13px;
    color: #f87171;
    margin-top: 12px;
  }

  .info-banner {
    display: flex;
    align-items: center;
    gap: 10px;
    background: rgba(251,191,36,0.08);
    border: 1px solid rgba(251,191,36,0.2);
    border-radius: 12px;
    padding: 14px 18px;
    font-family: 'DM Sans', sans-serif;
    font-size: 13px;
    color: #fbbf24;
  }

  .footer-bar {
    background: #0a0a0a;
    padding: 24px 60px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 12px;
    border-top: 1px solid rgba(255,255,255,0.05);
  }

  .capacity-bar-bg {
    height: 4px;
    background: rgba(255,255,255,0.08);
    border-radius: 99px;
    overflow: hidden;
    margin-top: 10px;
  }
  .capacity-bar-fill {
    height: 100%;
    background: linear-gradient(90deg, #E8441A, #ff6b3d);
    border-radius: 99px;
    transition: width 0.4s ease;
  }
`;

function EventBookingPage() {
  const { user } = useAuth();
  const [locations, setLocations] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [bookingData, setBookingData] = useState({
    event_location_id: "",
    booking_date: "",
    event_name: "",
    number_of_guests: 1,
    total_amount: 0,
  });
  const [bookedDates, setBookedDates] = useState([]);
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (document.getElementById("epicure-event-css")) return;
    const s = document.createElement("style");
    s.id = "epicure-event-css";
    s.textContent = GLOBAL_CSS;
    document.head.appendChild(s);
    return () => {
      const el = document.getElementById("epicure-event-css");
      if (el) el.remove();
    };
  }, []);

  useEffect(() => {
    fetchLocations();
  }, []);
  useEffect(() => {
    if (selectedLocation && bookingData.booking_date) checkAvailability();
  }, [selectedLocation, bookingData.booking_date]);

  const fetchLocations = async () => {
    try {
      const response = await axios.get(
        "http://localhost:5000/api/event-locations",
      );
      setLocations(response.data);
    } catch (error) {
      console.error("Error fetching locations:", error);
    }
  };

  const checkAvailability = async () => {
    try {
      const response = await axios.get(
        `http://localhost:5000/api/event-locations/${selectedLocation}/availability`,
      );
      setBookedDates(response.data.booked_dates);
    } catch (error) {
      console.error("Error checking availability:", error);
    }
  };

  const calculateTotal = (guests, locationId) => {
    const location = locations.find((l) => l.id === locationId);
    if (!location) return 0;
    const pricePerGuest = 25;
    return guests * pricePerGuest;
  };

  const handleLocationSelect = (location) => {
    setSelectedLocation(location.id);
    setBookingData({
      ...bookingData,
      event_location_id: location.id,
      total_amount: calculateTotal(bookingData.number_of_guests, location.id),
    });
  };

  const handleDateSelect = (date) => {
    setBookingData({
      ...bookingData,
      booking_date: date,
      total_amount: calculateTotal(
        bookingData.number_of_guests,
        selectedLocation,
      ),
    });
  };

  const handleGuestsChange = (guests) => {
    setBookingData({
      ...bookingData,
      number_of_guests: guests,
      total_amount: calculateTotal(guests, selectedLocation),
    });
  };

  const isDateBooked = (date) => bookedDates.includes(date);

  const handleSubmit = async () => {
    if (!bookingData.booking_date) {
      toast.error("Please select a date");
      return;
    }
    if (isDateBooked(bookingData.booking_date)) {
      toast.error("This date is already booked");
      return;
    }
    setLoading(true);
    try {
      const response = await axios.post(
        "http://localhost:5000/api/event-bookings",
        bookingData,
      );
      if (response.data.success) {
        toast.success("Event booked successfully! Check your email.");
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
  maxDate.setMonth(maxDate.getMonth() + 6);

  /* ── STEP INDICATOR ── */
  const StepBar = () => (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "0",
        maxWidth: "360px",
        margin: "0 auto 48px",
      }}
    >
      {[
        { n: 1, label: "Venue & Date" },
        { n: 2, label: "Details" },
        { n: 3, label: "Confirmed" },
      ].map((s, i, arr) => (
        <React.Fragment key={s.n}>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <div
              className="step-circle"
              style={{
                background: step >= s.n ? "#E8441A" : "rgba(255,255,255,0.06)",
                color: step >= s.n ? "#fff" : "rgba(255,255,255,0.3)",
                boxShadow:
                  step === s.n ? "0 0 0 4px rgba(232,68,26,0.2)" : "none",
              }}
            >
              {step > s.n ? "✓" : s.n}
            </div>
            <span
              style={{
                fontFamily: "'DM Sans',sans-serif",
                fontSize: "11px",
                fontWeight: "600",
                letterSpacing: "0.5px",
                color: step >= s.n ? "#E8441A" : "rgba(255,255,255,0.25)",
                whiteSpace: "nowrap",
              }}
            >
              {s.label}
            </span>
          </div>
          {i < arr.length - 1 && (
            <div
              className={`step-connector${step > s.n ? " done" : ""}`}
              style={{ margin: "0 4px", marginBottom: "18px" }}
            />
          )}
        </React.Fragment>
      ))}
    </div>
  );

  /* ── STEP 1 ── */
  if (step === 1) {
    return (
      <div style={{ minHeight: "100vh", background: "#0a0a0a", color: "#fff" }}>
        <nav
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            zIndex: 1000,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "18px 60px",
            background: "rgba(10,10,10,0.88)",
            backdropFilter: "blur(14px)",
            borderBottom: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          <a
            href="/"
            style={{
              fontSize: "22px",
              fontFamily: "'Playfair Display', serif",
              fontWeight: "700",
              letterSpacing: "2px",
              color: "#fff",
              textDecoration: "none",
            }}
          >
            <span style={{ color: "#E8441A" }}>美食家大廳</span> Epicure{" "}
            <span style={{ color: "#E8441A" }}>Hall</span>
          </a>

          <ul
            style={{
              display: "flex",
              gap: "32px",
              listStyle: "none",
              fontFamily: "'DM Sans', sans-serif",
              fontSize: "14px",
              fontWeight: "500",
              margin: 0,
              padding: 0,
            }}
          >
            {[
              { name: "Home", path: "/" },
              { name: "Menu", path: "/menu" },
              { name: "Book Tables", path: "/table-booking" },
              { name: "Events", path: "/event-booking" },
              { name: "My Bookings", path: "/my-bookings" },
            ].map((link) => (
              <li key={link.name}>
                <a
                  href={link.path}
                  style={{
                    color:
                      link.path === window.location.pathname
                        ? "#fff"
                        : "rgba(255,255,255,0.7)",
                    textDecoration: "none",
                    transition: "color 0.2s",
                  }}
                >
                  {link.name}
                </a>
              </li>
            ))}
          </ul>

          {user ? (
            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
              <Link
                to="/cart"
                style={{
                  fontSize: "20px",
                  textDecoration: "none",
                  color: "rgba(255,255,255,0.8)",
                  position: "relative",
                }}
              >
                🛒
                {cartCount > 0 && (
                  <span
                    style={{
                      position: "absolute",
                      top: "-6px",
                      right: "-8px",
                      background: "#E8441A",
                      color: "#fff",
                      width: "18px",
                      height: "18px",
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "11px",
                      fontWeight: "700",
                    }}
                  >
                    {cartCount}
                  </span>
                )}
              </Link>
              <ProfileDropdown user={user} onLogout={handleLogout} />
            </div>
          ) : (
            <div>
              <Link
                to="/login"
                style={{
                  background: "#E8441A",
                  color: "#fff",
                  padding: "10px 24px",
                  borderRadius: "50px",
                  textDecoration: "none",
                  fontSize: "14px",
                  fontWeight: "600",
                  marginLeft: "12px",
                }}
              >
                Sign In
              </Link>
              <Link
                to="/register"
                style={{
                  background: "transparent",
                  border: "1px solid rgba(255,255,255,0.3)",
                  color: "#fff",
                  padding: "10px 24px",
                  borderRadius: "50px",
                  textDecoration: "none",
                  fontSize: "14px",
                  fontWeight: "600",
                }}
              >
                Sign Up
              </Link>
            </div>
          )}
        </nav>

        <div
          className="page-header"
          style={{
            paddingTop: "130px",
            paddingBottom: "48px",
            textAlign: "center",
            background: "linear-gradient(180deg,#0f0f0f 0%,#0a0a0a 100%)",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%,-50%)",
              width: "600px",
              height: "300px",
              background:
                "radial-gradient(ellipse,rgba(232,68,26,0.07) 0%,transparent 70%)",
              pointerEvents: "none",
            }}
          />
          <div style={{ position: "relative", zIndex: 1 }}>
            <div
              style={{
                fontSize: "12px",
                fontWeight: "700",
                letterSpacing: "4px",
                textTransform: "uppercase",
                color: "#E8441A",
                marginBottom: "16px",
                fontFamily: "'DM Sans',sans-serif",
              }}
            >
              Private Events
            </div>
            <h1
              style={{
                fontFamily: "'Playfair Display',serif",
                fontSize: "clamp(36px,5vw,60px)",
                fontWeight: "700",
                color: "#fff",
                marginBottom: "16px",
                letterSpacing: "-1px",
              }}
            >
              Book an{" "}
              <span style={{ color: "#E8441A", fontStyle: "italic" }}>
                Event
              </span>
            </h1>
            <p
              style={{
                fontFamily: "'DM Sans',sans-serif",
                fontSize: "15px",
                color: "rgba(255,255,255,0.45)",
                maxWidth: "480px",
                margin: "0 auto",
                lineHeight: "1.7",
              }}
            >
              Celebrate life's finest moments with us — our venues set the stage
              for memories that last.
            </p>
          </div>
        </div>

        <div
          style={{
            maxWidth: "840px",
            margin: "0 auto",
            padding: "0 40px 80px",
          }}
          className="step-content"
        >
          <StepBar />

          {/* Calendar */}
          <div
            style={{
              background: "#141414",
              border: "1px solid rgba(255,255,255,0.07)",
              borderRadius: "20px",
              padding: "28px",
              marginBottom: "24px",
            }}
          >
            <div
              style={{
                fontFamily: "'DM Sans',sans-serif",
                fontSize: "12px",
                fontWeight: "700",
                letterSpacing: "3px",
                textTransform: "uppercase",
                color: "#E8441A",
                marginBottom: "16px",
              }}
            >
              Select a Date
            </div>
            <EventCalendar onDateSelect={handleDateSelect} />
          </div>

          {/* Date badge */}
          {bookingData.booking_date ? (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                background: "rgba(232,68,26,0.06)",
                border: "1px solid rgba(232,68,26,0.2)",
                borderRadius: "14px",
                padding: "16px 20px",
                marginBottom: "24px",
              }}
            >
              <div className="date-badge">📅 {bookingData.booking_date}</div>
              <button
                onClick={() =>
                  setBookingData({ ...bookingData, booking_date: "" })
                }
                style={{
                  background: "rgba(239,68,68,0.1)",
                  border: "1px solid rgba(239,68,68,0.25)",
                  borderRadius: "50px",
                  color: "#f87171",
                  fontFamily: "'DM Sans',sans-serif",
                  fontSize: "12px",
                  fontWeight: "600",
                  padding: "6px 14px",
                  cursor: "pointer",
                  transition: "background 0.2s",
                }}
              >
                Clear ✕
              </button>
            </div>
          ) : (
            <div className="info-banner" style={{ marginBottom: "24px" }}>
              ⚠️ Please select a date from the calendar above to continue
            </div>
          )}

          {/* Locations */}
          <div
            style={{
              fontFamily: "'DM Sans',sans-serif",
              fontSize: "12px",
              fontWeight: "700",
              letterSpacing: "3px",
              textTransform: "uppercase",
              color: "rgba(255,255,255,0.4)",
              marginBottom: "16px",
            }}
          >
            Choose Your Venue
          </div>
          <div style={{ display: "grid", gap: "16px" }}>
            {locations.map((location) => (
              <div
                key={location.id}
                className={`location-card${selectedLocation === location.id ? " selected" : ""}`}
                onClick={() => handleLocationSelect(location)}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    justifyContent: "space-between",
                    gap: "16px",
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                        marginBottom: "8px",
                      }}
                    >
                      <div
                        style={{
                          width: "36px",
                          height: "36px",
                          borderRadius: "10px",
                          background:
                            selectedLocation === location.id
                              ? "#E8441A"
                              : "rgba(255,255,255,0.06)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "16px",
                          transition: "background 0.25s",
                          flexShrink: 0,
                        }}
                      >
                        🏛️
                      </div>
                      <h3
                        style={{
                          fontFamily: "'Playfair Display',serif",
                          fontSize: "18px",
                          fontWeight: "700",
                          color: "#fff",
                          margin: 0,
                        }}
                      >
                        {location.name}
                      </h3>
                    </div>
                    <p
                      style={{
                        fontFamily: "'DM Sans',sans-serif",
                        fontSize: "13px",
                        color: "rgba(255,255,255,0.45)",
                        margin: "0 0 12px",
                        lineHeight: "1.5",
                      }}
                    >
                      {location.address}
                    </p>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "16px",
                      }}
                    >
                      <span
                        style={{
                          fontFamily: "'DM Sans',sans-serif",
                          fontSize: "12px",
                          color: "rgba(255,255,255,0.35)",
                        }}
                      >
                        👥 Capacity:{" "}
                        <strong style={{ color: "rgba(255,255,255,0.7)" }}>
                          {location.capacity} guests
                        </strong>
                      </span>
                    </div>
                    <div
                      className="capacity-bar-bg"
                      style={{ maxWidth: "200px" }}
                    >
                      <div
                        className="capacity-bar-fill"
                        style={{
                          width: `${Math.min((bookingData.number_of_guests / location.capacity) * 100, 100)}%`,
                        }}
                      />
                    </div>
                  </div>
                  <div
                    style={{
                      flexShrink: 0,
                      width: "22px",
                      height: "22px",
                      borderRadius: "50%",
                      border: `2px solid ${selectedLocation === location.id ? "#E8441A" : "rgba(255,255,255,0.15)"}`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      transition: "border-color 0.25s, background 0.25s",
                      background:
                        selectedLocation === location.id
                          ? "#E8441A"
                          : "transparent",
                      marginTop: "4px",
                    }}
                  >
                    {selectedLocation === location.id && (
                      <div
                        style={{
                          width: "8px",
                          height: "8px",
                          borderRadius: "50%",
                          background: "#fff",
                        }}
                      />
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div
            style={{
              marginTop: "36px",
              display: "flex",
              justifyContent: "center",
            }}
          >
            {selectedLocation && bookingData.booking_date ? (
              <button className="btn-primary-event" onClick={() => setStep(2)}>
                Continue to Event Details →
              </button>
            ) : (
              <p
                style={{
                  fontFamily: "'DM Sans',sans-serif",
                  fontSize: "13px",
                  color: "rgba(255,255,255,0.3)",
                }}
              >
                {!selectedLocation && !bookingData.booking_date
                  ? "Select a date and venue to continue"
                  : !selectedLocation
                    ? "Select a venue to continue"
                    : "Select a date to continue"}
              </p>
            )}
          </div>
        </div>

        <footer className="footer-bar">
          <span
            style={{
              fontFamily: "'DM Sans',sans-serif",
              fontSize: "13px",
              color: "rgba(255,255,255,0.4)",
            }}
          >
            © 2026 Epicure Hall. All rights reserved.
          </span>
          <div style={{ display: "flex", gap: "24px" }}>
            {["Privacy Policy", "Terms", "Sitemap"].map((l) => (
              <a
                key={l}
                href="#"
                className="footer-link"
                style={{
                  fontFamily: "'DM Sans',sans-serif",
                  fontSize: "13px",
                  color: "rgba(255,255,255,0.4)",
                  textDecoration: "none",
                  transition: "color 0.2s",
                }}
              >
                {l}
              </a>
            ))}
          </div>
        </footer>
      </div>
    );
  }

  /* ── STEP 2 ── */
  if (step === 2) {
    const location = locations.find((l) => l.id === selectedLocation);
    return (
      <div style={{ minHeight: "100vh", background: "#0a0a0a", color: "#fff" }}>
        <nav
          className="nav-bar"
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            zIndex: 1000,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "18px 60px",
            background: "rgba(10,10,10,0.88)",
            backdropFilter: "blur(14px)",
            borderBottom: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          <a
            href="/"
            style={{
              fontSize: "22px",
              fontFamily: "'Playfair Display',serif",
              fontWeight: "700",
              letterSpacing: "2px",
              color: "#fff",
              textDecoration: "none",
            }}
          >
            <span style={{ color: "#E8441A" }}>美食家大廳</span> Epicure{" "}
            <span style={{ color: "#E8441A" }}>Hall</span>
          </a>
          <ul
            style={{
              display: "flex",
              gap: "32px",
              listStyle: "none",
              fontFamily: "'DM Sans',sans-serif",
              fontSize: "14px",
              fontWeight: "500",
            }}
          >
            {["Home", "Menu", "Reservations", "Events", "Contact"].map((l) => (
              <li key={l}>
                <a
                  href={l === "Home" ? "/" : l === "Menu" ? "/menu" : "#"}
                  className="nav-link"
                  style={{
                    color: l === "Events" ? "#fff" : "rgba(255,255,255,0.7)",
                    textDecoration: "none",
                    transition: "color 0.2s",
                  }}
                >
                  {l}
                </a>
              </li>
            ))}
          </ul>
          <div />
        </nav>

        <div
          className="page-header"
          style={{
            paddingTop: "130px",
            paddingBottom: "48px",
            textAlign: "center",
            background: "linear-gradient(180deg,#0f0f0f 0%,#0a0a0a 100%)",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%,-50%)",
              width: "600px",
              height: "300px",
              background:
                "radial-gradient(ellipse,rgba(232,68,26,0.07) 0%,transparent 70%)",
              pointerEvents: "none",
            }}
          />
          <div style={{ position: "relative", zIndex: 1 }}>
            <div
              style={{
                fontSize: "12px",
                fontWeight: "700",
                letterSpacing: "4px",
                textTransform: "uppercase",
                color: "#E8441A",
                marginBottom: "16px",
                fontFamily: "'DM Sans',sans-serif",
              }}
            >
              Step 2 of 2
            </div>
            <h1
              style={{
                fontFamily: "'Playfair Display',serif",
                fontSize: "clamp(32px,4vw,52px)",
                fontWeight: "700",
                color: "#fff",
                marginBottom: "16px",
                letterSpacing: "-1px",
              }}
            >
              Event{" "}
              <span style={{ color: "#E8441A", fontStyle: "italic" }}>
                Details
              </span>
            </h1>
          </div>
        </div>

        <div
          style={{
            maxWidth: "640px",
            margin: "0 auto",
            padding: "0 40px 80px",
          }}
          className="step-content"
        >
          <StepBar />

          {/* Summary card */}
          <div
            style={{
              background: "#141414",
              border: "1px solid rgba(255,255,255,0.07)",
              borderRadius: "20px",
              padding: "24px",
              marginBottom: "24px",
            }}
          >
            <div
              style={{
                fontFamily: "'DM Sans',sans-serif",
                fontSize: "12px",
                fontWeight: "700",
                letterSpacing: "3px",
                textTransform: "uppercase",
                color: "rgba(255,255,255,0.3)",
                marginBottom: "16px",
              }}
            >
              Your Selection
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: "12px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  gap: "16px",
                  alignItems: "center",
                  flexWrap: "wrap",
                }}
              >
                <div className="date-badge">📅 {bookingData.booking_date}</div>
                <div
                  style={{
                    fontFamily: "'DM Sans',sans-serif",
                    fontSize: "14px",
                    color: "rgba(255,255,255,0.6)",
                  }}
                >
                  🏛️ {location?.name}
                </div>
              </div>
              <button
                onClick={() => setStep(1)}
                style={{
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "50px",
                  color: "rgba(255,255,255,0.5)",
                  fontFamily: "'DM Sans',sans-serif",
                  fontSize: "12px",
                  fontWeight: "600",
                  padding: "6px 14px",
                  cursor: "pointer",
                  transition: "all 0.2s",
                }}
              >
                Change ↩
              </button>
            </div>
            {isDateBooked(bookingData.booking_date) && (
              <div className="warn-banner">
                ❌ This date is already booked for this location. Please go back
                and select another date.
              </div>
            )}
          </div>

          {/* Form */}
          <div
            style={{
              background: "#141414",
              border: "1px solid rgba(255,255,255,0.07)",
              borderRadius: "20px",
              padding: "32px",
            }}
          >
            {/* Event Name */}
            <div style={{ marginBottom: "24px" }}>
              <label
                style={{
                  display: "block",
                  fontFamily: "'DM Sans',sans-serif",
                  fontSize: "13px",
                  fontWeight: "600",
                  letterSpacing: "0.5px",
                  color: "rgba(255,255,255,0.5)",
                  marginBottom: "10px",
                  textTransform: "uppercase",
                  letterSpacing: "1px",
                }}
              >
                Event Name
              </label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g., Birthday Party, Wedding Reception, Corporate Event"
                value={bookingData.event_name}
                onChange={(e) =>
                  setBookingData({ ...bookingData, event_name: e.target.value })
                }
              />
            </div>

            {/* Guests */}
            <div style={{ marginBottom: "28px" }}>
              <label
                style={{
                  display: "block",
                  fontFamily: "'DM Sans',sans-serif",
                  fontSize: "13px",
                  fontWeight: "600",
                  color: "rgba(255,255,255,0.5)",
                  marginBottom: "10px",
                  textTransform: "uppercase",
                  letterSpacing: "1px",
                }}
              >
                Number of Guests
              </label>
              <input
                type="number"
                className="form-input"
                min="1"
                max={location?.capacity}
                value={bookingData.number_of_guests}
                onChange={(e) => handleGuestsChange(parseInt(e.target.value))}
              />
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginTop: "10px",
                }}
              >
                <p
                  style={{
                    fontFamily: "'DM Sans',sans-serif",
                    fontSize: "12px",
                    color: "rgba(255,255,255,0.25)",
                    margin: 0,
                  }}
                >
                  Maximum: {location?.capacity} guests
                </p>
                <p
                  style={{
                    fontFamily: "'DM Sans',sans-serif",
                    fontSize: "12px",
                    color: "#E8441A",
                    margin: 0,
                    fontWeight: "600",
                  }}
                >
                  $25 per guest
                </p>
              </div>
              <div className="capacity-bar-bg">
                <div
                  className="capacity-bar-fill"
                  style={{
                    width: `${Math.min((bookingData.number_of_guests / (location?.capacity || 1)) * 100, 100)}%`,
                  }}
                />
              </div>
            </div>

            {/* Price Summary */}
            <div
              style={{
                background: "#0f0f0f",
                border: "1px solid rgba(255,255,255,0.06)",
                borderRadius: "14px",
                padding: "20px",
                marginBottom: "28px",
              }}
            >
              <div
                style={{
                  fontFamily: "'DM Sans',sans-serif",
                  fontSize: "12px",
                  fontWeight: "700",
                  letterSpacing: "3px",
                  textTransform: "uppercase",
                  color: "rgba(255,255,255,0.25)",
                  marginBottom: "14px",
                }}
              >
                Price Summary
              </div>
              <div className="summary-row">
                <span style={{ color: "rgba(255,255,255,0.5)" }}>
                  Price per guest
                </span>
                <span
                  style={{ color: "rgba(255,255,255,0.7)", fontWeight: "600" }}
                >
                  $25.00
                </span>
              </div>
              <div className="summary-row">
                <span style={{ color: "rgba(255,255,255,0.5)" }}>Guests</span>
                <span
                  style={{ color: "rgba(255,255,255,0.7)", fontWeight: "600" }}
                >
                  × {bookingData.number_of_guests}
                </span>
              </div>
              <div
                style={{
                  height: "1px",
                  background: "rgba(232,68,26,0.15)",
                  margin: "8px 0",
                }}
              />
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  paddingTop: "8px",
                }}
              >
                <span
                  style={{
                    fontFamily: "'DM Sans',sans-serif",
                    fontSize: "15px",
                    fontWeight: "700",
                    color: "#fff",
                  }}
                >
                  Total Amount
                </span>
                <span
                  style={{
                    fontFamily: "'Playfair Display',serif",
                    fontSize: "24px",
                    fontWeight: "700",
                    color: "#E8441A",
                  }}
                >
                  ${bookingData.total_amount}
                </span>
              </div>
            </div>

            {/* Buttons */}
            <div style={{ display: "flex", gap: "12px" }}>
              <button
                className="btn-outline-event"
                onClick={() => setStep(1)}
                style={{ flex: 1 }}
              >
                ← Back
              </button>
              <button
                className="btn-primary-event"
                onClick={handleSubmit}
                disabled={
                  !bookingData.event_name ||
                  isDateBooked(bookingData.booking_date) ||
                  loading
                }
                style={{ flex: 2 }}
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
                        width: "16px",
                        height: "16px",
                        border: "2px solid rgba(255,255,255,0.3)",
                        borderTopColor: "#fff",
                        borderRadius: "50%",
                        display: "inline-block",
                        animation: "spin 0.8s linear infinite",
                      }}
                    />
                    Confirming…
                  </span>
                ) : (
                  "Confirm Booking ✓"
                )}
              </button>
            </div>
          </div>
        </div>

        <footer className="footer-bar">
          <span
            style={{
              fontFamily: "'DM Sans',sans-serif",
              fontSize: "13px",
              color: "rgba(255,255,255,0.4)",
            }}
          >
            © 2026 Epicure Hall. All rights reserved.
          </span>
          <div style={{ display: "flex", gap: "24px" }}>
            {["Privacy Policy", "Terms", "Sitemap"].map((l) => (
              <a
                key={l}
                href="#"
                className="footer-link"
                style={{
                  fontFamily: "'DM Sans',sans-serif",
                  fontSize: "13px",
                  color: "rgba(255,255,255,0.4)",
                  textDecoration: "none",
                  transition: "color 0.2s",
                }}
              >
                {l}
              </a>
            ))}
          </div>
        </footer>
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
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(ellipse at 50% 50%, rgba(232,68,26,0.06) 0%, transparent 65%)",
          pointerEvents: "none",
        }}
      />
      <div
        className="success-card"
        style={{
          background: "#141414",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: "28px",
          padding: "56px 48px",
          textAlign: "center",
          maxWidth: "480px",
          width: "100%",
          boxShadow: "0 40px 80px rgba(0,0,0,0.6)",
          position: "relative",
          zIndex: 1,
        }}
      >
        <div
          style={{
            width: "80px",
            height: "80px",
            background: "rgba(232,68,26,0.12)",
            border: "2px solid rgba(232,68,26,0.3)",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "36px",
            margin: "0 auto 24px",
          }}
        >
          🎉
        </div>
        <div
          style={{
            fontFamily: "'DM Sans',sans-serif",
            fontSize: "12px",
            fontWeight: "700",
            letterSpacing: "4px",
            textTransform: "uppercase",
            color: "#E8441A",
            marginBottom: "16px",
          }}
        >
          Booking Confirmed
        </div>
        <h2
          style={{
            fontFamily: "'Playfair Display',serif",
            fontSize: "32px",
            fontWeight: "700",
            color: "#fff",
            marginBottom: "12px",
            letterSpacing: "-0.5px",
          }}
        >
          Event Booked Successfully!
        </h2>
        <p
          style={{
            fontFamily: "'DM Sans',sans-serif",
            fontSize: "14px",
            color: "rgba(255,255,255,0.45)",
            lineHeight: "1.65",
            marginBottom: "32px",
          }}
        >
          A confirmation email has been sent to your inbox. We look forward to
          making your event unforgettable.
        </p>

        <div
          style={{
            background: "#0f0f0f",
            border: "1px solid rgba(255,255,255,0.06)",
            borderRadius: "16px",
            padding: "20px",
            marginBottom: "32px",
            textAlign: "left",
          }}
        >
          {[
            [
              "📍",
              "Location",
              locations.find((l) => l.id === selectedLocation)?.name,
            ],
            ["📅", "Date", bookingData.booking_date],
            ["👥", "Guests", `${bookingData.number_of_guests} guests`],
            ["💰", "Total", `$${bookingData.total_amount}`],
          ].map(([icon, label, value]) => (
            <div
              key={label}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                padding: "10px 0",
                borderBottom: "1px solid rgba(255,255,255,0.04)",
              }}
            >
              <span style={{ fontSize: "16px", width: "24px" }}>{icon}</span>
              <span
                style={{
                  fontFamily: "'DM Sans',sans-serif",
                  fontSize: "13px",
                  color: "rgba(255,255,255,0.35)",
                  flex: 1,
                }}
              >
                {label}
              </span>
              <span
                style={{
                  fontFamily: "'DM Sans',sans-serif",
                  fontSize: "13px",
                  fontWeight: "600",
                  color: "rgba(255,255,255,0.8)",
                }}
              >
                {value}
              </span>
            </div>
          ))}
        </div>

        <button
          onClick={() => (window.location.href = "/")}
          className="btn-primary-event"
          style={{ width: "100%" }}
        >
          Return to Home
        </button>
      </div>
    </div>
  );
}

export default EventBookingPage;
