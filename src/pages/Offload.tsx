import React, { useMemo } from "react";
import { usePlanner } from "../store/PlannerContext";
import { weekdayRu } from "../lib/date";
import { fmtMinutes } from "../lib/format";

export default function Offload(){
  const { dateKey, weekTemplate } = usePlanner();
  const today = useMemo(()=>new Date(dateKey),[dateKey]);

  const queue: {title:string; minutes:number; weekday:number; dayDiff:number; id:string}[] = [];
  for (let i=1;i<=7;i++){
    const fut = new Date(today); fut.setDate(today.getDate()+i);
    const wk = fut.getDay();
    (weekTemplate[wk]||[]).forEach(t=>{
      if (t.offload) queue.push({ title:t.title, minutes:t.minutes, weekday:wk, dayDiff:i, id:`${wk}-${t.id}` });
    });
  }
  queue.sort((a,b)=>a.dayDiff-b.dayDiff);

  return (
    <div className="container-app space-y-4 pb-8">
      <div className="h1">Разгрузка</div>
      <div className="kicker">Сделай сегодня то, что тяжело в ближайшие дни.</div>

      {queue.length===0 ? (
        <div className="card"><div className="card-body"><div className="empty">Нет предметов, помеченных для разгрузки. Отметь чекбокс в «Шаблон недели».</div></div></div>
      ) : (
        <div className="grid md:grid-cols-2 gap-3">
          {queue.map(i=>(
            <div key={i.id} className="card">
              <div className="card-body flex items-center justify-between">
                <div>
                  <div className="font-bold">{i.title}</div>
                  <div className="kicker">{fmtMinutes(i.minutes)} · {weekdayRu[i.weekday]} (через {i.dayDiff} д.)</div>
                </div>
                <div className="pill">Будущий день</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
