import { Minus, Plus, Trash2 } from 'lucide-react';
import { useAuth } from '../../contexts/auth/useAuth';
import { useCart } from '../../contexts/cart/useCart';
import { useCatalog } from '../../contexts/catalog/useCatalog';
import { useConfig } from '../../contexts/config/useConfig';
import { useProduct } from '../../contexts/product/useProduct';
import { useUi } from '../../contexts/ui/useUi';
import { useUser } from '../../contexts/user/useUser';
import { EmptyState } from '../../components/common/EmptyState';
import { ModalShell } from '../../components/layout/ModalShell';
import { ProductCard } from '../../components/product/ProductCard';
import { cartSubtotal, itemCount } from '../../utils/cart';
import { money } from '../../utils/format';

export function CartPage() {
  const { auth } = useAuth();
  const { cartIds, cartRecommendations, checkoutProducts, quantities, removeProduct, updateQuantity } = useCart();
  const { products } = useCatalog();
  const { storeMode } = useConfig();
  const { openProduct } = useProduct();
  const { closeModal, openModal } = useUi();
  const { favorites, toggleFavorite, refreshUserInfo } = useUser();

  const total = cartSubtotal(checkoutProducts);
  const count = itemCount(cartIds, quantities);

  function openCheckout() {
    if (!auth.id || !auth.token) {
      openModal('auth');
      return;
    }
    openModal('checkout');
    void refreshUserInfo();
  }

  return (
    <ModalShell
      title="Carrinho"
      onClose={closeModal}
      footer={
        cartIds.length ? (
          <button className="pagamentoBtn liah-react-pay-button" type="button" onClick={openCheckout}>
            <span>Finalizar compra</span>
            <strong>{money(total)}</strong>
          </button>
        ) : null
      }
    >
      {!cartIds.length ? (
        <EmptyState title="Carrinho vazio">Adicione produtos para continuar.</EmptyState>
      ) : (
        <>
          <div className="liah-react-cart-items">
            {cartIds.map((id) => {
              const product = products[String(id)];
              if (!product) return null;
              const quantity = quantities[String(id)] || 1;
              const available = Boolean(product.disponivel);

              return (
                <article className="produtoClass liah-react-cart-item" key={id}>
                  <button
                    className="liah-react-cart-photo"
                    type="button"
                    style={{ backgroundImage: `url(${product.foto})` }}
                    onClick={() => void openProduct(product)}
                    aria-label={`Abrir ${product.nome}`}
                  />
                  <div className="liah-react-cart-copy">
                    {!available ? <div className="tag-indisponivel small-tag">Indisponível</div> : null}
                    <span>{product.marca}</span>
                    <strong>
                      {product.nome}
                      {product.peso ? ` - ${product.peso}` : ''}
                      {product.sabor ? ` de ${product.sabor}` : ''}
                    </strong>
                    {available ? <span>{money((product.preco / 100) * quantity)}</span> : null}
                  </div>
                  <div className="liah-react-qty">
                    <button
                      className="btns-cart minus-button"
                      type="button"
                      onClick={() => (quantity <= 1 ? removeProduct(id) : updateQuantity(id, quantity - 1))}
                      aria-label={quantity <= 1 ? 'Remover' : 'Diminuir'}
                    >
                      {quantity <= 1 ? <Trash2 size={15} aria-hidden="true" /> : <Minus size={15} aria-hidden="true" />}
                    </button>
                    <span className="quantidadeItemClass">{quantity}</span>
                    <button
                      className="btns-cart plus-button"
                      type="button"
                      disabled={quantity >= 5}
                      onClick={() => updateQuantity(id, quantity + 1)}
                      aria-label="Aumentar"
                    >
                      <Plus size={15} aria-hidden="true" />
                    </button>
                  </div>
                </article>
              );
            })}
          </div>

          <section className="section-categoria liah-react-summary">
            <div className="div-categoria-produtos">
              <div className="titulo-categoria">Resumo do carrinho</div>
            </div>
            <div className="subtitulo item-resumo-compra">
              <div>Total de itens</div>
              <span>{count === 1 ? '1 item' : `${count} itens`}</span>
            </div>
            <div className="subtitulo item-resumo-compra">
              <div>Subtotal</div>
              <span>{money(total)}</span>
            </div>
          </section>

          {cartRecommendations.length ? (
            <section className="section-categoria liah-react-section">
              <div className="div-categoria-produtos">
                <div className="titulo-categoria">Compre também</div>
              </div>
              <div className="produtos-categoria liah-react-carousel">
                {cartRecommendations.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    storeMode={true}
                    inCart={cartIds.includes(product.id)}
                    favorite={favorites.includes(String(product.id))}
                    onOpen={() => void openProduct(product)}
                    onAdd={(p) => { void openProduct(p); }}
                    onToggleFavorite={toggleFavorite}
                    effectiveStoreMode={storeMode}
                  />
                ))}
              </div>
            </section>
          ) : null}
        </>
      )}
    </ModalShell>
  );
}
