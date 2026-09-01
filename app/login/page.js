'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [pw, setPw] = useState('');
  const [show, setShow] = useState(false);
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setBusy(true); setErr('');
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password: pw });
    if (error) {
      setErr(error.message === 'Invalid login credentials'
        ? 'Неверный email или пароль'
        : error.message);
      setBusy(false);
      return;
    }
    router.replace('/tools');
    router.refresh();
  }

  return (
    <div className="login">
      <form className="login-card" onSubmit={submit}>
        <div className="login-lg">
          <span className="mark" />
          <span className="wm"><b>QURAL<i>–</i><u>SAIMAN</u></b><em>SERVICE</em></span>
        </div>
        <h1>Вход в админку</h1>
        <p>Каталог, цены и фото сайта проката</p>
        {err && <div className="err" style={{ marginBottom: 13 }}>{err}</div>}
        <div className="f">
          <label htmlFor="em">Email</label>
          <input id="em" type="email" required autoComplete="username"
            value={email} onChange={e => setEmail(e.target.value)} />
        </div>
        <div className="f">
          <label htmlFor="pw">Пароль</label>
          <div className="pwrap">
            <input id="pw" type={show ? 'text' : 'password'} required autoComplete="current-password"
              value={pw} onChange={e => setPw(e.target.value)} />
            <button className="pwtg" type="button" onClick={() => setShow(v => !v)}
              aria-label={show ? 'Скрыть пароль' : 'Показать пароль'}>
              {show ? <EyeOff /> : <Eye />}
            </button>
          </div>
        </div>
        <button className="btn pri" type="submit" disabled={busy}>
          {busy ? <span className="spin" /> : null}{busy ? 'Проверяем…' : 'Войти'}
        </button>
      </form>
    </div>
  );
}
