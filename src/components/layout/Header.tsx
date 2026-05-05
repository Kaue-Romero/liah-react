import type { Dispatch, SetStateAction } from 'react';
import { Bell, ChevronDown, ListChecks, MapPin, Menu, Search, ShoppingBag } from 'lucide-react';
import type { ModalName } from '../../types';
import type { CatalogTab } from '../../contexts/catalog/types';

interface HeaderProps {
  activeTab: CatalogTab;
  setActiveTab: Dispatch<SetStateAction<CatalogTab>>;
  query: string;
  setQuery: Dispatch<SetStateAction<string>>;
  storeMode: boolean;
  selectedState: string | null;
  unreadNotifications: boolean;
  onOpenModal: (modal: ModalName) => void;
  onOpenNotifications: () => void;
  onOpenProfile: () => void;
}

export function Header({
  activeTab,
  setActiveTab,
  query,
  setQuery,
  storeMode,
  selectedState,
  unreadNotifications,
  onOpenModal,
  onOpenNotifications,
  onOpenProfile
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
          <button type="button" onClick={() => onOpenModal('state')} className="flex items-center gap-2 mt-4 text-sm w-full text-left">
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
            onChange={(event) => setQuery(event.target.value)}
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
              onClick={() => setActiveTab('recommended')}
            >
              <ListChecks size={18} aria-hidden="true" />
              <div>Nutri Prescreveu</div>
            </button>
            <button
              id="aba-busca"
              type="button"
              className={`aba-loja ${activeTab === 'store' ? 'aba-loja-ativa' : ''}`}
              onClick={() => setActiveTab('store')}
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
