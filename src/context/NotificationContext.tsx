import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
} from 'react';
import { View, useWindowDimensions } from 'react-native';
import { NotificationToast } from '../components/NotificationToast';
import { isDesktop } from '../utils';

export type NotificationType = 'success' | 'error' | 'info' | 'warning';

export interface NotificationAction {
  label: string;
  onPress: () => void;
}

export interface NotificationData {
  id: string;
  type: NotificationType;
  title: string;
  message?: string;
  duration?: number;
  action?: NotificationAction;
}

interface NotificationOptions {
  type: NotificationType;
  title: string;
  message?: string;
  duration?: number;
  action?: NotificationAction;
}

export interface NotificationContextType {
  showNotification: (opts: NotificationOptions) => string;
  dismissNotification: (id: string) => void;
  dismissAll: () => void;
}

const NotificationContext =
  createContext<NotificationContextType | undefined>(undefined);

let idCounter = 0;

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [notifications, setNotifications] = useState<NotificationData[]>([]);
  const { width } = useWindowDimensions();
  const desktop = isDesktop(width);

  const showNotification = useCallback((opts: NotificationOptions) => {
    const id = `notif-${++idCounter}-${Date.now()}`;
    const notification: NotificationData = { ...opts, id };
    setNotifications((prev) => [...prev, notification]);
    return id;
  }, []);

  const dismissNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const dismissAll = useCallback(() => {
    setNotifications([]);
  }, []);

  return (
    <NotificationContext.Provider
      value={{ showNotification, dismissNotification, dismissAll }}
    >
      <View style={{ flex: 1 }}>
        {children}
        <View
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            pointerEvents: 'box-none',
            zIndex: 9999,
          }}
        >
          {notifications.map((n, i) => (
            <NotificationToast
              key={n.id}
              notification={n}
              onRemove={dismissNotification}
              index={i}
              isDesktop={desktop}
            />
          ))}
        </View>
      </View>
    </NotificationContext.Provider>
  );
};

export const useNotification = (): NotificationContextType => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error(
      'useNotification must be used within a NotificationProvider',
    );
  }
  return context;
};
