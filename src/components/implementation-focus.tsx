"use client";

import { useEffect, useMemo, useState } from "react";
import type { ScheduleEntry } from "@/types/schedule-entry";
import StopWatch from "./stop-watch";
import styles from "./implementation-focus.module.css";

type ImplementationFocusProps = {
  entries: ScheduleEntry[];
  activityDraft: string;
  onActivityDraftChange: (value: string) => void;
  onTimeEntrySaved?: () => void;
};

type ActiveTask = {
  activityName: string;
  startTime: number;
};

type SlotInfo = {
  currentStart: number;
  currentEnd: number;
  currentLabel: string;
  nextStart: number;
  nextLabel: string;
};

const FALLBACK_DECOMPOSITION = [
  "Open your editor and write one tiny TODO",
  "Run the app and fix one visible issue",
  "Write 5 lines of implementation code",
];

function toHourFraction(timestamp: number) {
  const date = new Date(timestamp);
  return date.getHours() + date.getMinutes() / 60;
}

function isSameLocalDay(timestamp: number, date: Date) {
  const value = new Date(timestamp);
  return (
    value.getFullYear() === date.getFullYear() &&
    value.getMonth() === date.getMonth() &&
    value.getDate() === date.getDate()
  );
}

function formatTime24(value: number) {
  const normalized = ((value % 24) + 24) % 24;
  const hour = Math.floor(normalized);
  const minutes = Math.round((normalized - hour) * 60);
  return `${String(hour).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

function getSlotInfo(now: Date, entries: ScheduleEntry[], activeTask: ActiveTask | null): SlotInfo {
  const nowMs = now.getTime();
  const currentHour = now.getHours();

  const currentScheduled = entries.find((entry) => nowMs >= entry.startTime && nowMs < entry.endTime);

  if (currentScheduled) {
    const nextScheduled = entries.find((entry) => entry.startTime >= currentScheduled.endTime);

    return {
      currentStart: toHourFraction(currentScheduled.startTime),
      currentEnd: toHourFraction(currentScheduled.endTime),
      currentLabel: currentScheduled.title,
      nextStart: nextScheduled ? toHourFraction(nextScheduled.startTime) : currentHour + 1,
      nextLabel: nextScheduled?.title ?? "Free time",
    };
  }

  if (activeTask) {
    const nextBlockStart = activeTask.startTime + 60 * 60 * 1000;
    const nextScheduled = entries.find((entry) => entry.startTime >= nextBlockStart);
    const activeStartDate = new Date(activeTask.startTime);

    return {
      currentStart: activeStartDate.getHours() + activeStartDate.getMinutes() / 60,
      currentEnd: activeStartDate.getHours() + activeStartDate.getMinutes() / 60 + 1,
      currentLabel: activeTask.activityName,
      nextStart: nextScheduled ? toHourFraction(nextScheduled.startTime) : currentHour + 1,
      nextLabel: nextScheduled?.title ?? "Free time",
    };
  }

  const nextScheduled = entries.find((entry) => entry.startTime >= nowMs);

  return {
    currentStart: currentHour,
    currentEnd: currentHour + 1,
    currentLabel: "Free time",
    nextStart: nextScheduled ? toHourFraction(nextScheduled.startTime) : currentHour + 1,
    nextLabel: nextScheduled?.title ?? "Free time",
  };
}

export default function ImplementationFocus({
  entries,
  activityDraft,
  onActivityDraftChange,
  onTimeEntrySaved,
}: ImplementationFocusProps) {
  const [now, setNow] = useState(() => new Date());
  const [activeTask, setActiveTask] = useState<ActiveTask | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    let isMounted = true;

    const loadActiveTask = async () => {
      try {
        const response = await fetch("/api/active-time-entry");
        const data = await response.json();

        if (!response.ok || !isMounted) {
          return;
        }

        const active =
          data.active &&
          typeof data.active.activityName === "string" &&
          typeof data.active.startTime === "number"
            ? (data.active as ActiveTask)
            : null;

        setActiveTask(active);

        if (active && activityDraft.trim() === "") {
          onActivityDraftChange(active.activityName);
        }
      } catch {
        if (isMounted) {
          setActiveTask(null);
        }
      }
    };

    void loadActiveTask();

    return () => {
      isMounted = false;
    };
  }, [onActivityDraftChange]);

  const todayEntries = useMemo(
    () => entries.filter((entry) => isSameLocalDay(entry.startTime, now)),
    [entries, now]
  );

  const currentScheduled = useMemo(
    () => todayEntries.find((entry) => now.getTime() >= entry.startTime && now.getTime() < entry.endTime),
    [todayEntries, now]
  );

  const decomposition =
    currentScheduled && currentScheduled.decomposition.length > 0
      ? currentScheduled.decomposition
      : FALLBACK_DECOMPOSITION;

  const slot = useMemo(() => getSlotInfo(now, todayEntries, activeTask), [now, todayEntries, activeTask]);

  const progressRangeStart =
    currentScheduled?.startTime ?? activeTask?.startTime ?? new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours()).getTime();
  const progressPercent = Math.max(
    0,
    Math.min(100, ((now.getTime() - progressRangeStart) / (60 * 60 * 1000)) * 100)
  );

  const stopwatchPlaceholder =
    slot.currentLabel !== "Free time" ? slot.currentLabel : "Pick one concrete task for this hour";
  const currentSlotDurationMs = Math.max(
    1,
    (slot.currentEnd - slot.currentStart) * 60 * 60 * 1000
  );

  const timeLabel = now.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });

  const dateLabel = now.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const handleStart = (payload: { activityName: string; startTime: number }) => {
    void fetch("/api/active-time-entry", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!currentScheduled) {
      setActiveTask(payload);
    }
  };

  const handleStop = () => {
    void fetch("/api/active-time-entry", {
      method: "DELETE",
    });

    setActiveTask(null);
    onActivityDraftChange("");
    onTimeEntrySaved?.();
  };

  return (
    <section className={styles.container}>
      <header className={styles.header}>
        <h2 className={styles.title}>Implementation Focus</h2>
        <p className={styles.date}>{dateLabel}</p>
        <p className={styles.time} suppressHydrationWarning>
          {isHydrated ? timeLabel : "--:--:--"}
        </p>
      </header>

      <div className={styles.cardRow}>
        <article className={styles.card}>
          <h3 className={styles.cardTitle}>Happening Now</h3>
          <p className={styles.cardBody}>{slot.currentLabel}</p>
          <p className={styles.cardMeta}>
            {formatTime24(slot.currentStart)} - {formatTime24(slot.currentEnd)}
          </p>
          <div className={styles.progressTrack} aria-hidden="true">
            <div className={styles.progressFill} style={{ width: `${progressPercent}%` }} />
          </div>
        </article>
        <article className={styles.card}>
          <h3 className={styles.cardTitle}>Should Begin Next</h3>
          <p className={styles.cardBody}>{slot.nextLabel}</p>
          <p className={styles.cardMeta}>Starts at {formatTime24(slot.nextStart)}</p>
        </article>
      </div>

      <div className={styles.decomposition}>
        <h3 className={styles.decompositionTitle}>Atomic Next Steps</h3>
        <div className={styles.chips}>
          {decomposition.map((step) => (
            <button
              key={step}
              type="button"
              className={styles.chip}
              onClick={() => onActivityDraftChange(step)}
            >
              {step}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.stopwatchWrap}>
        <StopWatch
          placeholder={stopwatchPlaceholder}
          presetActivity={activityDraft}
          activityValue={activityDraft}
          onActivityChange={onActivityDraftChange}
          onStart={handleStart}
          onStop={handleStop}
          sessionDurationMs={currentSlotDurationMs}
        />
      </div>
    </section>
  );
}
