"use client";

import { useState, useRef, useEffect } from "react";
import { formatTime } from "@/utils/formatTime";
import styles from "./stop-watch.module.css";

type StopWatchProps = {
  placeholder?: string;
  presetActivity?: string;
  activityValue?: string;
  onActivityChange?: (value: string) => void;
  onStart?: (payload: { activityName: string; startTime: number }) => void;
  onStop?: () => void;
  sessionDurationMs?: number;
};

export default function StopWatch({
  placeholder = "Activity name",
  presetActivity,
  activityValue,
  onActivityChange,
  onStart,
  onStop,
  sessionDurationMs = 60 * 60 * 1000,
}: StopWatchProps) {
  const [elapsed, setElapsed] = useState(0);
  const [showRemaining, setShowRemaining] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [running, setRunning] = useState(false);
  const [internalActivity, setInternalActivity] = useState("");
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

  const activity = activityValue ?? internalActivity;
  const setActivity = onActivityChange ?? setInternalActivity;

  useEffect(() => {
    if (!running && presetActivity && activity.trim() === "") {
      setActivity(presetActivity);
    }
  }, [presetActivity, running, activity, setActivity]);

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

        const data = (await response.json().catch(() => ({}))) as {
          error?: string;
        };
        if (!response.ok) {
          setError(data.error || "Failed to save time entry.");
          return;
        }

        setRunning(false);
        setElapsed(0);
        setStartTime(null);
        setActivity("");
        setShowRemaining(false);
        onStop?.();
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
      setShowRemaining(false);
      onStart?.({
        activityName: activity.trim(),
        startTime: now,
      });
    }
  };

  return (
    <div className={styles.container}>
      <input
        type="text"
        className={styles.input}
        placeholder={placeholder}
        value={activity}
        onChange={(e) => setActivity(e.target.value)}
        disabled={running}
      />
      <button
        type="button"
        className={styles.time}
        onClick={() => {
          if (running) {
            setShowRemaining((old) => !old);
          }
        }}
      >
        {running && showRemaining
          ? formatTime(Math.max(0, sessionDurationMs - elapsed))
          : formatTime(elapsed)}
      </button>
      <button
        className={styles.button}
        onClick={handleButtonClick}
        disabled={(!running && activity.trim() === "") || saving}
      >
        {running ? "Stop" : "Start"}
      </button>
      {error && <div className={styles.error}>{error}</div>}
    </div>
  );
}
