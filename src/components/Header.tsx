import { Bell, ChevronDown, ListChecks, MapPin, Menu, Search, ShoppingBag } from 'lucide-react';
import type { LiahConfig } from '../types';

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
    <header className="header-liah ">
      <div className="bg-primary text-primary-foreground px-5 pt-6 pb-8 rounded-b-[28px] -mb-6">
        <div className="flex items-center justify-between">
          <div className="font-semibold text-lg tracking-tight">
            <span className="italic">liah</span> + webdiet
          </div>
          <div className="flex items-center gap-3">
            <button type="button" aria-label="Abrir notificações" onClick={onOpenNotifications} className="relative">
              <Bell size={22} aria-hidden="true" />
              {unreadNotifications ? <span className="notif-dot" /> : null}
            </button>
            <button type="button" aria-label="Abrir perfil" onClick={onOpenProfile}>
              <Menu size={22} aria-hidden="true" />
            </button>
          </div>
        </div>

        {storeMode ? (
          <button type="button" onClick={onOpenState} className="flex items-center gap-2 mt-4 text-sm w-full text-left">
            <MapPin size={16} aria-hidden="true" />
            <span className="opacity-90">Sua Localização:</span>
            <span className="font-semibold">{selectedState || 'SP'}</span>
            <ChevronDown size={14} aria-hidden="true" />
          </button>
        ) : null}

        <div className="mt-3 bg-background text-foreground rounded-full flex items-center gap-2 px-4 py-2.5">
          <Search size={18} className="text-muted-foreground" aria-hidden="true" />
          <input
            id="barraBuscaProdutos"
            name="busca-produtos"
            type="search"
            autoComplete="off"
            spellCheck={false}
            placeholder="Buscar na loja Liah"
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            className="bg-transparent flex-1 outline-none text-sm placeholder:text-muted-foreground"
          />
        </div>
      </div>

      <div className="header-row header-extras">
        <div id="abas-loja">
          <div className="div-abas-loja">
            <button
              id="aba-recomendacao"
              type="button"
              className={`aba-loja ${activeTab === 'recommended' ? 'aba-loja-ativa' : ''}`}
              onClick={() => onTabChange('recommended')}
            >
              <ListChecks size={18} aria-hidden="true" />
              <div>Nutri Prescreveu</div>
            </button>
            <button
              id="aba-busca"
              type="button"
              className={`aba-loja ${activeTab === 'store' ? 'aba-loja-ativa' : ''}`}
              onClick={() => onTabChange('store')}
            >
              <ShoppingBag size={18} aria-hidden="true" />
              <div>Loja Liah</div>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
