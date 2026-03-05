"use client";

import { useMemo, useState, type FormEvent } from "react";
import type { ScheduleEntry } from "@/types/schedule-entry";
import { CATEGORY_OPTIONS, getCategoryColor, getCategoryLabel } from "./schedule-categories";
import Calendar from "./calendar";
import styles from "./planning-panel.module.css";

type PlanningPanelProps = {
  entries: ScheduleEntry[];
  onEntryCreated: (entry: ScheduleEntry) => void;
  onEntryUpdated: (entry: ScheduleEntry) => void;
  onEntryDeleted: (entryId: string) => void;
};

type FormState = {
  title: string;
  category: string;
  date: string;
  start: string;
  end: string;
  decomposition: string;
};

function getInitialForm(): FormState {
  const now = new Date();
  const rounded = new Date(now);
  rounded.setMinutes(0, 0, 0);
  const end = new Date(rounded);
  end.setHours(rounded.getHours() + 1);
  const localDate = `${rounded.getFullYear()}-${String(rounded.getMonth() + 1).padStart(2, "0")}-${String(
    rounded.getDate()
  ).padStart(2, "0")}`;

  return {
    title: "",
    category: "focus",
    date: localDate,
    start: `${String(rounded.getHours()).padStart(2, "0")}:00`,
    end: `${String(end.getHours()).padStart(2, "0")}:00`,
    decomposition: "",
  };
}

function toTimestamp(date: string, time: string) {
  return new Date(`${date}T${time}`).getTime();
}

function fromEntry(entry: ScheduleEntry): FormState {
  const start = new Date(entry.startTime);
  const end = new Date(entry.endTime);

  return {
    title: entry.title,
    category: entry.category,
    date: `${start.getFullYear()}-${String(start.getMonth() + 1).padStart(2, "0")}-${String(start.getDate()).padStart(2, "0")}`,
    start: `${String(start.getHours()).padStart(2, "0")}:${String(start.getMinutes()).padStart(2, "0")}`,
    end: `${String(end.getHours()).padStart(2, "0")}:${String(end.getMinutes()).padStart(2, "0")}`,
    decomposition: entry.decomposition.join("\n"),
  };
}

