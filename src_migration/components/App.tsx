import { useCallback, useEffect, useMemo, useState } from 'react';
import { ArrowUp, ShoppingCart } from 'lucide-react';
import { api } from '../api/client';
import type {
  AuthState,
  BannerItem,
  Category,
  CheckoutProduct,
  CouponData,
  FaqItem,
  LiahConfig,
  ModalName,
  NotificationItem,
  Order,
  Product,
  ProductsResponse,
  ToastMessage,
  UserInfoResponse
} from '../types';
import { assetUrl } from '../utils/env';
import { buildCheckoutProducts, cartSubtotal, itemCount } from '../utils/cart';
import { money } from '../utils/format';
import { getActiveCampaign } from '../utils/coupon';
import { ensureSearchHistory, readAuth } from '../utils/storage';
import { useDebouncedValue } from '../hooks/useDebouncedValue';
import { useLocalStorageState } from '../hooks/useLocalStorageState';
import { AuthPanel } from './AuthPanel';
import { CartPanel } from './CartPanel';
import { CheckoutPanel } from './CheckoutPanel';
import { EmptyState } from './EmptyState';
import { Header } from './Header';
import { Loading } from './Loading';
import { ModalShell } from './ModalShell';
import { NotificationsPanel } from './NotificationsPanel';
import { ProductCard } from './ProductCard';
import { ProductDetailPanel } from './ProductDetailPanel';
import { ProductSections } from './ProductSections';
import { ProfilePanel } from './ProfilePanel';
import { StatePanel } from './StatePanel';
import { ToastHost } from './ToastHost';

interface AppProps {
  config: LiahConfig;
}

function normalizeProducts(response: ProductsResponse): Record<string, Product> {
  const next: Record<string, Product> = {};
  Object.entries(response.produtos || {}).forEach(([key, raw]) => {
    const id = Number(raw.id || key);
    if (!Number.isFinite(id)) return;
    next[String(id)] = {
      ...raw,
      id,
      disponivel: Boolean(Number(raw.disponivel))
    };
  });
  return next;
}

function normalizeCategories(categories: Category[], products: Record<string, Product>): Category[] {
  if (categories.length) {
    return categories.map((category) => ({
      ...category,
      produtos: (category.produtos || []).map(Number).filter((id) => products[String(id)])
    }));
  }

  const grouped = new Map<string, number[]>();
  Object.values(products).forEach((product) => {
    (product.categoria || ['todos']).forEach((category) => {
      const key = String(category || 'todos');
      grouped.set(key, [...(grouped.get(key) || []), product.id]);
    });
  });

  return Array.from(grouped.entries()).map(([key, ids]) => ({
    id: key,
    chave: key.toLowerCase().replace(/\s+/g, '-'),
    titulo: key,
    produtos: ids
  }));
}

