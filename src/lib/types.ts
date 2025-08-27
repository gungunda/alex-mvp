export type ProgressState = { progress: number; closed: boolean };
export type ProgressByDate = { [date: string]: { [taskId: string]: ProgressState } };
export type OverridesByDate = { [date: string]: Task[] };
// Central types for Study Planner

export type Task = {
  id: string;
  title: string;
  minutes: number;
  /** Optional: days-of-week to pre-do (offload) this task. 0..6 (Sun..Sat) */
  offloadDays?: number[];
};

export type WeekTemplate = {
  [weekday: number]: Task[];
};

