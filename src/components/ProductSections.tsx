import type { Category, Product, RecommendationList } from '../types';
import { assetUrl } from '../utils/env';
import { EmptyState } from './EmptyState';
import { ProductCard } from './ProductCard';

interface ProductSectionsProps {
  mode: 'recommended' | 'store' | 'search';
  products: Record<string, Product>;
  categories: Category[];
  recommendations: RecommendationList[];
  query: string;
  cartIds: number[];
  favorites: string[];
  storeMode: boolean;
  onOpen: (product: Product) => void;
  onAdd: (product: Product) => void;
  onFavorite: (product: Product) => void;
  onSeeAll: (title: string, productIds: number[]) => void;
}

function productById(products: Record<string, Product>, id: string | number): Product | undefined {
  return products[String(id)];
}

function visibleProductsByText(products: Product[], query: string): Product[] {
  const search = query.trim().toLowerCase();
  if (!search) return products;
  return products.filter((product) => {
    const content = [
      product.nome,
      product.marca,
      product.sabor,
      product.peso,
      ...(product.categoria || []),
      ...(product.palavrasChave || [])
    ]
      .join(' ')
      .toLowerCase();
    return content.includes(search);
  });
}

export function ProductSections({
  mode,
  products,
  categories,
  recommendations,
  query,
  cartIds,
  favorites,
  storeMode,
  onOpen,
  onAdd,
  onFavorite,
  onSeeAll
}: ProductSectionsProps) {
  if (mode === 'search') {
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
        <div className="liah-react-grid">
          {results.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              inCart={cartIds.includes(product.id)}
              favorite={favorites.includes(String(product.id))}
              storeMode={storeMode}
              onOpen={onOpen}
              onAdd={onAdd}
              onFavorite={onFavorite}
              compact
            />
          ))}
        </div>
      </section>
    );
  }

  if (mode === 'recommended') {
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
                    onClick={() => onSeeAll(list['nome-lista'], listProducts.map((product) => product.id))}
                  >
                    Ver mais
                  </button>
                ) : null}
              </div>
              <div className="produtos-categoria liah-react-carousel">
                {visible.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    inCart={cartIds.includes(product.id)}
                    favorite={favorites.includes(String(product.id))}
                    storeMode={storeMode}
                    onOpen={onOpen}
                    onAdd={onAdd}
                    onFavorite={onFavorite}
                  />
                ))}
              </div>
            </section>
          );
        })}
      </>
    );
  }

  const categorySections = categories.length
    ? categories
    : [
        {
          id: 'todos',
          titulo: 'Todos os produtos',
          chave: 'todos',
          produtos: Object.values(products).map((product) => product.id)
        }
      ];

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
                  onClick={() => onSeeAll(category.titulo, sectionProducts.map((product) => product.id))}
                >
                  Ver mais
                </button>
              ) : null}
            </div>
            <div className="produtos-categoria liah-react-carousel">
              {visible.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  inCart={cartIds.includes(product.id)}
                  favorite={favorites.includes(String(product.id))}
                  storeMode={storeMode}
                  onOpen={onOpen}
                  onAdd={onAdd}
                  onFavorite={onFavorite}
                />
              ))}
            </div>
          </section>
        );
      })}
    </>
  );
}
