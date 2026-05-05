import type { ReactNode } from 'react';
import { useCheckoutController } from '../../hooks/useCheckoutController';
import { useCart } from '../../contexts/cart/useCart';
import { useCoupon } from '../../contexts/coupon/useCoupon';
import { useToast } from '../../contexts/toast/useToast';
import { CheckoutContext } from './checkoutContextCore';

interface CheckoutProviderProps {
  children: ReactNode;
}

export function CheckoutProvider({ children }: CheckoutProviderProps) {
  const { clearCart } = useCart();
  const { clearCoupon } = useCoupon();
  const { pushToast } = useToast();

  function onPaymentComplete() {
    clearCart();
    clearCoupon();
    pushToast('Pagamento aprovado.', 'success');
  }

  const value = useCheckoutController(onPaymentComplete);
  return <CheckoutContext.Provider value={value}>{children}</CheckoutContext.Provider>;
}
