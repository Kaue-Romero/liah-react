import type { CheckoutProduct, Product } from '../../types';

export interface CartContextValue {
  cartIds: number[];
  quantities: Record<string, number>;
  checkoutProducts: CheckoutProduct[];
  subtotal: number;
  cartCount: number;
  cartRecommendations: Product[];
  addProduct: (product: Product, quantity?: number) => void;
  updateQuantity: (productId: number, next: number) => void;
  removeProduct: (productId: number) => void;
  clearCart: () => void;
}
