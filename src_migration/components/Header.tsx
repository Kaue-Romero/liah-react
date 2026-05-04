import { Bell, ListChecks, MapPin, Menu, Search, ShoppingBag } from 'lucide-react';
import type { LiahConfig } from '../types';
import { assetUrl } from '../utils/env';

interface HeaderProps {
  config: LiahConfig;
  query: string;
  activeTab: 'recommended' | 'store';
  storeMode: boolean;
  unreadNotifications: boolean;
  selectedState: string | null;
  onQueryChange: (value: string) => void;
  onTabChange: (tab: 'recommended' | 'store') => void;
  onOpenNotifications: () => void;
  onOpenProfile: () => void;
  onOpenState: () => void;
}

export function Header({
  config,
  query,
  activeTab,
  storeMode,
  unreadNotifications,
  selectedState,
  onQueryChange,
  onTabChange,
  onOpenNotifications,
  onOpenProfile,
  onOpenState
}: HeaderProps) {
  return (
    <header className="header-liah liah-react-header">
      <div className="header-row" id="header-logo">
        <img
          className="liah-react-logo"
          src={assetUrl(`img/logo/${config.empresa || 1}_v2.png`)}
          onError={(event) => {
            event.currentTarget.src = assetUrl('img/logo.png');
          }}
          alt=""
        />
        <label className="liah-busca liah-react-search" htmlFor="barraBuscaProdutos">
          <Search size={18} />
          <input
            type="search"
            autoComplete="off"
            id="barraBuscaProdutos"
            placeholder="Buscar na loja Liah"
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
          />
        </label>
        <div id="actions-header-btn">
          <button id="bell-btn" className="liah-icon-button" type="button" onClick={onOpenNotifications}>
            <Bell size={22} />
            {unreadNotifications ? <span className="notif-dot" /> : null}
          </button>
          <button id="perfil-btn" className="liah-icon-button" type="button" onClick={onOpenProfile}>
            <Menu size={24} />
          </button>
        </div>
      </div>

      {storeMode ? (
        <button className="titulo-categoria liah-react-location" type="button" onClick={onOpenState}>
          <MapPin size={15} />
          <span>{selectedState ? `Sua Localização: ${selectedState}` : 'Adicionar localização'}</span>
        </button>
      ) : null}

      <div className="header-row header-extras">
        <div id="abas-loja">
          <div className="div-abas-loja">
            <button
              id="aba-recomendacao"
              type="button"
              className={`aba-loja ${activeTab === 'recommended' ? 'aba-loja-ativa' : ''}`}
              onClick={() => onTabChange('recommended')}
            >
              <ListChecks size={18} />
              <div>Nutri Prescreveu</div>
            </button>
            <button
              id="aba-busca"
              type="button"
              className={`aba-loja ${activeTab === 'store' ? 'aba-loja-ativa' : ''}`}
              onClick={() => onTabChange('store')}
            >
              <ShoppingBag size={18} />
              <div>Loja Liah</div>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
