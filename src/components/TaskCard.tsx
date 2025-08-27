import React from "react";
import { Task } from "../types";
import { fmtMinutesLong, fmtHM } from "../utils";

type Props = {
  task: Task;
  progress: number;          // 0..100
  closed: boolean;
  planMinutes: number;       // план в минутах
  onChangeProgress: (v: number) => void;
  onToggleClosed: (closed: boolean) => void;
  onEditTime?: () => void;   // клик по кнопке с временем
  rightBadge?: React.ReactNode;
};

const clamp01 = (v: number) => Math.min(100, Math.max(0, v));
const snap10 = (v: number) => Math.round(v / 10) * 10;

export default function TaskCard({
  task,
  progress,
  closed,
  planMinutes,
  onChangeProgress,
  onToggleClosed,
  onEditTime,
  rightBadge,
}: Props) {
  const remaining = Math.max(0, planMinutes * (1 - progress / 100));

  // единая точка изменения значения с квантом 10%
  const setProgress10 = (val: number) => {
    const snapped = snap10(clamp01(val));
    if (snapped !== progress) onChangeProgress(snapped);
  };

  // обработчик для range
  const handleRangeChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const raw = Number(e.target.value);
    setProgress10(raw);
  };

  // «добивание» при отпускании мыши/тача
  const handleRangeMouseUp: React.MouseEventHandler<HTMLInputElement> = (e) => {
    const input = e.currentTarget;
    const raw = Number(input.value);
    setProgress10(raw);
  };

  // клавиатура: ←/→ и PgUp/PgDn шагом 10
  const handleRangeKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (e) => {
    if (e.key === "ArrowLeft" || e.key === "PageDown") {
      e.preventDefault();
      setProgress10(progress - 10);
    } else if (e.key === "ArrowRight" || e.key === "PageUp") {
      e.preventDefault();
      setProgress10(progress + 10);
    } else if (e.key === "Home") {
      e.preventDefault();
      setProgress10(0);
    } else if (e.key === "End") {
      e.preventDefault();
      setProgress10(100);
    }
  };

  const dec10 = () => setProgress10(progress - 10);
  const inc10 = () => setProgress10(progress + 10);

  return (
    <div className={`card ${closed ? "opacity-60" : ""}`}>
      <div className="card-body task">
        <div>
          {/* ===== ШАПКА: название слева, время справа (в правом верхнем углу) ===== */}
          <div
            className="task-header"
            style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8 }}
          >
            <div className="task-title">{task.title}</div>
            {onEditTime && (
              <button
                className="time-btn"
                onClick={onEditTime}
                title="Изменить план времени"
              >
                {fmtHM(planMinutes)}
              </button>
            )}
          </div>

          {/* мета под заголовком */}
          <div className="task-meta" style={{ marginTop: 6 }}>
            План: {fmtMinutesLong(planMinutes)} · Осталось: {fmtMinutesLong(Math.round(remaining))}
          </div>

          {/* прогресс + проценты */}
          <div className="progress-wrap">
            <input
              type="range"
              min={0}
              max={100}
              step={10}                      // шаг 10%
              value={progress}
              onChange={handleRangeChange}
              onMouseUp={handleRangeMouseUp}
              onKeyDown={handleRangeKeyDown}
              style={{ flex: 1 }}
            />
            <span className="progress-percent">{progress}%</span>
          </div>

          {/* единый горизонтальный ряд: слева -10/+10, справа Закрыть/Вернуть */}
          <div className="task-actions-row" style={{ marginTop: 10, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div className="pills" style={{ marginTop: 0 }}>
              <button className="pill" onClick={dec10}>-10%</button>
              <button className="pill" onClick={inc10}>+10%</button>
            </div>

            <div>
              {!closed ? (
                <button className="button" onClick={() => onToggleClosed(true)}>Закрыть</button>
              ) : (
                <button className="button" onClick={() => onToggleClosed(false)}>Вернуть</button>
              )}
            </div>
          </div>
        </div>

        {/* правый бейдж (дата/«через N д.») */}
        <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
          {rightBadge}
        </div>
      </div>
    </div>
  );
}
