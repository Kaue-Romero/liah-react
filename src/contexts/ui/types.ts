import type { RefObject, UIEvent } from 'react';
import type { ModalName } from '../../types';

export interface UiContextValue {
  modal: ModalName;
  frameRef: RefObject<HTMLElement | null>;
  showBackTop: boolean;
  openModal: (modal: ModalName) => void;
  closeModal: () => void;
  handleFrameScroll: (event: UIEvent<HTMLElement>) => void;
  scrollToTop: () => void;
}
