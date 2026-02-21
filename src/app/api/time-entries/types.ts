export type TimeEntry = {
  activityName: string;
  startTime: Date;
  endTime: Date;
  duration: number;
  createdAt: Date;
};

export type DomainError = {
  error: string;
};