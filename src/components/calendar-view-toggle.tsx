import type { CalendarView } from "./calendar-helpers";
import styles from "./calendar-view-toggle.module.css";

type CalendarViewToggleProps = {
  view: CalendarView;
  onChange: (view: CalendarView) => void;
};

const VIEWS: CalendarView[] = ["day", "week", "month"];

export default function CalendarViewToggle({ view, onChange }: CalendarViewToggleProps) {
  return (
    <div className={styles.toggle} role="tablist" aria-label="Calendar view">
      {VIEWS.map((option) => (
        <button
          key={option}
          type="button"
          role="tab"
          aria-selected={view === option}
          className={`${styles.item} ${view === option ? styles.active : ""}`.trim()}
          onClick={() => onChange(option)}
        >
          {option[0].toUpperCase() + option.slice(1)}
        </button>
      ))}
    </div>
  );
}
