import { useProduct } from '../contexts/product/useProduct';
import { useUi } from '../contexts/ui/useUi';
import { AuthPage } from '../pages/auth';
import { CartPage } from '../pages/cart';
import { CheckoutPage } from '../pages/checkout';
import { FullListPage } from '../pages/full-list';
import { NotificationsPage } from '../pages/notifications';
import { ProductDetailPage } from '../pages/product-detail';
import { ProfilePage } from '../pages/profile';
import { StatePage } from '../pages/state';

export function AppModals() {
  const { modal } = useUi();
  const { selectedProduct, fullList } = useProduct();

  return (
    <>
      {modal === 'cart' ? <CartPage /> : null}
      {modal === 'checkout' ? <CheckoutPage /> : null}
      {modal === 'auth' ? <AuthPage /> : null}
      {modal === 'product' && selectedProduct ? <ProductDetailPage /> : null}
      {modal === 'notifications' ? <NotificationsPage /> : null}
      {modal === 'profile' ? <ProfilePage /> : null}
      {modal === 'state' ? <StatePage /> : null}
      {modal === 'fullList' && fullList ? <FullListPage /> : null}
    </>
  );
}
