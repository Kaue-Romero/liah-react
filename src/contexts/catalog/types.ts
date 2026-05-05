import type { Dispatch, SetStateAction } from 'react';
import type { BannerItem, Category, Product, ProductsResponse } from '../../types';

export type CatalogTab = 'recommended' | 'store';
export type CatalogContentMode = CatalogTab | 'search';

export interface CatalogContextValue {
  products: Record<string, Product>;
  categories: Category[];
  recommendations: ProductsResponse['indicados'];
  loading: boolean;
  query: string;
  setQuery: Dispatch<SetStateAction<string>>;
  activeTab: CatalogTab;
  setActiveTab: Dispatch<SetStateAction<CatalogTab>>;
  contentMode: CatalogContentMode;
  banners: BannerItem[];
  refreshProducts: () => Promise<void>;
}
