export function getScriptDirectory(): { currentDir: string; rootDir: string } {
  const currentScript = document.currentScript as HTMLScriptElement | null;

  if (!currentScript?.src) {
    return {
      currentDir: '',
      rootDir: ''
    };
  }

  const url = new URL(currentScript.src);
  const currentDir = url.pathname.substring(0, url.pathname.lastIndexOf('/'));
  const pathParts = currentDir.split('/');
  const rootDir = `${url.origin}/${pathParts[1] || ''}`;

  return {
    currentDir,
    rootDir
  };
}

export function configureGlobalPaths(): void {
  const directory = getScriptDirectory();

  window.scriptDirectory = directory.currentDir;
  window.rootDirectory = directory.rootDir;

  if (typeof window.url_apis === 'undefined') {
    window.url_apis = 'https://hubdiet.com/api_app/';
  }
}

export function assetUrl(path: string): string {
  const root = window.rootDirectory || '';
  const normalized = path.startsWith('/') ? path.slice(1) : path;
  return `${root}/${normalized}`;
}

export function apiBaseUrl(): string {
  return window.url_apis || 'https://hubdiet.com/api_app/';
}
