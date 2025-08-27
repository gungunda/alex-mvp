import React, { useMemo, useState, useEffect } from 'react';
import { WeekTemplate, Task } from '../types';
import { weekdayRu, fmtMinutesLong, fmtHM } from '../utils';
import Modal from '../components/Modal';
import TimePicker from '../components/TimePicker';
import OffloadDaysGrid from '../components/OffloadDaysGrid';
import LS, { saveJSON } from '../storage';

export default function Templates({ weekTemplate, setWeekTemplate }:{ weekTemplate:WeekTemplate; setWeekTemplate:(u:WeekTemplate)=>void; }){
  const daySumsAssigned = useMemo(()=> Array.from({length:7},(_,d)=> (weekTemplate[d]||[]).reduce((s,t)=>s+(t.minutes||0),0)), [weekTemplate]);
  const avgAssigned = useMemo(()=> daySumsAssigned.reduce((a,b)=>a+b,0) / (daySumsAssigned.length||1), [daySumsAssigned]);
  const sumClassAssigned = (sum:number, avg:number)=>{
    if (avg<=0) return {class:"", label:fmtMinutesLong(sum)};
    if (sum < 0.5*avg) return {class:"sum-green", label:fmtMinutesLong(sum)};
    if (sum > avg) return {class:"sum-red", label:fmtMinutesLong(sum)};
    return {class:"sum-warn", label:fmtMinutesLong(sum)};
  };
  const daySumsDoing = useMemo(()=> Array.from({length:7},(_,d)=> daySumsAssigned[(d+1)%7]), [daySumsAssigned]);
  const avgDoing = useMemo(()=> daySumsDoing.reduce((a,b)=>a+b,0) / (daySumsDoing.length||1), [daySumsDoing]);

  const [templateEdit, setTemplateEdit] = useState<{ open:boolean; day:number|null; taskId:string|null; title:string; h:number; m:number; offloadDays:number[] }>({
    open:false, day:null, taskId:null, title:"", h:1, m:0, offloadDays:[]
  });
  const openTemplateEdit=(day:number,t:Task)=> setTemplateEdit({
    open:true, day, taskId:t.id, title:t.title, h:Math.floor(t.minutes/60), m:Math.round((t.minutes%60)/10)*10, offloadDays:[...(t.offloadDays??[])]
  });
  const closeTemplateEdit=()=>setTemplateEdit(s=>({...s,open:false}));
  const saveTemplateEdit=()=>{
    if(templateEdit.day==null || !templateEdit.taskId) return closeTemplateEdit();
    const minutes = templateEdit.h*60 + templateEdit.m;
    setWeekTemplate(prev=>({ ...prev, [templateEdit.day!]: (prev[templateEdit.day!]||[]).map(x=>x.id===templateEdit.taskId?{...x,title:templateEdit.title.trim()||x.title, minutes, offloadDays:[...templateEdit.offloadDays]}:x) }));
    closeTemplateEdit();
  };
  const deleteTemplateTask=()=>{
    if(templateEdit.day==null || !templateEdit.taskId) return closeTemplateEdit();
    setWeekTemplate(prev=>({ ...prev, [templateEdit.day!]: (prev[templateEdit.day!]||[]).filter(x=>x.id!==templateEdit.taskId) }));
    closeTemplateEdit();
  };

  const [addModal, setAddModal] = useState<{ open:boolean; day:number|null; title:string; h:number; m:number; offloadDays:number[] }>({
    open:false, day:null, title:"", h:1, m:0, offloadDays:[]
  });
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
      <div className="kicker">Сумма в заголовке — сколько ЗАДАНО в этот день. В модалке разгрузки видно нагрузку на ДЕЛАТЬ (сдвиг -1). Нажми ✏️ для редактирования.</div>

      <div className="grid" style={{ gap:18, marginTop:16 }}>
        {Array.from({length:7},(_,day)=>day).map(day=>{
          const list = weekTemplate[day] || [];
          const sumAssigned = daySumsAssigned[day];
          const sumInfo = sumClassAssigned(sumAssigned, avgAssigned);
          return (
            <div className="card" key={day}>
              <div className="card-body">
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                  <div className="h2">{weekdayRu[day]}</div>
                  <div className={`sum-strong ${sumInfo.class}`}>{sumInfo.label}</div>
                </div>

                <div className="grid" style={{ gap:10, marginTop:10 }}>
                  {list.map(t=> (
                    <div className="card" key={t.id} style={{ background:"#0e1531" }}>
                      <div className="card-body" style={{ display:"flex", gap:12, justifyContent:"space-between", alignItems:"center", flexWrap:"wrap" }}>
                        <div style={{flex:1, minWidth:220, fontWeight:700}}>{t.title}</div>
                        <div className="small">{fmtHM(t.minutes)}</div>
                        <button className="icon-btn" onClick={()=>openTemplateEdit(day,t)} title="Править">✏️</button>
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

      <Modal open={templateEdit.open} title="Правка предмета" onClose={closeTemplateEdit}>
        <div style={{ display:"grid", gap:12 }}>
          <label className="small">Название</label>
          <input className="input" value={templateEdit.title} onChange={e=>setTemplateEdit(s=>({...s,title:e.target.value}))} />
          <label className="small">Время</label>
          <TimePicker h={templateEdit.h} m={templateEdit.m} onChange={(h,m)=>setTemplateEdit(s=>({...s,h,m}))} />
          <label className="small">Дни разгрузки (нагрузка «делать»)</label>
          <OffloadDaysGrid value={templateEdit.offloadDays} onChange={days=>setTemplateEdit(s=>({...s,offloadDays:days}))}
            daySumsDoing={daySumsDoing} avgDoing={avgDoing} disabledDay={templateEdit.day!==null ? (templateEdit.day + 6) % 7 : undefined} />
          <div style={{ display:"flex", justifyContent:"space-between", marginTop:6 }}>
            <button className="button" onClick={deleteTemplateTask}>Удалить</button>
            <div style={{ display:"flex", gap:8 }}>
              <button className="button ghost" onClick={closeTemplateEdit}>Отмена</button>
              <button className="button" onClick={saveTemplateEdit}>Сохранить</button>
            </div>
          </div>
        </div>
      </Modal>

      <Modal open={addModal.open} title="Добавить предмет" onClose={closeAdd} onOk={applyAdd}>
        <div style={{ display:"grid", gap:12 }}>
          <input className="input" placeholder="Название" value={addModal.title} onChange={e=>setAddModal(s=>({...s,title:e.target.value}))} />
          <div className="small">Время</div>
          <TimePicker h={addModal.h} m={addModal.m} onChange={(h,m)=>setAddModal(s=>({...s,h,m}))} />
          <div className="small">Дни разгрузки</div>
          <OffloadDaysGrid value={addModal.offloadDays} onChange={v=>setAddModal(s=>({...s,offloadDays:v}))} daySumsDoing={daySumsDoing} avgDoing={avgDoing} disabledDay={addModal.day!==null ? (addModal.day + 6) % 7 : undefined} />
        </div>
      </Modal>
    </div>
  );
}
