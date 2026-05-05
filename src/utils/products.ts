import type { Category, Product, ProductsResponse } from '../types';

export function normalizeProducts(response: ProductsResponse): Record<string, Product> {
  const next: Record<string, Product> = {};
  Object.entries(response.produtos || {}).forEach(([key, raw]) => {
    const id = Number(raw.id || key);
    if (!Number.isFinite(id)) return;
    next[String(id)] = {
      ...raw,
      id,
      disponivel: Boolean(Number(raw.disponivel))
    };
  });
  return next;
}

export function normalizeCategories(categories: Category[], products: Record<string, Product>): Category[] {
  if (categories.length) {
    return categories.map((category) => ({
      ...category,
      produtos: (category.produtos || []).map(Number).filter((id) => products[String(id)])
    }));
  }

  const grouped = new Map<string, number[]>();
  Object.values(products).forEach((product) => {
    (product.categoria || ['todos']).forEach((category) => {
      const key = String(category || 'todos');
      grouped.set(key, [...(grouped.get(key) || []), product.id]);
    });
  });

  return Array.from(grouped.entries()).map(([key, ids]) => ({
    id: key,
    chave: key.toLowerCase().replace(/\s+/g, '-'),
    titulo: key,
    produtos: ids
  }));
}

export function productById(products: Record<string, Product>, id: string | number): Product | undefined {
  return products[String(id)];
}

export function visibleProductsByText(products: Product[], query: string): Product[] {
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
