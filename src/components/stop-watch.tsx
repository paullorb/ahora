"use client";

import { useState, useEffect, useRef } from "react";
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

  const [isCountdown, setIsCountdown] = useState(false);
  const [countdownTarget, setCountdownTarget] = useState<number | null>(null);

  const defaultSuggestions = ["Slow Work", "Fitness", "Reading"];

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

  // Parse input like "mm:ss" or "hh:mm:ss"
  function parseTimeString(str: string): number {
    const parts = str.split(":").map((p) => p.trim());
    if (parts.length === 2) {
      // mm:ss
      const [mm, ss] = parts;
      return (parseInt(mm) * 60 + parseInt(ss)) * 1000;
    }
    if (parts.length === 3) {
      // hh:mm:ss
      const [hh, mm, ss] = parts;
      return (parseInt(hh) * 3600 + parseInt(mm) * 60 + parseInt(ss)) * 1000;
    }
    // fallback: try as seconds
    const asNum = Number(str);
    if (!isNaN(asNum)) return asNum * 1000;
    return 0;
  }

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

  // Predefined countdown values in milliseconds
  const presetTimes = [
    { label: "5'", ms: 5 * 60 * 1000 },
    { label: "10'", ms: 10 * 60 * 1000 },
    { label: "25'", ms: 25 * 60 * 1000 },
    { label: "60'", ms: 60 * 60 * 1000 },
  ];

  const handlePresetClick = (ms: number) => {
    setElapsed(ms);
    setIsCountdown(true);
    setCountdownTarget(ms);
    setIsRunning(false);
    setShowModal(false);
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
        <div
          className={styles.modal}
          style={{
            position: "absolute",
            left: h1Ref.current?.offsetLeft,
            top: (h1Ref.current?.offsetTop ?? 0) + (h1Ref.current?.offsetHeight ?? 0) + 8,
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
                onClick={() => handlePresetClick(preset.ms)}
              >
                {preset.label}
              </button>
            ))}
          </div>
          <button onClick={() => setShowModal(false)}>Close</button>
        </div>
      )}
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
