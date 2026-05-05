import { useCallback } from 'react';
import type { ModalName } from '../../types';
import { useUi } from './useUi';

export function useModal(name: ModalName) {
  const { modalStack, openModal, closeModal } = useUi();
  const isOpen = modalStack.includes(name as NonNullable<ModalName>);
  const open = useCallback(() => openModal(name), [openModal, name]);
  return { isOpen, open, close: closeModal };
}
