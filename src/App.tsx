import React, { useEffect, useState } from 'react';
import { WeekTemplate, ProgressByDate, OverridesByDate } from './types';
import { uuid, toDateKey } from './utils';
import LS, { loadJSON, saveJSON } from './storage';
import Dashboard from './pages/Dashboard';
import Templates from './pages/Templates';

const seedWeek: WeekTemplate = {
  1: [ { id: uuid(), title: "Алгебра", minutes: 90 }, { id: uuid(), title: "Английский", minutes: 60 } ],
  2: [ { id: uuid(), title: "Геометрия", minutes: 240 }, { id: uuid(), title: "Робототехника (кружок)", minutes: 120 } ],
  3: [ { id: uuid(), title: "Литература", minutes: 60 } ],
  4: [ { id: uuid(), title: "История", minutes: 60 }, { id: uuid(), title: "Физика", minutes: 90 } ],
  5: [ { id: uuid(), title: "Химия", minutes: 90 } ],
  6: [ { id: uuid(), title: "Спортсекция", minutes: 60 } ],
  0: [],
};

export default function App(){
  const [page, setPage] = useState<'dashboard'|'templates'>(() => loadJSON(LS.UI,{page:'dashboard' as const}).page);
  useEffect(()=>saveJSON(LS.UI,{page}),[page]);

  // <<<<< ВЕРНУЛИ ГЛОБАЛЬНОЕ УПРАВЛЕНИЕ ДАТОЙ ДЛЯ НАВБАРА >>>>>
  const [dateKey, setDateKey] = useState<string>(() => toDateKey(new Date()));

  const [weekTemplate, setWeekTemplate] = useState<WeekTemplate>(()=>loadJSON(LS.WEEK, seedWeek));
  const [overrides, setOverrides] = useState<OverridesByDate>(()=>loadJSON(LS.OVERRIDES, {}));
  const [progressByDate, setProgressByDate] = useState<ProgressByDate>(()=>loadJSON(LS.PROGRESS, {}));
  const [startedAtByDate, setStartedAtByDate] = useState<Record<string, number>>(()=>loadJSON(LS.STARTED, {}));

  useEffect(()=>saveJSON(LS.WEEK, weekTemplate),[weekTemplate]);

  const goToday = () => {
    const k = toDateKey(new Date());
    setDateKey(k);
    setPage('dashboard'); // всегда переходим на дашборд
  };

  const onPickDate = (v: string) => {
    setDateKey(v);
    setPage('dashboard'); // выбранная дата — открываем дашборд
  };

  const Nav = (
    <div className="appbar">
      <div className="appbar-inner">
        <div className="brand">
          <span className="brand-badge">ST</span> Study Planner
        </div>

        {/* три элемента подряд: Расписание → календарь → Сегодня */}
        <div className="tabs" role="tablist" style={{ alignItems: 'center' }}>
          {/* 1) Ссылка на страницу расписания */}
          <button
            className="tab"
            aria-current={page === 'templates' ? 'page' : undefined}
            onClick={() => setPage('templates')}
            title="Правка расписания"
          >
            Расписание
          </button>

          {/* 2) Календарик: выбор даты всегда открывает Дашборд на выбранную дату */}
          <input
            className="input"
            type="date"
            value={dateKey}
            onChange={(e) => onPickDate((e.target as HTMLInputElement).value)}
            title="Выбрать дату для дашборда"
            style={{ marginLeft: 8 }}
          />

          {/* 3) Сегодня: открывает Дашборд на сегодняшнюю дату */}
          <button
            className="tab"
            onClick={goToday}
            title="Перейти к сегодняшнему дню"
            style={{ marginLeft: 8 }}
          >
            Сегодня
          </button>
        </div>
      </div>
    </div>
  );


  return (
    <div>
      {Nav}
      {page==='dashboard' && (
        <Dashboard
          weekTemplate={weekTemplate}
          overrides={overrides}
          progressByDate={progressByDate}
          startedAtByDate={startedAtByDate}
          setOverrides={setOverrides}
          setProgressByDate={setProgressByDate}
          setStartedAtByDate={setStartedAtByDate}
          dateKey={dateKey}   // <-- прокинули дату в дашборд
        />
      )}
      {page==='templates' && (
        <Templates weekTemplate={weekTemplate} setWeekTemplate={setWeekTemplate} />
      )}
      <div className="footer">Study Planner · локальное сохранение · {new Date().getFullYear()}</div>
    </div>
  );
}
