import { useMemo, useState, type Dispatch, type SetStateAction } from 'react';
import { ApiError, api } from '../api/client';
import { useAuth } from '../contexts/auth/useAuth';
import { useCart } from '../contexts/cart/useCart';
import { useConfig } from '../contexts/config/useConfig';
import { useCoupon } from '../contexts/coupon/useCoupon';
import { useToast } from '../contexts/toast/useToast';
import { useUser } from '../contexts/user/useUser';
import type { CouponData, UserInfoResponse } from '../types';
import { applyCoupon } from '../utils/coupon';
import { formatCep, onlyDigits } from '../utils/format';

export type CheckoutStep = 'checkout' | 'pix' | 'success';

export interface AddressFormState {
  cep: string;
  endereco: string;
  numero: string;
  complemento: string;
  bairro: string;
  cidade: string;
  estado: string;
  tipo: string;
}

export interface CardFormState {
  cartao: string;
  vencimento: string;
  cvv: string;
  nome: string;
}

export interface PixState {
  qrcode?: string;
  codigo?: string;
  transacao?: string;
}

export interface CheckoutController {
  addressForm: AddressFormState;
  cardForm: CardFormState;
  couponCode: string;
  couponData: CouponData | null;
  cvv: string;
  fillCep: (cep: string) => Promise<void>;
  finishCheckout: () => Promise<void>;
  installments: number;
  manualCoupon: string;
  pix: PixState;
  saveAddress: () => Promise<void>;
  saveCard: () => Promise<void>;
  saving: boolean;
  selectedAddress: string;
  selectedCard: string;
  selectedShippingIndex: number;
  setAddressForm: Dispatch<SetStateAction<AddressFormState>>;
  setCardForm: Dispatch<SetStateAction<CardFormState>>;
  setCvv: Dispatch<SetStateAction<string>>;
  setInstallments: Dispatch<SetStateAction<number>>;
  setManualCoupon: Dispatch<SetStateAction<string>>;
  setSelectedAddress: Dispatch<SetStateAction<string>>;
  setSelectedCard: Dispatch<SetStateAction<string>>;
  setSelectedShippingIndex: Dispatch<SetStateAction<number>>;
  setShowAddressForm: Dispatch<SetStateAction<boolean>>;
  setShowCardForm: Dispatch<SetStateAction<boolean>>;
  setStep: Dispatch<SetStateAction<CheckoutStep>>;
  shipping: ReturnType<typeof getShippingOption>;
  showAddressForm: boolean;
  showCardForm: boolean;
  step: CheckoutStep;
  subtotal: number;
  total: number;
  totals: ReturnType<typeof applyCoupon>;
  userInfo: UserInfoResponse | null;
  validateCoupon: () => Promise<void>;
  verifyPix: () => Promise<void>;
}

const EMPTY_ADDRESS: AddressFormState = {
  cep: '',
  endereco: '',
  numero: '',
  complemento: '',
  bairro: '',
  cidade: '',
  estado: '',
  tipo: 'residencial'
};