export default function PlanningPanel({
  entries,
  onEntryCreated,
  onEntryUpdated,
  onEntryDeleted,
}: PlanningPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(getInitialForm);

  const groupedEntries = useMemo(() => {
    const sorted = [...entries].sort((a, b) => a.startTime - b.startTime);
    return sorted.reduce<Record<string, ScheduleEntry[]>>((acc, entry) => {
      const category = entry.category || "general";
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(entry);
      return acc;
    }, {});
  }, [entries]);

  const closeModal = () => {
    setIsOpen(false);
    setEditingId(null);
    setError(null);
    setForm(getInitialForm());
  };

  const openCreate = () => {
    setEditingId(null);
    setError(null);
    setForm(getInitialForm());
    setIsOpen(true);
  };

  const openEdit = (entry: ScheduleEntry) => {
    setEditingId(entry.id);
    setError(null);
    setForm(fromEntry(entry));
    setIsOpen(true);
  };

  const handleDelete = async (entry: ScheduleEntry) => {
    const ok = confirm(`Delete \"${entry.title}\"?`);
    if (!ok) {
      return;
    }

    try {
      const response = await fetch(`/api/schedule-entries/${entry.id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.error ?? "Failed to delete entry.");
        return;
      }

      onEntryDeleted(entry.id);
    } catch {
      alert("Network error while deleting entry.");
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    const startTime = toTimestamp(form.date, form.start);
    const endTime = toTimestamp(form.date, form.end);

    if (!form.title.trim()) {
      setError("Title is required.");
      return;
    }

    if (!Number.isFinite(startTime) || !Number.isFinite(endTime)) {
      setError("Date and time are required.");
      return;
    }

    if (endTime <= startTime) {
      setError("End time must be after start time.");
      return;
    }

    const decomposition = form.decomposition
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);

    setSaving(true);

    try {
      const url = editingId ? `/api/schedule-entries/${editingId}` : "/api/schedule-entries";
      const method = editingId ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title,
          category: form.category,
          startTime,
          endTime,
          decomposition,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error ?? "Failed to save entry.");
        return;
      }

      if (editingId) {
        onEntryUpdated(data.entry as ScheduleEntry);
      } else {
        onEntryCreated(data.entry as ScheduleEntry);
      }

      closeModal();
    } catch {
      setError("Network error while saving entry.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.actions}>
        <button type="button" className={styles.createButton} onClick={openCreate}>
          + Create entry
        </button>
      </div>

      <Calendar entries={entries} />

      <section className={styles.listSection}>
        <h3 className={styles.listTitle}>Upcoming entries by category</h3>
        {entries.length === 0 ? <p className={styles.empty}>No planned entries yet.</p> : null}

        {Object.entries(groupedEntries).map(([category, items]) => (
          <div key={category} className={styles.group}>
            <h4 className={styles.groupTitle}>
              <span
                className={styles.groupDot}
                style={{ backgroundColor: getCategoryColor(category) }}
                aria-hidden="true"
              />
              {getCategoryLabel(category)}
            </h4>

            {items.slice(0, 8).map((entry) => (
              <div
                key={entry.id}
                className={styles.row}
                style={{ borderLeftColor: getCategoryColor(entry.category) }}
              >
                <span className={styles.rowTime}>
                  {new Date(entry.startTime).toLocaleTimeString("en-US", {
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: false,
                  })}
                  {" - "}
                  {new Date(entry.endTime).toLocaleTimeString("en-US", {
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: false,
                  })}
                </span>
                <span className={styles.rowTitle}>{entry.title}</span>
                <div className={styles.rowActions}>
                  <button
                    type="button"
                    className={styles.actionButton}
                    onClick={() => openEdit(entry)}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    className={styles.actionButtonDanger}
                    onClick={() => handleDelete(entry)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        ))}
      </section>

      {isOpen ? (
        <div className={styles.overlay} onClick={closeModal}>
          <div className={styles.modal} onClick={(event) => event.stopPropagation()}>
            <h3 className={styles.modalTitle}>
              {editingId ? "Edit planning entry" : "Create planning entry"}
            </h3>
            <form onSubmit={handleSubmit} className={styles.form}>
              <label className={styles.label}>
                Task title
                <input
                  className={styles.input}
                  value={form.title}
                  onChange={(event) => setForm((old) => ({ ...old, title: event.target.value }))}
                />
              </label>

              <div className={styles.grid}>
                <label className={styles.label}>
                  Category
                  <select
                    className={styles.input}
                    value={form.category}
                    onChange={(event) => setForm((old) => ({ ...old, category: event.target.value }))}
                  >
                    {CATEGORY_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>

                <label className={styles.label}>
                  Date
                  <input
                    type="date"
                    className={styles.input}
                    value={form.date}
                    onChange={(event) => setForm((old) => ({ ...old, date: event.target.value }))}
                  />
                </label>
                <label className={styles.label}>
                  Start
                  <input
                    type="time"
                    className={styles.input}
                    value={form.start}
                    onChange={(event) => setForm((old) => ({ ...old, start: event.target.value }))}
                  />
                </label>
                <label className={styles.label}>
                  End
                  <input
                    type="time"
                    className={styles.input}
                    value={form.end}
                    onChange={(event) => setForm((old) => ({ ...old, end: event.target.value }))}
                  />
                </label>
              </div>

              <label className={styles.label}>
                Atomic steps (optional, one per line)
                <textarea
                  className={styles.textarea}
                  value={form.decomposition}
                  onChange={(event) =>
                    setForm((old) => ({ ...old, decomposition: event.target.value }))
                  }
                />
              </label>

              {error ? <p className={styles.error}>{error}</p> : null}

              <div className={styles.modalActions}>
                <button type="button" className={styles.secondary} onClick={closeModal}>
                  Cancel
                </button>
                <button type="submit" className={styles.primary} disabled={saving}>
                  {saving ? "Saving..." : editingId ? "Update" : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}
