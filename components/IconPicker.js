'use client';
import * as icons from 'lucide-react';
import { ICON_SET } from '@/lib/format';

const toPascal = n => n.split('-').map(p => p[0].toUpperCase() + p.slice(1)).join('');
export function LucideIcon({ name, ...rest }) {
  const C = icons[toPascal(name || 'box')] || icons.Box;
  return <C {...rest} />;
}

export default function IconPicker({ value, onChange }) {
  const set = value && !ICON_SET.includes(value) ? [value, ...ICON_SET] : ICON_SET;
  return (
    <>
      <div className="icpick">
        <span className="iccur"><LucideIcon name={value} /></span>
        <span className="ictx">
          <b>{value || 'box'}</b>
          <span>Так иконка выглядит в каталоге и в фильтрах</span>
        </span>
      </div>
      <div className="icgrid">
        {set.map(n => (
          <button key={n} type="button" title={n}
            className={'ictile' + (n === value ? ' on' : '')}
            onClick={() => onChange(n)}>
            <LucideIcon name={n} />
          </button>
        ))}
      </div>
    </>
  );
}
