'use client';
import { useState, useTransition } from 'react';
import { Calculator } from 'lucide-react';
import { fmt, num } from '@/lib/format';
import { saveCalcRule } from '@/app/actions';

export function calcSummary(tool) {
  const c = tool.calc_rule ?? {};
  if (c.type === 'height') {
    const steps = Math.floor((c.endH - c.startH) / c.step) + 1;
    return num(c.startH) + '–' + num(c.endH) + ' м, шаг ' + num(c.step) +
      ' м, +' + fmt(c.priceStep) + ' за секцию · ' + steps + ' вариантов';
  }
  return 'Комплект ' + fmt(c.sectionPrice) + ' + трап ' + fmt(c.trapPrice);
}

function preview(price, c) {
  const rows = [];
  if (c.type === 'height') {
    const step = Number(c.step) || 1;
    for (let i = 0; Number(c.startH) + i * step <= Number(c.endH) + 1e-6 && i < 40; i++) {
      rows.push([num(Number(c.startH) + i * step) + ' м', fmt(Number(price) + i * Number(c.priceStep))]);
    }
  } else {
    const s = Number(c.sectionPrice), t = Number(c.trapPrice);
    rows.push(['1 комплект', fmt(s)]);
    rows.push(['1 комплект + трап', fmt(s + t)]);
    rows.push(['3 комплекта + 2 трапа', fmt(s * 3 + t * 2)]);
  }
  return rows;
}

export default function CalcForm({ tool, onDone, onCancel }) {
  const [price, setPrice] = useState(tool.price ?? 0);
  const [c, setC] = useState({ ...tool.calc_rule });
  const [err, setErr] = useState('');
  const [pending, start] = useTransition();
  const set = (k, v) => setC(p => ({ ...p, [k]: v === '' ? '' : Number(v) }));
  const height = c.type === 'height';

  function submit(e) {
    e.preventDefault();
    setErr('');
    start(async () => {
      try { await saveCalcRule(tool.id, c, price); onDone('Правило сохранено') }
      catch (e) { setErr(e.message) }
    });
  }

  return (
    <form className="dform" onSubmit={submit}>
      <div className="dbody">
        {err && <div className="err">{err}</div>}
        <div className="note info">
          <Calculator />
          <span>Клиент выбирает {height ? 'высоту' : 'количество комплектов'} в карточке товара, цена пересчитывается на месте. В каталоге показывается «от».</span>
        </div>

        <div className="fsec">
          <div className="f">
            <label>Базовая цена за сутки, ₸</label>
            <input type="number" min="0" step="50" value={price} onChange={e => setPrice(e.target.value)} />
            <span className="hint">Минимальная комплектация — от неё считаются надбавки</span>
          </div>

          {height ? (
            <>
              <div className="f3">
                <div className="f">
                  <label>Мин. высота, м</label>
                  <input type="number" step="0.1" value={c.startH} onChange={e => set('startH', e.target.value)} />
                </div>
                <div className="f">
                  <label>Макс. высота, м</label>
                  <input type="number" step="0.1" value={c.endH} onChange={e => set('endH', e.target.value)} />
                </div>
                <div className="f">
                  <label>Шаг, м</label>
                  <input type="number" step="0.1" value={c.step} onChange={e => set('step', e.target.value)} />
                </div>
              </div>
              <div className="f">
                <label>Надбавка за секцию, ₸</label>
                <input type="number" step="50" value={c.priceStep} onChange={e => set('priceStep', e.target.value)} />
                <span className="hint">У этой позиции своя надбавка — другие позиции не меняются</span>
              </div>
            </>
          ) : (
            <div className="f2">
              <div className="f">
                <label>Цена комплекта, ₸</label>
                <input type="number" step="50" value={c.sectionPrice} onChange={e => set('sectionPrice', e.target.value)} />
              </div>
              <div className="f">
                <label>Цена трапа, ₸</label>
                <input type="number" step="50" value={c.trapPrice} onChange={e => set('trapPrice', e.target.value)} />
              </div>
            </div>
          )}
        </div>

        <div className="fsec">
          <div className="lab">Как это увидит клиент</div>
          <div className="calcprev">
            {preview(price, c).map(([l, v]) => (
              <div key={l}><span>{l}</span><b>{v}</b></div>
            ))}
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
