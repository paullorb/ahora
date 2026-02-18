import React from "react";

function getSurroundingHours(centerHour: number, total: number = 25) {
  const half = Math.floor(total / 2);
  return Array.from({ length: total }, (_, i) => (centerHour - half + i + 24) % 24);
}

function getCurrentHourAndMinutes() {
  const now = new Date();
  return {
    hour: now.getHours(),
    label: `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`,
  };
}

export default function Today() {
  const { hour: currentHour, label: currentLabel } = getCurrentHourAndMinutes();
  const hours = getSurroundingHours(currentHour);

  return (
    <div style={{ display: "flex", flexDirection: "row", justifyContent: "center", gap: 16 }}>
      {hours.map((hour, idx) => {
        const isCurrent = idx === 12;
        return (
          <div key={idx} style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            <div
              style={{
                textAlign: "center",
                minWidth: 32,
                fontWeight: isCurrent ? "bold" : "normal",
                color: isCurrent ? "#1976d2" : "inherit",
                borderBottom: isCurrent ? "2px solid #1976d2" : "none",
              }}
            >
              {isCurrent ? currentLabel : hour.toString().padStart(2, "0")}
            </div>
            <div
              style={{
                width: 24,
                height: 24,
                border: "1px solid #ccc",
                borderRadius: 4,
                background: "#fff",
                marginTop: 8,
              }}
            />
          </div>
        );
      })}
    </div>
  );
}