"use client";

import { useState, useEffect } from "react";
import { formatTime } from "@/utils/formatTime";
import styles from "./stop-watch.module.css";

export default function StopWatch() {
  const [elapsed, setElapsed] = useState(0);
  const [isRunning, setIsRunning] = useState(false);

  const [activity, setActivity] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);

  const [suggestions, setSuggestions] = useState<string[]>([
    "Slow Work",
    "Fitness",
    "Reading",
  ]);

  const defaultSuggestions = ["Slow Work", "Fitness", "Reading"];

  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      setElapsed((prev) => prev + 10);
    }, 10);

    return () => clearInterval(interval);
  }, [isRunning]);

  const filteredSuggestions =
    activity.trim().length > 0
      ? suggestions.filter((s) =>
          s.toLowerCase().startsWith(activity.trim().toLowerCase())
        )
      : suggestions;

  const handleDeleteActivity = (activityToDelete: string) => {
    setSuggestions((prev) => prev.filter((s) => s !== activityToDelete));
  };

  return (
    <div className={styles.container}>
      <div className={styles.activity}>
        <input
          type="text"
          className={styles.input}
          placeholder="Deep Work"
          disabled={isRunning}
          value={activity}
          onChange={(e) => {
            setActivity(e.target.value);
            setShowDropdown(true); 
          }}
          onFocus={() => setShowDropdown(true)}
          onBlur={() => setShowDropdown(false)}
        />
        <button
          type="button"
          className={styles.addButton}
          onClick={() => {
            const val = activity.trim();
            if (!val) return;
            const exists = suggestions.some(
              (s) => s.toLowerCase() === val.toLowerCase()
            );
            if (exists) {
              alert(`${val} already exists`);
              return;
            }
            setSuggestions((prev) => [val, ...prev]);
            setShowDropdown(true);
          }}
        >
          +
        </button>
      </div>
      {showDropdown && filteredSuggestions.length > 0 && (
        <div className={styles.dropDown}>
          {filteredSuggestions.map((s) => (
            <div
              key={s}
              className={styles.dropdownItem}
              onMouseDown={() => setActivity(s)}
            >
              {s}
              {!defaultSuggestions.includes(s) && (
                <button
                  type="button"
                  className={styles.deleteButton}
                  onMouseDown={(e) => {
                    e.stopPropagation();
                    handleDeleteActivity(s);
                  }}
                >
                  ×
                </button>
              )}
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
