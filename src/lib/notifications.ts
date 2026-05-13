'use client';

import { create } from 'zustand';

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'info';
  title: string;
  message: string;
  duration?: number;
}

interface NotificationStore {
  notifications: Notification[];
  addNotification: (n: Omit<Notification, 'id'>) => void;
  removeNotification: (id: string) => void;
}

export const useNotifications = create<NotificationStore>((set) => ({
  notifications: [],
  addNotification: (n) => {
    const id = Math.random().toString(36).substring(7);
    set((state) => ({
      notifications: [...state.notifications, { ...n, id }]
    }));

    if (n.duration !== 0) {
      setTimeout(() => {
        set((state) => ({
          notifications: state.notifications.filter((notif) => notif.id !== id)
        }));
      }, n.duration || 5000);
    }
  },
  removeNotification: (id) => {
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id)
    }));
  }
}));
