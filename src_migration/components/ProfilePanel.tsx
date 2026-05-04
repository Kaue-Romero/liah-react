import { Heart, HelpCircle, LogOut, Package, UserRound } from 'lucide-react';
import type { AuthState, FaqItem, Order, Product } from '../types';
import { clearAuth } from '../utils/storage';
import { EmptyState } from './EmptyState';
import { ModalShell } from './ModalShell';
import { ProductCard } from './ProductCard';

interface ProfilePanelProps {
  auth: AuthState;
  favorites: Product[];
  orders: Order[];
  faq: FaqItem[];
  cartIds: number[];
  favoriteIds: string[];
  onClose: () => void;
  onLoggedOut: () => void;
  onOpenProduct: (product: Product) => void;
  onAddProduct: (product: Product) => void;
  onFavorite: (product: Product) => void;
}

export function ProfilePanel({
  auth,
  favorites,
  orders,
  faq,
  cartIds,
  favoriteIds,
  onClose,
  onLoggedOut,
  onOpenProduct,
  onAddProduct,
  onFavorite
}: ProfilePanelProps) {
  return (
    <ModalShell title="Perfil" onClose={onClose}>
      {!auth.id ? (
        <EmptyState title="Conta não encontrada">Entre para ver favoritos, pedidos e dados da conta.</EmptyState>
      ) : (
        <div className="liah-react-profile">
          <section>
            <h3>
              <UserRound size={18} />
              Conta
            </h3>
            <button
              className="secondary-btn"
              type="button"
              onClick={() => {
                clearAuth();
                onLoggedOut();
              }}
            >
              <LogOut size={16} />
              Sair
            </button>
          </section>

          <section>
            <h3>
              <Heart size={18} />
              Favoritos
            </h3>
            {!favorites.length ? (
              <EmptyState title="Nenhum favorito" />
            ) : (
              <div className="produtos-categoria liah-react-carousel">
                {favorites.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    inCart={cartIds.includes(product.id)}
                    favorite={favoriteIds.includes(String(product.id))}
                    storeMode
                    onOpen={onOpenProduct}
                    onAdd={onAddProduct}
                    onFavorite={onFavorite}
                  />
                ))}
              </div>
            )}
          </section>

          <section>
            <h3>
              <Package size={18} />
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
              <HelpCircle size={18} />
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
