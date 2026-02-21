import { z } from "zod";

export const timeEntrySchema = z.object({
  activityName: z.string().trim().min(1, "Activity name is required."),
  startTime: z.number().min(0, "Start time must be a valid number."),
  endTime: z.number().min(0, "End time must be a valid number."),
}).refine(
  data => data.endTime >= data.startTime,
  {
    message: "End time cannot be before start time.",
    path: ["endTime"]
  }
);

export type TimeEntryInput = z.infer<typeof timeEntrySchema>;