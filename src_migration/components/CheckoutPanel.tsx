import { useMemo, useState } from 'react';
import { Copy, CreditCard, MapPin, QrCode, Ticket } from 'lucide-react';
import type { AuthState, CheckoutProduct, CouponData, LiahConfig, ShippingOption, UserInfoResponse } from '../types';
import { api, ApiError } from '../api/client';
import { applyCoupon } from '../utils/coupon';
import { formatCard, formatCep, formatExpiry, money, onlyDigits } from '../utils/format';
import { ModalShell } from './ModalShell';

interface CheckoutPanelProps {
  config: LiahConfig;
  auth: AuthState;
  checkoutProducts: CheckoutProduct[];
  subtotal: number;
  userInfo: UserInfoResponse | null;
  couponCode: string;
  couponData: CouponData | null;
  onClose: () => void;
  onRefreshUserInfo: () => Promise<void>;
  onCouponApplied: (code: string, data: CouponData) => void;
  onCouponCleared: () => void;
  onPaid: () => void;
  onToast: (message: string, type?: 'success' | 'error' | 'info') => void;
}

type CheckoutStep = 'checkout' | 'pix' | 'success';

export function CheckoutPanel({
  config,
  auth,
  checkoutProducts,
  subtotal,
  userInfo,
  couponCode,
  couponData,
  onClose,
  onRefreshUserInfo,
  onCouponApplied,
  onCouponCleared,
  onPaid,
  onToast
}: CheckoutPanelProps) {
  const [selectedAddress, setSelectedAddress] = useState<string>(() => userInfo?.enderecos_final?.[0]?.id || '');
  const [selectedCard, setSelectedCard] = useState<string>(() => userInfo?.carteira_final?.[0]?.id || 'pix');
  const [selectedShippingIndex, setSelectedShippingIndex] = useState(0);
  const [installments, setInstallments] = useState(1);
  const [cvv, setCvv] = useState('');
  const [manualCoupon, setManualCoupon] = useState(couponCode);
  const [saving, setSaving] = useState(false);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [showCardForm, setShowCardForm] = useState(false);
  const [step, setStep] = useState<CheckoutStep>('checkout');
  const [pix, setPix] = useState<{ qrcode?: string; codigo?: string; transacao?: string }>({});
  const [addressForm, setAddressForm] = useState({
    cep: '',
    endereco: '',
    numero: '',
    complemento: '',
    bairro: '',
    cidade: '',
    estado: '',
    tipo: 'residencial'
  });
  const [cardForm, setCardForm] = useState({ cartao: '', vencimento: '', cvv: '', nome: '' });

  const shipping = userInfo?.frete?.[selectedShippingIndex] as ShippingOption | undefined;
  const totals = useMemo(
    () => applyCoupon(subtotal, shipping, couponData, checkoutProducts),
    [checkoutProducts, couponData, shipping, subtotal]
  );
  const total = totals.payableSubtotal + totals.payableShipping;

  async function saveAddress() {
    if (!auth.id || !auth.token) return;
    setSaving(true);
    try {
      const response = await api.saveAddress(config, auth.id, auth.token, addressForm);
      if (response.trim() === 'cep_invalido') {
        onToast('CEP fora da área de entrega.', 'error');
        return;
      }
      await onRefreshUserInfo();
      setShowAddressForm(false);
      setSelectedAddress(response.trim());
      onToast('Endereço salvo.', 'success');
    } catch {
      onToast('Erro ao salvar endereço.', 'error');
    } finally {
      setSaving(false);
    }
  }

  async function fillCep(cep: string) {
    const formatted = formatCep(cep);
    setAddressForm((current) => ({ ...current, cep: formatted }));
    if (onlyDigits(formatted).length !== 8) return;

    try {
      const response = await api.validateCep(formatted);
      if (!response.success) {
        onToast(response.message || 'CEP inválido.', 'error');
        return;
      }
      setAddressForm((current) => ({
        ...current,
        endereco: response.data?.logradouro || current.endereco,
        bairro: response.data?.bairro || current.bairro,
        cidade: response.data?.cidade || current.cidade,
        estado: response.data?.estado || current.estado
      }));
    } catch (error) {
      const message = error instanceof ApiError && typeof error.payload === 'object'
        ? String((error.payload as { message?: string }).message || 'CEP inválido.')
        : 'CEP inválido.';
      onToast(message, 'error');
    }
  }

  async function saveCard() {
    if (!auth.id || !auth.token) return;
    setSaving(true);
    try {
      const id = await api.saveCard(config, auth.id, auth.token, {
        cartao: onlyDigits(cardForm.cartao),
        vencimento: cardForm.vencimento,
        cvv: onlyDigits(cardForm.cvv),
        nome: cardForm.nome
      });
      await onRefreshUserInfo();
      setShowCardForm(false);
      setSelectedCard(id.trim());
      onToast('Cartão salvo.', 'success');
    } catch {
      onToast('Erro ao salvar cartão.', 'error');
    } finally {
      setSaving(false);
    }
  }

  async function validateCoupon() {
    if (!auth.id || !manualCoupon.trim()) return;
    setSaving(true);
    try {
      const response = await api.validateCoupon(config, auth.id, manualCoupon.trim().toUpperCase(), checkoutProducts, subtotal);
      if (response.retorno === 'sucesso' && response.dados) {
        const data = JSON.parse(response.dados) as CouponData;
        onCouponApplied(manualCoupon.trim().toUpperCase(), data);
        onToast('Cupom aplicado.', 'success');
      } else {
        onToast(response.txt || 'Cupom inválido.', 'error');
      }
    } catch (error) {
      const payload = error instanceof ApiError ? error.payload : null;
      const message = typeof payload === 'object' && payload
        ? String((payload as { txt?: string }).txt || 'Cupom inválido.')
        : 'Cupom inválido.';
      onToast(message, 'error');
    } finally {
      setSaving(false);
    }
  }

  async function finishCheckout() {
    if (!auth.id || !auth.token) return;
    if (!selectedAddress) {
      onToast('Selecione um endereço.', 'error');
      return;
    }
    if (!selectedCard) {
      onToast('Selecione um pagamento.', 'error');
      return;
    }
    if (selectedCard !== 'pix') {
      if (!cvv.trim()) {
        onToast('Confirme o CVV.', 'error');
        return;
      }
      try {
        const cvvResponse = await api.checkCvv(auth.id, auth.token, selectedCard, onlyDigits(cvv));
        if (!cvvResponse.sucesso) {
          onToast('CVV inválido.', 'error');
          return;
        }
      } catch {
        onToast('Erro ao confirmar CVV.', 'error');
        return;
      }
    }

    setSaving(true);
    try {
      const response = await api.checkout(config, auth.id, auth.token, {
        cartao: selectedCard,
        endereco: selectedAddress,
        tipoFrete: { ...(shipping || {}) },
        produtos: checkoutProducts,
        preco: total,
        parcela: installments,
        desconto: couponCode
      });

      if (response.status === 'PIX_GERADO') {
        setPix({ qrcode: response.qrcode, codigo: response.codigo, transacao: response.transacao });
        setStep('pix');
        return;
      }

      if (response.status === 'PAID') {
        onPaid();
        setStep('success');
        return;
      }

      onToast('Pagamento não aprovado.', 'error');
    } catch (error) {
      const payload = error instanceof ApiError ? error.payload : null;
      const message = typeof payload === 'object' && payload
        ? String((payload as { msg?: string }).msg || 'Falha ao finalizar compra.')
        : 'Falha ao finalizar compra.';
      onToast(message, 'error');
    } finally {
      setSaving(false);
    }
  }

  async function verifyPix() {
    if (!pix.transacao) return;
    setSaving(true);
    try {
      const response = await api.verifyPix(config, pix.transacao);
      if (response.status === 'PAID') {
        onPaid();
        setStep('success');
      } else {
        onToast('Pagamento ainda não identificado.', 'info');
      }
    } catch {
      onToast('Erro ao verificar PIX.', 'error');
    } finally {
      setSaving(false);
    }
  }

  if (!userInfo) {
    return (
      <ModalShell title="Checkout" onClose={onClose}>
        <div className="liah-react-loading-message">Carregando dados de pagamento...</div>
      </ModalShell>
    );
  }

  if (step === 'success') {
    return (
      <ModalShell title="Pagamento aprovado!" onClose={onClose}>
        <div className="liah-react-success">
          <strong>Seu pedido foi confirmado com sucesso.</strong>
          <p>Você receberá mais informações sobre a entrega em breve.</p>
          <button className="primary-btn" type="button" onClick={onClose}>
            Voltar à loja
          </button>
        </div>
      </ModalShell>
    );
  }

  if (step === 'pix') {
    return (
      <ModalShell title="PIX" onClose={() => setStep('checkout')}>
        <div className="liah-react-pix">
          {pix.qrcode ? <img src={pix.qrcode} alt="QR Code PIX" /> : <QrCode size={140} />}
          <textarea readOnly value={pix.codigo || ''} />
          <div className="liah-react-row">
            <button
              className="secondary-btn"
              type="button"
              onClick={() => {
                void navigator.clipboard?.writeText(pix.codigo || '');
                onToast('Código PIX copiado.', 'success');
              }}
            >
              <Copy size={16} />
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

  return (
    <ModalShell
      title="Checkout"
      onClose={onClose}
      footer={
        <button className="pagamentoBtn liah-react-pay-button" type="button" disabled={saving} onClick={() => void finishCheckout()}>
          <span>{selectedCard === 'pix' ? 'Gerar QR Code' : 'Confirmar pagamento'}</span>
          <strong>{money(total)}</strong>
        </button>
      }
    >
      {userInfo.avisos ? <div className="liah-react-warning" dangerouslySetInnerHTML={{ __html: userInfo.avisos }} /> : null}
      {userInfo.correios ? <div className="liah-react-warning">{userInfo.correios}</div> : null}

      <section className="liah-react-checkout-section">
        <h3>
          <MapPin size={18} />
          Entrega
        </h3>
        {userInfo.enderecos_final.length ? (
          <div className="liah-react-options">
            {userInfo.enderecos_final.map((address) => (
              <label key={address.id}>
                <input
                  type="radio"
                  name="address"
                  checked={selectedAddress === address.id}
                  onChange={() => setSelectedAddress(address.id)}
                />
                <span>
                  <strong>{address.endereco}, {address.numero}</strong>
                  {address.bairro} - {address.cidade}/{address.estado}
                </span>
              </label>
            ))}
          </div>
        ) : (
          <p>Adicione um endereço para entrega.</p>
        )}
        <button className="secondary-btn" type="button" onClick={() => setShowAddressForm((value) => !value)}>
          {showAddressForm ? 'Fechar' : 'Adicionar endereço'}
        </button>
        {showAddressForm ? (
          <form className="liah-react-form liah-react-inline-form" onSubmit={(event) => event.preventDefault()}>
            <label>
              CEP
              <input value={addressForm.cep} onChange={(event) => void fillCep(event.target.value)} />
            </label>
            <label>
              Endereço
              <input value={addressForm.endereco} onChange={(event) => setAddressForm((current) => ({ ...current, endereco: event.target.value }))} />
            </label>
            <label>
              Número
              <input value={addressForm.numero} onChange={(event) => setAddressForm((current) => ({ ...current, numero: event.target.value }))} />
            </label>
            <label>
              Complemento
              <input value={addressForm.complemento} onChange={(event) => setAddressForm((current) => ({ ...current, complemento: event.target.value }))} />
            </label>
            <label>
              Bairro
              <input value={addressForm.bairro} onChange={(event) => setAddressForm((current) => ({ ...current, bairro: event.target.value }))} />
            </label>
            <label>
              Cidade
              <input value={addressForm.cidade} onChange={(event) => setAddressForm((current) => ({ ...current, cidade: event.target.value }))} />
            </label>
            <label>
              Estado
              <input value={addressForm.estado} onChange={(event) => setAddressForm((current) => ({ ...current, estado: event.target.value.toUpperCase().slice(0, 2) }))} />
            </label>
            <button className="primary-btn" disabled={saving} type="button" onClick={() => void saveAddress()}>
              Salvar endereço
            </button>
          </form>
        ) : null}
      </section>

      <section className="liah-react-checkout-section">
        <h3>
          <CreditCard size={18} />
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
        {selectedCard !== 'pix' ? (
          <div className="liah-react-form liah-react-inline-form">
            <label>
              CVV
              <input inputMode="numeric" value={cvv} onChange={(event) => setCvv(onlyDigits(event.target.value).slice(0, 4))} />
            </label>
            <label>
              Parcelas
              <select value={installments} onChange={(event) => setInstallments(Number(event.target.value))}>
                {[1, 2, 3, 4, 5, 6].map((value) => (
                  <option key={value} value={value}>
                    {value}x de {money(total / value)} sem juros
                  </option>
                ))}
              </select>
            </label>
          </div>
        ) : null}
        <button className="secondary-btn" type="button" onClick={() => setShowCardForm((value) => !value)}>
          {showCardForm ? 'Fechar' : 'Adicionar cartão'}
        </button>
        {showCardForm ? (
          <form className="liah-react-form liah-react-inline-form" onSubmit={(event) => event.preventDefault()}>
            <label>
              Número do cartão
              <input value={cardForm.cartao} onChange={(event) => setCardForm((current) => ({ ...current, cartao: formatCard(event.target.value) }))} />
            </label>
            <label>
              Validade
              <input value={cardForm.vencimento} onChange={(event) => setCardForm((current) => ({ ...current, vencimento: formatExpiry(event.target.value) }))} />
            </label>
            <label>
              CVV
              <input value={cardForm.cvv} onChange={(event) => setCardForm((current) => ({ ...current, cvv: onlyDigits(event.target.value).slice(0, 4) }))} />
            </label>
            <label>
              Nome impresso
              <input value={cardForm.nome} onChange={(event) => setCardForm((current) => ({ ...current, nome: event.target.value }))} />
            </label>
            <button className="primary-btn" disabled={saving} type="button" onClick={() => void saveCard()}>
              Salvar cartão
            </button>
          </form>
        ) : null}
      </section>

      <section className="liah-react-checkout-section">
        <h3>
          <Ticket size={18} />
          Área de cupons
        </h3>
        <div className="liah-react-coupon-row">
          <input value={manualCoupon} onChange={(event) => setManualCoupon(event.target.value.toUpperCase())} placeholder="Digite seu cupom" />
          <button className="secondary-btn" disabled={saving || !manualCoupon.trim()} type="button" onClick={() => void validateCoupon()}>
            Aplicar
          </button>
          {couponCode ? (
            <button className="liah-link-button" type="button" onClick={onCouponCleared}>
              Limpar
            </button>
          ) : null}
        </div>
        {couponCode ? <div className="liah-react-applied-coupon">{couponCode} aplicado</div> : null}
      </section>

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
    </ModalShell>
  );
}
