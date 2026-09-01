'use client';
import { useState, useTransition } from 'react';
import { Gift, Calculator, Layers, Grid3x3, Wallet } from 'lucide-react';
import Shell from '@/components/Shell';
import Drawer from '@/components/Drawer';
import { ToastProvider, useToast } from '@/components/Toast';
import Toggle from '@/components/Toggle';
import CalcForm, { calcSummary } from './CalcForm';
import { savePromo } from '@/app/actions';

function Inner({ shell, promo, calcTools }) {
  const toast = useToast();
  const [, start] = useTransition();
  const [p, setP] = useState({
    title: promo?.title ?? '5 суток аренды + 1 сутки в подарок',
    paid_days: promo?.paid_days ?? 5,
    free_days: promo?.free_days ?? 1,
    is_active: promo?.is_active ?? true
  });
  const [editing, setEditing] = useState(null);
  const [err, setErr] = useState('');
  const [pending, startSave] = useTransition();
  const set = (k, v) => setP(prev => ({ ...prev, [k]: v }));

  function save() {
    setErr('');
    startSave(async () => {
      try { await savePromo(p); toast('Акция сохранена') }
      catch (e) { setErr(e.message) }
    });
  }

  return (
    <>
      <Shell {...shell} crumb="Правила" title="Цены и акции" actions={
        <button className="btn pri" type="button" onClick={save} disabled={pending}>
          {pending ? <span className="spin" /> : null}{pending ? 'Сохраняем…' : 'Сохранить'}
        </button>
      }>
        {err && <div className="err">{err}</div>}

        <div className="grid2">
          <div className="card">
            <div className="chead">
              <Gift /><b>Акция «5+1»</b>
              <div className="sp" />
              <Toggle on={p.is_active} onChange={v => set('is_active', v)} label="Акция активна" />
            </div>
            <div className="cbody">
              <div className="f">
                <label>Заголовок на сайте</label>
                <input type="text" value={p.title} onChange={e => set('title', e.target.value)} />
              </div>
              <div className="f2">
                <div className="f">
                  <label>Платных суток</label>
                  <input type="number" min="1" value={p.paid_days}
                    onChange={e => set('paid_days', e.target.value)} />
                </div>
                <div className="f">
                  <label>Бесплатных суток</label>
                  <input type="number" min="1" value={p.free_days}
                    onChange={e => set('free_days', e.target.value)} />
                </div>
              </div>
              <span className="hint">
                Сейчас: {p.paid_days} суток оплаты → следующие {p.free_days} бесплатно.
                Участие включается отдельно у каждой позиции — переключатель «Участвует в акции» в карточке инструмента.
              </span>
            </div>
          </div>

          <div className="card">
            <div className="chead"><Wallet /><b>Залог</b></div>
            <div className="cbody">
              <span className="hint" style={{ fontSize: 13, lineHeight: 1.55 }}>
                Общего правила залога нет — сейчас прокат без залога.
                Если по отдельной позиции залог нужен, укажите сумму в её карточке, в поле «Залог».
                Пустое поле означает «без залога» и на сайте не показывается.
              </span>
            </div>
          </div>

          <div className="card" style={{ gridColumn: '1 / -1' }}>
            <div className="chead"><Calculator /><b>Позиции с особым расчётом</b></div>
            <div className="cbody">
              {calcTools.map(t => (
                <div className="tier" key={t.id}>
                  <span className="tnum">{t.calc_rule?.type === 'height' ? <Layers /> : <Grid3x3 />}</span>
                  <span className="ttx"><b>{t.name}</b><span>{calcSummary(t)}</span></span>
                  <button className="btn sec" type="button" onClick={() => setEditing(t)}>Изменить</button>
                </div>
              ))}
              {calcTools.length === 0 && (
                <span className="hint">Пока таких позиций нет. Правило расчёта задаётся в базе, в поле calc_rule.</span>
              )}
              <span className="hint">
                Клиент выбирает высоту или количество комплектов в карточке товара, цена пересчитывается на месте.
                В каталоге такие позиции показываются с приставкой «от».
              </span>
            </div>
          </div>
        </div>
      </Shell>

      <Drawer open={!!editing} onClose={() => setEditing(null)}
        crumb="Правило расчёта" title={editing?.name || ''}>
        {editing && (
          <CalcForm tool={editing}
            onDone={m => { setEditing(null); toast(m) }}
            onCancel={() => setEditing(null)} />
        )}
      </Drawer>
    </>
  );
}

export default function PricingClient(props) {
  return <ToastProvider><Inner {...props} /></ToastProvider>;
}
