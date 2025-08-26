export const pad2 = (n: number) => String(n).padStart(2, "0");
export const fmtMinutes = (m: number) => {
  const sign = m < 0 ? "-" : "";
  const abs = Math.abs(m);
  const h = Math.floor(abs / 60);
  const mm = abs % 60;
  return `${sign}${h} ч ${mm} мин`;
};
export const uuid = () => Math.random().toString(36).slice(2, 10);
