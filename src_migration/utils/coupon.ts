import type { Campaign, CampaignCondition, CheckoutProduct, CouponData, ShippingOption } from '../types';

export function calculateDiscount(total: number, discount: number, type?: string): number {
  if (type === 'porcentagem') return total * (discount / 100);
  return discount / 100;
}

export function normalizeCouponValue(value: number, type?: string): number {
  return type === 'porcentagem' ? value : value * 100;
}

export function applyCoupon(
  subtotal: number,
  shipping: ShippingOption | undefined,
  coupon: CouponData | null,
  checkoutProducts: CheckoutProduct[]
): { subtotalDiscount: number; shippingDiscount: number; payableSubtotal: number; payableShipping: number } {
  if (!coupon) {
    return {
      subtotalDiscount: 0,
      shippingDiscount: 0,
      payableSubtotal: subtotal,
      payableShipping: shipping?.valor ?? 0
    };
  }

  let base = subtotal;
  if (coupon.marca) {
    base = checkoutProducts
      .filter((product) => String(product.codigo_marca) === String(coupon.marca))
      .reduce((sum, product) => sum + product.precoFinal, 0);
  }

  if (coupon.produtos_categoria?.length) {
    base = checkoutProducts
      .filter((product) => coupon.produtos_categoria?.includes(product.id))
      .reduce((sum, product) => sum + product.precoFinal, 0);
  }

  const discountOnPurchase = Boolean(Number(coupon.desconto_sob_compra));
  const discountOnShipping = Boolean(Number(coupon.desconto_sob_frete));
  const subtotalDiscount = discountOnPurchase
    ? Math.min(base, calculateDiscount(base, Number(coupon.desconto || 0), coupon.tipo))
    : 0;

  const shippingValue = shipping?.valor_beneficios ?? shipping?.valor ?? 0;
  const shippingDiscount = discountOnShipping
    ? Math.min(
        shippingValue,
        calculateDiscount(shippingValue, Number(coupon.desconto_frete || 0), coupon.desconto_tipo_frete)
      )
    : 0;

  return {
    subtotalDiscount,
    shippingDiscount,
    payableSubtotal: Math.max(0, subtotal - subtotalDiscount),
    payableShipping: Math.max(0, shippingValue - shippingDiscount)
  };
}

export function getActiveCampaign(campaigns: Campaign[]): Campaign | undefined {
  return campaigns.find((campaign) => Array.isArray(campaign.condicao) && campaign.condicao.length > 0);
}

export function getAutomaticCoupon(campaigns: Campaign[], subtotal: number): CampaignCondition | undefined {
  const campaign = campaigns.find((item) => item.modo === 'cupons' && item.condicao?.length);
  if (!campaign?.condicao?.length) return undefined;

  return [...campaign.condicao]
    .sort((a, b) => Number(a.valor_minimo || 0) - Number(b.valor_minimo || 0))
    .filter((condition) => subtotal >= Number(condition.valor_minimo || 0) / 100)
    .pop();
}
