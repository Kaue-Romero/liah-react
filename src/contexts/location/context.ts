import { createContext } from 'react';
import type { LocationContextValue } from './types';

export const LocationContext = createContext<LocationContextValue | null>(null);
