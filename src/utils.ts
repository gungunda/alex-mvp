export const pad2 = (n:number)=>String(n).padStart(2,"0");
export const toDateKey=(d:Date)=>`${d.getFullYear()}-${pad2(d.getMonth()+1)}-${pad2(d.getDate())}`;
export const fromDateKey=(k:string)=>{const [y,m,d]=k.split("-").map(Number);return new Date(y,(m||1)-1,(d||1));};
export const addDays=(d:Date,days:number)=>{const x=new Date(d);x.setDate(x.getDate()+days);return x;};
export const weekdayRu = ["Вск","Пн","Вт","Ср","Чт","Пт","Сб"];
export const uuid = ()=>Math.random().toString(36).slice(2,10);
export const fmtMinutesLong=(m:number)=>{const sign=m<0?"-":"";const abs=Math.abs(m);const h=Math.floor(abs/60);const mm=abs%60;return `${sign}${h} ч ${mm} мин`;};
export const fmtHM=(m:number)=>{const h=Math.floor(m/60);const mm=m%60;return `${h}:${pad2(mm)}`;};
