import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { Task, WeekTemplate, ProgressByDate, OverridesByDate } from "../lib/types";
import { uuid } from "../lib/format";
import { fromDateKey, toDateKey } from "../lib/date";

type Ctx = {
  dateKey: string; setDateKey: (v:string)=>void;
  weekTemplate: WeekTemplate; setWeekTemplate: React.Dispatch<React.SetStateAction<WeekTemplate>>;
  overrides: OverridesByDate; setOverrides: React.Dispatch<React.SetStateAction<OverridesByDate>>;
  progressByDate: ProgressByDate; setProgressByDate: React.Dispatch<React.SetStateAction<ProgressByDate>>;
  startedAtByDate: Record<string, number>; setStartedAtByDate: React.Dispatch<React.SetStateAction<Record:string,number>>>;
  tasksForDate: Task[];
  progressMap: Record<string,{progress:number;closed:boolean}>;
  plannedAll: number; doneAll: number; remainingOpen: number; percent: number; eta: Date|null;
  setProgress: (id:string, v:number)=>void;
  nudge: (id:string, d:number)=>void;
  setClosed: (id:string, closed:boolean)=>void;
  createOverride: ()=>void;
  setPlanned: (id:string, minutes:number)=>void;
};

// Fix Typescript generic typo
type RecordFix = Record<string, number>;

const LS = { WEEK:"study.weekTemplate", OVERRIDES:"study.overridesByDate", PROGRESS:"study.progressByDate", STARTED:"study.startedAtByDate" };
const loadJSON = <T,>(k:string, fb:T):T => { try{const v=localStorage.getItem(k); return v?JSON.parse(v) as T:fb;}catch{return fb;} };
const saveJSON = <T,>(k:string, v:T)=>localStorage.setItem(k, JSON.stringify(v));

const seedWeek: WeekTemplate = {
  1: [ { id: uuid(), title: "Алгебра", minutes: 90 }, { id: uuid(), title: "Английский", minutes: 60 } ],
  2: [ { id: uuid(), title: "Геометрия", minutes: 240 }, { id: uuid(), title: "Робототехника (кружок)", minutes: 120 } ],
  3: [ { id: uuid(), title: "Литература", minutes: 60 } ],
  4: [ { id: uuid(), title: "История", minutes: 60 }, { id: uuid(), title: "Физика", minutes: 90 } ],
  5: [ { id: uuid(), title: "Химия", minutes: 90 } ],
  6: [ { id: uuid(), title: "Спортсекция", minutes: 60 } ],
  0: [],
};

const PlannerContext = createContext<Ctx | null>(null);

export const PlannerProvider: React.FC<{children:React.ReactNode}> = ({children})=>{
  const [dateKey, setDateKey] = useState(()=>toDateKey(new Date()));
  const [weekTemplate, setWeekTemplate] = useState<WeekTemplate>(()=>loadJSON(LS.WEEK, seedWeek));
  const [overrides, setOverrides] = useState<OverridesByDate>(()=>loadJSON(LS.OVERRIDES, {}));
  const [progressByDate, setProgressByDate] = useState<ProgressByDate>(()=>loadJSON(LS.PROGRESS, {}));
  const [startedAtByDate, setStartedAtByDate] = useState<RecordFix>(()=>loadJSON(LS.STARTED, {}));

  useEffect(()=>saveJSON(LS.WEEK, weekTemplate),[weekTemplate]);
  useEffect(()=>saveJSON(LS.OVERRIDES, overrides),[overrides]);
  useEffect(()=>saveJSON(LS.PROGRESS, progressByDate),[progressByDate]);
  useEffect(()=>saveJSON(LS.STARTED, startedAtByDate),[startedAtByDate]);

  const today = useMemo(()=>fromDateKey(dateKey),[dateKey]);
  const weekday = today.getDay();

  const tasksForDate = useMemo(()=>{
    const o = overrides[dateKey];
    if (o && o.length) return o;
    return weekTemplate[weekday] || [];
  }, [overrides, dateKey, weekTemplate, weekday]);

  const progressMap = progressByDate[dateKey] || {};
  const plannedAll = tasksForDate.reduce((s,t)=>s+t.minutes,0);
  const doneAll = tasksForDate.reduce((s,t)=>s + (t.minutes*(progressMap[t.id]?.progress ?? 0))/100, 0);
  const remainingOpen = tasksForDate.reduce((s,t)=>{
    const st = progressMap[t.id];
    if (st?.closed) return s;
    return s + t.minutes * (1 - (st?.progress ?? 0)/100);
  }, 0);
  const percent = plannedAll>0 ? Math.round((doneAll/plannedAll)*100) : 0;

  const now = new Date();
  const startedAt = startedAtByDate[dateKey];
  let eta: Date|null = null;
  if (remainingOpen>0){
    if (startedAt && doneAll>0){
      const elapsedMin = (now.getTime() - startedAt) / 60000;
      const pace = doneAll / Math.max(1, elapsedMin);
      const left = Math.ceil(remainingOpen / Math.max(0.25, pace));
      eta = new Date(now.getTime() + left * 60000);
    } else eta = new Date(now.getTime() + remainingOpen * 60000);
  } else eta = now;

  const ensureStarted=()=>{ if(!startedAtByDate[dateKey]) setStartedAtByDate(p=>({...p,[dateKey]:Date.now()})); };
  const setProgress=(id:string,v:number)=> {
    ensureStarted();
    setProgressByDate(p=>({
      ...p, [dateKey]: {
        ...(p[dateKey]||{}),
        [id]: { progress: Math.max(0,Math.min(100,Math.round(v))), closed: p[dateKey]?.[id]?.closed || false }
      }
    }));
  };
  const nudge=(id:string,d:number)=> setProgress(id,(progressMap[id]?.progress??0)+d);
  const setClosed=(id:string,closed:boolean)=> setProgressByDate(p=>({...p,[dateKey]:{...(p[dateKey]||{}),[id]:{progress:p[dateKey]?.[id]?.progress??0, closed}}}));
  const createOverride=()=>{ if(!overrides[dateKey]) setOverrides(p=>({...p,[dateKey]:tasksForDate.map(t=>({...t}))})); };
  const setPlanned=(id:string,min:number)=> setOverrides(p=>{
    const base = p[dateKey] ?? tasksForDate;
    const upd = base.map(t=>t.id===id?{...t,minutes:Math.max(0,Math.round(min))}:t);
    return {...p,[dateKey]:upd};
  });

  const value: Ctx = {
    dateKey, setDateKey,
    weekTemplate, setWeekTemplate,
    overrides, setOverrides,
    progressByDate, setProgressByDate,
    startedAtByDate, setStartedAtByDate,
    tasksForDate, progressMap,
    plannedAll, doneAll, remainingOpen, percent, eta,
    setProgress, nudge, setClosed, createOverride, setPlanned
  };

  return <PlannerContext.Provider value={value}>{children}</PlannerContext.Provider>;
};

export const usePlanner = ()=> {
  const ctx = useContext(PlannerContext);
  if (!ctx) throw new Error("usePlanner must be inside PlannerProvider");
  return ctx;
};
