import type { LiahConfig } from '../types';
import { StorePage } from '../pages/store';
import { AppProviders } from './AppProviders';

export function App({ config }: { config: LiahConfig }) {
  return (
    <AppProviders config={config}>
      <StorePage />
    </AppProviders>
  );
}
