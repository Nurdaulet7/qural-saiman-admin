'use client';
import { useState, useTransition } from 'react';
import { saveFamily } from '@/app/actions';

export default function FamilyForm({ fam, onDone, onCancel }) {
  const [f, setF] = useState({ id: fam.id ?? '', name: fam.name ?? '', name_kz: fam.name_kz ?? '' });
  const [err, setErr] = useState('');
  const [pending, start] = useTransition();
  const set = (k, v) => setF(p => ({ ...p, [k]: v }));

  function submit(e) {
    e.preventDefault();
    setErr('');
    start(async () => {
      try { await saveFamily(fam.id, f); onDone('Сохранено') }
      catch (e) { setErr(e.message) }
    });
  }

  return (
    <form className="dform" onSubmit={submit}>
      <div className="dbody">
        {err && <div className="err">{err}</div>}
        <div className="fsec">
          <div className="f">
            <label>Название</label>
            <input type="text" required value={f.name}
              placeholder="Напр.: Клининг и промышленная уборка"
              onChange={e => set('name', e.target.value)} />
          </div>
          <div className="f">
            <label>ID</label>
            <input type="text" required value={f.id} placeholder="cleaning-pro" disabled={!!fam.id}
              onChange={e => set('id', e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'))} />
            <span className="hint">{fam.id ? 'ID менять нельзя — на него ссылаются категории' : 'Латиница'}</span>
          </div>
          <div className="f">
            <label>Название на казахском</label>
            <input type="text" value={f.name_kz} placeholder="черновик"
              onChange={e => set('name_kz', e.target.value)} />
          </div>
        </div>
      </div>
      <div className="dfoot">
        <button className="btn pri" type="submit" disabled={pending}>
          {pending ? <span className="spin" /> : null}{pending ? 'Сохраняем…' : 'Сохранить'}
        </button>
        <button className="btn ghost" type="button" onClick={onCancel}>Отмена</button>
      </div>
    </form>
  );
}
