
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
import type { ModalName } from '../types';

export function AppModals() {
  const { modalStack } = useUi();
  const { selectedProduct, fullList } = useProduct();

  return (
    <>
      {modalStack.map((name, i) => (
        <ModalEntry key={`${name}-${i}`} name={name} selectedProduct={!!selectedProduct} fullList={!!fullList} />
      ))}
    </>
  );
}

function ModalEntry({ name, selectedProduct, fullList }: { name: ModalName; selectedProduct: boolean; fullList: boolean }) {
  if (name === 'cart') return <CartPage />;
  if (name === 'checkout') return <CheckoutPage />;
  if (name === 'auth') return <AuthPage />;
  if (name === 'product' && selectedProduct) return <ProductDetailPage />;
  if (name === 'notifications') return <NotificationsPage />;
  if (name === 'profile') return <ProfilePage />;
  if (name === 'state') return <StatePage />;
  if (name === 'fullList' && fullList) return <FullListPage />;
  return null;
}
