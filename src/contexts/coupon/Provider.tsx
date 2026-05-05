import { useCallback, useState, type ReactNode } from 'react';
import type { CouponData } from '../../types';
import { CouponContext } from './context';

export function CouponProvider({ children }: { children: ReactNode }) {
  const [couponCode, setCouponCode] = useState('');
  const [couponData, setCouponData] = useState<CouponData | null>(null);

  const applyCoupon = useCallback((code: string, data: CouponData) => {
    setCouponCode(code);
    setCouponData(data);
  }, []);

  const clearCoupon = useCallback(() => {
    setCouponCode('');
    setCouponData(null);
  }, []);

  return (
    <CouponContext.Provider value={{ couponCode, couponData, applyCoupon, clearCoupon }}>
      {children}
    </CouponContext.Provider>
  );
}
