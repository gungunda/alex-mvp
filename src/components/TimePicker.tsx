import React from 'react';
import { pad2 } from '../utils';

export default function TimePicker({ h, m, onChange, maxHours=12 }:{ h:number; m:number; onChange:(h:number,m:number)=>void; maxHours?:number }){
  const minuteOptions = [0,10,20,30,40,50];
  return (
    <div className="wheels">
      <div className="wheel">
        <select value={h} onChange={e=>onChange(Number(e.target.value), m)}>
          {Array.from({length:maxHours+1},(_,i)=>i).map(H=> <option key={H} value={H}>{H}</option>)}
        </select>
      </div>
      <div style={{ fontWeight:900, fontSize:20 }}>:</div>
      <div className="wheel">
        <select value={m} onChange={e=>onChange(h, Number(e.target.value))}>
          {minuteOptions.map(M=> <option key={M} value={M}>{pad2(M)}</option>)}
        </select>
      </div>
    </div>
  );
}
