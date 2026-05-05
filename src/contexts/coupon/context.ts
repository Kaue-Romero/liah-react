import { createContext } from 'react';
import type { CouponContextValue } from './types';

export const CouponContext = createContext<CouponContextValue | null>(null);
