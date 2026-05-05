import { createContext } from 'react';
import type { CheckoutController } from '../../hooks/useCheckoutController';

export const CheckoutContext = createContext<CheckoutController | null>(null);
