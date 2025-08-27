import React, { useMemo, useState, useEffect } from 'react';
import { Task, WeekTemplate, ProgressByDate, OverridesByDate } from '../types';
import { fromDateKey, addDays, weekdayRu, fmtMinutesLong } from '../utils';
import LS, { saveJSON } from '../storage';
import TaskCard from '../components/TaskCard';
import Modal from '../components/Modal';
import TimePicker from '../components/TimePicker';

export default function Dashboard({
  weekTemplate, overrides, progressByDate, startedAtByDate,
  setOverrides, setProgressByDate, setStartedAtByDate,
  dateKey,   // <-- получаем дату от App
}:{
  weekTemplate: WeekTemplate;
  overrides: OverridesByDate;
  progressByDate: ProgressByDate;
  startedAtByDate: Record<string, number>;
  setOverrides:(u:OverridesByDate)=>void;
  setProgressByDate:(u:ProgressByDate)=>void;
  setStartedAtByDate:(u:Record<string,number>)=>void;
  dateKey: string;
}){
  // !!! локальное состояние dateKey УДАЛЕНО — используем проп
  const today = useMemo(()=>fromDateKey(dateKey),[dateKey]);
  const weekday = today.getDay();
  const tomorrow = useMemo(()=>addDays(today, 1),[today]);
  const tomorrowKey = useMemo(()=>`${tomorrow.getFullYear()}-${String(tomorrow.getMonth()+1).padStart(2,"0")}-${String(tomorrow.getDate()).padStart(2,"0")}`,[tomorrow]);
  const tomorrowWeekday = tomorrow.getDay();

  const tasksForTomorrow = useMemo(()=>{
    const o = overrides[tomorrowKey];
    if (o && o.length) return o;
    return weekTemplate[tomorrowWeekday] || [];
  },[overrides, tomorrowKey, weekTemplate, tomorrowWeekday]);

  const progressMap = progressByDate[dateKey] || {};

  const plannedAll = tasksForTomorrow.reduce((s,t)=>s+t.minutes,0);
  const doneAll = tasksForTomorrow.reduce((s,t)=>s + (t.minutes*(progressMap[t.id]?.progress??0))/100,0);
  const remainingOpen = tasksForTomorrow.reduce((s,t)=>{ const st = progressMap[t.id]; if (st?.closed) return s; return s + t.minutes*(1-(st?.progress??0)/100); },0);
  const percent = plannedAll>0 ? Math.round((doneAll/plannedAll)*100) : 0;

  const now = new Date();
  const startedAt = startedAtByDate[dateKey];
  let eta: Date | null = null;
  if (remainingOpen>0){
    if (startedAt && doneAll>0){ const elapsedMin=(now.getTime()-startedAt)/60000; const pace=doneAll/Math.max(1,elapsedMin); const left=Math.ceil(remainingOpen/Math.max(0.25, pace)); eta=new Date(now.getTime()+left*60000); }
    else { eta=new Date(now.getTime()+remainingOpen*60000); }
  } else { eta=now; }

  type OffloadItem = { task:Task; dayDiff:number; weekday:number };
  const offloadQueue: OffloadItem[] = useMemo(()=>{
    const acc: OffloadItem[] = [];
    for(let i=1;i<=7;i++){
      const future = addDays(today, i);
      const wk = future.getDay();
      (weekTemplate[wk]||[]).forEach(t=>{
        const days = t.offloadDays??[];
        if (days.includes(weekday)) acc.push({task:t, dayDiff:i, weekday:wk});
      });
    }
    acc.sort((a,b)=>a.dayDiff-b.dayDiff);
    return acc;
  },[today, weekTemplate, weekday]);

  const offloadId = (wk:number,t:Task)=>`offload:${wk}:${t.id}`;

  const ensureStarted=()=>{ if(!startedAtByDate[dateKey]) setStartedAtByDate({ ...startedAtByDate, [dateKey]:Date.now() }); };
  const setProgress=(taskId:string,value:number)=>{
    ensureStarted();
    const v = Math.max(0,Math.min(100,Math.round(value)));
    setProgressByDate({
      ...progressByDate,
      [dateKey]:{ ...(progressByDate[dateKey]||{}), [taskId]:{ progress: v, closed: v>=100 || progressByDate[dateKey]?.[taskId]?.closed||false } }
    });
  };
  const setClosed=(id:string,closed:boolean)=> setProgressByDate({
    ...progressByDate,
    [dateKey]:{ ...(progressByDate[dateKey]||{}), [id]:{ progress:progressByDate[dateKey]?.[id]?.progress??0, closed } }
  });

  const setOffloadProgress=(wk:number,tId:string,value:number)=>{
    const id = offloadId(wk,{id:tId,title:"",minutes:0} as Task);
    const v = Math.max(0,Math.min(100,Math.round(value)));
    setProgressByDate({
      ...progressByDate,
      [dateKey]:{ ...(progressByDate[dateKey]||{}), [id]:{ progress: v, closed: v>=100 || progressByDate[dateKey]?.[id]?.closed||false } }
    });
  };
  const setOffloadClosed=(wk:number,t:Task,closed:boolean)=>{
    const id = offloadId(wk,t);
    setProgressByDate({
      ...progressByDate,
      [dateKey]:{ ...(progressByDate[dateKey]||{}), [id]:{ progress:progressByDate[dateKey]?.[id]?.progress??0, closed } }
    });
  };

  const createOverrideForTomorrow=()=>{ if(!overrides[tomorrowKey]) setOverrides({ ...overrides, [tomorrowKey]:tasksForTomorrow.map(t=>({...t})) }); };
  const setPlannedTomorrow=(id:string,min:number)=> setOverrides({
    ...overrides,
    [tomorrowKey]:(overrides[tomorrowKey]??tasksForTomorrow).map(t=>t.id===id?{...t,minutes:Math.max(0,Math.round(min))}:t)
  });

  const [timeEdit, setTimeEdit] = useState<{ open:boolean; taskId:string|null; h:number; m:number; }>({
    open:false, taskId:null, h:0, m:0
  });
  const openTimeEditTomorrow=(t:Task)=>{ const h=Math.floor(t.minutes/60); const m=t.minutes%60; setTimeEdit({ open:true, taskId:t.id, h, m: Math.round(m/10)*10 }); };
  const closeTimeEdit=()=>setTimeEdit(s=>({...s,open:false}));
  const applyTimeEdit=()=>{
    if(!timeEdit.taskId) return closeTimeEdit();
    const total = timeEdit.h*60 + timeEdit.m;
    createOverrideForTomorrow();
    setPlannedTomorrow(timeEdit.taskId, total);
    closeTimeEdit();
  };

  useEffect(()=>{
    saveJSON(LS.OVERRIDES, overrides);
    saveJSON(LS.PROGRESS, progressByDate);
    saveJSON(LS.STARTED, startedAtByDate);
  },[overrides, progressByDate, startedAtByDate]);

  return (
    <div className="container">
      <div className="h1">Дашборд</div>
      <div className="kicker">Сегодня: {weekdayRu[weekday]} · {today.toLocaleDateString()} · Домашка на завтра: {weekdayRu[tomorrowWeekday]} ({tomorrow.toLocaleDateString()})</div>

      <div className="grid cols-4" style={{ marginTop:16 }}>
        <div className="card"><div className="card-body stat"><div className="label">Общая нагрузка</div><div className="value">{fmtMinutesLong(Math.round(plannedAll))}</div></div></div>
        <div className="card"><div className="card-body stat"><div className="label">Выполнено</div><div className="value">{percent}% ({fmtMinutesLong(Math.round(doneAll))})</div></div></div>
        <div className="card"><div className="card-body stat"><div className="label">Осталось</div><div className="value">{fmtMinutesLong(Math.round(remainingOpen))}</div></div></div>
        <div className="card"><div className="card-body stat"><div className="label">Финиш (оценка)</div><div className="value">{(remainingOpen<=0? new Date() : (new Date(new Date().getTime() + remainingOpen*60000))).toLocaleTimeString([], {hour:"2-digit", minute:"2-digit"})}</div></div></div>
      </div>

      <div className="card" style={{ marginTop:18 }}>
        <div className="card-body">
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
            <div className="h2">Домашка на завтра</div>
            <div className="badge">Всего задач: {tasksForTomorrow.length}</div>
          </div>
          {tasksForTomorrow.length===0 ? (
            <div className="empty">На завтра активных занятий нет. Добавь по шаблону недели или создай переопределение для этой даты.</div>
          ):(
            <div className="grid" style={{ gap:12 }}>
              {[...tasksForTomorrow].sort((a,b)=>{
                const sa=progressMap[a.id]; const sb=progressMap[b.id];
                if((sa?.closed)&&(sb?.closed)) return 0;
                if(sa?.closed) return 1;
                if(sb?.closed) return -1;
                return 0;
              }).map(task=>{
                const st = progressMap[task.id];
                const progress = st?.progress ?? 0;
                const closed = st?.closed ?? false;
                return (
                  <TaskCard
                    key={task.id}
                    task={task}
                    progress={progress}
                    closed={closed}
                    planMinutes={task.minutes}
                    onChangeProgress={v=>setProgress(task.id,v)}
                    onToggleClosed={c=>setClosed(task.id,c)}
                    onEditTime={()=>openTimeEditTomorrow(task)}
                  />
                );
              })}
            </div>
          )}
        </div>
      </div>

      {offloadQueue.length>0 && (
        <>
          <div className="hr" />
          <div className="h2">Разгрузка на сегодня</div>
          <div className="kicker">Подготовь заранее то, что назначено на ближние дни (отмечено разгрузкой на {weekdayRu[weekday]}).</div>
          <div className="grid" style={{ gap:12, marginTop:12 }}>
            {offloadQueue.map(({task,dayDiff,weekday:wk})=>{
              const id = offloadId(wk,task); const st = progressMap[id]; const progress = st?.progress ?? 0; const closed = st?.closed ?? false;
              return (
                <TaskCard
                  key={id}
                  task={task}
                  progress={progress}
                  closed={closed}
                  planMinutes={task.minutes}
                  onChangeProgress={v=>setOffloadProgress(wk, task.id, v)}
                  onToggleClosed={c=>setOffloadClosed(wk, task, c)}
                  rightBadge={<span className="badge">{weekdayRu[wk]} · через {dayDiff} д.</span>}
                />
              );
            })}
          </div>
        </>
      )}

      <Modal open={timeEdit.open} title="Время на задачу (завтра)" onClose={closeTimeEdit} onOk={applyTimeEdit} okText="✔️ Сохранить">
        <TimePicker h={timeEdit.h} m={timeEdit.m} onChange={(h,m)=>setTimeEdit(s=>({...s,h,m}))} />
      </Modal>
    </div>
  );
}
