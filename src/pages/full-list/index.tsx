import { useCart } from '../../contexts/cart/useCart';
import { useConfig } from '../../contexts/config/useConfig';
import { useProduct } from '../../contexts/product/useProduct';
import { useUi } from '../../contexts/ui/useUi';
import { useUser } from '../../contexts/user/useUser';
import { ModalShell } from '../../components/layout/ModalShell';
import { ProductCard } from '../../components/product/ProductCard';

export function FullListPage() {
  const { closeModal } = useUi();
  const { fullList, openProduct } = useProduct();
  const { cartIds, addProduct } = useCart();
  const { storeMode } = useConfig();
  const { favorites, toggleFavorite } = useUser();

  if (!fullList) return null;

  return (
    <ModalShell title={fullList.title} onClose={closeModal}>
      <div className="liah-react-grid">
        {fullList.products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            compact
            storeMode={storeMode}
            inCart={cartIds.includes(product.id)}
            favorite={favorites.includes(String(product.id))}
            onOpen={() => void openProduct(product)}
            onAdd={addProduct}
            onToggleFavorite={toggleFavorite}
          />
        ))}
      </div>
    </ModalShell>
  );
}
