'use client';
import { useState, useTransition } from 'react';
import { Plus, Pencil, Trash2, Folder, Info } from 'lucide-react';
import Shell from '@/components/Shell';
import Drawer from '@/components/Drawer';
import { ToastProvider, useToast } from '@/components/Toast';
import { LucideIcon } from '@/components/IconPicker';
import CategoryForm from './CategoryForm';
import FamilyForm from './FamilyForm';
import { deleteCategory, reorderCategories } from '@/app/actions';
import { plural } from '@/lib/format';

function Inner({ shell, cats, fams, counts }) {
  const toast = useToast();
  const [, start] = useTransition();
  const [editCat, setEditCat] = useState(null);
  const [editFam, setEditFam] = useState(null);
  const [local, setLocal] = useState(null);
  const [err, setErr] = useState('');
  const list = local ?? cats;

  function run(fn, msg) {
    setErr('');
    start(async () => {
      try { await fn(); if (msg) toast(msg) }
      catch (e) { setErr(e.message) }
    });
  }

  function move(famId, from, to) {
    const inFam = list.filter(c => c.family_id === famId);
    const [moved] = inFam.splice(from, 1);
    inFam.splice(to, 0, moved);
    const next = [...list.filter(c => c.family_id !== famId), ...inFam];
    setLocal(next);
    run(() => reorderCategories(inFam.map(c => c.id)), 'Порядок сохранён');
  }

  return (
    <>
      <Shell {...shell} crumb="Каталог" title="Категории и семейства" actions={
        <>
          <button className="btn sec" type="button" onClick={() => setEditFam({})}><Plus />Семейство</button>
          <button className="btn pri" type="button" onClick={() => setEditCat({})}><Plus />Новая категория</button>
        </>
      }>
        {err && <div className="err">{err}</div>}

        <div className="note info">
          <Info />
          <span>Семейство — крупная группа на главной («Бетон и грунт»). Категория живёт внутри семейства и попадает в фильтры каталога. Порядок задаётся перетаскиванием.</span>
        </div>

        <div className="famlist">
          {fams.map(f => {
            const inFam = list.filter(c => c.family_id === f.id);
            const total = inFam.reduce((s, c) => s + (counts[c.id] ?? 0), 0);
            return (
              <div className="card" key={f.id}>
                <div className="chead">
                  <Folder /><b>{f.name}</b>
                  <span className="chip">{inFam.length} {plural(inFam.length, ['категория','категории','категорий'])} · {total} поз.</span>
                  <div className="sp" />
                  <button className="ib" type="button" onClick={() => setEditFam(f)} aria-label="Переименовать"><Pencil /></button>
                  <button className="btn sec" type="button" onClick={() => setEditCat({ family_id: f.id })}>
                    <Plus />Категория
                  </button>
                </div>
                <div>
                  {inFam.map((c, i) => (
                    <div className="catrow" key={c.id}
                      onDragOver={e => e.preventDefault()}
                      onDrop={e => {
                        e.preventDefault();
                        const from = parseInt(e.dataTransfer.getData('text/plain'), 10);
                        if (!Number.isNaN(from) && from !== i) move(f.id, from, i);
                      }}>
                      <span className="grab" draggable
                        onDragStart={e => e.dataTransfer.setData('text/plain', String(i))}>⠿</span>
                      <span className="cic"><LucideIcon name={c.icon} /></span>
                      <span className="ctx">
                        <b>{c.name}</b>
                        <span>чип: {c.short} · id: {c.id}</span>
                      </span>
                      <span className="cnt">{counts[c.id] ?? 0} поз.</span>
                      <span className="crowacts">
                        <button className="ib" type="button" onClick={() => setEditCat(c)} aria-label="Изменить"><Pencil /></button>
                        <button className="ib dl" type="button" aria-label="Удалить"
                          onClick={() => { if (confirm('Удалить категорию «' + c.name + '»?')) run(() => deleteCategory(c.id), 'Категория удалена') }}>
                          <Trash2 />
                        </button>
                      </span>
                    </div>
                  ))}
                  {inFam.length === 0 && (
                    <div className="empty-state" style={{ padding: '26px 20px' }}>
                      <b>Пока пусто</b><span>Добавьте первую категорию в это семейство</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </Shell>

      <Drawer open={!!editCat} onClose={() => setEditCat(null)}
        crumb="Категория" title={editCat?.name || 'Новая категория'}>
        {editCat && (
          <CategoryForm cat={editCat} fams={fams}
            onDone={m => { setEditCat(null); toast(m) }}
            onCancel={() => setEditCat(null)} />
        )}
      </Drawer>

      <Drawer open={!!editFam} onClose={() => setEditFam(null)}
        crumb="Семейство" title={editFam?.name || 'Новое семейство'}>
        {editFam && (
          <FamilyForm fam={editFam}
            onDone={m => { setEditFam(null); toast(m) }}
            onCancel={() => setEditFam(null)} />
        )}
      </Drawer>
    </>
  );
}

export default function CategoriesClient(props) {
  return <ToastProvider><Inner {...props} /></ToastProvider>;
}
