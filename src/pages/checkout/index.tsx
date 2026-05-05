import { useUi } from '../../contexts/ui/useUi';
import { ModalShell } from '../../components/layout/ModalShell';
import { money } from '../../utils/format';
import { CheckoutContext } from './checkoutContextCore';
import { CheckoutCouponSection } from './CheckoutCouponSection';
import { CheckoutDeliverySection } from './CheckoutDeliverySection';
import { CheckoutPaymentSection } from './CheckoutPaymentSection';
import { CheckoutPixPanel } from './CheckoutPixPanel';
import { CheckoutProvider } from './CheckoutContext';
import { CheckoutSuccessPanel } from './CheckoutSuccessPanel';
import { CheckoutSummarySection } from './CheckoutSummarySection';
import { useCheckout } from './useCheckout';

export { CheckoutContext };

export function CheckoutPage() {
  return (
    <CheckoutProvider>
      <CheckoutContent />
    </CheckoutProvider>
  );
}

function CheckoutContent() {
  const { closeModal } = useUi();
  const { finishCheckout, saving, selectedCard, step, total, userInfo } = useCheckout();

  if (!userInfo) {
    return (
      <ModalShell title="Checkout" onClose={closeModal}>
        <div className="liah-react-loading-message">Carregando dados de pagamento...</div>
      </ModalShell>
    );
  }

  if (step === 'success') return <CheckoutSuccessPanel />;
  if (step === 'pix') return <CheckoutPixPanel />;

  return (
    <ModalShell
      title="Checkout"
      onClose={closeModal}
      footer={
        <button className="pagamentoBtn liah-react-pay-button" type="button" disabled={saving} onClick={() => void finishCheckout()}>
          <span>{selectedCard === 'pix' ? 'Gerar QR Code' : 'Confirmar pagamento'}</span>
          <strong>{money(total)}</strong>
        </button>
      }
    >
      {userInfo.avisos ? <div className="liah-react-warning" dangerouslySetInnerHTML={{ __html: userInfo.avisos }} /> : null}
      {userInfo.correios ? <div className="liah-react-warning">{userInfo.correios}</div> : null}
      <CheckoutDeliverySection />
      <CheckoutPaymentSection />
      <CheckoutCouponSection />
      <CheckoutSummarySection />
    </ModalShell>
  );
}
