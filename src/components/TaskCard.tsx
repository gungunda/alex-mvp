import React from 'react';
import { Task } from '../types';
import { fmtMinutesLong, fmtHM } from '../utils';

export default function TaskCard({ task, progress, closed, onChangeProgress, onToggleClosed, planMinutes, onEditTime, rightBadge }:{ task:Task; progress:number; closed:boolean; onChangeProgress:(v:number)=>void; onToggleClosed:(closed:boolean)=>void; planMinutes:number; onEditTime?:()=>void; rightBadge?:React.ReactNode; }){
  const remaining = Math.max(0, planMinutes*(1-progress/100));
  return (
    <div className={`card ${closed?"opacity-60":""}`}>
      <div className="card-body">
        <div className="task-header">
          <div className="task-title">{task.title}</div>
          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
            {rightBadge}
            {onEditTime && (
              <button className="time-btn" onClick={onEditTime} title="Изменить план времени">{fmtHM(planMinutes)}</button>
            )}
          </div>
        </div>

        {closed ? (
          <>
            <div className="task-meta">Выполнено: {progress}%</div>
            <div className="card-actions">
              <button className="button" onClick={()=>onToggleClosed(false)}>Возобновить</button>
            </div>
          </>
        ) : (
          <>
            <div className="task-meta">План: {fmtMinutesLong(planMinutes)} · Осталось: {fmtMinutesLong(Math.round(remaining))}</div>
            <div className="progress-wrap">
              <input type="range" min={0} max={100} value={progress} onChange={e=>onChangeProgress(Number(e.target.value))} style={{flex:1}} />
              <span className="progress-percent">{progress}%</span>
            </div>
            <div className="pills">
              <button className="pill" onClick={()=>onChangeProgress(Math.max(0,progress-10))}>-10%</button>
              <button className="pill" onClick={()=>onChangeProgress(Math.min(100,progress+10))}>+10%</button>
            </div>
            <div className="card-actions">
              <button className="button" onClick={()=>onToggleClosed(true)}>Закрыть</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
