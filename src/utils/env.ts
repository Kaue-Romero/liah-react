export function assetUrl(path: string): string {
  const normalized = path.startsWith('/') ? path.slice(1) : path;
  return `/${normalized}`;
}

export function apiBaseUrl(): string {
  if (typeof window === 'undefined') {
    return 'https://hubdiet.com/api_app/';
  }

  return window.url_apis || 'https://hubdiet.com/api_app/';
}
