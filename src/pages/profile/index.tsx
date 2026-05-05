import { Heart, HelpCircle, LogOut, Package, UserRound } from 'lucide-react';
import { useCart } from '../../contexts/cart/useCart';
import { useConfig } from '../../contexts/config/useConfig';
import { useProduct } from '../../contexts/product/useProduct';
import { useUi } from '../../contexts/ui/useUi';
import { useUser } from '../../contexts/user/useUser';
import { EmptyState } from '../../components/common/EmptyState';
import { ModalShell } from '../../components/layout/ModalShell';
import { ProductCard } from '../../components/product/ProductCard';
import { useAuth } from '../../contexts/auth/useAuth';

export function ProfilePage() {
  const { auth, logout } = useAuth();
  const { cartIds, addProduct } = useCart();
  const { storeMode } = useConfig();
  const { openProduct } = useProduct();
  const { closeModal } = useUi();
  const { faq, favoriteProducts, favorites, orders, toggleFavorite } = useUser();

  return (
    <ModalShell title="Perfil" onClose={closeModal}>
      {!auth.id ? (
        <EmptyState title="Conta não encontrada">Entre para ver favoritos, pedidos e dados da conta.</EmptyState>
      ) : (
        <div className="liah-react-profile">
          <section>
            <h3>
              <UserRound size={18} aria-hidden="true" />
              Conta
            </h3>
            <button className="secondary-btn" type="button" onClick={logout}>
              <LogOut size={16} aria-hidden="true" />
              Sair
            </button>
          </section>

          <section>
            <h3>
              <Heart size={18} aria-hidden="true" />
              Favoritos
            </h3>
            {!favoriteProducts.length ? (
              <EmptyState title="Nenhum favorito" />
            ) : (
              <div className="produtos-categoria liah-react-carousel">
                {favoriteProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    storeMode={storeMode}
                    inCart={cartIds.includes(product.id)}
                    favorite={favorites.includes(String(product.id))}
                    onOpen={() => void openProduct(product)}
                    onAdd={addProduct}
                    onToggleFavorite={toggleFavorite}
                  />
                ))}
              </div>
            )}
          </section>

          <section>
            <h3>
              <Package size={18} aria-hidden="true" />
              Pedidos
            </h3>
            {!orders.length ? (
              <EmptyState title="Nenhum pedido encontrado" />
            ) : (
              <div className="liah-react-orders">
                {orders.map((order) => (
                  <article key={order.pedido || order.numero_pedido}>
                    <strong>Pedido {order.numero_pedido}</strong>
                    <span>{order.status}</span>
                    <small>{order.data}</small>
                  </article>
                ))}
              </div>
            )}
          </section>

          <section>
            <h3>
              <HelpCircle size={18} aria-hidden="true" />
              FAQ
            </h3>
            {!faq.length ? (
              <EmptyState title="FAQ indisponível" />
            ) : (
              <div className="liah-react-faq">
                {faq.map((item, index) => (
                  <details key={`${item.titulo || item.pergunta}-${index}`}>
                    <summary>{item.titulo || item.pergunta}</summary>
                    <p>{item.resposta}</p>
                  </details>
                ))}
              </div>
            )}
          </section>
        </div>
      )}
    </ModalShell>
  );
}
