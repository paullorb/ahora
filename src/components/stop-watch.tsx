"use client";

import { useState, useEffect } from "react";
import { formatTime } from "@/utils/formatTime";
import styles from "./stop-watch.module.css";

export default function StopWatch() {
  const [elapsed, setElapsed] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);

  const [activityName, setActivityName] = useState("");
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
    activityName.trim().length > 0
      ? suggestions.filter((s) =>
          s.toLowerCase().startsWith(activityName.trim().toLowerCase())
        )
      : suggestions;

  const handleDeleteActivity = (activityToDelete: string) => {
    setSuggestions((prev) => prev.filter((s) => s !== activityToDelete));
  };

  const handleReset = async () => {
    if (isRunning || (elapsed === 0 && startTime === null)) return;
    
    // Save the time entry
    if (startTime && activityName) {
      await fetch('/api/times', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          startTime,
          duration: elapsed,
          activity: activityName
        })
      });
    }
    
    // Reset state
    setElapsed(0);
    setStartTime(null);
    setActivityName("");
  };

  return (
    <div className={styles.container}>
      <div className={styles.activity}>
        <input
          type="text"
          className={styles.input}
          placeholder="Deep Work"
          disabled={isRunning}
          value={activityName}
          onChange={(e) => {
            setActivityName(e.target.value);
            setShowDropdown(true); 
          }}
          onFocus={() => setShowDropdown(true)}
          onBlur={() => setShowDropdown(false)}
        />
        {showDropdown &&
          activityName.trim() !== "" &&
          !suggestions.some(
            (s) => s.toLowerCase() === activityName.trim().toLowerCase()
          ) && (
            <button
              type="button"
              className={styles.addButton}
              onClick={() => {
                const val = activityName.trim();
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
          )}
      </div>
      {showDropdown && filteredSuggestions.length > 0 && (
        <div className={styles.dropDown}>
          {filteredSuggestions.map((s) => (
            <div
              key={s}
              className={styles.dropdownItem}
              onMouseDown={() => setActivityName(s)}
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
        {elapsed > 0 && !isRunning && (
          <button className={styles.button} onClick={handleReset}>Reset</button>
        )}
      </div>
    </div>
  );
}
