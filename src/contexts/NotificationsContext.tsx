import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { useAuth } from "@/hooks/useAuth";
import {
  listNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  subscribeToLocalBackend,
} from "@/lib/local-backend";

export type NotificationType = "news" | "feedback_status" | "feedback_response" | "feedback_removed";

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  createdAt: Date;
  link?: string;
}

interface NotificationsContextType {
  notifications: AppNotification[];
  unreadCount: number;
  addNotification: (notification: Omit<AppNotification, "id" | "read" | "createdAt">) => void;
  markRead: (id: string) => void;
  markAllRead: () => void;
}

const NotificationsContext = createContext<NotificationsContextType | null>(null);

export function NotificationsProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  const refresh = async () => {
    if (!user) {
      setNotifications([]);
      return;
    }

    const items = await listNotifications(user.id);
    setNotifications(
      items.map((item) => ({
        ...item,
        createdAt: new Date(item.createdAt),
      })),
    );
  };

  useEffect(() => {
    void refresh();
    const unsubscribe = subscribeToLocalBackend(() => {
      void refresh();
    });
    return unsubscribe;
  }, [user?.id]);

  const unreadCount = useMemo(
    () => notifications.filter((notification) => !notification.read).length,
    [notifications],
  );

  const markRead = async (id: string) => {
    await markNotificationRead(id);
    await refresh();
  };

  const markAllRead = async () => {
    if (!user) return;
    await markAllNotificationsRead(user.id);
    await refresh();
  };

  return (
    <NotificationsContext.Provider
      value={{
        notifications,
        unreadCount,
        addNotification: () => undefined,
        markRead,
        markAllRead,
      }}
    >
      {children}
    </NotificationsContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationsContext);
  if (!context) {
    throw new Error("useNotifications must be used inside NotificationsProvider");
  }
  return context;
}
