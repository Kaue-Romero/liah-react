import type { CheckoutProduct, Product } from '../types';
import { centsToNumber } from './format';

export function isProductAvailable(product?: Product): boolean {
  return Boolean(product && product.disponivel);
}

export function buildCheckoutProducts(
  cartIds: number[],
  quantities: Record<string, number>,
  products: Record<string, Product>
): CheckoutProduct[] {
  return cartIds.reduce<CheckoutProduct[]>((items, id) => {
    const product = products[String(id)];
    if (!isProductAvailable(product)) return items;
    const quantity = Math.max(1, Math.min(5, Number(quantities[String(id)] || 1)));
    const unitPrice = centsToNumber(product.preco);
    items.push({
      id,
      quantidade: quantity,
      preco: unitPrice,
      precoFinal: unitPrice * quantity,
      codigo_marca: product.codigo_marca
    });
    return items;
  }, []);
}

export function cartSubtotal(items: CheckoutProduct[]): number {
  return items.reduce((total, item) => total + item.precoFinal, 0);
}

export function itemCount(cartIds: number[], quantities: Record<string, number>): number {
  return cartIds.reduce((sum, id) => sum + Number(quantities[String(id)] || 1), 0);
}
