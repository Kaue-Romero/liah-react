import type { ToastMessage } from '../../types';

export function ToastHost({ toasts }: { toasts: ToastMessage[] }) {
  if (!toasts.length) return null;

  return (
    <div className="liah-react-toasts" role="status" aria-live="polite">
      {toasts.map((toast) => (
        <div key={toast.id} className={`liah-react-toast liah-toast-${toast.type || 'info'}`}>
          {toast.message}
        </div>
      ))}
    </div>
  );
}
