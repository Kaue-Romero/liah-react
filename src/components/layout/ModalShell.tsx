import { useCallback, useRef, useState, type ReactNode } from 'react';
import { X } from 'lucide-react';

interface ModalShellProps {
  title: string;
  onClose: () => void;
  footer?: ReactNode;
  children: ReactNode;
  className?: string;
}

export function ModalShell({ title, onClose, footer, children, className = '' }: ModalShellProps) {
  const [closing, setClosing] = useState(false);
  const modalRef = useRef<HTMLElement>(null);

  const handleClose = useCallback(() => {
    const el = modalRef.current;
    if (!el) { onClose(); return; }
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) { onClose(); return; }
    setClosing(true);
    const onEnd = () => { el.removeEventListener('animationend', onEnd); onClose(); };
    el.addEventListener('animationend', onEnd);
  }, [onClose]);

  return (
    <div className="liah-react-modal-layer">
      <button className={`liah-react-scrim${closing ? ' is-closing' : ''}`} type="button" aria-label="Fechar" onClick={handleClose} />
      <section
        ref={modalRef}
        className={`liah-react-modal${closing ? ' is-closing' : ''}${className ? ` ${className}` : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        <header className="liah-react-modal-header">
          <h2>{title}</h2>
          <button className="liah-icon-button" type="button" aria-label="Fechar" onClick={handleClose}>
            <X size={22} aria-hidden="true" />
          </button>
        </header>
        <div className="liah-react-modal-body">{children}</div>
        {footer ? <footer className="liah-react-modal-footer">{footer}</footer> : null}
      </section>
    </div>
  );
}
