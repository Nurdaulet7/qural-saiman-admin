'use client';
import { useState, useTransition } from 'react';
import { Plus, Pencil, Eye, EyeOff, Trash2, ImageOff, Zap } from 'lucide-react';
import Shell from '@/components/Shell';
import Drawer from '@/components/Drawer';
import { ToastProvider, useToast } from '@/components/Toast';
import GeneratorForm from './GeneratorForm';
import { fmt, num, photoUrl } from '@/lib/format';
import { toggleGenerator, deleteGenerator } from '@/app/actions';

function Inner({ shell, list }) {
  const toast = useToast();
  const [, start] = useTransition();
  const [editing, setEditing] = useState(null);
  const [err, setErr] = useState('');

  function run(fn, msg) {
    setErr('');
    start(async () => {
      try { await fn(); if (msg) toast(msg) }
      catch (e) { setErr(e.message) }
    });
  }

  return (
    <>
      <Shell {...shell} crumb="Каталог" title="Генераторы ДГУ" actions={
        <button className="btn pri" type="button" onClick={() => setEditing({})}>
          <Plus />Добавить генератор
        </button>
      }>
        {err && <div className="err">{err}</div>}

        <div className="note info">
          <Zap />
          <span>ДГУ — отдельный раздел сайта: фильтр по мощности, цена может быть «по запросу». Акция «5+1» здесь не применяется.</span>
        </div>

        <div className="card">
          <div className="tscroll">
            <table>
              <thead>
                <tr><th>Генератор</th><th>Мощность</th><th>Бренд</th><th>Цена / сутки</th><th>На сайте</th><th /></tr>
              </thead>
              <tbody>
                {list.map(g => {
                  const src = photoUrl(g.photo_path);
                  return (
                    <tr key={g.id} className={g.is_published ? '' : 'hiddenrow'}>
                      <td>
                        <div className="tname">
                          <div className={'ph' + (src ? '' : ' empty')}>
                            {src ? <img src={src} alt="" loading="lazy" /> : <ImageOff />}
                          </div>
                          <div className="tx"><b>{g.name}</b><span>{g.spec}</span></div>
                        </div>
                      </td>
                      <td><span className="chip">{num(g.kw)} кВт</span></td>
                      <td>{g.brand || '—'}</td>
                      <td><div className="price">{g.price ? fmt(g.price) : 'По запросу'}</div></td>
                      <td><span className={'st ' + (g.is_published ? 'ok' : 'hid')}>{g.is_published ? 'Опубликован' : 'Скрыт'}</span></td>
                      <td>
                        <div className="acts">
                          <button className="ib" type="button" onClick={() => setEditing(g)} aria-label="Изменить"><Pencil /></button>
                          <button className="ib" type="button" aria-label="Скрыть"
                            onClick={() => run(() => toggleGenerator(g.id, !g.is_published),
                              g.is_published ? 'Генератор скрыт' : 'Генератор снова на сайте')}>
                            {g.is_published ? <EyeOff /> : <Eye />}
                          </button>
                          <button className="ib dl" type="button" aria-label="Удалить"
                            onClick={() => { if (confirm('Удалить «' + g.name + '»?')) run(() => deleteGenerator(g.id), 'Удалено') }}>
                            <Trash2 />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {list.length > 0
            ? <div className="tfoot">Всего {list.length} генераторов</div>
            : <div className="empty-state"><b>Пока пусто</b><span>Добавьте первый генератор</span></div>}
        </div>
      </Shell>

      <Drawer open={!!editing} onClose={() => setEditing(null)}
        crumb="Генератор ДГУ" title={editing?.name || 'Новый генератор'}>
        {editing && (
          <GeneratorForm gen={editing}
            onDone={m => { setEditing(null); toast(m) }}
            onCancel={() => setEditing(null)} />
        )}
      </Drawer>
    </>
  );
}

export default function DguClient(props) {
  return <ToastProvider><Inner {...props} /></ToastProvider>;
}
