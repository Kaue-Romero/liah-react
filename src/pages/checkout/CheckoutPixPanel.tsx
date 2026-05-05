import { Copy, QrCode } from 'lucide-react';
import { useToast } from '../../contexts/toast/useToast';
import { ModalShell } from '../../components/layout/ModalShell';
import { useCheckout } from './useCheckout';

export function CheckoutPixPanel() {
  const { pushToast } = useToast();
  const { pix, saving, setStep, verifyPix } = useCheckout();

  return (
    <ModalShell title="PIX" onClose={() => setStep('checkout')}>
      <div className="liah-react-pix">
        {pix.qrcode ? <img src={pix.qrcode} width={180} height={180} alt="QR Code PIX" /> : <QrCode size={140} aria-hidden="true" />}
        <textarea readOnly name="pix-code" aria-label="Código PIX" value={pix.codigo || ''} />
        <div className="liah-react-row">
          <button
            className="secondary-btn"
            type="button"
            onClick={() => {
              void navigator.clipboard?.writeText(pix.codigo || '');
              pushToast('Código PIX copiado.', 'success');
            }}
          >
            <Copy size={16} aria-hidden="true" />
            Copiar código
          </button>
          <button className="primary-btn" disabled={saving} type="button" onClick={() => void verifyPix()}>
            Verificar pagamento
          </button>
        </div>
      </div>
    </ModalShell>
  );
}
