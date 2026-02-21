import { timeEntrySchema } from "./schema";
import { TimeEntry, DomainError } from "./types";

export function createTimeEntry(
  input: unknown
): TimeEntry | DomainError {
  const parsed = timeEntrySchema.safeParse(input);

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const { activityName, startTime, endTime } = parsed.data;

  const duration = endTime - startTime;

  return {
    activityName: activityName.trim(),
    startTime: new Date(startTime),
    endTime: new Date(endTime),
    duration,
    createdAt: new Date()
  };
}