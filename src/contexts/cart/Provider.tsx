import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { api } from '../../api/client';
import { useLocalStorageState } from '../../hooks/useLocalStorageState';
import type { Product } from '../../types';
import { buildCheckoutProducts, cartSubtotal, itemCount } from '../../utils/cart';
import { useCatalog } from '../catalog/useCatalog';
import { useConfig } from '../config/useConfig';
import { useToast } from '../toast/useToast';
import { CartContext } from './context';

export function CartProvider({ children }: { children: ReactNode }) {
  const { storeMode } = useConfig();
  const { products } = useCatalog();
  const { pushToast } = useToast();

  const [cartIds, setCartIds] = useLocalStorageState<number[]>('carrinho', []);
  const [quantities, setQuantities] = useLocalStorageState<Record<string, number>>('quantidadeCarrinho', {});
  const [cartRecommendations, setCartRecommendations] = useState<Product[]>([]);

  const checkoutProducts = useMemo(
    () => buildCheckoutProducts(cartIds, quantities, products),
    [cartIds, products, quantities]
  );
  const subtotal = useMemo(() => cartSubtotal(checkoutProducts), [checkoutProducts]);
  const cartCount = useMemo(() => itemCount(cartIds, quantities), [cartIds, quantities]);

  const addProduct = useCallback(
    (product: Product, quantity = quantities[String(product.id)] || 1) => {
      if (!storeMode || !product.disponivel) return;
      setCartIds((current) => (current.includes(product.id) ? current : [...current, product.id]));
      setQuantities((current) => ({ ...current, [product.id]: Math.max(1, Math.min(5, quantity)) }));
      pushToast('Produto adicionado ao carrinho.', 'success');
    },
    [pushToast, quantities, setCartIds, setQuantities, storeMode]
  );

  const updateQuantity = useCallback(
    (productId: number, next: number) => {
      setQuantities((current) => ({ ...current, [productId]: Math.max(1, Math.min(5, next)) }));
    },
    [setQuantities]
  );

  const removeProduct = useCallback(
    (productId: number) => {
      setCartIds((current) => current.filter((id) => id !== productId));
      setQuantities((current) => {
        const next = { ...current };
        delete next[String(productId)];
        return next;
      });
    },
    [setCartIds, setQuantities]
  );

  const clearCart = useCallback(() => {
    setCartIds([]);
    setQuantities({});
  }, [setCartIds, setQuantities]);

  useEffect(() => {
    if (!cartIds.length) {
      window.queueMicrotask(() => setCartRecommendations([]));
      return;
    }

    api
      .loadCartRecommendations(cartIds)
      .then((ids) => {
        const next = ids
          .map((id) => products[String(id)])
          .filter((product): product is Product => Boolean(product && product.disponivel && !cartIds.includes(product.id)))
          .slice(0, 5);
        setCartRecommendations(next);
      })
      .catch(() => setCartRecommendations([]));
  }, [cartIds, products]);

  return (
    <CartContext.Provider
      value={{ cartIds, quantities, checkoutProducts, subtotal, cartCount, cartRecommendations, addProduct, updateQuantity, removeProduct, clearCart }}
    >
      {children}
    </CartContext.Provider>
  );
}
