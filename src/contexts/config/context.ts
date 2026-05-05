import { createContext } from 'react';
import type { ConfigContextValue } from './types';

export const ConfigContext = createContext<ConfigContextValue | null>(null);
