import { useContext } from 'react';
import { LocationContext } from './context';

export function useLocation() {
  const context = useContext(LocationContext);
  if (!context) throw new Error('useLocation must be used inside LocationProvider.');
  return context;
}
