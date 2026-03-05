"use client";

import { useMemo, useState } from "react";
import type { ScheduleEntry } from "@/types/schedule-entry";
import CalendarViewToggle from "./calendar-view-toggle";
import { getCategoryColor } from "./schedule-categories";
import {
  getHeaderLabel,
  getHourLabels,
  getMonthGridDays,
  getWeekDays,
  isSameDay,
  shiftDateForView,
  type CalendarView,
} from "./calendar-helpers";
import styles from "./calendar.module.css";

type CalendarProps = {
  entries?: ScheduleEntry[];
};

function overlapsHour(entry: ScheduleEntry, dayDate: Date, hour: number) {
  const start = new Date(entry.startTime);
  const end = new Date(entry.endTime);

  if (!isSameDay(start, dayDate) && !isSameDay(end, dayDate)) {
    return false;
  }

  const slotStart = new Date(dayDate);
  slotStart.setHours(hour, 0, 0, 0);
  const slotEnd = new Date(slotStart);
  slotEnd.setHours(hour + 1, 0, 0, 0);

  return entry.startTime < slotEnd.getTime() && entry.endTime > slotStart.getTime();
}

function entriesForDay(entries: ScheduleEntry[], dayDate: Date) {
  return entries.filter((entry) => {
    const start = new Date(entry.startTime);
    return isSameDay(start, dayDate);
  });
}

export default function Calendar({ entries = [] }: CalendarProps) {
  const [view, setView] = useState<CalendarView>("week");
  const [anchorDate, setAnchorDate] = useState(() => new Date());

  const now = useMemo(() => new Date(), []);
  const hours = useMemo(() => getHourLabels(), []);
  const weekDays = useMemo(() => getWeekDays(anchorDate), [anchorDate]);
  const monthDays = useMemo(() => getMonthGridDays(anchorDate), [anchorDate]);
  const selectedDay = weekDays.find((day) => isSameDay(day.date, anchorDate)) ?? weekDays[0];
  const headerLabel = getHeaderLabel(view, anchorDate);

  const goTo = (direction: "prev" | "next") => {
    setAnchorDate((date) => shiftDateForView(date, view, direction));
  };

  const goToToday = () => {
    setAnchorDate(new Date());
  };

  const renderDayView = () => (
    <table className={styles.calendarTable}>
      <thead>
        <tr>
          <th className={styles.timeHeader}>Time</th>
          <th className={`${styles.dayHeader} ${isSameDay(anchorDate, now) ? styles.today : ""}`.trim()}>
            <span>{selectedDay.weekday}</span>
            <span className={styles.dayNumber}>{selectedDay.dayNumber}</span>
          </th>
        </tr>
      </thead>
      <tbody>
        {hours.map((hourLabel, hour) => {
          const entry = entries.find((value) => overlapsHour(value, selectedDay.date, hour));

          return (
            <tr key={hourLabel}>
              <th className={styles.timeCell}>{hourLabel}</th>
              <td className={`${styles.hourBlock} ${entry ? styles.occupied : ""}`.trim()}>
                {entry ? (
                  <span
                    className={styles.blockLabel}
                    style={{ borderColor: getCategoryColor(entry.category) }}
                  >
                    {entry.title}
                  </span>
                ) : null}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );

  const renderWeekView = () => (
    <table className={styles.calendarTable}>
      <thead>
        <tr>
          <th className={styles.timeHeader}>Time</th>
          {weekDays.map((day) => (
            <th
              key={day.key}
              className={`${styles.dayHeader} ${isSameDay(day.date, now) ? styles.today : ""}`.trim()}
            >
              <span>{day.weekday}</span>
              <span className={styles.dayNumber}>{day.dayNumber}</span>
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {hours.map((hourLabel, hour) => (
          <tr key={hourLabel}>
            <th className={styles.timeCell}>{hourLabel}</th>
            {weekDays.map((day) => {
              const entry = entries.find((value) => overlapsHour(value, day.date, hour));

              return (
                <td key={`${day.key}-${hourLabel}`} className={`${styles.hourBlock} ${entry ? styles.occupied : ""}`.trim()}>
                  {entry ? (
                    <span
                      className={styles.blockLabel}
                      style={{ borderColor: getCategoryColor(entry.category) }}
                    >
                      {entry.title}
                    </span>
                  ) : null}
                </td>
              );
            })}
          </tr>
        ))}
      </tbody>
    </table>
  );

  const renderMonthView = () => (
    <table className={styles.monthTable}>
      <thead>
        <tr>
          {weekDays.map((day) => (
            <th key={day.key} className={styles.monthWeekday}>
              {day.weekday}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {Array.from({ length: 6 }, (_, weekIndex) => (
          <tr key={weekIndex}>
            {monthDays.slice(weekIndex * 7, weekIndex * 7 + 7).map((day) => {
              const dayEntries = entriesForDay(entries, day.date);

              return (
                <td
                  key={day.key}
                  className={`${styles.monthCell} ${!day.isCurrentMonth ? styles.outsideMonth : ""} ${
                    isSameDay(day.date, now) ? styles.todayOutline : ""
                  }`.trim()}
                >
                  <div className={styles.monthCellTop}>{day.dayNumber}</div>
                  {dayEntries.slice(0, 2).map((entry) => (
                    <div
                      key={entry.id}
                      className={styles.monthEvent}
                      style={{ borderColor: getCategoryColor(entry.category) }}
                    >
                      {entry.title}
                    </div>
                  ))}
                  {dayEntries.length > 2 ? <div className={styles.monthMore}>+{dayEntries.length - 2} more</div> : null}
                </td>
              );
            })}
          </tr>
        ))}
      </tbody>
    </table>
  );

  return (
    <div className={styles.container}>
      <div className={styles.topBar}>
        <div className={styles.navigation}>
          <button type="button" className={styles.navButton} onClick={() => goTo("prev")}>
            ←
          </button>
          <h2 className={styles.monthTitle}>{headerLabel}</h2>
          <button type="button" className={styles.navButton} onClick={() => goTo("next")}>
            →
          </button>
          <button type="button" className={styles.todayButton} onClick={goToToday}>
            Today
          </button>
        </div>

        <CalendarViewToggle view={view} onChange={setView} />
      </div>

      {view === "day" && renderDayView()}
      {view === "week" && renderWeekView()}
      {view === "month" && renderMonthView()}
    </div>
  );
}
