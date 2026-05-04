import { Minus, Plus, Trash2 } from 'lucide-react';
import type { CheckoutProduct, Product } from '../types';
import { cartSubtotal, itemCount } from '../utils/cart';
import { money } from '../utils/format';
import { EmptyState } from './EmptyState';
import { ModalShell } from './ModalShell';
import { ProductCard } from './ProductCard';

interface CartPanelProps {
  products: Record<string, Product>;
  cartIds: number[];
  quantities: Record<string, number>;
  checkoutProducts: CheckoutProduct[];
  recommendations: Product[];
  favorites: string[];
  onClose: () => void;
  onCheckout: () => void;
  onOpenProduct: (product: Product) => void;
  onAddProduct: (product: Product) => void;
  onFavorite: (product: Product) => void;
  onQuantityChange: (productId: number, next: number) => void;
  onRemove: (productId: number) => void;
}

export function CartPanel({
  products,
  cartIds,
  quantities,
  checkoutProducts,
  recommendations,
  favorites,
  onClose,
  onCheckout,
  onOpenProduct,
  onAddProduct,
  onFavorite,
  onQuantityChange,
  onRemove
}: CartPanelProps) {
  const total = cartSubtotal(checkoutProducts);
  const count = itemCount(cartIds, quantities);

  return (
    <ModalShell
      title="Carrinho"
      onClose={onClose}
      footer={
        cartIds.length ? (
          <button className="pagamentoBtn liah-react-pay-button" type="button" onClick={onCheckout}>
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
                    onClick={() => onOpenProduct(product)}
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
                      onClick={() => (quantity <= 1 ? onRemove(id) : onQuantityChange(id, quantity - 1))}
                      aria-label={quantity <= 1 ? 'Remover' : 'Diminuir'}
                    >
                      {quantity <= 1 ? <Trash2 size={15} /> : <Minus size={15} />}
                    </button>
                    <span className="quantidadeItemClass">{quantity}</span>
                    <button
                      className="btns-cart plus-button"
                      type="button"
                      disabled={quantity >= 5}
                      onClick={() => onQuantityChange(id, quantity + 1)}
                      aria-label="Aumentar"
                    >
                      <Plus size={15} />
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

          {recommendations.length ? (
            <section className="section-categoria liah-react-section">
              <div className="div-categoria-produtos">
                <div className="titulo-categoria">Compre também</div>
              </div>
              <div className="produtos-categoria liah-react-carousel">
                {recommendations.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    inCart={cartIds.includes(product.id)}
                    favorite={favorites.includes(String(product.id))}
                    storeMode
                    onOpen={onOpenProduct}
                    onAdd={onAddProduct}
                    onFavorite={onFavorite}
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
