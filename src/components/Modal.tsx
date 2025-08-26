import React from 'react';

export default function Modal({ open, title, onClose, children, onOk, okText = "✔️ OK" }:{ open:boolean; title:string; onClose:()=>void; children:React.ReactNode; onOk?:()=>void; okText?:string }){
  if (!open) return null;
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={e=>e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">{title}</div>
          <button className="button ghost" onClick={onClose} aria-label="Закрыть">✖️</button>
        </div>
        <div>{children}</div>
        {onOk && (
          <div style={{ display:"flex", justifyContent:"flex-end", gap:8, marginTop:12 }}>
            <button className="button" onClick={onOk}>{okText}</button>
          </div>
        )}
      </div>
    </div>
  );
}
