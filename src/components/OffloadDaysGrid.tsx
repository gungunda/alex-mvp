import React from 'react';
import { weekdayRu, fmtMinutesLong } from '../utils';

export default function OffloadDaysGrid({ value, onChange, daySums, avg, disableDay }:{ value:number[]; onChange:(v:number[])=>void; daySums:number[]; avg:number; disableDay?: number|null }){
  const toggle=(d:number)=>{ if (disableDay===d) return; const has=value.includes(d); onChange(has?value.filter(x=>x!==d):[...value,d]); };
  const indClass=(sum:number)=>{
    if (avg<=0) return "yellow";
    if (sum < 0.7*avg) return "green";
    if (sum > 1.2*avg) return "red";
    return "yellow";
  };
  return (
    <div className="days-grid">
      {weekdayRu.map((lbl,d)=> {
        const disabled = disableDay===d;
        return (
          <label key={d} className="day-line" style={{ cursor: disabled?'not-allowed':'pointer', opacity: disabled?0.5:1, textDecoration: disabled?'line-through':'none' }}>
            <span className={`day-ind ${indClass(daySums[d]||0)}`} />
            <input type="checkbox" disabled={disabled} checked={value.includes(d)} onChange={()=>toggle(d)} />
            <div style={{ fontWeight:700 }}>{lbl}</div>
            <div className="small" style={{ marginLeft:"auto", opacity:.7 }}>{fmtMinutesLong(daySums[d]||0)}</div>
          </label>
        );
      })}
    </div>
  );
}
