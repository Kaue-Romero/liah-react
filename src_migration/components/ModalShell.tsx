import type { ReactNode } from 'react';
import { X } from 'lucide-react';

interface ModalShellProps {
  title: string;
  children: ReactNode;
  onClose: () => void;
  footer?: ReactNode;
  className?: string;
}

export function ModalShell({ title, children, onClose, footer, className = '' }: ModalShellProps) {
  return (
    <div className="liah-react-modal-layer">
      <button className="liah-react-scrim" type="button" aria-label="Fechar" onClick={onClose} />
      <section className={`liah-react-modal ${className}`} role="dialog" aria-modal="true" aria-label={title}>
        <header className="liah-react-modal-header">
          <h2>{title}</h2>
          <button className="liah-icon-button" type="button" aria-label="Fechar" onClick={onClose}>
            <X size={22} />
          </button>
        </header>
        <div className="liah-react-modal-body">{children}</div>
        {footer ? <footer className="liah-react-modal-footer">{footer}</footer> : null}
      </section>
    </div>
  );
}
