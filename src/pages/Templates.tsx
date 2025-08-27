import React, { useMemo, useState } from 'react';
import type { Task, WeekTemplate } from '../types';
import { weekdayRu, fmtMinutesLong, fmtHM } from '../utils';
import Modal from '../components/Modal';
import TimePicker from '../components/TimePicker';
import OffloadDaysGrid from '../components/OffloadDaysGrid';

type TemplatesProps = {
  weekTemplate: WeekTemplate;
  setWeekTemplate: React.Dispatch<React.SetStateAction<WeekTemplate>>;
};

type EditState = {
  open: boolean;
  day: number | null;
  taskId: string | null;
  title: string;
  h: number;
  m: number;
  offloadDays: number[];
};

type AddState = {
  open: boolean;
  day: number | null;
  title: string;
  h: number;
  m: number;
  offloadDays: number[];
};

const emptyEdit: EditState = {
  open: false,
  day: null,
  taskId: null,
  title: '',
  h: 0,
  m: 0,
  offloadDays: []
};

const emptyAdd: AddState = {
  open: false,
  day: null,
  title: '',
  h: 0,
  m: 30,
  offloadDays: []
};

export default function Templates({ weekTemplate, setWeekTemplate }: TemplatesProps) {
  // ===== Aggregates for UI & OffloadDaysGrid =====
  const daySumsAssigned = useMemo(
    () => Array.from({ length: 7 }, (_, d) => (weekTemplate[d] || []).reduce((s, t) => s + (t.minutes || 0), 0)),
    [weekTemplate]
  );

  // doing[d] = assigned[(d+1)%7]
  const daySumsDoing = useMemo(
    () => Array.from({ length: 7 }, (_, d) => daySumsAssigned[(d + 1) % 7]),
    [daySumsAssigned]
  );
  const avgDoing = useMemo(
    () => daySumsDoing.reduce((a, b) => a + b, 0) / (daySumsDoing.length || 1),
    [daySumsDoing]
  );

  const sumClassAssigned = (sum: number, avg: number) => {
    if (avg <= 0) return { class: '', label: fmtMinutesLong(sum) };
    if (sum < 0.5 * avg) return { class: 'sum-green', label: fmtMinutesLong(sum) };
    if (sum > avg) return { class: 'sum-red', label: fmtMinutesLong(sum) };
    return { class: 'sum-warn', label: fmtMinutesLong(sum) };
  };
  const avgAssigned = useMemo(
    () => daySumsAssigned.reduce((a, b) => a + b, 0) / (daySumsAssigned.length || 1),
    [daySumsAssigned]
  );

  // ===== Edit modal =====
  const [templateEdit, setTemplateEdit] = useState<EditState>(emptyEdit);
  const openTemplateEdit = (day: number, t: Task) => {
    const h = Math.floor((t.minutes || 0) / 60);
    const m = (t.minutes || 0) % 60;
    setTemplateEdit({
      open: true,
      day,
      taskId: t.id,
      title: t.title,
      h,
      m,
      offloadDays: Array.isArray(t.offloadDays) ? [...t.offloadDays] : []
    });
  };
  const closeTemplateEdit = () => setTemplateEdit(emptyEdit);

  const saveTemplateEdit = () => {
    if (templateEdit.day == null || !templateEdit.taskId) return closeTemplateEdit();
    const minutes = templateEdit.h * 60 + templateEdit.m;
    const day = templateEdit.day;
    const list = (weekTemplate[day] || []) as Task[];
    const nextList = list.map((x) =>
      x.id === templateEdit.taskId
        ? { ...x, title: templateEdit.title.trim() || x.title, minutes, offloadDays: [...templateEdit.offloadDays] }
        : x
    );
    setWeekTemplate({ ...weekTemplate, [day]: nextList });
    closeTemplateEdit();
  };

  const deleteTemplateTask = () => {
    if (templateEdit.day == null || !templateEdit.taskId) return closeTemplateEdit();
    const day = templateEdit.day;
    const list = (weekTemplate[day] || []) as Task[];
    const nextList = list.filter((x) => x.id !== templateEdit.taskId);
    setWeekTemplate({ ...weekTemplate, [day]: nextList });
    closeTemplateEdit();
  };

  // ===== Add modal =====
  const [addModal, setAddModal] = useState<AddState>(emptyAdd);
  const openAdd = (day: number) => setAddModal({ open: true, day, title: '', h: 0, m: 30, offloadDays: [] });
  const closeAdd = () => setAddModal(emptyAdd);

  const applyAdd = () => {
    if (addModal.day == null || !addModal.title.trim()) return closeAdd();
    const minutes = addModal.h * 60 + addModal.m;
    const task: Task = { id: Math.random().toString(36).slice(2,10), title: addModal.title.trim(), minutes, offloadDays: [...addModal.offloadDays] };
    const day = addModal.day;
    const list = (weekTemplate[day] || []) as Task[];
    const nextList = [...list, task];
    setWeekTemplate({ ...weekTemplate, [day]: nextList });
    closeAdd();
  };

  return (
    <div className="container">
      <div className="h1">Правка расписания</div>
      <div className="kicker">
        ✏️ «Править» — редактирование названия, времени (колёса), дней разгрузки. В заголовке каждого дня сумма —
        «сколько ЗАДАНО на этот день». В окнах выбора разгрузки — подсветка и суммы показывают «сколько ДЕЛАТЬ в этот день»
        (сдвиг на -1).
      </div>

      <div className="grid" style={{ gap: 18, marginTop: 16 }}>
        {Array.from({ length: 7 }, (_, day) => day).map((day) => {
          const list = weekTemplate[day] || [];
          const sumAssigned = daySumsAssigned[day];
          const sumInfo = sumClassAssigned(sumAssigned, avgAssigned);
          return (
            <div className="card" key={day}>
              <div className="card-body">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div className="h2">{weekdayRu[day]}</div>
                  <div className={`sum-strong ${sumInfo.class}`}>{sumInfo.label}</div>
                </div>

                <div className="grid" style={{ gap: 10, marginTop: 10 }}>
                  {list.map((t) => (
                    <div className="card" key={t.id} style={{ background: '#0e1531' }}>
                      <div
                        className="card-body"
                        style={{
                          display: 'grid',
                          gridTemplateColumns: '1fr auto auto',
                          gap: 12,
                          alignItems: 'center'
                        }}
                      >
                        <div style={{ fontWeight: 800, minWidth: 140 }}>{t.title}</div>
                        <div className="small" style={{ fontWeight: 700 }}>{fmtHM(t.minutes)}</div>
                        <button
                          className="icon-btn"
                          onClick={() => openTemplateEdit(day, t)}
                          aria-label="Править предмет"
                          title="Править предмет"
                          style={{ justifySelf: 'end' }}
                        >
                          ✏️
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 12 }}>
                  <button className="icon-btn" onClick={() => openAdd(day)} aria-label="Добавить предмет" title="Добавить предмет">➕</button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Edit */}
      <Modal open={templateEdit.open} title="Редактирование предмета" onClose={closeTemplateEdit}>
        <div style={{ display: 'grid', gap: 12 }}>
          <div className="small">Название</div>
          <input
            className="input"
            value={templateEdit.title}
            onChange={(e) => setTemplateEdit((s) => ({ ...s, title: e.target.value }))}
            placeholder="Название предмета"
          />
          <div className="small">Время</div>
          <TimePicker
            h={templateEdit.h}
            m={templateEdit.m}
            onChange={(h, m) => setTemplateEdit((s) => ({ ...s, h, m }))}
          />
          <div className="small">
            Дни разгрузки <span className="small" style={{ opacity: .7 }}>(индикаторы/время — сколько ДЕЛАТЬ в этот день; предыдущий день перечёркнут)</span>
          </div>
          <OffloadDaysGrid
            value={templateEdit.offloadDays}
            onChange={(offloadDays) => setTemplateEdit((s) => ({ ...s, offloadDays }))}
            daySumsDoing={daySumsDoing}
            avgDoing={avgDoing}
            disabledDay={templateEdit.day == null ? undefined : (templateEdit.day + 6) % 7}
          />

          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
            <button className="button" onClick={deleteTemplateTask} title="Удалить предмет">🗑️ Удалить</button>
            <button className="button" onClick={saveTemplateEdit} title="Сохранить изменения">✔️ Сохранить</button>
          </div>
        </div>
      </Modal>

      {/* Add */}
      <Modal open={addModal.open} title="Добавить предмет" onClose={closeAdd} onOk={applyAdd}>
        <div style={{ display: 'grid', gap: 12 }}>
          <input
            className="input"
            placeholder="Название"
            value={addModal.title}
            onChange={(e) => setAddModal((s) => ({ ...s, title: e.target.value }))}
          />
          <div className="small">Время</div>
          <TimePicker h={addModal.h} m={addModal.m} onChange={(h, m) => setAddModal((s) => ({ ...s, h, m }))} />
          <div className="small">
            Дни разгрузки <span className="small" style={{ opacity: .7 }}>(индикаторы/время — сколько ДЕЛАТЬ в этот день; предыдущий день перечёркнут)</span>
          </div>
          <OffloadDaysGrid
            value={addModal.offloadDays}
            onChange={(v) => setAddModal((s) => ({ ...s, offloadDays: v }))}
            daySumsDoing={daySumsDoing}
            avgDoing={avgDoing}
            disabledDay={addModal.day == null ? undefined : (addModal.day + 6) % 7}
          />
        </div>
      </Modal>
    </div>
  );
}
