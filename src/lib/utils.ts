// src/utils.ts
export const weekdayRu = ["Вск", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"];

export const fmtMinutesLong = (m: number) => {
  const sign = m < 0 ? "-" : "";
  const abs = Math.abs(m);
  const h = Math.floor(abs / 60);
  const mm = abs % 60;
  return `${sign}${h} ч ${mm} мин`;
};

export const fmtHM = (m: number) => {
  const h = Math.floor(m / 60);
  const mm = m % 60;
  return `${h}:${String(mm).padStart(2, "0")}`;
};
