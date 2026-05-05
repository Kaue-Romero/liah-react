import type { FaqItem, NotificationItem, Order, Product, UserInfoResponse } from '../../types';

export interface UserContextValue {
  notifications: NotificationItem[];
  favorites: string[];
  favoriteProducts: Product[];
  orders: Order[];
  faq: FaqItem[];
  userInfo: UserInfoResponse | null;
  unreadNotifications: boolean;
  refreshNotifications: () => Promise<void>;
  refreshFavorites: () => Promise<void>;
  refreshOrdersAndFaq: () => Promise<void>;
  refreshUserInfo: () => Promise<void>;
  toggleFavorite: (product: Product) => Promise<void>;
  openNotifications: () => void;
  openProfile: () => void;
  rateProduct: (product: Product, rating: number) => Promise<void>;
}
