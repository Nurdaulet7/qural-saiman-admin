'use client';
import { useMemo, useState, useTransition } from 'react';
import { Plus, ArrowUpDown, Search, Pencil, Eye, EyeOff, Copy, Trash2, ImageOff, Info, Move } from 'lucide-react';
import Shell from '@/components/Shell';
import Drawer from '@/components/Drawer';
import { ToastProvider, useToast } from '@/components/Toast';
import ToolForm from './ToolForm';
import { fmt, photoUrl } from '@/lib/format';
import { toggleTool, duplicateTool, deleteTool, reorderTools } from '@/app/actions';

const PER = 12;

function Inner({ shell, tools, cats }) {
  const toast = useToast();
  const [pending, start] = useTransition();
  const [q, setQ] = useState('');
  const [cat, setCat] = useState('');
  const [pub, setPub] = useState('');
  const [page, setPage] = useState(1);
  const [order, setOrder] = useState(false);
  const [editing, setEditing] = useState(null);
  const [rows, setRows] = useState(null);
  const [err, setErr] = useState('');

  const catName = id => cats.find(c => c.id === id)?.name ?? '';

  const filtered = useMemo(() => {
    let list = tools.slice();
    if (q) {
      const s = q.toLowerCase();
      list = list.filter(t => [t.name, t.brand, t.spec].filter(Boolean).join(' ').toLowerCase().includes(s));
    }
    if (cat) list = list.filter(t => t.category_id === cat);
    if (pub === 'on') list = list.filter(t => t.is_published);
    if (pub === 'off') list = list.filter(t => !t.is_published);
    return list;
  }, [tools, q, cat, pub]);

  const dragList = order && cat ? (rows ?? filtered) : filtered;
  const pages = Math.max(1, Math.ceil(filtered.length / PER));
  const current = Math.min(page, pages);
  const slice = order ? dragList : filtered.slice((current - 1) * PER, current * PER);

  const hidden = tools.filter(t => !t.is_published).length;
  const noPhoto = tools.filter(t => !t.photo_path).length;

  function run(fn, okMsg) {
    setErr('');
    start(async () => {
      try { await fn(); if (okMsg) toast(okMsg) }
      catch (e) { setErr(e.message) }
    });
  }

  function onDrop(from, to) {
    const next = dragList.slice();
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    setRows(next);
    run(() => reorderTools(next.map(t => t.id)), 'Порядок сохранён');
  }

  return (
    <>
      <Shell {...shell} crumb="Каталог" title="Инструменты" actions={
        <>
          <button className={'btn sec' + (order ? ' on' : '')} type="button"
            onClick={() => { setOrder(v => !v); setRows(null); setPage(1) }}>
            <ArrowUpDown />Порядок
          </button>
          <button className="btn pri" type="button" onClick={() => setEditing({})}>
            <Plus />Добавить инструмент
          </button>
        </>
      }>
        {err && <div className="err">{err}</div>}

        <div className="kpis">
          <div className="kpi"><span>Всего позиций</span><b>{tools.length}</b><i>категорий {cats.length}</i></div>
          <div className="kpi"><span>Опубликовано</span><b>{tools.length - hidden}</b></div>
          <div className="kpi"><span>Скрыто с сайта</span><b>{hidden}</b>{hidden > 0 && <i className="warn">не видны в каталоге</i>}</div>
          <div className="kpi"><span>Без фото</span><b>{noPhoto}</b>{noPhoto > 0 && <i className="warn">нужна фотография</i>}</div>
        </div>

        {order && (
          <div className="note">
            {cat ? <Move /> : <Info />}
            <span>{cat
              ? <>Порядок внутри категории <b>{catName(cat)}</b>: тяните строки за <b>⠿</b>. На другие категории не влияет.</>
              : 'Выберите категорию в фильтре — порядок задаётся отдельно внутри каждой категории.'}</span>
          </div>
        )}

        <div className="tbar">
          <div className="srch">
            <Search />
            <input type="text" placeholder="Поиск по названию, бренду или описанию"
              value={q} disabled={order}
              onChange={e => { setQ(e.target.value); setPage(1) }} />
          </div>
          <select className="sel" value={cat} onChange={e => { setCat(e.target.value); setRows(null); setPage(1) }}>
            <option value="">{order ? '— выберите категорию —' : 'Все категории'}</option>
            {cats.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <select className="sel" value={pub} disabled={order} onChange={e => { setPub(e.target.value); setPage(1) }}>
            <option value="">Все позиции</option>
            <option value="on">Опубликованные</option>
            <option value="off">Скрытые</option>
          </select>
        </div>

        <div className="card">
          <div className="tscroll">
            <table>
              <thead>
                <tr>
                  {order && <th style={{ width: 36 }} />}
                  <th>Инструмент</th><th>Категория</th><th>Цена / сутки</th><th>На сайте</th><th />
                </tr>
              </thead>
              <tbody>
                {slice.map((t, i) => (
                  <Row key={t.id} t={t} i={i} order={order} canDrag={order && !!cat}
                    catName={catName(t.category_id)} onDrop={onDrop}
                    onEdit={() => setEditing(t)}
                    onToggle={() => run(() => toggleTool(t.id, !t.is_published),
                      t.is_published ? 'Позиция скрыта с сайта' : 'Позиция снова на сайте')}
                    onDup={() => run(() => duplicateTool(t.id), 'Создана копия — скрыта до проверки')}
                    onDel={() => { if (confirm('Удалить «' + t.name + '»? Действие необратимо.')) run(() => deleteTool(t.id), 'Удалено') }}
                  />
                ))}
              </tbody>
            </table>
          </div>
          {slice.length > 0 && (
            <div className="tfoot">
              Показано {slice.length} из {filtered.length}
              {!order && pages > 1 && (
                <div className="pg">
                  <button type="button" disabled={current === 1} onClick={() => setPage(current - 1)}>‹</button>
                  {Array.from({ length: Math.min(pages, 7) }, (_, n) => (
                    <button key={n} type="button" className={current === n + 1 ? 'on' : ''}
                      onClick={() => setPage(n + 1)}>{n + 1}</button>
                  ))}
                  <button type="button" disabled={current === pages} onClick={() => setPage(current + 1)}>›</button>
                </div>
              )}
            </div>
          )}
          {slice.length === 0 && (
            <div className="empty-state"><b>Ничего не найдено</b><span>Измените поиск или фильтры</span></div>
          )}
        </div>
      </Shell>

      <Drawer open={!!editing} onClose={() => setEditing(null)}
        crumb={editing?.id ? 'Инструмент' : 'Новая позиция'}
        title={editing?.name || 'Новый инструмент'}>
        {editing && (
          <ToolForm tool={editing} cats={cats}
            onDone={msg => { setEditing(null); toast(msg) }}
            onCancel={() => setEditing(null)} />
        )}
      </Drawer>
    </>
  );
}

function Row({ t, i, order, canDrag, catName, onDrop, onEdit, onToggle, onDup, onDel }) {
  const src = photoUrl(t.photo_path);
  return (
    <tr className={t.is_published ? '' : 'hiddenrow'}
      onDragOver={canDrag ? e => e.preventDefault() : undefined}
      onDrop={canDrag ? e => {
        e.preventDefault();
        const from = parseInt(e.dataTransfer.getData('text/plain'), 10);
        if (!Number.isNaN(from) && from !== i) onDrop(from, i);
      } : undefined}>
      {order && (
        <td>
          {canDrag && (
            <span className="grab" draggable
              onDragStart={e => e.dataTransfer.setData('text/plain', String(i))}>⠿</span>
          )}
        </td>
      )}
      <td>
        <div className="tname">
          <div className={'ph' + (src ? '' : ' empty')}>
            {src ? <img src={src} alt="" loading="lazy" /> : <ImageOff />}
          </div>
          <div className="tx">
            <b>{t.name}</b>
            <span>{[t.brand, t.power, t.spec].filter(Boolean).join(' · ').slice(0, 64)}</span>
          </div>
        </div>
      </td>
      <td><span className="chip">{catName}</span></td>
      <td>
        <div className="price">
          {t.price_note ? 'от ' : ''}{fmt(t.price)}
          {t.price_note && <small>{t.price_note}</small>}
        </div>
      </td>
      <td><span className={'st ' + (t.is_published ? 'ok' : 'hid')}>{t.is_published ? 'Опубликован' : 'Скрыт'}</span></td>
      <td>
        <div className="acts">
          <button className="ib" type="button" onClick={onEdit} aria-label="Изменить"><Pencil /></button>
          <button className="ib" type="button" onClick={onToggle} aria-label="Скрыть">{t.is_published ? <EyeOff /> : <Eye />}</button>
          <button className="ib" type="button" onClick={onDup} aria-label="Дублировать"><Copy /></button>
          <button className="ib dl" type="button" onClick={onDel} aria-label="Удалить"><Trash2 /></button>
        </div>
      </td>
    </tr>
  );
}

export default function ToolsClient(props) {
  return <ToastProvider><Inner {...props} /></ToastProvider>;
}
