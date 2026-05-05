import { useMemo, type ReactNode } from 'react';
import type { LiahConfig } from '../../types';
import { ConfigContext } from './context';

export function AppConfigProvider({ config, children }: { config: LiahConfig; children: ReactNode }) {
  const normalized = useNormalizedConfig(config);
  const storeMode = Boolean(config.loja);
  const value = useMemo(() => ({ config: normalized, storeMode }), [normalized, storeMode]);
  return <ConfigContext.Provider value={value}>{children}</ConfigContext.Provider>;
}

function useNormalizedConfig(config: LiahConfig): LiahConfig {
  return useMemo(
    () => ({
      origem: config.origem || 'app',
      carrinho_altura: config.carrinho_altura || 20,
      loja: Boolean(config.loja),
      empresa: config.empresa || 1,
      recomendacoes: config.recomendacoes || [],
      assinante: Boolean(config.assinante),
      p: config.p,
      n: config.n,
      produto: config.produto
    }),
    [
      config.assinante,
      config.carrinho_altura,
      config.empresa,
      config.loja,
      config.n,
      config.origem,
      config.p,
      config.produto,
      config.recomendacoes
    ]
  );
}
