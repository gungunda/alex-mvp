import React from 'react';
import { weekdayRu, fmtMinutesLong } from '../utils';

export default function OffloadDaysGrid({ value, onChange, daySumsDoing, avgDoing, disabledDay }:{ value:number[]; onChange:(v:number[])=>void; daySumsDoing:number[]; avgDoing:number; disabledDay?: number; }){
  const toggle=(d:number)=>{ if (disabledDay===d) return; const has=value.includes(d); onChange(has?value.filter(x=>x!==d):[...value,d]); };
  const indClass=(sum:number)=>{
    if (avgDoing<=0) return "yellow";
    if (sum < 0.7*avgDoing) return "green";
    if (sum > 1.2*avgDoing) return "red";
    return "yellow";
  };
  return (
    <div className="days-grid">
      {weekdayRu.map((lbl,d)=> {
        const disabled = disabledDay===d;
        return (
          <label key={d} className="day-line" style={{ cursor: disabled?'not-allowed':'pointer', opacity: disabled?0.6:1, textDecoration: disabled?'line-through':'none' }}>
            <span className={`day-ind ${indClass(daySumsDoing[d]||0)}`} />
            <input type="checkbox" disabled={disabled} checked={!disabled && value.includes(d)} onChange={()=>toggle(d)} />
            <div style={{ fontWeight:700 }}>{lbl}</div>
            <div className="small" style={{ marginLeft:"auto", opacity:.7 }}>{fmtMinutesLong(daySumsDoing[d]||0)}</div>
          </label>
        );
      })}
    </div>
  );
}
