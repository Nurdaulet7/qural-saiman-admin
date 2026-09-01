'use client';
export default function Toggle({ on, onChange, label }) {
  return (
    <button type="button" role="switch" aria-checked={on} aria-label={label}
      className={'tg' + (on ? ' on' : '')} onClick={() => onChange(!on)} />
  );
}
