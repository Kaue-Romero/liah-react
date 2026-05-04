import type { AuthState } from '../types';

export function readStorageItem(key: string): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

export function writeStorageItem(key: string, value: string): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // Storage can fail in private browsing or when quota is exceeded.
  }
}

export function removeStorageItem(key: string): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(key);
  } catch {
    // Storage can fail in private browsing.
  }
}

export function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = readStorageItem(key);
    if (raw === null || raw === undefined || raw === '') return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function writeJson<T>(key: string, value: T): void {
  writeStorageItem(key, JSON.stringify(value));
}

export function readAuth(): AuthState {
  return {
    id: readStorageItem('tspayid'),
    token: readStorageItem('tspaytoken')
  };
}

export function writeAuth(id: string, token: string): AuthState {
  writeStorageItem('tspayid', id);
  writeStorageItem('tspaytoken', token);
  return { id, token };
}

export function clearAuth(): void {
  removeStorageItem('tspayid');
  removeStorageItem('tspaytoken');
  removeStorageItem('primeiraCompra');
  removeStorageItem('noventaDias');
  removeStorageItem('favoritos');
}

export function ensureSearchHistory(): void {
  if (readStorageItem('historico_busca') === null) {
    writeStorageItem('historico_busca', JSON.stringify([]));
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
