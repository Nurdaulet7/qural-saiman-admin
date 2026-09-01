'use client';
import { createContext, useCallback, useContext, useState } from 'react';

const Ctx = createContext(() => {});
export const useToast = () => useContext(Ctx);

export function ToastProvider({ children }) {
  const [msg, setMsg] = useState('');

  const toast = useCallback(text => {
    setMsg(text);
    setTimeout(() => setMsg(''), 2200);
  }, []);

  return (
    <Ctx.Provider value={toast}>
      {children}
      <div className={'toast' + (msg ? ' on' : '')}>{msg}</div>
    </Ctx.Provider>
  );
}
