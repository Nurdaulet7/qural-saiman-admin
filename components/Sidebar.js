'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Wrench, Layers, Zap, Percent, Image as ImageIcon, Settings, ExternalLink, LogOut } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

const NAV = [
  { href: '/tools', label: 'Инструменты', Icon: Wrench, count: 'tools' },
  { href: '/categories', label: 'Категории', Icon: Layers, count: 'cats' },
  { href: '/dgu', label: 'Генераторы ДГУ', Icon: Zap, count: 'dgu' },
  { href: '/pricing', label: 'Цены и акции', Icon: Percent },
  { href: '/media', label: 'Фото и медиа', Icon: ImageIcon }
];

export default function Sidebar({ counts, email, onNavigate }) {
  const path = usePathname();
  const router = useRouter();

  async function logout() {
    await createClient().auth.signOut();
    router.replace('/login');
    router.refresh();
  }

  return (
    <aside className="side">
      <div className="lg">
        <span className="mark" />
        <span className="wm"><b>QURAL<i>–</i><u>SAIMAN</u></b><em>SERVICE</em></span>
      </div>
      <div className="grp">Каталог</div>
      <nav className="snav">
        {NAV.map(({ href, label, Icon, count }) => (
          <Link key={href} href={href} className={path === href ? 'on' : ''} onClick={onNavigate}>
            <Icon />{label}
            {count && <span className="cnt">{counts[count]}</span>}
          </Link>
        ))}
        <div className="grp">Прочее</div>
        <Link href="/settings" className={path === '/settings' ? 'on' : ''} onClick={onNavigate}>
          <Settings />Настройки
        </Link>
        <a href="https://qural-saiman.kz" target="_blank" rel="noopener noreferrer">
          <ExternalLink />Открыть сайт
        </a>
      </nav>
      <div className="foot">
        <div className="av">{(email || '?')[0].toUpperCase()}</div>
        <div className="who">
          <b>Владелец</b>
          <span title={email}>{email}</span>
        </div>
        <button type="button" onClick={logout} aria-label="Выйти"><LogOut /></button>
      </div>
    </aside>
  );
}
