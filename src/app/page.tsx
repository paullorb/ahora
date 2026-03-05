"use client";

import { useEffect, useState } from "react";
import type { ScheduleEntry } from "@/types/schedule-entry";
import Calendar from "@/components/calendar";
import ImplementationFocus from "@/components/implementation-focus";
import PlanningPanel from "@/components/planning-panel";
import ResearchPanel, { type ResearchSummary } from "@/components/research-panel";
import WorkModeNav, { type WorkMode } from "@/components/work-mode-nav";
import styles from "./page.module.css";

export default function Home() {
  const [mode, setMode] = useState<WorkMode>("implementation");
  const [entries, setEntries] = useState<ScheduleEntry[]>([]);
  const [researchSummaries, setResearchSummaries] = useState<ResearchSummary[]>([]);
  const [activityDraft, setActivityDraft] = useState("");

  useEffect(() => {
    let isMounted = true;

    const loadEntries = async () => {
      try {
        const response = await fetch("/api/schedule-entries");
        const data = await response.json();

        if (!response.ok || !isMounted) {
          return;
        }

        setEntries(Array.isArray(data.entries) ? (data.entries as ScheduleEntry[]) : []);
      } catch {
        if (isMounted) {
          setEntries([]);
        }
      }
    };

    void loadEntries();

    return () => {
      isMounted = false;
    };
  }, []);

  const loadResearchSummaries = async () => {
    try {
      const response = await fetch("/api/time-entries");
      const data = await response.json();

      if (!response.ok) {
        return;
      }

      setResearchSummaries(
        Array.isArray(data.summaries) ? (data.summaries as ResearchSummary[]) : []
      );
    } catch {
      setResearchSummaries([]);
    }
  };

  useEffect(() => {
    if (mode === "research") {
      void loadResearchSummaries();
    }
  }, [mode]);

  const handleEntryCreated = (entry: ScheduleEntry) => {
    setEntries((old) => [...old, entry]);
  };

  const handleEntryUpdated = (entry: ScheduleEntry) => {
    setEntries((old) => old.map((item) => (item.id === entry.id ? entry : item)));
  };

  const handleEntryDeleted = (entryId: string) => {
    setEntries((old) => old.filter((item) => item.id !== entryId));
  };

  return (
    <div className={styles.container}>
      <WorkModeNav mode={mode} onChange={setMode} />

      {mode === "research" && (
        <section className={styles.section}>
          <h1 className={styles.sectionTitle}>Research</h1>
          <ResearchPanel summaries={researchSummaries} />
        </section>
      )}

      {mode === "planning" && (
        <section className={styles.section}>
          <h1 className={styles.sectionTitle}>Planning</h1>
          <PlanningPanel
            entries={entries}
            onEntryCreated={handleEntryCreated}
            onEntryUpdated={handleEntryUpdated}
            onEntryDeleted={handleEntryDeleted}
          />
        </section>
      )}

      {mode === "implementation" && (
        <section className={styles.section}>
          <ImplementationFocus
            entries={entries}
            activityDraft={activityDraft}
            onActivityDraftChange={setActivityDraft}
            onTimeEntrySaved={loadResearchSummaries}
          />
        </section>
      )}
    </div>
  );
}
