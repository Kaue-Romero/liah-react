import { Ticket } from 'lucide-react';
import { useCoupon } from '../../contexts/coupon/useCoupon';
import { useCheckout } from './useCheckout';

export function CheckoutCouponSection() {
  const { clearCoupon } = useCoupon();
  const { couponCode, manualCoupon, saving, setManualCoupon, validateCoupon } = useCheckout();

  return (
    <section className="liah-react-checkout-section">
      <h3>
        <Ticket size={18} aria-hidden="true" />
        Área de cupons
      </h3>
      <div className="liah-react-coupon-row">
        <input
          name="coupon"
          autoComplete="off"
          spellCheck={false}
          value={manualCoupon}
          onChange={(event) => setManualCoupon(event.target.value.toUpperCase())}
          placeholder="Digite seu cupom"
        />
        <button className="secondary-btn" disabled={saving || !manualCoupon.trim()} type="button" onClick={() => void validateCoupon()}>
          Aplicar
        </button>
        {couponCode ? (
          <button className="liah-link-button" type="button" onClick={clearCoupon}>
            Limpar
          </button>
        ) : null}
      </div>
      {couponCode ? <div className="liah-react-applied-coupon">{couponCode} aplicado</div> : null}
    </section>
  );
}
