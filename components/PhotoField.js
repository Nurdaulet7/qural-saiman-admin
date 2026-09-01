'use client';
import { useRef, useState } from 'react';
import { ImageOff } from 'lucide-react';
import { photoUrl } from '@/lib/format';
import { uploadPhoto, removePhoto } from '@/lib/upload';
import { setPhotoPath } from '@/app/actions';

/* path — текущее значение (управляется формой), onChange отдаёт новый путь.
   Для уже сохранённой позиции путь сразу пишется в базу; для новой —
   уезжает вместе с формой при сохранении. */
export default function PhotoField({ table, id, slug, path, onChange }) {
  const input = useRef(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const src = photoUrl(path);

  async function upload(file) {
    if (!file) return;
    setBusy(true); setErr('');
    try {
      const key = await uploadPhoto({ table, slug, file, prevPath: path });
      onChange(key);
      if (id) await setPhotoPath(table, id, key);
    } catch (e) {
      setErr(e.message || 'Не удалось загрузить файл');
    } finally {
      setBusy(false);
    }
  }

  async function drop() {
    setBusy(true); setErr('');
    try {
      await removePhoto(path);
      onChange(null);
      if (id) await setPhotoPath(table, id, null);
    } catch (e) { setErr(e.message) } finally { setBusy(false) }
  }

  return (
    <>
      <div className="drop"
        onDragOver={e => { e.preventDefault(); e.currentTarget.classList.add('over') }}
        onDragLeave={e => e.currentTarget.classList.remove('over')}
        onDrop={e => {
          e.preventDefault();
          e.currentTarget.classList.remove('over');
          upload(e.dataTransfer.files?.[0]);
        }}>
        <div className="pv">{src ? <img src={src} alt="" /> : <ImageOff />}</div>
        <div className="tx">
          <b>{busy ? 'Загрузка…' : path ? path.split('/').pop() : 'Файл не загружен'}</b>
          <span>{src ? 'Можно перетащить новый файл поверх' : 'PNG или JPG, квадрат, от 800×800'}</span>
          <div className="row">
            <button type="button" disabled={busy} onClick={() => input.current?.click()}>
              {busy ? 'Загрузка…' : src ? 'Заменить' : 'Загрузить'}
            </button>
            {src && <button type="button" className="dl" disabled={busy} onClick={drop}>Удалить</button>}
          </div>
        </div>
        <input ref={input} type="file" accept="image/*" hidden
          onChange={e => { upload(e.target.files?.[0]); e.target.value = '' }} />
      </div>
      {err && <div className="err">{err}</div>}
      {!id && path && (
        <span className="hint">Фото привяжется к позиции после сохранения карточки</span>
      )}
    </>
  );
}
