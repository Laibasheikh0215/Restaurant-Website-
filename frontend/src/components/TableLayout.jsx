import React from "react";

/* ─────────────────────────────────────────────
   GLOBAL CSS
───────────────────────────────────────────────*/
const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;1,700&family=DM+Sans:wght@400;500;600;700&display=swap');
  *, *::before, *::after { box-sizing: border-box; }

  @keyframes tl-fadeUp {
    from { opacity: 0; transform: translateY(16px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes tl-pop {
    0%   { transform: scale(0.85); opacity: 0; }
    70%  { transform: scale(1.04); }
    100% { transform: scale(1); opacity: 1; }
  }

  .tl-header { animation: tl-fadeUp 0.5s ease 0.05s both; }
  .tl-grid   { animation: tl-fadeUp 0.5s ease 0.15s both; }
  .tl-legend { animation: tl-fadeUp 0.5s ease 0.28s both; }

  .tl-table-card {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 16px 10px;
    cursor: default;
    transition: transform 0.25s cubic-bezier(0.22,1,0.36,1), box-shadow 0.25s, border-color 0.2s;
    position: relative;
    animation: tl-pop 0.4s cubic-bezier(0.22,1,0.36,1) both;
  }
  .tl-table-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 14px 36px rgba(0,0,0,0.4) !important;
  }
  .tl-table-card.booked:hover {
    transform: translateY(-4px);
    box-shadow: 0 14px 36px rgba(232,68,26,0.25) !important;
  }
`;

const TABLE_TYPES = {
  window: { icon: "🪑", label: "2-Seater (Window)" },
  standard: { icon: "🍽️", label: "4-Seater" },
  booth: { icon: "🛋️", label: "Booth (6 seats)" },
  private: { icon: "🍽️", label: "Private (8–10)" },
};

function TableLayout({ bookings, selectedDate, selectedTime }) {
  const tables = [
    { number: 1, capacity: 2, type: "window", shape: "circle" },
    { number: 2, capacity: 2, type: "window", shape: "circle" },
    { number: 3, capacity: 4, type: "standard", shape: "square" },
    { number: 4, capacity: 4, type: "standard", shape: "square" },
    { number: 5, capacity: 4, type: "standard", shape: "square" },
    { number: 6, capacity: 6, type: "booth", shape: "rectangle" },
    { number: 7, capacity: 6, type: "booth", shape: "rectangle" },
    { number: 8, capacity: 8, type: "private", shape: "large" },
    { number: 9, capacity: 8, type: "private", shape: "large" },
    { number: 10, capacity: 10, type: "private", shape: "large" },
  ];

  const bookedTableNumbers = bookings?.map((b) => b.table_number) || [];

  // Inject CSS once
  React.useEffect(() => {
    if (document.getElementById("tl-css")) return;
    const s = document.createElement("style");
    s.id = "tl-css";
    s.textContent = GLOBAL_CSS;
    document.head.appendChild(s);
    return () => {
      const el = document.getElementById("tl-css");
      if (el) el.remove();
    };
  }, []);

  const getBorderRadius = (shape) => {
    if (shape === "circle") return "50%";
    if (shape === "rectangle") return "10px";
    if (shape === "large") return "14px";
    return "12px"; // square
  };

  return (
    <div
      style={{
        background: "rgba(255,255,255,0.025)",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: "18px",
        padding: "24px",
        marginTop: "8px",
        fontFamily: "'DM Sans', sans-serif",
      }}
    >
      {/* Header */}
      <div
        className="tl-header"
        style={{ textAlign: "center", marginBottom: "20px" }}
      >
        <div
          style={{
            fontSize: "12px",
            fontWeight: "700",
            letterSpacing: "3px",
            textTransform: "uppercase",
            color: "#E8441A",
            marginBottom: "8px",
          }}
        >
          Table Layout
        </div>
        <div
          style={{
            fontFamily: "'Playfair Display',serif",
            fontSize: "18px",
            fontWeight: "700",
            color: "#fff",
            marginBottom: "6px",
          }}
        >
          🗺️ &nbsp;Restaurant Floor Plan
        </div>
        {selectedDate && (
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              background: "rgba(232,68,26,0.08)",
              border: "1px solid rgba(232,68,26,0.18)",
              borderRadius: "50px",
              padding: "5px 14px",
              fontSize: "12px",
              color: "rgba(255,255,255,0.6)",
            }}
          >
            <span style={{ color: "#E8441A" }}>📅</span>
            <span>
              <strong style={{ color: "#fff" }}>{selectedDate}</strong>
            </span>
            {selectedTime && (
              <>
                <span style={{ color: "rgba(255,255,255,0.2)" }}>·</span>
                <span>
                  <strong style={{ color: "#fff" }}>{selectedTime}</strong>
                </span>
              </>
            )}
          </div>
        )}
      </div>

      {/* Table grid */}
      <div
        className="tl-grid"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: "14px",
        }}
      >
        {tables.map((table, i) => {
          const isBooked = bookedTableNumbers.includes(table.number);
          const typeInfo = TABLE_TYPES[table.type];

          return (
            <div
              key={table.number}
              className={`tl-table-card${isBooked ? " booked" : ""}`}
              style={{
                animationDelay: `${0.05 + i * 0.04}s`,
                background: isBooked
                  ? "rgba(232,68,26,0.08)"
                  : "rgba(255,255,255,0.04)",
                border: isBooked
                  ? "1.5px solid rgba(232,68,26,0.4)"
                  : "1.5px solid rgba(255,255,255,0.09)",
                borderRadius: getBorderRadius(table.shape),
                boxShadow: isBooked
                  ? "0 4px 18px rgba(232,68,26,0.15)"
                  : "0 2px 10px rgba(0,0,0,0.2)",
              }}
            >
              {/* Icon */}
              <div
                style={{ fontSize: "26px", marginBottom: "6px", lineHeight: 1 }}
              >
                {typeInfo.icon}
              </div>

              {/* Table number */}
              <div
                style={{
                  fontSize: "13px",
                  fontWeight: "700",
                  color: "#fff",
                  marginBottom: "2px",
                }}
              >
                Table {table.number}
              </div>

              {/* Seat count */}
              <div
                style={{
                  fontSize: "11px",
                  color: "rgba(255,255,255,0.35)",
                  marginBottom: isBooked ? "6px" : "0",
                }}
              >
                {table.capacity} seats
              </div>

              {/* Booked badge */}
              {isBooked && (
                <div
                  style={{
                    fontSize: "10px",
                    fontWeight: "700",
                    letterSpacing: "1px",
                    textTransform: "uppercase",
                    color: "#E8441A",
                    background: "rgba(232,68,26,0.12)",
                    padding: "2px 8px",
                    borderRadius: "50px",
                    border: "1px solid rgba(232,68,26,0.25)",
                  }}
                >
                  Booked
                </div>
              )}

              {/* Corner dot for booked */}
              {isBooked && (
                <div
                  style={{
                    position: "absolute",
                    top: "-4px",
                    right: "-4px",
                    width: "14px",
                    height: "14px",
                    background: "#E8441A",
                    borderRadius: "50%",
                    border: "2px solid #0a0a0a",
                    boxShadow: "0 0 6px rgba(232,68,26,0.5)",
                  }}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div
        className="tl-legend"
        style={{
          marginTop: "22px",
          paddingTop: "18px",
          borderTop: "1px solid rgba(255,255,255,0.07)",
          display: "flex",
          gap: "10px 22px",
          justifyContent: "center",
          flexWrap: "wrap",
        }}
      >
        {[
          {
            swatch: {
              background: "rgba(255,255,255,0.04)",
              border: "1.5px solid rgba(255,255,255,0.09)",
            },
            label: "Available",
          },
          {
            swatch: {
              background: "rgba(232,68,26,0.08)",
              border: "1.5px solid rgba(232,68,26,0.4)",
            },
            label: "Booked",
          },
          { icon: "🪑", label: "2-Seater" },
          { icon: "🛋️", label: "Booth (6 seats)" },
          { icon: "🍽️", label: "4–10 Seater" },
        ].map(({ swatch, icon, label }) => (
          <div
            key={label}
            style={{ display: "flex", alignItems: "center", gap: "6px" }}
          >
            {swatch ? (
              <div
                style={{
                  width: "18px",
                  height: "18px",
                  borderRadius: "5px",
                  flexShrink: 0,
                  ...swatch,
                }}
              />
            ) : (
              <span style={{ fontSize: "15px" }}>{icon}</span>
            )}
            <span
              style={{
                fontSize: "11px",
                fontWeight: "500",
                color: "rgba(255,255,255,0.45)",
              }}
            >
              {label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default TableLayout;
