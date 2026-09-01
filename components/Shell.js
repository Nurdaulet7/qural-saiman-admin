'use client';
import { useState } from 'react';
import { Menu } from 'lucide-react';
import Sidebar from './Sidebar';

export default function Shell({ counts, email, crumb, title, actions, children }) {
  const [nav, setNav] = useState(false);

  return (
    <div className={'shell' + (nav ? ' nav-open' : '')}>
      <Sidebar counts={counts} email={email} onNavigate={() => setNav(false)} />
      <div className="main">
        <header className="top">
          <button className="burger" type="button" onClick={() => setNav(v => !v)} aria-label="Меню">
            <Menu />
          </button>
          <div>
            <div className="crumb">{crumb}</div>
            <h1>{title}</h1>
          </div>
          <div className="sp" />
          <div id="pacts" style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>{actions}</div>
        </header>
        <div className="body">{children}</div>
      </div>
      <div className="scrim" onClick={() => setNav(false)} />
    </div>
  );
}
