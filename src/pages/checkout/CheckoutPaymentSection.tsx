import { CreditCard } from 'lucide-react';
import { formatCard, formatExpiry, money, onlyDigits } from '../../utils/format';
import { useCheckout } from './useCheckout';

export function CheckoutPaymentSection() {
  const { selectedCard, setSelectedCard, setShowCardForm, showCardForm, userInfo } = useCheckout();

  if (!userInfo) return null;

  return (
    <section className="liah-react-checkout-section">
      <h3>
        <CreditCard size={18} aria-hidden="true" />
        Pagamento
      </h3>
      <div className="liah-react-options">
        <label>
          <input type="radio" name="card" checked={selectedCard === 'pix'} onChange={() => setSelectedCard('pix')} />
          <span>PIX</span>
        </label>
        {userInfo.carteira_final.map((card) => (
          <label key={card.id}>
            <input type="radio" name="card" checked={selectedCard === card.id} onChange={() => setSelectedCard(card.id)} />
            <span>Cartão de crédito ({card.numero})</span>
          </label>
        ))}
      </div>
      {selectedCard !== 'pix' ? <SavedCardFields /> : null}
      <button className="secondary-btn" type="button" onClick={() => setShowCardForm((value) => !value)}>
        {showCardForm ? 'Fechar' : 'Adicionar cartão'}
      </button>
      {showCardForm ? <NewCardForm /> : null}
    </section>
  );
}

function SavedCardFields() {
  const { cvv, installments, setCvv, setInstallments, total } = useCheckout();

  return (
    <div className="liah-react-form liah-react-inline-form">
      <label>
        CVV
        <input
          name="card-cvv"
          autoComplete="cc-csc"
          inputMode="numeric"
          value={cvv}
          onChange={(event) => setCvv(onlyDigits(event.target.value).slice(0, 4))}
        />
      </label>
      <label>
        Parcelas
        <select name="installments" value={installments} onChange={(event) => setInstallments(Number(event.target.value))}>
          {[1, 2, 3, 4, 5, 6].map((value) => (
            <option key={value} value={value}>
              {value}x de {money(total / value)} sem juros
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}

function NewCardForm() {
  const { cardForm, saveCard, saving, setCardForm } = useCheckout();

  return (
    <form className="liah-react-form liah-react-inline-form" onSubmit={(event) => event.preventDefault()}>
      <label>
        Número do cartão
        <input
          name="card-number"
          autoComplete="cc-number"
          inputMode="numeric"
          value={cardForm.cartao}
          onChange={(event) => setCardForm((current) => ({ ...current, cartao: formatCard(event.target.value) }))}
        />
      </label>
      <label>
        Validade
        <input
          name="card-expiration"
          autoComplete="cc-exp"
          inputMode="numeric"
          value={cardForm.vencimento}
          onChange={(event) => setCardForm((current) => ({ ...current, vencimento: formatExpiry(event.target.value) }))}
        />
      </label>
      <label>
        CVV
        <input
          name="new-card-cvv"
          autoComplete="cc-csc"
          inputMode="numeric"
          value={cardForm.cvv}
          onChange={(event) => setCardForm((current) => ({ ...current, cvv: onlyDigits(event.target.value).slice(0, 4) }))}
        />
      </label>
      <label>
        Nome impresso
        <input
          name="card-name"
          autoComplete="cc-name"
          value={cardForm.nome}
          onChange={(event) => setCardForm((current) => ({ ...current, nome: event.target.value }))}
        />
      </label>
      <button className="primary-btn" disabled={saving} type="button" onClick={() => void saveCard()}>
        Salvar cartão
      </button>
    </form>
  );
}
