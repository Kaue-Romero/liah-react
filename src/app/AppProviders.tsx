import type { ReactNode } from 'react';
import type { LiahConfig } from '../types';
import { AppConfigProvider } from '../contexts/config/Provider';
import { ToastProvider } from '../contexts/toast/Provider';
import { UiProvider } from '../contexts/ui/Provider';
import { AuthProvider } from '../contexts/auth/Provider';
import { LocationProvider } from '../contexts/location/Provider';
import { CatalogProvider } from '../contexts/catalog/Provider';
import { CartProvider } from '../contexts/cart/Provider';
import { CouponProvider } from '../contexts/coupon/Provider';
import { UserProvider } from '../contexts/user/Provider';
import { ProductProvider } from '../contexts/product/Provider';

export function AppProviders({ config, children }: { config: LiahConfig; children: ReactNode }) {
  return (
    <AppConfigProvider config={config}>
      <ToastProvider>
        <UiProvider>
          <AuthProvider>
            <LocationProvider>
              <CatalogProvider>
                <CartProvider>
                  <CouponProvider>
                    <UserProvider>
                      <ProductProvider>{children}</ProductProvider>
                    </UserProvider>
                  </CouponProvider>
                </CartProvider>
              </CatalogProvider>
            </LocationProvider>
          </AuthProvider>
        </UiProvider>
      </ToastProvider>
    </AppConfigProvider>
  );
}
