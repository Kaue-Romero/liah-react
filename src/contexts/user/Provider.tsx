import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { api } from '../../api/client';
import type { FaqItem, NotificationItem, Order, Product, UserInfoResponse } from '../../types';
import { useAuth } from '../auth/useAuth';
import { useCart } from '../cart/useCart';
import { useCatalog } from '../catalog/useCatalog';
import { useConfig } from '../config/useConfig';
import { useToast } from '../toast/useToast';
import { useUi } from '../ui/useUi';
import { UserContext } from './context';

export function UserProvider({ children }: { children: ReactNode }) {
  const { auth } = useAuth();
  const { config } = useConfig();
  const { products } = useCatalog();
  const { subtotal } = useCart();
  const { pushToast } = useToast();
  const { openModal } = useUi();

  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [faq, setFaq] = useState<FaqItem[]>([]);
  const [userInfo, setUserInfo] = useState<UserInfoResponse | null>(null);

  const favoriteProducts = useMemo(
    () => favorites.map((id) => products[id]).filter((product): product is Product => Boolean(product)),
    [favorites, products]
  );

  const refreshNotifications = useCallback(async () => {
    const items = await api.loadNotifications(auth.id, auth.token);
    setNotifications(items);
  }, [auth.id, auth.token]);

  const refreshFavorites = useCallback(async () => {
    const ids = await api.loadFavorites(auth.id);
    setFavorites(ids);
  }, [auth.id]);

  const refreshOrdersAndFaq = useCallback(async () => {
    if (!auth.id || !auth.token) return;
    const [ordersResponse, faqResponse] = await Promise.all([
      api.loadOrders(auth.id, auth.token),
      api.loadFaq(config.empresa || 1)
    ]);
    setOrders(Array.isArray(ordersResponse) ? ordersResponse : []);
    setFaq(faqResponse);
  }, [auth.id, auth.token, config.empresa]);

  const refreshUserInfo = useCallback(async () => {
    if (!auth.id || !auth.token) {
      setUserInfo(null);
      return;
    }
    const info = await api.loadUserInfo(config, auth.id, auth.token, subtotal);
    setUserInfo(info);
  }, [auth.id, auth.token, config, subtotal]);

  const toggleFavorite = useCallback(
    async (product: Product) => {
      if (!auth.id) {
        openModal('auth');
        return;
      }
      const productId = String(product.id);
      const nextFavorite = !favorites.includes(productId);
      setFavorites((current) => (nextFavorite ? [...current, productId] : current.filter((id) => id !== productId)));
      try {
        await api.setFavorite(auth.id, auth.token || '', product.id, nextFavorite);
      } catch {
        setFavorites((current) => (nextFavorite ? current.filter((id) => id !== productId) : [...current, productId]));
        pushToast('Erro ao atualizar favorito.', 'error');
      }
    },
    [auth.id, auth.token, favorites, openModal, pushToast]
  );

  const openNotifications = useCallback(() => {
    openModal('notifications');
    void api.markNotificationsRead(auth.id, auth.token).then(() => refreshNotifications());
  }, [auth.id, auth.token, openModal, refreshNotifications]);

  const openProfile = useCallback(() => {
    openModal('profile');
    void refreshOrdersAndFaq();
  }, [openModal, refreshOrdersAndFaq]);

  const rateProduct = useCallback(
    async (product: Product, rating: number) => {
      await api.addRating(config, auth.id, product.id, rating);
      pushToast('Avaliação registrada.', 'success');
    },
    [auth.id, config, pushToast]
  );

  useEffect(() => {
    const handler = () => {
      setFavorites([]);
      setOrders([]);
      setNotifications([]);
    };
    window.addEventListener('liah:logout', handler);
    return () => window.removeEventListener('liah:logout', handler);
  }, []);

  useEffect(() => {
    window.queueMicrotask(() => {
      void refreshNotifications();
      void refreshFavorites();
      void refreshOrdersAndFaq();
    });
  }, [refreshFavorites, refreshNotifications, refreshOrdersAndFaq]);

  return (
    <UserContext.Provider
      value={{
        notifications,
        favorites,
        favoriteProducts,
        orders,
        faq,
        userInfo,
        unreadNotifications: notifications.some((item) => item.status === 'nao_lida'),
        refreshNotifications,
        refreshFavorites,
        refreshOrdersAndFaq,
        refreshUserInfo,
        toggleFavorite,
        openNotifications,
        openProfile,
        rateProduct
      }}
    >
      {children}
    </UserContext.Provider>
  );
}
