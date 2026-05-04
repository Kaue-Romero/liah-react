import React from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { App } from './components/App';
import type { LiahConfig, LiahPublicApi, VersionInfo } from './types';
import { configureGlobalPaths } from './utils/env';
import './styles/legacy.css';
import './styles/react.css';

const roots = new Map<string, Root>();

configureGlobalPaths();

function validateConfig(config: LiahConfig): void {
  if (!config?.p || !config?.n) {
    throw new Error(`Paciente e Nutricionista nao identificados: ${config?.p || ''} ${config?.n || ''}`);
  }
}

function renderInterface(elementId: string, config: LiahConfig): void {
  validateConfig(config);

  const element = document.getElementById(elementId);
  if (!element) {
    console.error(`Elemento com ID ${elementId} não encontrado.`);
    return;
  }

  const normalizedConfig: LiahConfig = {
    origem: 'app',
    carrinho_altura: 20,
    loja: false,
    empresa: 1,
    recomendacoes: [],
    assinante: false,
    ...config
  };

  let root = roots.get(elementId);
  if (!root) {
    root = createRoot(element);
    roots.set(elementId, root);
  }

  root.render(
    <React.StrictMode>
      <App config={normalizedConfig} />
    </React.StrictMode>
  );
}

async function loadVersionInfo(): Promise<VersionInfo> {
  const rootURL = window.location.origin;
  const response = await fetch(`${rootURL}/liah_embed/assets/js/boot/version.json`, {
    method: 'GET',
    cache: 'no-store',
    headers: {
      Accept: 'application/json'
    }
  });

  if (!response.ok) {
    throw new Error('Falha ao buscar version.json');
  }

  return response.json() as Promise<VersionInfo>;
}

function exposeGlobals(): void {
  const interfaceApi: LiahPublicApi = {
    init: renderInterface
  };

  window.MyInterface = {
    ...(window.MyInterface || {}),
    ...interfaceApi
  };

  window.objetosLiah = window.objetosLiah || {};
  window.variaveisLiah = window.variaveisLiah || {};

  const existingLiah = window.LIAH;
  if (!existingLiah?.ensureLoaded) {
    window.LIAH = {
      init(containerId: string, options: LiahConfig) {
        renderInterface(containerId, options);
        return Promise.resolve();
      },
      async ensureLoaded() {
        return Promise.resolve();
      },
      loadVersionInfo
    };
  }

  window.showToast = (options) => {
    window.dispatchEvent(
      new CustomEvent('liah:toast', {
        detail: {
          messageText: options?.messageText || '',
          type: options?.type || 'info',
          staySeconds: options?.staySeconds
        }
      })
    );
  };

  if (window.MyInterface.pendingInit) {
    const pending = window.MyInterface.pendingInit;
    delete window.MyInterface.pendingInit;
    window.MyInterface.init(pending.elementId, pending.config);
  }
}

exposeGlobals();
