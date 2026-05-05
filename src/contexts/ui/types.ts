import type { RefObject, UIEvent } from 'react';
import type { ModalName } from '../../types';

export interface UiContextValue {
  modal: ModalName;
  modalStack: ModalName[];
  frameRef: RefObject<HTMLElement | null>;
  showBackTop: boolean;
  openModal: (modal: ModalName) => void;
  closeModal: () => void;
  closeAllModals: () => void;
  handleFrameScroll: (event: UIEvent<HTMLElement>) => void;
  scrollToTop: () => void;
}
