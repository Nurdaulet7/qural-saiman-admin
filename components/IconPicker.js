'use client';
import { useRef, useState } from 'react';
import * as icons from 'lucide-react';
import { ICON_SET } from '@/lib/format';
import { uploadIcon, removeIcon } from '@/lib/upload';

const toPascal = n => n.split('-').map(p => p[0].toUpperCase() + p.slice(1)).join('');
export function LucideIcon({ name, ...rest }) {
  const C = icons[toPascal(name || 'box')] || icons.Box;
  return <C {...rest} />;
}

/* Свою иконку показываем маской, как на сайте: цвет берётся из темы,
   поэтому в превью она сразу выглядит так же, как в каталоге. */
function CustomIcon({ url, size = 24 }) {
  return <span className="cusicn" style={{ '--i': `url('${url}')`, width: size, height: size }} />;
}

export default function IconPicker({ catId, value, iconUrl, onChange, onIconUrl }) {
  const [tab, setTab] = useState(iconUrl ? 'own' : 'set');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const input = useRef(null);
  const set = value && !ICON_SET.includes(value) ? [value, ...ICON_SET] : ICON_SET;

  async function upload(file) {
    if (!file) return;
    setBusy(true); setErr('');
    try {
      onIconUrl(await uploadIcon({ catId, file, prevUrl: iconUrl }));
    } catch (e) { setErr(e.message || 'Не удалось загрузить файл') } finally { setBusy(false) }
  }

  async function drop() {
    setBusy(true); setErr('');
    try { await removeIcon(iconUrl); onIconUrl(null); setTab('set') }
    catch (e) { setErr(e.message) } finally { setBusy(false) }
  }

  return (
    <>
      <div className="icpick">
        <span className="iccur">
          {iconUrl ? <CustomIcon url={iconUrl} size={24} /> : <LucideIcon name={value} />}
        </span>
        <span className="ictx">
          <b>{iconUrl ? 'Своя иконка' : value || 'box'}</b>
          <span>Так иконка выглядит в каталоге и в фильтрах</span>
        </span>
      </div>

      <div className="ictabs">
        <button type="button" className={tab === 'set' ? 'on' : ''} onClick={() => setTab('set')}>
          Набор lucide
        </button>
        <button type="button" className={tab === 'own' ? 'on' : ''} onClick={() => setTab('own')}>
          Своя иконка{iconUrl ? ' ·' : ''}
        </button>
      </div>

      {tab === 'set' ? (
        <>
          <div className="icgrid">
            {set.map(n => (
              <button key={n} type="button" title={n}
                className={'ictile' + (n === value && !iconUrl ? ' on' : '')}
                onClick={() => onChange(n)}>
                <LucideIcon name={n} />
              </button>
            ))}
          </div>
          {iconUrl && (
            <span className="hint">Пока загружена своя иконка — на сайте показывается она, а не глиф</span>
          )}
        </>
      ) : (
        <>
          <div className="drop"
            onDragOver={e => { e.preventDefault(); e.currentTarget.classList.add('over') }}
            onDragLeave={e => e.currentTarget.classList.remove('over')}
            onDrop={e => {
              e.preventDefault();
              e.currentTarget.classList.remove('over');
              upload(e.dataTransfer.files?.[0]);
            }}>
            <div className="pv icpv">{iconUrl ? <CustomIcon url={iconUrl} size={30} /> : <icons.Shapes />}</div>
            <div className="tx">
              <b>{busy ? 'Загрузка…' : iconUrl ? iconUrl.split('/').pop() : 'Иконка не загружена'}</b>
              <span>SVG одним цветом, квадратный viewBox. Цвет подставит сайт</span>
              <div className="row">
                <button type="button" disabled={busy} onClick={() => input.current?.click()}>
                  {busy ? 'Загрузка…' : iconUrl ? 'Заменить' : 'Загрузить SVG'}
                </button>
                {iconUrl && <button type="button" className="dl" disabled={busy} onClick={drop}>Удалить</button>}
              </div>
            </div>
            <input ref={input} type="file" accept=".svg,image/svg+xml" hidden
              onChange={e => { upload(e.target.files?.[0]); e.target.value = '' }} />
          </div>
          {err && <div className="err">{err}</div>}
          {!catId && <span className="hint">Сначала задайте ID категории — по нему называется файл</span>}
        </>
      )}
    </>
  );
}
