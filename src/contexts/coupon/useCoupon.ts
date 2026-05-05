import { useContext } from 'react';
import { CouponContext } from './context';

export function useCoupon() {
  const context = useContext(CouponContext);
  if (!context) throw new Error('useCoupon must be used inside CouponProvider.');
  return context;
}
