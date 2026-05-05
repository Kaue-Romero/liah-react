import type { CouponData } from '../../types';

export interface CouponContextValue {
  couponCode: string;
  couponData: CouponData | null;
  applyCoupon: (code: string, data: CouponData) => void;
  clearCoupon: () => void;
}
