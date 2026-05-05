import { money } from '../../utils/format';
import { useCheckout } from './useCheckout';

export function CheckoutSummarySection() {
  const { selectedShippingIndex, setSelectedShippingIndex, subtotal, total, totals, userInfo } = useCheckout();

  if (!userInfo) return null;

  return (
    <section className="section-categoria liah-react-summary">
      <div className="subtitulo item-resumo-compra">
        <div>Subtotal</div>
        <span>{money(subtotal)}</span>
      </div>
      {totals.subtotalDiscount > 0 ? (
        <div className="subtitulo item-resumo-compra">
          <div>Desconto</div>
          <span>-{money(totals.subtotalDiscount)}</span>
        </div>
      ) : null}
      {userInfo.frete?.length ? (
        <div className="liah-react-options">
          {userInfo.frete.map((option, index) => (
            <label key={`${option.layout}-${index}`}>
              <input
                type="radio"
                name="shipping"
                checked={selectedShippingIndex === index}
                onChange={() => setSelectedShippingIndex(index)}
              />
              <span>
                <strong>{option.layout}</strong>
                {(option.valor_beneficios ?? option.valor) === 0 ? 'Grátis' : money(option.valor_beneficios ?? option.valor)}
              </span>
            </label>
          ))}
        </div>
      ) : null}
      {totals.shippingDiscount > 0 ? (
        <div className="subtitulo item-resumo-compra">
          <div>Desconto frete</div>
          <span>-{money(totals.shippingDiscount)}</span>
        </div>
      ) : null}
      <div className="subtitulo item-resumo-compra liah-react-total">
        <div>Total</div>
        <span>{money(total)}</span>
      </div>
    </section>
  );
}
