import type { ToastMessage } from '../../types';

export interface ToastContextValue {
  toasts: ToastMessage[];
  pushToast: (message: string, type?: ToastMessage['type']) => void;
}
