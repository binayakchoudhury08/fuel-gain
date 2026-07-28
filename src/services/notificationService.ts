import type { NotificationItem } from '../types';

const NOTIF_STORAGE_KEY = 'fuel_gain_notifications';

export const notificationService = {
  getNotifications(): NotificationItem[] {
    try {
      const raw = localStorage.getItem(NOTIF_STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  },

  addNotification(title: string, message: string) {
    try {
      const notifs = this.getNotifications();
      const item: NotificationItem = {
        id: `notif-${Date.now()}`,
        title,
        message,
        read: false,
        createdAt: new Date().toISOString(),
      };
      notifs.unshift(item);
      localStorage.setItem(NOTIF_STORAGE_KEY, JSON.stringify(notifs));
    } catch {
      // Fallback
    }
  },

  markAllAsRead() {
    try {
      const notifs = this.getNotifications().map((n) => ({ ...n, read: true }));
      localStorage.setItem(NOTIF_STORAGE_KEY, JSON.stringify(notifs));
    } catch {
      // Fallback
    }
  },

  getUnreadCount(): number {
    return this.getNotifications().filter((n) => !n.read).length;
  },
};
