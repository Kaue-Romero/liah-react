import type { Product } from '../../types';

export interface FullProductList {
  title: string;
  products: Product[];
}

export interface ProductContextValue {
  selectedProduct: Product | null;
  fullList: FullProductList | null;
  descriptions: Record<string, unknown>;
  openProduct: (product: Product) => Promise<void>;
  openFullList: (title: string, ids: number[]) => void;
}
