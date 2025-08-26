import { pad2 } from "./format";
export const toDateKey = (d: Date) => `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
export const fromDateKey = (k: string) => { const [y, m, d] = k.split("-").map(Number); return new Date(y, (m || 1) - 1, d || 1); };
export const weekdayRu = ["Вск","Пн","Вт","Ср","Чт","Пт","Сб"];
