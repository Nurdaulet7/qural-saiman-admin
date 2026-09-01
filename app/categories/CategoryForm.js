'use client';
import { useState, useTransition } from 'react';
import IconPicker from '@/components/IconPicker';
import { saveCategory } from '@/app/actions';

export default function CategoryForm({ cat, fams, onDone, onCancel }) {
  const [f, setF] = useState({
    id: cat.id ?? '',
    family_id: cat.family_id ?? fams[0]?.id ?? '',
    name: cat.name ?? '',
    name_kz: cat.name_kz ?? '',
    short: cat.short ?? '',
    icon: cat.icon ?? 'box'
  });
  const [err, setErr] = useState('');
  const [pending, start] = useTransition();
  const set = (k, v) => setF(p => ({ ...p, [k]: v }));

  function submit(e) {
    e.preventDefault();
    setErr('');
    start(async () => {
      try { await saveCategory(cat.id, f); onDone('Сохранено') }
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
            <input type="text" required value={f.name} onChange={e => set('name', e.target.value)} />
          </div>
          <div className="f2">
            <div className="f">
              <label>Короткое имя (чип)</label>
              <input type="text" value={f.short} placeholder={f.name}
                onChange={e => set('short', e.target.value)} />
            </div>
            <div className="f">
              <label>ID</label>
              <input type="text" required value={f.id} placeholder="power-tools" disabled={!!cat.id}
                onChange={e => set('id', e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'))} />
              <span className="hint">{cat.id ? 'ID менять нельзя — на него ссылаются инструменты' : 'Латиница, попадает в адрес каталога'}</span>
            </div>
          </div>
          <div className="f">
            <label>Семейство</label>
            <select value={f.family_id} onChange={e => set('family_id', e.target.value)}>
              {fams.map(x => <option key={x.id} value={x.id}>{x.name}</option>)}
            </select>
          </div>
          <div className="f">
            <label>Название на казахском</label>
            <input type="text" value={f.name_kz} placeholder="черновик"
              onChange={e => set('name_kz', e.target.value)} />
          </div>
        </div>
        <div className="fsec">
          <div className="lab">Иконка категории</div>
          <IconPicker value={f.icon} onChange={v => set('icon', v)} />
          <span className="hint">Набор lucide.dev — те же иконки, что на сайте</span>
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
