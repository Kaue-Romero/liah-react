import { useCart } from '../../contexts/cart/useCart';
import { useCatalog } from '../../contexts/catalog/useCatalog';
import { useConfig } from '../../contexts/config/useConfig';
import { useProduct } from '../../contexts/product/useProduct';
import { useUser } from '../../contexts/user/useUser';
import type { Product } from '../../types';
import { assetUrl } from '../../utils/env';
import { productById, visibleProductsByText } from '../../utils/products';
import { EmptyState } from '../common/EmptyState';
import { ProductCard } from './ProductCard';

export function ProductSections() {
  const { cartIds, addProduct } = useCart();
  const { categories, contentMode, products, query, recommendations } = useCatalog();
  const { storeMode } = useConfig();
  const { openProduct, openFullList } = useProduct();
  const { favorites, toggleFavorite } = useUser();

  function renderCard(product: Product, compact = false) {
    return (
      <ProductCard
        key={product.id}
        product={product}
        compact={compact}
        storeMode={storeMode}
        inCart={cartIds.includes(product.id)}
        favorite={favorites.includes(String(product.id))}
        onOpen={() => void openProduct(product)}
        onAdd={addProduct}
        onToggleFavorite={toggleFavorite}
      />
    );
  }

  if (contentMode === 'search') {
    const results = visibleProductsByText(Object.values(products), query).filter(Boolean);
    if (!results.length) {
      return (
        <EmptyState image={assetUrl('img/busca-empty.svg')} title="Nenhum produto encontrado">
          Infelizmente nenhum produto foi encontrado com o termo buscado.
        </EmptyState>
      );
    }

    return (
      <section className="busca-produtos-content liah-react-section">
        <div className="liah-react-grid">{results.map((product) => renderCard(product, true))}</div>
      </section>
    );
  }

  if (contentMode === 'recommended') {
    const lists = recommendations.filter((list) => list.produtos?.length);
    if (!lists.length) {
      return (
        <EmptyState image={assetUrl('img/icon-empty-suggestion.svg')} title="Sem prescrições vinculadas">
          Não identificamos prescrições com suplementos vinculadas ao seu perfil.
        </EmptyState>
      );
    }

    return (
      <>
        {lists.map((list, index) => {
          const listProducts = list.produtos
            .map((item) => productById(products, item.id))
            .filter((product): product is Product => Boolean(product));
          if (!listProducts.length) return null;
          const visible = listProducts.slice(0, 8);
          return (
            <section className="section-categoria liah-react-section" key={`${list['nome-lista']}-${index}`}>
              <div className="div-categoria-produtos">
                <div className="titulo-categoria">{list['nome-lista']}</div>
                {listProducts.length > visible.length ? (
                  <button
                    className="ver-mais-categoria"
                    type="button"
                    onClick={() => openFullList(list['nome-lista'], listProducts.map((p) => p.id))}
                  >
                    Ver mais
                  </button>
                ) : null}
              </div>
              <div className="produtos-categoria liah-react-carousel">{visible.map((p) => renderCard(p))}</div>
            </section>
          );
        })}
      </>
    );
  }

  const categorySections = categories.length
    ? categories
    : [{ id: 'todos', titulo: 'Todos os produtos', chave: 'todos', produtos: Object.values(products).map((p) => p.id) }];

  return (
    <>
      {categorySections.map((category) => {
        const sectionProducts = category.produtos
          .map((id) => productById(products, id))
          .filter((product): product is Product => Boolean(product))
          .filter((product) => product.disponivel);
        const visible = sectionProducts.slice(0, 8);
        if (!visible.length) return null;

        return (
          <section className="section-categoria liah-react-section" key={category.chave}>
            <div className="div-categoria-produtos">
              <div className="titulo-categoria">{category.titulo}</div>
              {sectionProducts.length > visible.length ? (
                <button
                  className="ver-mais-categoria"
                  type="button"
                  onClick={() => openFullList(category.titulo, sectionProducts.map((p) => p.id))}
                >
                  Ver mais
                </button>
              ) : null}
            </div>
            <div className="produtos-categoria liah-react-carousel">{visible.map((p) => renderCard(p))}</div>
          </section>
        );
      })}
    </>
  );
}
