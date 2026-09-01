'use client';
import { useState, useTransition } from 'react';
import { Phone, Share2, Globe, Lock, Check } from 'lucide-react';
import Shell from '@/components/Shell';
import { ToastProvider, useToast } from '@/components/Toast';
import { createClient } from '@/lib/supabase/client';
import { saveSettings } from '@/app/actions';

const FIELDS = [
  ['phone', 'Телефон'],
  ['whatsapp', 'WhatsApp — номер для заявок'],
  ['address', 'Адрес склада'],
  ['hours_week', 'Часы, будни'],
  ['hours_weekend', 'Часы, выходные'],
  ['delivery_note', 'Условия доставки (строка на сайте)'],
  ['tiktok', 'TikTok'],
  ['instagram', 'Instagram'],
  ['gis', 'Карточка 2ГИС'],
  ['domain', 'Домен'],
  ['seo_title', 'Title главной'],
  ['seo_description', 'Description главной']
];

function Inner({ shell, settings }) {
  const toast = useToast();
  const [f, setF] = useState(() => {
    const init = {};
    FIELDS.forEach(([k]) => { init[k] = settings[k] ?? '' });
    return init;
  });
  const [err, setErr] = useState('');
  const [pending, start] = useTransition();
  const set = (k, v) => setF(p => ({ ...p, [k]: v }));

  const [pw, setPw] = useState('');
  const [pw2, setPw2] = useState('');
  const [pwMsg, setPwMsg] = useState('');
  const [pwBusy, setPwBusy] = useState(false);

  function save() {
    setErr('');
    start(async () => {
      try { await saveSettings(f); toast('Настройки сохранены') }
      catch (e) { setErr(e.message) }
    });
  }

  async function changePw(e) {
    e.preventDefault();
    setPwMsg('');
    if (pw.length < 8) { setPwMsg('Пароль короче 8 символов'); return }
    if (pw !== pw2) { setPwMsg('Пароли не совпадают'); return }
    setPwBusy(true);
    const { error } = await createClient().auth.updateUser({ password: pw });
    setPwBusy(false);
    if (error) { setPwMsg(error.message); return }
    setPw(''); setPw2(''); setPwMsg('');
    toast('Пароль изменён');
  }

  const fld = (k, label, extra) => (
    <div className="f" key={k}>
      <label>{label}</label>
      <input type="text" value={f[k]} onChange={e => set(k, e.target.value)} />
      {extra && <span className="hint">{extra}</span>}
    </div>
  );

  return (
    <Shell {...shell} crumb="Прочее" title="Настройки сайта" actions={
      <button className="btn pri" type="button" onClick={save} disabled={pending}>
        {pending ? <span className="spin" /> : <Check />}{pending ? 'Сохраняем…' : 'Сохранить'}
      </button>
    }>
      {err && <div className="err">{err}</div>}

      <div className="grid2">
        <div className="card">
          <div className="chead"><Phone /><b>Контакты</b></div>
          <div className="cbody">
            <div className="f2">{fld('phone', 'Телефон')}{fld('whatsapp', 'WhatsApp', 'В формате 77057802074, без плюса')}</div>
            {fld('address', 'Адрес склада')}
            <div className="f2">{fld('hours_week', 'Часы, будни')}{fld('hours_weekend', 'Часы, выходные')}</div>
            {fld('delivery_note', 'Условия доставки')}
          </div>
        </div>

        <div className="card">
          <div className="chead"><Share2 /><b>Соцсети и карты</b></div>
          <div className="cbody">
            {fld('tiktok', 'TikTok')}
            {fld('instagram', 'Instagram')}
            {fld('gis', 'Карточка 2ГИС')}
            <span className="hint">Ссылки подставляются в футер, в мобильное меню «Ещё» и в разметку schema.org.</span>
          </div>
        </div>

        <div className="card">
          <div className="chead"><Globe /><b>Сайт и SEO</b></div>
          <div className="cbody">
            {fld('domain', 'Домен', 'Используется в canonical, OG-тегах и sitemap.xml')}
            {fld('seo_title', 'Title главной')}
            <div className="f">
              <label>Description главной</label>
              <textarea rows={3} value={f.seo_description}
                onChange={e => set('seo_description', e.target.value)} />
              <span className="hint">До 160 символов — дальше поиск обрежет</span>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="chead"><Lock /><b>Доступ</b></div>
          <div className="cbody">
            <div className="f">
              <label>Email владельца</label>
              <input type="email" value={shell.email} disabled />
              <span className="hint">Меняется в панели Supabase → Authentication</span>
            </div>
            <form onSubmit={changePw} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div className="f2">
                <div className="f">
                  <label>Новый пароль</label>
                  <input type="password" value={pw} autoComplete="new-password"
                    placeholder="минимум 8 символов" onChange={e => setPw(e.target.value)} />
                </div>
                <div className="f">
                  <label>Повторите</label>
                  <input type="password" value={pw2} autoComplete="new-password"
                    onChange={e => setPw2(e.target.value)} />
                </div>
              </div>
              {pwMsg && <div className="err">{pwMsg}</div>}
              <button className="btn sec" type="submit" disabled={pwBusy || !pw}
                style={{ alignSelf: 'flex-start' }}>
                {pwBusy ? 'Меняем…' : 'Изменить пароль'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </Shell>
  );
}

export default function SettingsClient(props) {
  return <ToastProvider><Inner {...props} /></ToastProvider>;
}
