'use client';
import { useMemo, useRef, useState, useTransition } from 'react';
import { UploadCloud, ImageOff, Upload, Info, Search } from 'lucide-react';
import Shell from '@/components/Shell';
import { ToastProvider, useToast } from '@/components/Toast';
import { uploadPhoto } from '@/lib/upload';
import { photoUrl, plural } from '@/lib/format';
import { setPhotoPath } from '@/app/actions';

function Inner({ shell, items }) {
  const toast = useToast();
  const [, start] = useTransition();
  const [q, setQ] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState('');
  const picker = useRef(null);
  const target = useRef(null);

  const missing = items.filter(i => !i.path);
  const filled = items.filter(i => i.path);
  const shown = useMemo(() => {
    if (!q) return filled.slice(0, 48);
    const s = q.toLowerCase();
    return filled.filter(i => i.name.toLowerCase().includes(s));
  }, [filled, q]);

  async function upload(item, file) {
    if (!file) return;
    setBusy(item.id); setErr('');
    try {
      const key = await uploadPhoto({ table: item.table, slug: item.slug, file, prevPath: item.path });
      await setPhotoPath(item.table, item.id, key);
      toast('Фото загружено');
    } catch (e) {
      setErr(e.message || 'Не удалось загрузить файл');
    } finally {
      setBusy('');
    }
  }

  function pick(item) {
    target.current = item;
    picker.current?.click();
  }

  return (
    <Shell {...shell} crumb="Каталог" title="Фото и медиа" actions={null}>
      {err && <div className="err">{err}</div>}

      <div className="kpis">
        <div className="kpi"><span>Всего фото</span><b>{filled.length}</b></div>
        <div className="kpi"><span>Без фото</span><b>{missing.length}</b>{missing.length > 0 && <i className="warn">видны как заглушка</i>}</div>
        <div className="kpi"><span>Бакет</span><b>tools</b><i>Supabase Storage</i></div>
        <div className="kpi"><span>Рекомендация</span><b>800×800</b><i>PNG на белом</i></div>
      </div>

      {missing.length > 0 && (
        <>
          <div className="sechead">
            <h2>Нужны фото</h2>
            <span>{missing.length} {plural(missing.length, ['позиция','позиции','позиций'])}</span>
          </div>
          <div className="mgrid">
            {missing.map(i => (
              <Tile key={i.id} item={i} busy={busy === i.id} onPick={() => pick(i)} onDropFile={f => upload(i, f)} />
            ))}
          </div>
        </>
      )}

      <div className="sechead">
        <h2>Загруженные</h2>
        <span>{filled.length} {plural(filled.length, ['файл','файла','файлов'])}</span>
      </div>
      <div className="tbar">
        <div className="srch">
          <Search />
          <input type="text" placeholder="Найти позицию по названию"
            value={q} onChange={e => setQ(e.target.value)} />
        </div>
      </div>
      <div className="mgrid">
        {shown.map(i => (
          <Tile key={i.id} item={i} busy={busy === i.id} onPick={() => pick(i)} onDropFile={f => upload(i, f)} />
        ))}
      </div>
      {!q && filled.length > 48 && (
        <div className="note">
          <Info />
          <span>Показаны первые 48 файлов из {filled.length}. Найдите нужную позицию поиском выше.</span>
        </div>
      )}

      <input ref={picker} type="file" accept="image/*" hidden
        onChange={e => { const f = e.target.files?.[0]; if (target.current) upload(target.current, f); e.target.value = '' }} />
    </Shell>
  );
}

function Tile({ item, busy, onPick, onDropFile }) {
  const src = photoUrl(item.path);
  return (
    <div className={'mtile' + (item.path ? '' : ' miss')}
      onDragOver={e => e.preventDefault()}
      onDrop={e => { e.preventDefault(); onDropFile(e.dataTransfer.files?.[0]) }}>
      <div className={'im' + (src ? '' : ' none')}>
        {src ? <img src={src} alt="" loading="lazy" /> : <ImageOff />}
      </div>
      <div className="mact">
        <button type="button" onClick={onPick} aria-label={src ? 'Заменить фото' : 'Загрузить фото'}>
          <Upload />
        </button>
      </div>
      <div className="mtx">
        <b>{item.name}</b>
        <span>{busy ? 'Загрузка…' : item.path ? item.path.split('/').pop() : 'нет файла'}</span>
      </div>
    </div>
  );
}

export default function MediaClient(props) {
  return <ToastProvider><Inner {...props} /></ToastProvider>;
}
