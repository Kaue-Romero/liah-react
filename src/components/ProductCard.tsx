import { Heart, Plus, Star } from 'lucide-react';
import type { Product } from '../types';
import { assetUrl } from '../utils/env';
import { centsToNumber, money } from '../utils/format';
import { isProductAvailable } from '../utils/cart';

interface ProductCardProps {
  product: Product;
  inCart: boolean;
  favorite: boolean;
  storeMode: boolean;
  onOpen: (product: Product) => void;
  onAdd: (product: Product) => void;
  onFavorite: (product: Product) => void;
  compact?: boolean;
}

export function ProductCard({
  product,
  inCart,
  favorite,
  storeMode,
  onOpen,
  onAdd,
  onFavorite,
  compact = false
}: ProductCardProps) {
  const available = isProductAvailable(product);
  const price = centsToNumber(product.preco);
  const oldPrice = centsToNumber(product.precoNaoPromocional || 0);
  const averagePrice = centsToNumber(product.precoOriginal || product.precoMedio || product.preco || 0);
  const hasPromo = available && oldPrice > price;
  const discount = hasPromo ? Math.round((1 - price / oldPrice) * 100) : 0;
  const note = Number(product.nota || 0);
  const openProduct = () => onOpen(product);

  return (
    <article
      className={`produtoClassGeral liah-react-product ${compact ? 'liah-react-product-compact' : ''}`}
      id={`produto${product.id}`}
      data-product-id={product.id}
      role="button"
      tabIndex={0}
      onClick={openProduct}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          openProduct();
        }
      }}
    >
      <div className="divFotoProduto liah-react-product-photo-wrap">
        <div
          className="fotoProdutoLoja liah-react-product-photo"
          style={{ backgroundImage: `url(${product.foto || assetUrl('img/loading.gif')})` }}
        />
        {note > 0 ? (
          <div className="small-tag liah-react-rating">
            <Star size={13} fill="currentColor" aria-hidden="true" />
            {note.toFixed(1)}
          </div>
        ) : null}
        {!available && storeMode ? <div className="tag-indisponivel small-tag">Indisponível</div> : null}
        {hasPromo ? <div className="liah-react-discount">{discount}% OFF</div> : null}
        {storeMode && available ? (
          <button
            className={`btn-adicionar-produto liah-react-add ${inCart ? 'produto-selecionado' : ''}`}
            type="button"
            aria-label={inCart ? 'Produto no carrinho' : 'Adicionar produto'}
            onClick={(event) => {
              event.stopPropagation();
              onAdd(product);
            }}
          >
            {inCart ? '✓' : <Plus size={18} aria-hidden="true" />}
          </button>
        ) : null}
      </div>

      <div className="liah-react-product-copy">
        <div className="liah-react-product-topline">
          <span>{product.marca}</span>
          <button
            type="button"
            className={`liah-favorite-button ${favorite ? 'is-active' : ''}`}
            aria-label={favorite ? 'Remover favorito' : 'Favoritar produto'}
            onClick={(event) => {
              event.stopPropagation();
              onFavorite(product);
            }}
          >
            <Heart size={17} fill={favorite ? 'currentColor' : 'none'} aria-hidden="true" />
          </button>
        </div>
        <h3 className="duas-linhas">
          {product.nome}
          {product.peso ? ` - ${product.peso}` : ''}
          {product.sabor ? ` - ${product.sabor}` : ''}
        </h3>
        <div className="liah-react-price">
          {storeMode && available ? (
            hasPromo ? (
              <>
                <span className="liah-react-old-price">{money(oldPrice)}</span>
                <strong>{money(price)}</strong>
              </>
            ) : (
              <strong>{money(price)}</strong>
            )
          ) : (
            <span>
              Preço médio: <strong>{money(averagePrice)}</strong>
            </span>
          )}
        </div>
      </div>
    </article>
  );
}
