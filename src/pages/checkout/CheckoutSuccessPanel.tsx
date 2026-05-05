import { useUi } from '../../contexts/ui/useUi';
import { ModalShell } from '../../components/layout/ModalShell';

export function CheckoutSuccessPanel() {
  const { closeModal } = useUi();

  return (
    <ModalShell title="Pagamento aprovado!" onClose={closeModal}>
      <div className="liah-react-success">
        <strong>Seu pedido foi confirmado com sucesso.</strong>
        <p>Você receberá mais informações sobre a entrega em breve.</p>
        <button className="primary-btn" type="button" onClick={closeModal}>
          Voltar à loja
        </button>
      </div>
    </ModalShell>
  );
}
