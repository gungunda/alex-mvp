import React, { useMemo } from "react";
import { usePlanner } from "../store/PlannerContext";
import { weekdayRu } from "../lib/date";
import NumberInput from "../components/NumberInput";
import { fmtMinutes } from "../lib/format";

export default function Dashboard(){
  const {
    dateKey, setProgress, nudge, setClosed, createOverride, setPlanned,
    tasksForDate, progressMap, plannedAll, doneAll, remainingOpen, percent, eta
  } = usePlanner();

  const today = useMemo(()=>new Date(dateKey),[dateKey]);
  const weekday = today.getDay();

  return (
    <div className="container-app space-y-4 pb-8">
      <div className="h1">Дашборд</div>
      <div className="kicker">{weekdayRu[weekday]} · {today.toLocaleDateString()}</div>

      <div className="grid md:grid-cols-4 gap-4">
        <div className="card"><div className="card-body stat"><div className="stat-label">Общая нагрузка</div><div className="stat-value">{fmtMinutes(Math.round(plannedAll))}</div></div></div>
        <div className="card"><div className="card-body stat"><div className="stat-label">Выполнено</div><div className="stat-value">{percent}% ({fmtMinutes(Math.round(doneAll))})</div></div></div>
        <div className="card"><div className="card-body stat"><div className="stat-label">Осталось</div><div className="stat-value">{fmtMinutes(Math.round(remainingOpen))}</div></div></div>
        <div className="card"><div className="card-body stat"><div className="stat-label">Финиш (оценка)</div><div className="stat-value">{eta?eta.toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"}):"—"}</div></div></div>
      </div>

      <div className="card">
        <div className="card-body space-y-3">
          <div className="flex items-center justify-between">
            <div className="h2">Сегодняшние занятия</div>
            <div className="kicker">Всего задач: {tasksForDate.length}</div>
          </div>

          {tasksForDate.length===0 ? (
            <div className="empty">На сегодня активных занятий нет. Добавь по шаблону недели или создай переопределение для этой даты.</div>
          ) : (
            <div className="space-y-3">
              {tasksForDate.map(task=>{
                const st = progressMap[task.id];
                const progress = st?.progress ?? 0;
                const closed = st?.closed ?? false;
                const remaining = Math.max(0, task.minutes*(1-progress/100));
                return (
                  <div key={task.id} className={`card ${closed?"opacity-60":""}`}>
                    <div className="card-body grid md:grid-cols-[1fr,auto] gap-3">
                      <div>
                        <div className="font-bold text-base">{task.title}</div>
                        <div className="kicker">План: {fmtMinutes(task.minutes)} · Осталось: {fmtMinutes(Math.round(remaining))}</div>
                        <div className="mt-2">
                          <input className="w-full" type="range" min={0} max={100} value={progress} onChange={e=>setProgress(task.id, Number(e.target.value))}/>
                        </div>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {[0,5,10,50,100].map(v=>(
                            <button key={v} className="pill" onClick={()=>setProgress(task.id,v)}>{v}%</button>
                          ))}
                          {[-10,-5,5,10].map(d=>(
                            <button key={d} className="pill" onClick={()=>nudge(task.id,d)}>{d>0?`+${d}%`:`${d}%`}</button>
                          ))}
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        {!closed ? (
                          <button className="btn" onClick={()=>setClosed(task.id,true)}>Закрыть</button>
                        ) : (
                          <button className="btn" onClick={()=>setClosed(task.id,false)}>Вернуть</button>
                        )}
                      </div>

                      <div className="md:col-span-2 flex items-center gap-3">
                        <span className="kicker">План (мин):</span>
                        <NumberInput value={task.minutes} onChange={(m)=>{ createOverride(); setPlanned(task.id,m); }}/>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
