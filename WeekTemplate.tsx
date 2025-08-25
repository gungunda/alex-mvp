import React from "react";
import { usePlanner } from "../store/PlannerContext";
import { weekdayRu } from "../lib/date";
import NumberInput from "../components/NumberInput";
import { uuid, fmtMinutes } from "../lib/format";

export default function WeekTemplate(){
  const { weekTemplate, setWeekTemplate } = usePlanner();

  return (
    <div className="container-app space-y-4 pb-8">
      <div className="h1">Шаблон недели</div>
      <div className="kicker">Дефолтные занятия и времена. Помечай «Разгрузка», чтобы предлагать их заранее.</div>

      <div className="grid md:grid-cols-2 gap-4">
        {Array.from({length:7},(_,day)=>day).map(day=>{
          const list = weekTemplate[day] || [];
          const sum = list.reduce((s,t)=>s+(t.minutes||0),0);
          return (
            <div className="card" key={day}>
              <div className="card-body space-y-3">
                <div className="flex items-center justify-between">
                  <div className="h2">{weekdayRu[day]}</div>
                  <div className="kicker">Σ {fmtMinutes(sum)}</div>
                </div>

                <div className="space-y-2">
                  {list.map(t=>(
                    <div className="card bg-[#0e1531]" key={t.id}>
                      <div className="card-body flex items-center justify-between gap-3">
                        <label className="flex items-center gap-2 flex-1">
                          <input type="checkbox" className="h-4 w-4"
                            checked={!!t.offload}
                            onChange={e=>setWeekTemplate(prev=>({...prev,[day]:(prev[day]||[]).map(x=>x.id===t.id?{...x,offload:e.target.checked}:x)}))}/>
                          <input className="input flex-1" value={t.title}
                            onChange={e=>setWeekTemplate(prev=>({...prev,[day]:(prev[day]||[]).map(x=>x.id===t.id?{...x,title:e.target.value}:x)}))}/>
                        </label>
                        <div className="flex items-center gap-2">
                          <span className="kicker">мин:</span>
                          <NumberInput value={t.minutes} onChange={(m)=>setWeekTemplate(prev=>({...prev,[day]:(prev[day]||[]).map(x=>x.id===t.id?{...x,minutes:m}:x)}))}/>
                          <button className="btn" onClick={()=>setWeekTemplate(prev=>({...prev,[day]:(prev[day]||[]).filter(x=>x.id!==t.id)}))}>Удалить</button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <AddRow onAdd={(title,minutes,offload)=> setWeekTemplate(prev=>({
                  ...prev,[day]:[...(prev[day]||[]),{id:uuid(), title, minutes:Math.max(0,Math.round(minutes)), offload}]
                }))}/>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function AddRow({ onAdd }:{onAdd:(title:string,minutes:number,offload:boolean)=>void}){
  const [title,setTitle] = React.useState("");
  const [minutes,setMinutes] = React.useState(60);
  const [offload,setOffload] = React.useState(false);
  return (
    <div className="flex items-center gap-2">
      <label className="flex items-center gap-2">
        <input type="checkbox" className="h-4 w-4" checked={offload} onChange={e=>setOffload(e.target.checked)}/>
        <span className="kicker">Разгрузка</span>
      </label>
      <input className="input flex-1" placeholder="Название" value={title} onChange={e=>setTitle(e.target.value)}/>
      <span className="kicker">мин:</span>
      <NumberInput value={minutes} onChange={setMinutes}/>
      <button className="btn btn-primary" onClick={()=>{ onAdd(title,minutes,offload); setTitle(""); setOffload(false); }}>Добавить</button>
    </div>
  );
}
