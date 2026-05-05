import { useCallback, useRef, useState, type ReactNode, type UIEvent } from 'react';
import type { ModalName } from '../../types';
import { UiContext } from './context';

export function UiProvider({ children }: { children: ReactNode }) {
  const frameRef = useRef<HTMLElement | null>(null);
  const [modal, setModal] = useState<ModalName>(null);
  const [showBackTop, setShowBackTop] = useState(false);

  const openModal = useCallback((nextModal: ModalName) => setModal(nextModal), []);
  const closeModal = useCallback(() => setModal(null), []);

  const handleFrameScroll = useCallback((event: UIEvent<HTMLElement>) => {
    const shouldShow = event.currentTarget.scrollTop > 80;
    setShowBackTop((current) => (current === shouldShow ? current : shouldShow));
  }, []);

  const scrollToTop = useCallback(() => {
    frameRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return (
    <UiContext.Provider value={{ modal, frameRef, showBackTop, openModal, closeModal, handleFrameScroll, scrollToTop }}>
      {children}
    </UiContext.Provider>
  );
}
