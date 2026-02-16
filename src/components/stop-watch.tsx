"use client";

import { useState, useEffect } from "react";
import { formatTime } from "@/utils/formatTime";
import styles from "./stop-watch.module.css";

export default function StopWatch() {
  const [elapsed, setElapsed] = useState(0);
  const [isRunning, setIsRunning] = useState(false);

  const [title, setTitle] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);

  const [suggestions, setSuggestions] = useState<string[]>([
    "Slow Work",
    "Fitness",
    "Reading",
  ]);

  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      setElapsed((prev) => prev + 10);
    }, 10);

    return () => clearInterval(interval);
  }, [isRunning]);

  return (
    <div className={styles.container}>
      <div className={styles.activity}>
        <input
          type="text"
          className={styles.input}
          placeholder="Deep Work"
          disabled={isRunning}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onFocus={() => setShowDropdown(true)}
          onBlur={() => setShowDropdown(false)}
        />
        <button
          type="button"
          className={styles.addButton}
          onClick={() => {
            const val = title.trim();
            if (!val) return;
            const exists = suggestions.some(
              (s) => s.toLowerCase() === val.toLowerCase()
            );
            if (exists) {
              alert(`${val} already exists`);
              return;
            }
            setSuggestions((prev) => [val, ...prev]);
            // keep the input value so the user sees the entry after adding
            setShowDropdown(true);
          }}
        >
          +
        </button>
      </div>
      {showDropdown && (
        <div className={styles.dropDown}>
          {suggestions.map((s) => (
            <div
              key={s}
              className={styles.dropdownItem}
              onMouseDown={() => setTitle(s)}
            >
              {s}
            </div>
          ))}
        </div>
      )}
      <h1 className={styles.time}>{formatTime(elapsed)}</h1>
      <div className={styles.buttons}>
        <button className={styles.button} onClick={() => setIsRunning(!isRunning)}>
          {isRunning ? "Stop" : "Start"}
        </button>
        <button className={styles.button} onClick={() => setElapsed(0)}>Reset</button>
      </div>
    </div>
  );
}
