import React, { useEffect, useState } from "react";

export default function NumberInput({ value, onChange }:{value:number; onChange:(v:number)=>void}){
  const [txt, setTxt] = useState(String(value));
  useEffect(()=>setTxt(String(value)),[value]);
  return (
    <div className="flex items-center gap-2">
      <button className="btn" onClick={()=>onChange(Math.max(0,value-5))}>-5</button>
      <input className="input w-24" value={txt} onChange={e=>setTxt(e.target.value)} onBlur={()=>{
        const n = Number(txt); onChange(Number.isFinite(n)?n:value);
      }}/>
      <button className="btn" onClick={()=>onChange(value+5)}>+5</button>
    </div>
  );
}
