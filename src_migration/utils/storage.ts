import type { AuthState } from '../types';

export function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null || raw === undefined || raw === '') return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function writeJson<T>(key: string, value: T): void {
  localStorage.setItem(key, JSON.stringify(value));
}

export function readAuth(): AuthState {
  return {
    id: localStorage.getItem('tspayid'),
    token: localStorage.getItem('tspaytoken')
  };
}

export function writeAuth(id: string, token: string): AuthState {
  localStorage.setItem('tspayid', id);
  localStorage.setItem('tspaytoken', token);
  return { id, token };
}

export function clearAuth(): void {
  localStorage.removeItem('tspayid');
  localStorage.removeItem('tspaytoken');
  localStorage.removeItem('primeiraCompra');
  localStorage.removeItem('noventaDias');
  localStorage.removeItem('favoritos');
}

export function ensureSearchHistory(): void {
  if (typeof localStorage.historico_busca === 'undefined') {
    localStorage.historico_busca = JSON.stringify([]);
  }
}

export function getCartIds(): number[] {
  return readJson<number[]>('carrinho', []).map(Number).filter(Number.isFinite);
}

export function getCartQuantities(): Record<string, number> {
  return readJson<Record<string, number>>('quantidadeCarrinho', {});
}

export function writeCart(cartIds: number[], quantities: Record<string, number>): void {
  writeJson('carrinho', cartIds);
  writeJson('quantidadeCarrinho', quantities);
}
