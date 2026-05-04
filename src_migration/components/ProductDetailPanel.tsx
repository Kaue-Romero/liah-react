import { useState } from 'react';
import { Heart, Minus, Plus, Star } from 'lucide-react';
import type { Product } from '../types';
import { centsToNumber, money } from '../utils/format';
import { isProductAvailable } from '../utils/cart';
import { ModalShell } from './ModalShell';

interface ProductDetailPanelProps {
  product: Product;
  storeMode: boolean;
  quantity: number;
  inCart: boolean;
  favorite: boolean;
  description?: unknown;
  onClose: () => void;
  onAdd: (product: Product, quantity: number) => void;
  onFavorite: (product: Product) => void;
  onRate: (product: Product, rating: number) => void;
}

function renderDescription(description: unknown): string {
  if (!description) return '';
  if (typeof description === 'string') return description;
  if (Array.isArray(description)) {
    return description
      .map((item) => (typeof item === 'string' ? item : JSON.stringify(item)))
      .join('\n');
  }
  return JSON.stringify(description);
}

export function ProductDetailPanel({
  product,
  storeMode,
  quantity,
  inCart,
  favorite,
  description,
  onClose,
  onAdd,
  onFavorite,
  onRate
}: ProductDetailPanelProps) {
  const available = isProductAvailable(product);
  const [qty, setQty] = useProductQuantity(quantity);
  const price = centsToNumber(product.preco) * qty;
  const descriptionText = renderDescription(description || product.comentario);
  const note = Number(product.nota || 0);

  return (
    <ModalShell
      title="Detalhes"
      onClose={onClose}
      footer={
        storeMode && available ? (
          <button className="pagamentoBtn liah-react-pay-button" type="button" onClick={() => onAdd(product, qty)}>
            <span>{inCart ? 'Atualizar' : 'Adicionar'}</span>
            <strong>{money(price)}</strong>
          </button>
        ) : null
      }
    >
      <article className="liah-react-product-detail">
        <div className="liah-react-detail-image" style={{ backgroundImage: `url(${product.foto})` }} />
        <div className="liah-react-detail-heading">
          <div>
            <span>{product.marca}</span>
            <h3>
              {product.nome}
              {product.peso ? ` - ${product.peso}` : ''}
              {product.sabor ? ` de ${product.sabor}` : ''}
            </h3>
          </div>
          <button
            type="button"
            className={`liah-favorite-button ${favorite ? 'is-active' : ''}`}
            aria-label={favorite ? 'Remover favorito' : 'Favoritar produto'}
            onClick={() => onFavorite(product)}
          >
            <Heart size={22} fill={favorite ? 'currentColor' : 'none'} />
          </button>
        </div>
        {note > 0 ? (
          <div className="liah-react-stars">
            <Star size={16} fill="currentColor" />
            {note.toFixed(1)}
          </div>
        ) : null}
        <div className="liah-react-price-detail">
          {storeMode && available ? (
            <strong>{money(price)}</strong>
          ) : (
            <span>
              Preço médio: <strong>{money(centsToNumber(product.precoOriginal || product.preco))}</strong>
            </span>
          )}
        </div>
        {storeMode && available ? (
          <div className="secondary-btn liah-react-detail-qty" id="btn-qtd-produto">
            <button type="button" disabled={qty <= 1} onClick={() => setQty(qty - 1)}>
              <Minus size={16} />
            </button>
            <span className="quantidadeProduto">{qty}</span>
            <button type="button" disabled={qty >= 5} onClick={() => setQty(qty + 1)}>
              <Plus size={16} />
            </button>
          </div>
        ) : null}
        {descriptionText ? <p className="liah-react-description">{descriptionText}</p> : null}
        <div className="liah-react-rating-actions">
          {[1, 2, 3, 4, 5].map((rating) => (
            <button key={rating} type="button" aria-label={`Avaliar ${rating}`} onClick={() => onRate(product, rating)}>
              <Star size={18} />
            </button>
          ))}
        </div>
      </article>
    </ModalShell>
  );
}

function useProductQuantity(initial: number): [number, (next: number) => void] {
  const [quantity, setQuantity] = useState(Math.max(1, Math.min(5, initial || 1)));
  const update = (next: number) => setQuantity(Math.max(1, Math.min(5, next)));
  return [quantity, update];
}
