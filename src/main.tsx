import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './components/App';
import type { LiahConfig } from './types';
import './styles/legacy.css';
import './styles/react.css';
import './index.css';

const DEMO_CONFIG: LiahConfig = {
  p: '1',
  n: '1',
  origem: 'app',
  carrinho_altura: 20,
  loja: true,
  empresa: 1,
  recomendacoes: [],
  assinante: false
};

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Root element not found.');
}

createRoot(rootElement).render(
  <StrictMode>
    <App config={DEMO_CONFIG} />
  </StrictMode>
);
