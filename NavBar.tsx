import React from "react";
import { Link, useLocation } from "react-router-dom";
import { usePlanner } from "../store/PlannerContext";

export default function NavBar(){
  const { dateKey, setDateKey } = usePlanner();
  const { pathname } = useLocation();
  const tab = (path:string, label:string) => (
    <Link to={path} className={`tab ${pathname===path ? "tab-active":""}`}>{label}</Link>
  );
  return (
    <div className="appbar">
      <div className="container-app flex items-center justify-between py-3">
        <div className="flex items-center gap-3 font-extrabold">
          <div className="w-8 h-8 rounded-xl grid place-items-center bg-gradient-to-br from-brand to-brand2 text-[#0c0f1f]">ST</div>
          Study Planner
        </div>
        <div className="flex gap-2 flex-wrap">
          {tab("/dashboard","Dashboard")}
          {tab("/offload","Разгрузка")}
          {tab("/week","Шаблон недели")}
        </div>
        <div className="flex items-center gap-2">
          <input className="input" type="date" value={dateKey} onChange={e=>setDateKey(e.target.value)} />
          <button className="btn btn-ghost" onClick={()=>setDateKey(new Date().toISOString().slice(0,10))}>Сегодня</button>
        </div>
      </div>
    </div>
  );
}
