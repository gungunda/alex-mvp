export type Task = { id: string; title: string; minutes: number; offload?: boolean };
export type WeekTemplate = { [weekday: number]: Task[] };
export type ProgressState = { progress: number; closed: boolean };
export type ProgressByDate = { [date: string]: { [taskId: string]: ProgressState } };
export type OverridesByDate = { [date: string]: Task[] };
