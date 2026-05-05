import { ArrowUp, ShoppingCart } from 'lucide-react';
import { api } from '../../api/client';
import { AppModals } from '../../app/AppModals';
import { useCart } from '../../contexts/cart/useCart';
import { useCatalog } from '../../contexts/catalog/useCatalog';
import { useConfig } from '../../contexts/config/useConfig';
import { useLocation } from '../../contexts/location/useLocation';
import { useToast } from '../../contexts/toast/useToast';
import { useUi } from '../../contexts/ui/useUi';
import { useUser } from '../../contexts/user/useUser';
import { EmptyState } from '../../components/common/EmptyState';
import { Header } from '../../components/layout/Header';
import { Loading } from '../../components/common/Loading';
import { ProductSections } from '../../components/product/ProductSections';
import { ToastHost } from '../../components/common/ToastHost';
import { assetUrl } from '../../utils/env';

export function StorePage() {
  const { frameRef, handleFrameScroll, showBackTop, scrollToTop, openModal } = useUi();
  const { loading, products, banners, activeTab, setActiveTab, query, setQuery } = useCatalog();
  const { config, storeMode } = useConfig();
  const { cartCount } = useCart();
  const { toasts } = useToast();
  const { selectedState } = useLocation();
  const { unreadNotifications, openNotifications, openProfile } = useUser();

  return (
    <div id="embed-body" className="liah-react-root">
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        query={query}
        setQuery={setQuery}
        storeMode={storeMode}
        selectedState={selectedState}
        unreadNotifications={unreadNotifications}
        onOpenModal={openModal}
        onOpenNotifications={openNotifications}
        onOpenProfile={openProfile}
      />
      <main id="checkoutFrame" ref={frameRef} className="liah-react-frame" onScroll={handleFrameScroll}>
        {loading ? (
          <Loading />
        ) : Object.keys(products).length ? (
          <>
            {banners.length ? <BannerStrip /> : null}
            <ProductSections />
          </>
        ) : (
          <EmptyState image={assetUrl('img/busca-empty.svg')} title="Nenhum produto encontrado" />
        )}
      </main>
      {storeMode && cartCount > 0 ? (
        <div id="div-carrinho" className="liah-react-cart-fab" style={{ bottom: `${config.carrinho_altura || 20}px` }}>
          <button type="button" onClick={() => openModal('cart')}>
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
          aria-label="Voltar ao topo"
          onClick={scrollToTop}
        >
          <ArrowUp size={18} />
        </button>
      ) : null}
      <AppModals />
      <ToastHost toasts={toasts} />
    </div>
  );
}

function BannerStrip() {
  const { banners } = useCatalog();

  return (
    <section className="liah-react-banners">
      {banners.slice(0, 4).map((banner, index) => (
        <button
          type="button"
          key={`${banner.id || banner.url || index}`}
          style={{ backgroundImage: `url(${banner.url || banner.image || banner.banner?.url || assetUrl('img/loading.gif')})` }}
          onClick={() => void api.logBannerView({ id: banner.id || banner.banner?.id || '', tipo: 'click' })}
          aria-label="Banner Liah"
        />
      ))}
    </section>
  );
}
