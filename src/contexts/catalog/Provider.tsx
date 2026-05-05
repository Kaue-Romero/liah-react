import { useCallback, useEffect, useState, type ReactNode } from 'react';
import { api } from '../../api/client';
import { useDebouncedValue } from '../../hooks/useDebouncedValue';
import type { BannerItem, Category, Product, ProductsResponse } from '../../types';
import { getActiveCampaign } from '../../utils/coupon';
import { normalizeCategories, normalizeProducts } from '../../utils/products';
import { ensureSearchHistory } from '../../utils/storage';
import { useAuth } from '../auth/useAuth';
import { useConfig } from '../config/useConfig';
import { useLocation } from '../location/useLocation';
import { useToast } from '../toast/useToast';
import { CatalogContext } from './context';
import type { CatalogContentMode, CatalogTab } from './types';

export function CatalogProvider({ children }: { children: ReactNode }) {
  const { config, storeMode } = useConfig();
  const { auth } = useAuth();
  const { selectedState } = useLocation();
  const { pushToast } = useToast();

  const [products, setProducts] = useState<Record<string, Product>>({});
  const [categories, setCategories] = useState<Category[]>([]);
  const [recommendations, setRecommendations] = useState<ProductsResponse['indicados']>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebouncedValue(query);
  const [activeTab, setActiveTab] = useState<CatalogTab>('recommended');
  const [banners, setBanners] = useState<BannerItem[]>([]);

  const contentMode: CatalogContentMode = debouncedQuery.trim() ? 'search' : activeTab;

  const refreshProducts = useCallback(async () => {
    setLoading(true);
    try {
      ensureSearchHistory();
      const state = selectedState && selectedState !== 'outro' ? selectedState : 'SP';
      const [productResponse, categoryResponse, campaignResponse, carouselResponse] = await Promise.all([
        api.loadProducts({ config, estado: state, authId: auth.id }),
        api.loadCategories(state),
        storeMode ? api.loadCampaigns(config, auth.id) : Promise.resolve({ campanhas: [] }),
        storeMode ? api.loadCarousel(config) : Promise.resolve({ data: [] })
      ]);

      const normalizedProducts = normalizeProducts(productResponse);
      setProducts(normalizedProducts);
      setCategories(normalizeCategories(categoryResponse, normalizedProducts));
      setRecommendations(productResponse.indicados || []);
      setBanners(carouselResponse.data || []);
      window.campanhasLiah = campaignResponse.campanhas;
      window.campanhaAtivaLiah = getActiveCampaign(campaignResponse.campanhas);
    } catch (error) {
      console.error('Erro ao carregar LIAH:', error);
      pushToast('Erro ao carregar produtos.', 'error');
    } finally {
      setLoading(false);
    }
  }, [auth.id, config, pushToast, selectedState, storeMode]);

  useEffect(() => {
    window.queueMicrotask(() => {
      void refreshProducts();
    });
  }, [refreshProducts]);

  return (
    <CatalogContext.Provider
      value={{ products, categories, recommendations, loading, query, setQuery, activeTab, setActiveTab, contentMode, banners, refreshProducts }}
    >
      {children}
    </CatalogContext.Provider>
  );
}
