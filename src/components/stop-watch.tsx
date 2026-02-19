"use client";

import { useState, useEffect, useRef } from "react";
import { formatTime } from "@/utils/formatTime";
import { parseTimeString } from "@/app/lib/timeUtils";
import styles from "./stop-watch.module.css";
import TimeModal from "./timeModal";

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

  const [isCountdown, setIsCountdown] = useState(false);
  const [countdownTarget, setCountdownTarget] = useState<number | null>(null);

  const defaultSuggestions = ["Slow Work", "Fitness", "Reading"];

  const STORAGE_KEY = "ahora-stopwatch-state";

  // Restore state from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const state = JSON.parse(saved);
        setActivityName(state.activityName ?? "");
        setIsCountdown(state.isCountdown ?? false);
        setCountdownTarget(state.countdownTarget ?? null);

        if (state.isRunning && state.startTime) {
          const now = Date.now();
          if (state.isCountdown && state.countdownTarget != null) {
            const remaining = Math.max(state.countdownTarget - (now - state.startTime), 0);
            setElapsed(remaining);
            setIsRunning(remaining > 0);
            setStartTime(now - (state.countdownTarget - remaining));
          } else {
            const elapsedNow = now - state.startTime;
            setElapsed(elapsedNow);
            setIsRunning(true);
            setStartTime(state.startTime);
          }
        } else {
          setElapsed(state.elapsed ?? 0);
          setIsRunning(false);
          setStartTime(null);
        }
      } catch {}
    }
  }, []);

  // Save state to localStorage whenever relevant state changes
  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        elapsed,
        isRunning,
        startTime,
        activityName,
        isCountdown,
        countdownTarget,
      })
    );
  }, [elapsed, isRunning, startTime, activityName, isCountdown, countdownTarget]);

  useEffect(() => {
    if (!isRunning) return;

    if (isCountdown && countdownTarget !== null) {
      if (elapsed <= 0) {
        setIsRunning(false);
        setElapsed(0);
        setCountdownTarget(null);
        setIsCountdown(false);
        return;
      }
      const interval = setInterval(() => {
        setElapsed((prev) => Math.max(prev - 10, 0));
      }, 10);
      return () => clearInterval(interval);
    } else {
      const interval = setInterval(() => {
        setElapsed((prev) => prev + 10);
      }, 10);
      return () => clearInterval(interval);
    }
  }, [isRunning, isCountdown, countdownTarget, elapsed]);

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

  const [showModal, setShowModal] = useState(false);
  const h1Ref = useRef<HTMLHeadingElement>(null);

  // Add state for editing the timer value
  const [isEditingTime, setIsEditingTime] = useState(false);
  const [inputTime, setInputTime] = useState(formatTime(elapsed));
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input when editing
  useEffect(() => {
    if (isEditingTime && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditingTime]);

  const handleTimeInputBlur = () => {
    setIsEditingTime(false);
    const ms = parseTimeString(inputTime);
    if (ms > 0) {
      setElapsed(ms);
      setIsCountdown(true);
      setCountdownTarget(ms);
      setIsRunning(false);
    }
  };

  const handleTimeInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleTimeInputBlur();
    } else if (e.key === "Escape") {
      setIsEditingTime(false);
      setInputTime(formatTime(elapsed));
    }
  };

  const handlePresetClick = (ms: number) => {
    setElapsed(ms);
    setIsCountdown(true);
    setCountdownTarget(ms);
    setIsRunning(false);
    setShowModal(false);
  };

  const handleStartStop = () => {
    if (isRunning) {
      setIsRunning(false);
    } else {
      setStartTime(Date.now() - elapsed);
      setIsRunning(true);
    }
  };

  // Add state for scheduled timer
  const [scheduledStart, setScheduledStart] = useState<number | null>(null);
  const [scheduledEnd, setScheduledEnd] = useState<number | null>(null);

  // Helper to parse "HH:MM" to Date object for today
  function parseTodayTime(str: string): Date {
    const [h, m] = str.split(":").map(Number);
    const now = new Date();
    now.setHours(h, m, 0, 0);
    return now;
  }

  // Handler for the time range input
  const handleTimeRangeSet = (start: string, end: string) => {
    const startDate = parseTodayTime(start);
    const endDate = parseTodayTime(end);
    if (endDate <= startDate) {
      alert("End time must be after start time");
      return;
    }
    setScheduledStart(startDate.getTime());
    setScheduledEnd(endDate.getTime());
    setElapsed(0);
    setIsCountdown(false);
    setCountdownTarget(null);
    setIsRunning(false);
  };

  // Effect to start/stop timer at scheduled times
  useEffect(() => {
    if (!scheduledStart || !scheduledEnd) return;

    const now = Date.now();

    if (now >= scheduledStart && now < scheduledEnd) {
      // Start timer if within the range
      setIsRunning(true);
      setStartTime(scheduledStart);
      setElapsed(now - scheduledStart);
    } else if (now >= scheduledEnd) {
      // Stop timer if past end
      setIsRunning(false);
      setElapsed(scheduledEnd - scheduledStart);
      setStartTime(null);
      setScheduledStart(null);
      setScheduledEnd(null);
    } else {
      // Wait until start time
      const timeout = setTimeout(() => {
        setIsRunning(true);
        setStartTime(scheduledStart);
        setElapsed(0);
      }, scheduledStart - now);
      return () => clearTimeout(timeout);
    }
  }, [scheduledStart, scheduledEnd]);

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
      {isEditingTime ? (
        <input
          ref={inputRef}
          className={styles.time}
          style={{ fontFamily: "monospace", fontSize: "2.5rem", textAlign: "center" }}
          value={inputTime}
          onChange={(e) => setInputTime(e.target.value)}
          onBlur={handleTimeInputBlur}
          onKeyDown={handleTimeInputKeyDown}
        />
      ) : (
        <h1
          className={styles.time}
          ref={h1Ref}
          style={{ cursor: isRunning ? "default" : "pointer" }}
          onClick={() => {
            if (!isRunning) setShowModal((v) => !v);
          }}
          onDoubleClick={() => {
            if (!isRunning) {
              setIsEditingTime(true);
              setInputTime(formatTime(elapsed));
              setShowModal(false);
            }
          }}
          title="Click to open presets, double-click to edit"
        >
          {formatTime(elapsed)}
        </h1>
      )}
      {showModal && !isEditingTime && (
        <TimeModal
          left={h1Ref.current?.offsetLeft}
          top={(h1Ref.current?.offsetTop ?? 0) + (h1Ref.current?.offsetHeight ?? 0) + 8}
          onPresetClick={handlePresetClick}
          onTimeRangeSet={handleTimeRangeSet}
          onClose={() => setShowModal(false)}
        />
      )}
      <div className={styles.buttons}>
        <button
          className={styles.button}
          onClick={handleStartStop}
          disabled={!activityName.trim()}
        >
          {isRunning ? "Stop" : "Start"}
        </button>
        {elapsed > 0 && !isRunning && (
          <button className={styles.button} onClick={handleReset}>Reset</button>
        )}
      </div>
    </div>
  );
}
