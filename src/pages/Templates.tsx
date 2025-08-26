import React, { useMemo, useState, useEffect } from 'react';
import { WeekTemplate, Task } from '../types';
import { weekdayRu, fmtMinutesLong, fmtHM } from '../utils';
import Modal from '../components/Modal';
import TimePicker from '../components/TimePicker';
import OffloadDaysGrid from '../components/OffloadDaysGrid';
import LS, { saveJSON } from '../storage';

export default function Templates({ weekTemplate, setWeekTemplate }:{ weekTemplate:WeekTemplate; setWeekTemplate:(u:WeekTemplate)=>void; }){
  const daySumsRaw = useMemo(()=> Array.from({length:7},(_,d)=> (weekTemplate[(d+1)%7]||[]).reduce((s,t)=>s+(t.minutes||0),0)), [weekTemplate]); // сколько ДЕЛАТЬ в день d
  const avg = useMemo(()=> daySumsRaw.reduce((a,b)=>a+b,0) / 7, [daySumsRaw]);
  const sumClass = (sum:number)=>{
    if (avg<=0) return {class:"", label:fmtMinutesLong(sum)};
    if (sum < 0.7*avg) return {class:"sum-green", label:fmtMinutesLong(sum)};
    if (sum > 1.2*avg) return {class:"sum-red", label:fmtMinutesLong(sum)};
    return {class:"sum-warn", label:fmtMinutesLong(sum)};
  };

  const [timeEdit, setTimeEdit] = useState<{ open:boolean; day:number|null; taskId:string|null; h:number; m:number; }>({
    open:false, day:null, taskId:null, h:0, m:0
  });
  const openTimeEditTemplate=(day:number,t:Task)=>{ const h=Math.floor(t.minutes/60); const m=t.minutes%60; setTimeEdit({ open:true, day, taskId:t.id, h, m: Math.round(m/10)*10 }); };
  const closeTimeEdit=()=>setTimeEdit(s=>({...s,open:false}));
  const applyTimeEdit=()=>{
    if(timeEdit.day==null || !timeEdit.taskId) return closeTimeEdit();
    const total = timeEdit.h*60 + timeEdit.m;
    setWeekTemplate(prev=>({ ...prev, [timeEdit.day!]: (prev[timeEdit.day!]||[]).map(x=>x.id===timeEdit.taskId?{...x,minutes:total}:x) }));
    closeTimeEdit();
  };

  const [offloadEdit, setOffloadEdit] = useState<{ open:boolean; day:number|null; taskId:string|null; days:number[] }>({ open:false, day:null, taskId:null, days:[] });
  const openOffloadEdit=(day:number,t:Task)=> setOffloadEdit({ open:true, day, taskId:t.id, days:[...(t.offloadDays??[])] });
  const closeOffloadEdit=()=>setOffloadEdit(s=>({...s,open:false}));
  const applyOffloadEdit=()=>{ if(offloadEdit.day==null || !offloadEdit.taskId) return closeOffloadEdit(); setWeekTemplate(prev=>({ ...prev, [offloadEdit.day!]: (prev[offloadEdit.day!]||[]).map(x=>x.id===offloadEdit.taskId?{...x,offloadDays:[...offloadEdit.days]}:x) })); closeOffloadEdit(); };

  const [addModal, setAddModal] = useState<{ open:boolean; day:number|null; title:string; h:number; m:number; offloadDays:number[] }>({ open:false, day:null, title:"", h:1, m:0, offloadDays:[] });
  const openAdd=(day:number)=> setAddModal({ open:true, day, title:"", h:1, m:0, offloadDays:[] });
  const closeAdd=()=> setAddModal(s=>({...s,open:false}));
  const applyAdd=()=>{
    if(addModal.day==null || !addModal.title.trim()) return closeAdd();
    const minutes = addModal.h*60 + addModal.m;
    const task:Task = { id:Math.random().toString(36).slice(2,10), title:addModal.title.trim(), minutes, offloadDays:[...addModal.offloadDays] };
    setWeekTemplate(prev=>({ ...prev, [addModal.day!]: [ ...(prev[addModal.day!]||[]), task ] }));
    closeAdd();
  };

  useEffect(()=>{ saveJSON(LS.WEEK, weekTemplate); },[weekTemplate]);

  return (
    <div className="container">
      <div className="h1">Правка расписания</div>
      <div className="kicker">⌚ — изменить время; 🗓️ — дни разгрузки; 🗑️ — удалить; ➕ — добавить предмет. Цвет суммы у дня — по загруженности (зел/жёлт/красн).</div>

      <div className="grid" style={{ gap:18, marginTop:16 }}>
        {Array.from({length:7},(_,day)=>day).map(day=>{
          const list = weekTemplate[day] || [];
          const doSum = daySumsRaw[day]; // сколько делать в этот день (назначено на следующий)
          const sumInfo = sumClass(doSum);
          return (
            <div className="card" key={day}>
              <div className="card-body">
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                  <div className="h2">{weekdayRu[day]}</div>
                  <div className={`sum-strong ${sumInfo.class}`} style={{ fontWeight:900 }}>{sumInfo.label}</div>
                </div>

                <div className="grid" style={{ gap:10, marginTop:10 }}>
                  {list.map(t=> (
                    <div className="card" key={t.id} style={{ background:"#0e1531" }}>
                      <div className="card-body" style={{ display:"flex", gap:12, justifyContent:"space-between", alignItems:"center", flexWrap:"wrap" }}>
                        <div style={{flex:1, minWidth:220, fontWeight:700}}>{t.title}</div>
                        <div className="small" title="План времени">{fmtHM(t.minutes)}</div>
                        <button className="icon-btn" onClick={()=>openTimeEditTemplate(day,t)} aria-label="Время" title="Изменить время">⌚</button>
                        <button className="icon-btn" onClick={()=>openOffloadEdit(day,t)} aria-label="Дни разгрузки" title="Дни разгрузки">🗓️</button>
                        <button className="icon-btn" onClick={()=>setWeekTemplate(prev=>({ ...prev, [day]:(prev[day]||[]).filter(x=>x.id!==t.id) }))} aria-label="Удалить предмет" title="Удалить предмет">🗑️</button>
                      </div>
                    </div>
                  ))}
                </div>

                <div style={{ display:"flex", justifyContent:"flex-end", marginTop:12 }}>
                  <button className="icon-btn" onClick={()=>openAdd(day)} aria-label="Добавить предмет" title="Добавить предмет">➕</button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <Modal open={timeEdit.open} title="Выбор времени" onClose={closeTimeEdit} onOk={applyTimeEdit}>
        <TimePicker h={timeEdit.h} m={timeEdit.m} onChange={(h,m)=>setTimeEdit(s=>({...s,h,m}))} />
      </Modal>

      <Modal open={offloadEdit.open} title="Дни разгрузки" onClose={closeOffloadEdit} onOk={applyOffloadEdit}>
        <OffloadDaysGrid value={offloadEdit.days} onChange={days=>setOffloadEdit(s=>({...s,days}))} daySums={daySumsRaw} avg={avg} disableDay={offloadEdit.day!==null ? (offloadEdit.day + 6) % 7 : null} />
      </Modal>

      <Modal open={addModal.open} title="Добавить предмет" onClose={closeAdd} onOk={applyAdd}>
        <div style={{ display:"grid", gap:12 }}>
          <input className="input" placeholder="Название" value={addModal.title} onChange={e=>setAddModal(s=>({...s,title:e.target.value}))} />
          <div className="small">Время</div>
          <TimePicker h={addModal.h} m={addModal.m} onChange={(h,m)=>setAddModal(s=>({...s,h,m}))} />
          <div className="small">Дни разгрузки</div>
          <OffloadDaysGrid value={addModal.offloadDays} onChange={v=>setAddModal(s=>({...s,offloadDays:v}))} daySums={daySumsRaw} avg={avg} disableDay={addModal.day!==null ? (addModal.day + 6) % 7 : null} />
        </div>
      </Modal>
    </div>
  );
}
