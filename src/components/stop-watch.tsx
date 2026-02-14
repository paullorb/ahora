"use client";

import { useState, useEffect } from "react";
import { formatTime } from "@/utils/formatTime";
import styles from "./stop-watch.module.css";

export default function StopWatch() {
  const [elapsed, setElapsed] = useState(0);
  const [isRunning, setIsRunning] = useState(false);

  const [title, setTitle] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      setElapsed((prev) => prev + 10);
    }, 10);

    return () => clearInterval(interval);
  }, [isRunning]);

  return (
    <div className={styles.container}>
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
        {showDropdown && (
          <div className={styles.dropDown}>
            <div className={styles.dropdownItem} onMouseDown={() => setTitle("Slow Work")}>Slow Work</div>
            <div className={styles.dropdownItem} onMouseDown={() => setTitle("Fitness")}>Fitness</div>
            <div className={styles.dropdownItem} onMouseDown={() => setTitle("Reading")}>Reading</div>
          </div>
        )}
      <h1 className={styles.time}>{formatTime(elapsed)}</h1>
      <div className={styles.buttons}>
        <button className={styles.button} onClick={() => setIsRunning(!isRunning)}>{isRunning ? "Stop" : "Start"}</button>
        <button className={styles.button} onClick={() => setElapsed(0)}>Reset</button>
      </div>
    </div>
  );
}
