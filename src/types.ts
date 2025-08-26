export type Task = { id:string; title:string; minutes:number; offloadDays?: number[] };
export type WeekTemplate = { [weekday:number]: Task[] };
export type ProgressState = { progress:number; closed:boolean };
export type ProgressByDate = { [date:string]: { [taskId:string]: ProgressState } };
export type OverridesByDate = { [date:string]: Task[] };
