'use client';
import { useEffect } from 'react';
import { X } from 'lucide-react';

/* Внутрь передаётся <form className="dform"> с .dbody и .dfoot — так кнопки
   остаются прижатыми к низу, а поля скроллятся. */
export default function Drawer({ open, onClose, crumb, title, children }) {
  useEffect(() => {
    if (!open) return;
    const esc = e => { if (e.key === 'Escape') onClose() };
    document.addEventListener('keydown', esc);
    return () => document.removeEventListener('keydown', esc);
  }, [open, onClose]);

  return (
    <>
      <div className={'scrim' + (open ? ' on' : '')} onClick={onClose} />
      <aside className={'drawer' + (open ? ' open' : '')} aria-hidden={!open}>
        {open && (
          <>
            <div className="dhead">
              <div>
                <div className="crumb">{crumb}</div>
                <h2>{title}</h2>
              </div>
              <button className="ib x" type="button" onClick={onClose} aria-label="Закрыть"><X /></button>
            </div>
            {children}
          </>
        )}
      </aside>
    </>
  );
}
