export function assetUrl(path: string): string {
  const normalized = path.startsWith('/') ? path.slice(1) : path;
  return `/${normalized}`;
}

export function apiBaseUrl(): string {
  if (typeof window === 'undefined') {
    return 'http://localhost:8085/api/api_app/';
  }

  return window.url_apis || 'http://localhost:8085/api/api_app/';
}
