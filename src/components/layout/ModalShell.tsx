import type { ReactNode } from 'react';
import { X } from 'lucide-react';

interface ModalShellProps {
  title: string;
  onClose: () => void;
  footer?: ReactNode;
  children: ReactNode;
}

export function ModalShell({ title, onClose, footer, children }: ModalShellProps) {
  return (
    <div className="modal-liah liah-react-modal" role="dialog" aria-modal="true" aria-label={title}>
      <div className="liah-react-modal-backdrop" onClick={onClose} />
      <div className="liah-react-modal-panel">
        <div className="liah-react-modal-header">
          <h2>{title}</h2>
          <button type="button" aria-label="Fechar" onClick={onClose}>
            <X size={20} aria-hidden="true" />
          </button>
        </div>
        <div className="liah-react-modal-body">{children}</div>
        {footer ? <div className="liah-react-modal-footer">{footer}</div> : null}
      </div>
    </div>
  );
}