export function useCheckoutController(onPaymentComplete: () => void): CheckoutController {
  const { auth } = useAuth();
  const { checkoutProducts, subtotal } = useCart();
  const { config } = useConfig();
  const { couponCode, couponData, applyCoupon: applyCtxCoupon } = useCoupon();
  const { pushToast } = useToast();
  const { refreshUserInfo, userInfo } = useUser();

  const [selectedAddress, setSelectedAddress] = useState('');
  const [selectedCard, setSelectedCard] = useState('pix');
  const [selectedShippingIndex, setSelectedShippingIndex] = useState(0);
  const [installments, setInstallments] = useState(1);
  const [cvv, setCvv] = useState('');
  const [manualCoupon, setManualCoupon] = useState(couponCode);
  const [saving, setSaving] = useState(false);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [showCardForm, setShowCardForm] = useState(false);
  const [step, setStep] = useState<CheckoutStep>('checkout');
  const [pix, setPix] = useState<PixState>({});
  const [addressForm, setAddressForm] = useState<AddressFormState>(EMPTY_ADDRESS);
  const [cardForm, setCardForm] = useState<CardFormState>({ cartao: '', vencimento: '', cvv: '', nome: '' });

  const shipping = getShippingOption(userInfo, selectedShippingIndex);
  const totals = useMemo(
    () => applyCoupon(subtotal, shipping, couponData, checkoutProducts),
    [checkoutProducts, couponData, shipping, subtotal]
  );
  const total = totals.payableSubtotal + totals.payableShipping;
  const effectiveSelectedAddress = selectedAddress || userInfo?.enderecos_final?.[0]?.id || '';

  async function saveAddress() {
    if (!auth.id || !auth.token) return;
    setSaving(true);
    try {
      const response = await api.saveAddress(config, auth.id, auth.token, { ...addressForm });
      if (response.trim() === 'cep_invalido') {
        pushToast('CEP fora da área de entrega.', 'error');
        return;
      }
      await refreshUserInfo();
      setShowAddressForm(false);
      setSelectedAddress(response.trim());
      pushToast('Endereço salvo.', 'success');
    } catch {
      pushToast('Erro ao salvar endereço.', 'error');
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
        pushToast(response.message || 'CEP inválido.', 'error');
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
      pushToast(readApiMessage(error, 'CEP inválido.'), 'error');
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
      await refreshUserInfo();
      setShowCardForm(false);
      setSelectedCard(id.trim());
      pushToast('Cartão salvo.', 'success');
    } catch {
      pushToast('Erro ao salvar cartão.', 'error');
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
        applyCtxCoupon(manualCoupon.trim().toUpperCase(), JSON.parse(response.dados) as CouponData);
        pushToast('Cupom aplicado.', 'success');
      } else {
        pushToast(response.txt || 'Cupom inválido.', 'error');
      }
    } catch (error) {
      pushToast(readApiMessage(error, 'Cupom inválido.', 'txt'), 'error');
    } finally {
      setSaving(false);
    }
  }

  async function finishCheckout() {
    if (!auth.id || !auth.token || !(await validatePaymentSelection())) return;
    setSaving(true);
    try {
      const response = await api.checkout(config, auth.id, auth.token, {
        cartao: selectedCard,
        endereco: effectiveSelectedAddress,
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
        onPaymentComplete();
        setStep('success');
        return;
      }
      pushToast('Pagamento não aprovado.', 'error');
    } catch (error) {
      pushToast(readApiMessage(error, 'Falha ao finalizar compra.', 'msg'), 'error');
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
        onPaymentComplete();
        setStep('success');
      } else {
        pushToast('Pagamento ainda não identificado.', 'info');
      }
    } catch {
      pushToast('Erro ao verificar PIX.', 'error');
    } finally {
      setSaving(false);
    }
  }

  async function validatePaymentSelection() {
    if (!effectiveSelectedAddress) {
      pushToast('Selecione um endereço.', 'error');
      return false;
    }
    if (!selectedCard) {
      pushToast('Selecione um pagamento.', 'error');
      return false;
    }
    if (selectedCard === 'pix') return true;
    return validateCvv();
  }

  async function validateCvv() {
    if (!auth.id || !auth.token || !cvv.trim()) {
      pushToast('Confirme o CVV.', 'error');
      return false;
    }
    try {
      const cvvResponse = await api.checkCvv(auth.id, auth.token, selectedCard, onlyDigits(cvv));
      if (cvvResponse.sucesso) return true;
      pushToast('CVV inválido.', 'error');
    } catch {
      pushToast('Erro ao confirmar CVV.', 'error');
    }
    return false;
  }

  return {
    addressForm,
    cardForm,
    couponCode,
    couponData,
    cvv,
    fillCep,
    finishCheckout,
    installments,
    manualCoupon,
    pix,
    saveAddress,
    saveCard,
    saving,
    selectedAddress: effectiveSelectedAddress,
    selectedCard,
    selectedShippingIndex,
    setAddressForm,
    setCardForm,
    setCvv,
    setInstallments,
    setManualCoupon,
    setSelectedAddress,
    setSelectedCard,
    setSelectedShippingIndex,
    setShowAddressForm,
    setShowCardForm,
    setStep,
    shipping,
    showAddressForm,
    showCardForm,
    step,
    subtotal,
    total,
    totals,
    userInfo,
    validateCoupon,
    verifyPix
  };
}

function getShippingOption(userInfo: UserInfoResponse | null, selectedShippingIndex: number) {
  return userInfo?.frete?.[selectedShippingIndex];
}

function readApiMessage(error: unknown, fallback: string, key = 'message') {
  const payload = error instanceof ApiError ? error.payload : null;
  return typeof payload === 'object' && payload ? String((payload as Record<string, unknown>)[key] || fallback) : fallback;
}
