export type ScheduleEntry = {
  id: string;
  title: string;
  category: string;
  startTime: number;
  endTime: number;
  decomposition: string[];
  createdAt: number;
};

export type ScheduleEntryInput = {
  title: string;
  category?: string;
  startTime: number;
  endTime: number;
  decomposition?: string[];
};
