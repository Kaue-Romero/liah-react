import { useCallback, useState, type ReactNode } from 'react';
import { readStorageItem, writeStorageItem } from '../../utils/storage';
import { useUi } from '../ui/useUi';
import { LocationContext } from './context';

export function LocationProvider({ children }: { children: ReactNode }) {
  const { closeModal } = useUi();
  const [selectedState, setSelectedState] = useState<string | null>(() => readStorageItem('estado') || 'SP');

  const selectState = useCallback(
    (state: string) => {
      const nextState = state.toUpperCase();
      writeStorageItem('estado', nextState);
      setSelectedState(nextState);
      closeModal();
    },
    [closeModal]
  );

  return <LocationContext.Provider value={{ selectedState, selectState }}>{children}</LocationContext.Provider>;
}
