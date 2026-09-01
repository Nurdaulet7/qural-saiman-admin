'use client';
import { useState, useTransition } from 'react';
import Toggle from '@/components/Toggle';
import PhotoField from '@/components/PhotoField';
import { saveGenerator, deleteGenerator } from '@/app/actions';

export default function GeneratorForm({ gen, onDone, onCancel }) {
  const [f, setF] = useState({
    slug: gen.slug ?? '',
    name: gen.name ?? '',
    name_kz: gen.name_kz ?? '',
    kw: gen.kw ?? '',
    spec: gen.spec ?? '',
    brand: gen.brand ?? '',
    price: gen.price ?? '',
    is_published: gen.is_published ?? true,
    photo_path: gen.photo_path ?? null
  });
  const [err, setErr] = useState('');
  const [pending, start] = useTransition();
  const set = (k, v) => setF(p => ({ ...p, [k]: v }));

  function submit(e) {
    e.preventDefault();
    setErr('');
    start(async () => {
      try { await saveGenerator(gen.id, f); onDone('Сохранено') }
      catch (e) { setErr(e.message) }
    });
  }

  function remove() {
    if (!confirm('Удалить «' + gen.name + '»?')) return;
    start(async () => {
      try { await deleteGenerator(gen.id); onDone('Генератор удалён') }
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
              placeholder="Дизельный генератор Magnetta D100E3"
              onChange={e => set('name', e.target.value)} />
          </div>
          <div className="f2">
            <div className="f">
              <label>Мощность, кВт</label>
              <input type="number" required min="0" step="0.5" value={f.kw}
                onChange={e => set('kw', e.target.value)} />
              <span className="hint">Основной фильтр раздела</span>
            </div>
            <div className="f">
              <label>Бренд</label>
              <input type="text" value={f.brand} onChange={e => set('brand', e.target.value)} />
            </div>
          </div>
          <div className="f2">
            <div className="f">
              <label>Цена за сутки, ₸</label>
              <input type="number" min="0" step="1000" value={f.price}
                placeholder="пусто = по запросу" onChange={e => set('price', e.target.value)} />
            </div>
            <div className="f">
              <label>Артикул / slug</label>
              <input type="text" required value={f.slug} placeholder="dgu-magnetta-d100e3"
                onChange={e => set('slug', e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'))} />
            </div>
          </div>
          <div className="f">
            <label>Описание</label>
            <textarea rows={2} value={f.spec} onChange={e => set('spec', e.target.value)} />
          </div>
        </div>

        <div className="fsec">
          <div className="lab">Фото</div>
          <PhotoField table="generators" id={gen.id} slug={f.slug} path={f.photo_path}
            onChange={v => set('photo_path', v)} />
        </div>

        <div className="fsec">
          <div className="lab">Публикация</div>
          <div className="sw">
            <div className="tx"><b>Показывать на сайте</b><span>Скрытые генераторы не видны в разделе ДГУ</span></div>
            <Toggle on={f.is_published} onChange={v => set('is_published', v)} label="Публикация" />
          </div>
        </div>
      </div>
      <div className="dfoot">
        <button className="btn pri" type="submit" disabled={pending}>
          {pending ? <span className="spin" /> : null}{pending ? 'Сохраняем…' : 'Сохранить'}
        </button>
        <button className="btn ghost" type="button" onClick={onCancel}>Отмена</button>
        {gen.id && <button className="del" type="button" onClick={remove}>Удалить генератор</button>}
      </div>
    </form>
  );
}
