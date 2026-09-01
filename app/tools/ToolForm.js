'use client';
import { useState, useTransition } from 'react';
import Toggle from '@/components/Toggle';
import PhotoField from '@/components/PhotoField';
import { POWERS } from '@/lib/format';
import { saveTool, deleteTool } from '@/app/actions';

export default function ToolForm({ tool, cats, onDone, onCancel }) {
  const [f, setF] = useState({
    slug: tool.slug ?? '',
    category_id: tool.category_id ?? cats[0]?.id ?? '',
    name: tool.name ?? '',
    name_kz: tool.name_kz ?? '',
    spec: tool.spec ?? '',
    spec_kz: tool.spec_kz ?? '',
    brand: tool.brand ?? '',
    power: tool.power ?? 'Электрический',
    price: tool.price ?? '',
    deposit: tool.deposit ?? '',
    price_note: tool.price_note ?? '',
    promo_5plus1: tool.promo_5plus1 ?? true,
    is_top: tool.is_top ?? false,
    is_published: tool.is_published ?? true,
    photo_path: tool.photo_path ?? null
  });
  const [lang, setLang] = useState('ru');
  const [err, setErr] = useState('');
  const [pending, start] = useTransition();
  const set = (k, v) => setF(p => ({ ...p, [k]: v }));

  function submit(e) {
    e.preventDefault();
    setErr('');
    start(async () => {
      try { await saveTool(tool.id, f); onDone('Сохранено') }
      catch (e) { setErr(e.message) }
    });
  }

  function remove() {
    if (!confirm('Удалить «' + tool.name + '»? Действие необратимо.')) return;
    start(async () => {
      try { await deleteTool(tool.id); onDone('Инструмент удалён') }
      catch (e) { setErr(e.message) }
    });
  }

  const kz = lang === 'kz';

  return (
    <form className="dform" onSubmit={submit}>
      <div className="dbody">
        {err && <div className="err">{err}</div>}

        <div className="fsec">
          <div className="langtab">
            <button type="button" className={kz ? '' : 'on'} onClick={() => setLang('ru')}>Русский</button>
            <button type="button" className={kz ? 'on' : ''} onClick={() => setLang('kz')}>
              Қазақша {!f.name_kz && <i>черновик</i>}
            </button>
          </div>

          <div className="f">
            <label>Название</label>
            <input type="text" required value={kz ? f.name_kz : f.name}
              placeholder={kz ? (f.name || 'Аты') : 'Напр.: Перфоратор BOSCH GBH 5-40 D'}
              onChange={e => set(kz ? 'name_kz' : 'name', e.target.value)} />
            {kz && <span className="hint">Если пусто — на сайте покажется русское название</span>}
          </div>

          <div className="f">
            <label>Краткое описание</label>
            <textarea rows={2} value={kz ? f.spec_kz : f.spec}
              placeholder="Мощность, габариты, ключевая характеристика"
              onChange={e => set(kz ? 'spec_kz' : 'spec', e.target.value)} />
            <span className="hint">Видно в карточке каталога, до 90 символов</span>
          </div>

          <div className="f2">
            <div className="f">
              <label>Категория</label>
              <select value={f.category_id} onChange={e => set('category_id', e.target.value)}>
                {cats.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div className="f">
              <label>Бренд</label>
              <input type="text" value={f.brand} onChange={e => set('brand', e.target.value)} />
            </div>
          </div>

          <div className="f2">
            <div className="f">
              <label>Тип питания</label>
              <select value={f.power} onChange={e => set('power', e.target.value)}>
                {POWERS.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div className="f">
              <label>Артикул / slug</label>
              <input type="text" required value={f.slug} placeholder="bosch-gbh-5-40-d"
                onChange={e => set('slug', e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'))} />
              <span className="hint">Латиница, попадает в адрес страницы</span>
            </div>
          </div>
        </div>

        <div className="fsec">
          <div className="lab">Фото</div>
          <PhotoField table="tools" id={tool.id} slug={f.slug} path={f.photo_path}
            onChange={v => set('photo_path', v)} />
        </div>

        <div className="fsec">
          <div className="lab">Цена</div>
          <div className="f2">
            <div className="f">
              <label>Цена за сутки, ₸</label>
              <input type="number" required min="0" step="50" value={f.price}
                onChange={e => set('price', e.target.value)} />
            </div>
            <div className="f">
              <label>Залог, ₸</label>
              <input type="number" min="0" step="500" value={f.deposit}
                placeholder="без залога" onChange={e => set('deposit', e.target.value)} />
            </div>
          </div>
          <div className="f">
            <label>Примечание к цене</label>
            <input type="text" value={f.price_note}
              placeholder="Напр.: От 2 600 (1,2 м) до 5 000 (6,0 м)"
              onChange={e => set('price_note', e.target.value)} />
            <span className="hint">Если цена зависит от комплектации — подпись появится под ценой, а в списке будет «от»</span>
          </div>
          <div className="sw">
            <div className="tx"><b>Участвует в акции «5+1»</b><span>Пять платных суток, шестые бесплатно</span></div>
            <Toggle on={f.promo_5plus1} onChange={v => set('promo_5plus1', v)} label="Акция 5+1" />
          </div>
        </div>

        <div className="fsec">
          <div className="lab">Публикация</div>
          <div className="sw">
            <div className="tx"><b>Показывать на сайте</b><span>Скрытые позиции не видны в каталоге и поиске</span></div>
            <Toggle on={f.is_published} onChange={v => set('is_published', v)} label="Публикация" />
          </div>
          <div className="sw">
            <div className="tx"><b>Хит проката</b><span>Попадёт в блок «Часто берут» на главной</span></div>
            <Toggle on={f.is_top} onChange={v => set('is_top', v)} label="Хит проката" />
          </div>
        </div>
      </div>

      <div className="dfoot">
        <button className="btn pri" type="submit" disabled={pending}>
          {pending ? <span className="spin" /> : null}{pending ? 'Сохраняем…' : 'Сохранить'}
        </button>
        <button className="btn ghost" type="button" onClick={onCancel}>Отмена</button>
        {tool.id && <button className="del" type="button" onClick={remove}>Удалить инструмент</button>}
      </div>
    </form>
  );
}
