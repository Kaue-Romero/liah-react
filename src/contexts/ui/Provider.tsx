import { useCallback, useRef, useState, type ReactNode, type UIEvent } from 'react';
import type { ModalName } from '../../types';
import { UiContext } from './context';

export function UiProvider({ children }: { children: ReactNode }) {
  const frameRef = useRef<HTMLElement | null>(null);
  const [modalStack, setModalStack] = useState<ModalName[]>([]);
  const [showBackTop, setShowBackTop] = useState(false);

  const modal = modalStack[modalStack.length - 1] ?? null;

  const openModal = useCallback((next: ModalName) => {
    setModalStack((s) => (s[s.length - 1] === next ? s : [...s, next]));
  }, []);

  const closeModal = useCallback(() => {
    setModalStack((s) => s.slice(0, -1));
  }, []);

  const closeAllModals = useCallback(() => {
    setModalStack([]);
  }, []);

  const handleFrameScroll = useCallback((event: UIEvent<HTMLElement>) => {
    const shouldShow = event.currentTarget.scrollTop > 80;
    setShowBackTop((current) => (current === shouldShow ? current : shouldShow));
  }, []);

  const scrollToTop = useCallback(() => {
    frameRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return (
    <UiContext.Provider value={{ modal, modalStack, frameRef, showBackTop, openModal, closeModal, closeAllModals, handleFrameScroll, scrollToTop }}>
      {children}
    </UiContext.Provider>
  );
}
