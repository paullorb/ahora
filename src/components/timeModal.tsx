import React, { useState } from "react";
import styles from "./timeModal.module.css";
import { presetTimes } from "@/app/lib/timeUtils";

type TimeModalProps = {
  left: number | undefined;
  top: number;
  onPresetClick: (ms: number) => void;
  onTimeRangeSet: (start: string, end: string) => void;
  onClose: () => void;
};

export default function TimeModal({ left, top, onPresetClick, onTimeRangeSet, onClose }: TimeModalProps) {
  const [rangeInput, setRangeInput] = useState("");

  const handleRangeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const match = rangeInput.match(/^(\d{1,2}:\d{2})\s+(\d{1,2}:\d{2})$/);
    if (match) {
      onTimeRangeSet(match[1], match[2]);
      setRangeInput("");
      onClose();
    } else {
      alert("Please enter time as HH:MM HH:MM");
    }
  };

  return (
    <div
      className={styles.modal}
      style={{
        position: "absolute",
        left,
        top,
        zIndex: 10,
        background: "#fff",
        border: "1px solid #ccc",
        borderRadius: 8,
        padding: 16,
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
      }}
    >
      <div style={{ marginBottom: 8 }}>Set countdown:</div>
      <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        {presetTimes.map((preset) => (
          <button
            key={preset.label}
            style={{
              fontFamily: "monospace",
              padding: "6px 12px",
              borderRadius: 4,
              border: "1px solid #aaa",
              background: "#f5f5f5",
              cursor: "pointer",
            }}
            onClick={() => onPresetClick(preset.ms)}
          >
            {preset.label}
          </button>
        ))}
      </div>
      <form onSubmit={handleRangeSubmit} style={{ marginBottom: 12 }}>
        <input
          type="text"
          placeholder="16:00 17:00"
          value={rangeInput}
          onChange={e => setRangeInput(e.target.value)}
          style={{
            fontFamily: "monospace",
            padding: "6px 12px",
            borderRadius: 4,
            border: "1px solid #aaa",
            width: 120,
            marginRight: 8,
          }}
        />
        <button type="submit">Set Range</button>
      </form>
      <button onClick={onClose}>Close</button>
    </div>
  );
}