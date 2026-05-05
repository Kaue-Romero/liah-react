import { useCallback, useEffect, useState, type ReactNode } from 'react';
import type { ToastMessage } from '../../types';
import { ToastContext } from './context';

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const pushToast = useCallback((message: string, type: ToastMessage['type'] = 'info') => {
    const id = Date.now() + Math.floor(Math.random() * 1000);
    setToasts((current) => [...current, { id, message, type }]);
    window.setTimeout(() => {
      setToasts((current) => current.filter((toast) => toast.id !== id));
    }, 3200);
  }, []);

  useEffect(() => {
    const handler = (event: Event) => {
      const detail = (event as CustomEvent<{ messageText?: string; type?: ToastMessage['type'] }>).detail;
      pushToast(detail?.messageText || '', detail?.type || 'info');
    };
    window.addEventListener('liah:toast', handler);
    return () => window.removeEventListener('liah:toast', handler);
  }, [pushToast]);

  return <ToastContext.Provider value={{ toasts, pushToast }}>{children}</ToastContext.Provider>;
}
