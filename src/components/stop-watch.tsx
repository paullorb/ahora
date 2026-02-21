"use client";

import { useState, useRef, useEffect } from "react";
import { formatTime } from "@/utils/formatTime";
import styles from "./stop-watch.module.css";

export default function StopWatch() {
  const [elapsed, setElapsed] = useState(0); 
  const [startTime, setStartTime] = useState<number | null>(null); 
  const [running, setRunning] = useState(false);
  const [activity, setActivity] = useState("");
  const [error, setError] = useState<string | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (running && startTime !== null) {
      intervalRef.current = setInterval(() => {
        setElapsed(Date.now() - startTime);
      }, 1000); 
    }
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [running, startTime]);

  const handleButtonClick = async () => {
    setError(null);
    if (running && startTime !== null) {
      setSaving(true); // Set saving before fetch
      const endTime = Date.now();

      try {
        const response = await fetch("/api/time-entries", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            activityName: activity,
            startTime, 
            endTime
          })
        });

        const data = await response.json();
        if (!response.ok) {
          setError(data.error || "Failed to save time entry.");
          setSaving(false); // Reset saving on error
          return;
        }

        setRunning(false);
        setElapsed(0);
        setStartTime(null);
        setActivity("");
      } catch (err) {
        setError("Network error. Please try again.");
      } finally {
        setSaving(false); // Always reset saving after fetch
      }
    } else {
      const now = Date.now();
      setRunning(true);
      setElapsed(0);
      setStartTime(now);
    }
  };

  return (
    <div className={styles.container}>
      <input
        type="text"
        className={styles.input}
        placeholder="Activity name"
        value={activity}
        onChange={e => setActivity(e.target.value)}
        disabled={running}
      />
      <div className={styles.time}>{formatTime(elapsed)}</div>
      <button
        className={styles.button}
        onClick={handleButtonClick}
        disabled={(!running && activity.trim() === "") || saving }
      >
        {running ? "Stop" : "Start"}
      </button>
      {error && <div className={styles.error}>{error}</div>}
    </div>
  );
}