export function App({ config }: AppProps) {
  const storeMode = Boolean(config.loja);
  const [products, setProducts] = useState<Record<string, Product>>({});
  const [categories, setCategories] = useState<Category[]>([]);
  const [recommendations, setRecommendations] = useState<ProductsResponse['indicados']>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebouncedValue(query);
  const [activeTab, setActiveTab] = useState<'recommended' | 'store'>(storeMode ? 'recommended' : 'recommended');
  const [modal, setModal] = useState<ModalName>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [fullList, setFullList] = useState<{ title: string; products: Product[] } | null>(null);
  const [cartIds, setCartIds] = useLocalStorageState<number[]>('carrinho', []);
  const [quantities, setQuantities] = useLocalStorageState<Record<string, number>>('quantidadeCarrinho', {});
  const [favorites, setFavorites] = useState<string[]>([]);
  const [auth, setAuth] = useState<AuthState>(() => readAuth());
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [faq, setFaq] = useState<FaqItem[]>([]);
  const [cartRecommendations, setCartRecommendations] = useState<Product[]>([]);
  const [userInfo, setUserInfo] = useState<UserInfoResponse | null>(null);
  const [selectedState, setSelectedState] = useState<string | null>(() => localStorage.getItem('estado') || 'SP');
  const [couponCode, setCouponCode] = useState('');
  const [couponData, setCouponData] = useState<CouponData | null>(null);
  const [descriptions, setDescriptions] = useState<Record<string, unknown>>({});
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [showBackTop, setShowBackTop] = useState(false);
  const [banners, setBanners] = useState<BannerItem[]>([]);

  const checkoutProducts = useMemo<CheckoutProduct[]>(
    () => buildCheckoutProducts(cartIds, quantities, products),
    [cartIds, products, quantities]
  );
  const subtotal = useMemo(() => cartSubtotal(checkoutProducts), [checkoutProducts]);
  const cartCount = useMemo(() => itemCount(cartIds, quantities), [cartIds, quantities]);
  const favoriteProducts = useMemo(
    () => favorites.map((id) => products[id]).filter((product): product is Product => Boolean(product)),
    [favorites, products]
  );

  const pushToast = useCallback((message: string, type: ToastMessage['type'] = 'info') => {
    const id = Date.now() + Math.floor(Math.random() * 1000);
    setToasts((current) => [...current, { id, message, type }]);
    window.setTimeout(() => {
      setToasts((current) => current.filter((toast) => toast.id !== id));
    }, 3200);
  }, []);

  const refreshProducts = useCallback(async () => {
    setLoading(true);
    try {
      ensureSearchHistory();
      const state = selectedState && selectedState !== 'outro' ? selectedState : 'SP';
      const [productResponse, categoryResponse, campaignResponse, carouselResponse] = await Promise.all([
        api.loadProducts({ config: { ...config, p: config.p, n: config.n }, estado: state, authId: auth.id }),
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

  const refreshNotifications = useCallback(async () => {
    const items = await api.loadNotifications(auth.id, auth.token);
    setNotifications(items);
  }, [auth.id, auth.token]);

  const refreshFavorites = useCallback(async () => {
    const ids = await api.loadFavorites(auth.id);
    setFavorites(ids);
  }, [auth.id]);

  const refreshOrdersAndFaq = useCallback(async () => {
    if (!auth.id || !auth.token) return;
    const [ordersResponse, faqResponse] = await Promise.all([
      api.loadOrders(auth.id, auth.token),
      api.loadFaq(config.empresa || 1)
    ]);
    setOrders(Array.isArray(ordersResponse) ? ordersResponse : []);
    setFaq(faqResponse);
  }, [auth.id, auth.token, config.empresa]);

  const refreshUserInfo = useCallback(async () => {
    if (!auth.id || !auth.token) {
      setUserInfo(null);
      return;
    }
    const info = await api.loadUserInfo(config, auth.id, auth.token, subtotal);
    setUserInfo(info);
  }, [auth.id, auth.token, config, subtotal]);

  useEffect(() => {
    void refreshProducts();
  }, [refreshProducts]);

  useEffect(() => {
    void refreshNotifications();
    void refreshFavorites();
    void refreshOrdersAndFaq();
  }, [refreshFavorites, refreshNotifications, refreshOrdersAndFaq]);

  useEffect(() => {
    if (!cartIds.length) {
      setCartRecommendations([]);
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

  useEffect(() => {
    const handler = (event: Event) => {
      const detail = (event as CustomEvent<{ messageText?: string; type?: ToastMessage['type'] }>).detail;
      pushToast(detail?.messageText || '', detail?.type || 'info');
    };
    window.addEventListener('liah:toast', handler);
    return () => window.removeEventListener('liah:toast', handler);
  }, [pushToast]);

  useEffect(() => {
    if (!config.produto || !Object.keys(products).length) return;
    const product = products[String(config.produto)];
    if (product) {
      setSelectedProduct(product);
      setModal('product');
    }
  }, [config.produto, products]);

  function addProduct(product: Product, quantity = quantities[String(product.id)] || 1) {
    if (!storeMode || !product.disponivel) return;
    setCartIds((current) => (current.includes(product.id) ? current : [...current, product.id]));
    setQuantities((current) => ({ ...current, [product.id]: Math.max(1, Math.min(5, quantity)) }));
    pushToast('Produto adicionado ao carrinho.', 'success');
  }

  function updateQuantity(productId: number, next: number) {
    setQuantities((current) => ({ ...current, [productId]: Math.max(1, Math.min(5, next)) }));
  }

  function removeProduct(productId: number) {
    setCartIds((current) => current.filter((id) => id !== productId));
    setQuantities((current) => {
      const next = { ...current };
      delete next[String(productId)];
      return next;
    });
  }

  async function toggleFavorite(product: Product) {
    if (!auth.id) {
      setModal('auth');
      return;
    }
    const nextFavorite = !favorites.includes(String(product.id));
    setFavorites((current) => (nextFavorite ? [...current, String(product.id)] : current.filter((id) => id !== String(product.id))));
    try {
      await api.setFavorite(auth.id, auth.token || '', product.id, nextFavorite);
    } catch {
      setFavorites((current) =>
        nextFavorite ? current.filter((id) => id !== String(product.id)) : [...current, String(product.id)]
      );
      pushToast('Erro ao atualizar favorito.', 'error');
    }
  }

  async function openProduct(product: Product) {
    setSelectedProduct(product);
    setModal('product');
    if (!descriptions[String(product.id)]) {
      try {
        const detail = await api.loadProductDescription(product.id);
        if (detail.descricao) {
          setDescriptions((current) => ({ ...current, [product.id]: detail.descricao }));
        }
      } catch {
        // Description is optional.
      }
    }
  }

  function openCheckout() {
    if (!auth.id || !auth.token) {
      setModal('auth');
      return;
    }
    setModal('checkout');
    void refreshUserInfo();
  }

  function handlePaid() {
    setCartIds([]);
    setQuantities({});
    setCouponCode('');
    setCouponData(null);
    localStorage.removeItem('primeiraCompra');
    localStorage.removeItem('noventaDias');
    pushToast('Pagamento aprovado.', 'success');
  }

  function selectState(state: string) {
    localStorage.setItem('estado', state.toUpperCase());
    setSelectedState(state.toUpperCase());
    setModal(null);
  }

  const contentMode = debouncedQuery.trim() ? 'search' : activeTab;
  const unreadNotifications = notifications.some((item) => item.status === 'nao_lida');

  return (
    <div id="embed-body" className="liah-react-root">
      <Header
        config={config}
        query={query}
        activeTab={activeTab}
        storeMode={storeMode}
        unreadNotifications={unreadNotifications}
        selectedState={selectedState}
        onQueryChange={setQuery}
        onTabChange={setActiveTab}
        onOpenNotifications={() => {
          setModal('notifications');
          void api.markNotificationsRead(auth.id, auth.token).then(() => refreshNotifications());
        }}
        onOpenProfile={() => {
          setModal('profile');
          void refreshOrdersAndFaq();
        }}
        onOpenState={() => setModal('state')}
      />

      <main
        id="checkoutFrame"
        className="liah-react-frame"
        onScroll={(event) => setShowBackTop(event.currentTarget.scrollTop > 80)}
      >
        {loading ? (
          <Loading />
        ) : Object.keys(products).length ? (
          <>
            {banners.length ? (
              <section className="liah-react-banners">
                {banners.slice(0, 4).map((banner, index) => (
                  <button
                    type="button"
                    key={`${banner.id || banner.url || index}`}
                    style={{
                      backgroundImage: `url(${banner.url || banner.image || banner.banner?.url || assetUrl('img/loading.gif')})`
                    }}
                    onClick={() => void api.logBannerView({ id: banner.id || banner.banner?.id || '', tipo: 'click' })}
                    aria-label="Banner Liah"
                  />
                ))}
              </section>
            ) : null}
            <ProductSections
              mode={contentMode}
              products={products}
              categories={categories}
              recommendations={recommendations}
              query={debouncedQuery}
              cartIds={cartIds}
              favorites={favorites}
              storeMode={storeMode}
              onOpen={(product) => void openProduct(product)}
              onAdd={addProduct}
              onFavorite={(product) => void toggleFavorite(product)}
              onSeeAll={(title, ids) => {
                setFullList({
                  title,
                  products: ids.map((id) => products[String(id)]).filter((product): product is Product => Boolean(product))
                });
                setModal('fullList');
              }}
            />
          </>
        ) : (
          <EmptyState image={assetUrl('img/busca-empty.svg')} title="Nenhum produto encontrado" />
        )}
      </main>

      {storeMode && cartCount > 0 ? (
        <div id="div-carrinho" className="liah-react-cart-fab" style={{ bottom: `${config.carrinho_altura || 20}px` }}>
          <button type="button" onClick={() => setModal('cart')}>
            <span>Ir para o carrinho</span>
            <ShoppingCart size={24} />
            <strong id="quantidadeCarrinhoDiv">{cartCount}</strong>
          </button>
        </div>
      ) : null}

      {showBackTop ? (
        <button
          id="subirLiahBtn"
          className="liah-react-backtop"
          style={{ bottom: `${config.carrinho_altura || 20}px` }}
          type="button"
          onClick={() => document.querySelector('.liah-react-frame')?.scrollTo({ top: 0, behavior: 'smooth' })}
        >
          <ArrowUp size={18} />
        </button>
      ) : null}

      {modal === 'cart' ? (
        <CartPanel
          products={products}
          cartIds={cartIds}
          quantities={quantities}
          checkoutProducts={checkoutProducts}
          recommendations={cartRecommendations}
          favorites={favorites}
          onClose={() => setModal(null)}
          onCheckout={openCheckout}
          onOpenProduct={(product) => void openProduct(product)}
          onAddProduct={addProduct}
          onFavorite={(product) => void toggleFavorite(product)}
          onQuantityChange={updateQuantity}
          onRemove={removeProduct}
        />
      ) : null}

      {modal === 'checkout' ? (
        <CheckoutPanel
          config={config}
          auth={auth}
          checkoutProducts={checkoutProducts}
          subtotal={subtotal}
          userInfo={userInfo}
          couponCode={couponCode}
          couponData={couponData}
          onClose={() => setModal(null)}
          onRefreshUserInfo={refreshUserInfo}
          onCouponApplied={(code, data) => {
            setCouponCode(code);
            setCouponData(data);
          }}
          onCouponCleared={() => {
            setCouponCode('');
            setCouponData(null);
          }}
          onPaid={handlePaid}
          onToast={pushToast}
        />
      ) : null}

      {modal === 'auth' ? (
        <AuthPanel
          config={config}
          onClose={() => setModal(null)}
          onAuthenticated={(nextAuth) => {
            setAuth(nextAuth);
            void refreshProducts();
          }}
          onToast={pushToast}
        />
      ) : null}

      {modal === 'product' && selectedProduct ? (
        <ProductDetailPanel
          product={selectedProduct}
          storeMode={storeMode}
          quantity={quantities[String(selectedProduct.id)] || 1}
          inCart={cartIds.includes(selectedProduct.id)}
          favorite={favorites.includes(String(selectedProduct.id))}
          description={descriptions[String(selectedProduct.id)]}
          onClose={() => setModal(null)}
          onAdd={(product, quantity) => addProduct(product, quantity)}
          onFavorite={(product) => void toggleFavorite(product)}
          onRate={(product, rating) => {
            void api.addRating(config, auth.id, product.id, rating).then(() => pushToast('Avaliação registrada.', 'success'));
          }}
        />
      ) : null}

      {modal === 'notifications' ? (
        <NotificationsPanel notifications={notifications} onClose={() => setModal(null)} />
      ) : null}

      {modal === 'profile' ? (
        <ProfilePanel
          auth={auth}
          favorites={favoriteProducts}
          orders={orders}
          faq={faq}
          cartIds={cartIds}
          favoriteIds={favorites}
          onClose={() => setModal(null)}
          onLoggedOut={() => {
            setAuth({ id: null, token: null });
            setFavorites([]);
            setOrders([]);
            setModal(null);
          }}
          onOpenProduct={(product) => void openProduct(product)}
          onAddProduct={addProduct}
          onFavorite={(product) => void toggleFavorite(product)}
        />
      ) : null}

      {modal === 'state' ? (
        <StatePanel selectedState={selectedState} onClose={() => setModal(null)} onSelect={selectState} />
      ) : null}

      {modal === 'fullList' && fullList ? (
        <ModalShell title={fullList.title} onClose={() => setModal(null)}>
          <div className="liah-react-grid">
            {fullList.products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                inCart={cartIds.includes(product.id)}
                favorite={favorites.includes(String(product.id))}
                storeMode={storeMode}
                onOpen={(item) => void openProduct(item)}
                onAdd={addProduct}
                onFavorite={(item) => void toggleFavorite(item)}
                compact
              />
            ))}
          </div>
        </ModalShell>
      ) : null}

      <ToastHost toasts={toasts} />
    </div>
  );
}
