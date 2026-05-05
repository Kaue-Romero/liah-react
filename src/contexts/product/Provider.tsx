import { useCallback, useEffect, useState, type ReactNode } from 'react';
import { api } from '../../api/client';
import type { Product } from '../../types';
import { useCatalog } from '../catalog/useCatalog';
import { useConfig } from '../config/useConfig';
import { useUi } from '../ui/useUi';
import { ProductContext } from './context';
import type { FullProductList } from './types';

export function ProductProvider({ children }: { children: ReactNode }) {
  const { config } = useConfig();
  const { products } = useCatalog();
  const { openModal } = useUi();

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [fullList, setFullList] = useState<FullProductList | null>(null);
  const [descriptions, setDescriptions] = useState<Record<string, unknown>>({});

  const openProduct = useCallback(
    async (product: Product) => {
      setSelectedProduct(product);
      openModal('product');
      if (descriptions[String(product.id)]) return;
      try {
        const detail = await api.loadProductDescription(product.id);
        if (detail.descricao) {
          setDescriptions((current) => ({ ...current, [product.id]: detail.descricao }));
        }
      } catch {
        // Product description is optional.
      }
    },
    [descriptions, openModal]
  );

  const openFullList = useCallback(
    (title: string, ids: number[]) => {
      setFullList({
        title,
        products: ids.map((id) => products[String(id)]).filter((product): product is Product => Boolean(product))
      });
      openModal('fullList');
    },
    [openModal, products]
  );

  useEffect(() => {
    if (!config.produto || !Object.keys(products).length) return;
    const product = products[String(config.produto)];
    if (product) {
      window.queueMicrotask(() => {
        setSelectedProduct(product);
        openModal('product');
      });
    }
  }, [config.produto, openModal, products]);

  return (
    <ProductContext.Provider value={{ selectedProduct, fullList, descriptions, openProduct, openFullList }}>
      {children}
    </ProductContext.Provider>
  );
}
