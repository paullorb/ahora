export type CalendarView = "day" | "week" | "month";

type Direction = "prev" | "next";

const HOURS_IN_DAY = 24;
const DAYS_IN_WEEK = 7;

const WEEKDAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export function getHourLabels() {
  return Array.from({ length: HOURS_IN_DAY }, (_, hour) =>
    `${String(hour).padStart(2, "0")}:00`
  );
}

export function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function startOfDay(date: Date) {
  const day = new Date(date);
  day.setHours(0, 0, 0, 0);
  return day;
}

export function getWeekStartMonday(date: Date) {
  const day = startOfDay(date);
  const jsDay = day.getDay();
  const mondayOffset = (jsDay + 6) % DAYS_IN_WEEK;
  day.setDate(day.getDate() - mondayOffset);
  return day;
}

export function getWeekDays(date: Date) {
  const weekStart = getWeekStartMonday(date);

  return Array.from({ length: DAYS_IN_WEEK }, (_, index) => {
    const day = new Date(weekStart);
    day.setDate(weekStart.getDate() + index);

    return {
      key: day.toISOString(),
      weekday: WEEKDAY_LABELS[index],
      dayNumber: day.getDate(),
      date: day,
    };
  });
}

function getMonthGridStart(date: Date) {
  const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
  return getWeekStartMonday(monthStart);
}

export function getMonthGridDays(date: Date) {
  const gridStart = getMonthGridStart(date);

  return Array.from({ length: 42 }, (_, index) => {
    const day = new Date(gridStart);
    day.setDate(gridStart.getDate() + index);

    return {
      key: day.toISOString(),
      dayNumber: day.getDate(),
      date: day,
      isCurrentMonth: day.getMonth() === date.getMonth(),
    };
  });
}

export function getHeaderLabel(view: CalendarView, date: Date) {
  if (view === "day") {
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  }

  if (view === "week") {
    const weekStart = getWeekStartMonday(date);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);

    const sameMonth = weekStart.getMonth() === weekEnd.getMonth();
    const sameYear = weekStart.getFullYear() === weekEnd.getFullYear();

    if (sameMonth && sameYear) {
      return `${weekStart.toLocaleDateString("en-US", {
        month: "long",
      })} ${weekStart.getDate()}-${weekEnd.getDate()}, ${weekStart.getFullYear()}`;
    }

    return `${weekStart.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })} - ${weekEnd.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })}`;
  }

  return date.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
}

export function shiftDateForView(date: Date, view: CalendarView, direction: Direction) {
  const nextDate = new Date(date);
  const delta = direction === "next" ? 1 : -1;

  if (view === "day") {
    nextDate.setDate(nextDate.getDate() + delta);
    return nextDate;
  }

  if (view === "week") {
    nextDate.setDate(nextDate.getDate() + delta * 7);
    return nextDate;
  }

  nextDate.setMonth(nextDate.getMonth() + delta);
  return nextDate;
}
