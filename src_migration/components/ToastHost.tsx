import type { ToastMessage } from '../types';

interface ToastHostProps {
  toasts: ToastMessage[];
}

export function ToastHost({ toasts }: ToastHostProps) {
  return (
    <div className="liah-toast-wrap is-visible" aria-live="polite" aria-atomic="true">
      {toasts.map((toast) => (
        <div className={`liah-toast liah-react-toast-${toast.type || 'info'}`} key={toast.id}>
          <div id="liah-toast-icon" aria-hidden="true" />
          <div className="liah-toast-text">{toast.message}</div>
        </div>
      ))}
    </div>
  );
}
