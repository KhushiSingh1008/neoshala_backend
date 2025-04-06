import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import { requestNotificationPermission, onMessageListener } from '../services/notificationService';
import { toast } from 'react-toastify';

interface Notification {
  id: string;
  title: string;
  body: string;
  type: 'course_purchase' | 'payment_confirmation';
  data?: any;
  read: boolean;
  createdAt: Date;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  markAsRead: (notificationId: string) => void;
  clearAll: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      // Request notification permission when user logs in
      requestNotificationPermission(user.id)
        .catch(error => console.error('Error requesting notification permission:', error));

      // Listen for foreground messages
      const unsubscribe = onMessageListener().then((payload: any) => {
        const notification: Notification = {
          id: Date.now().toString(),
          title: payload.notification.title,
          body: payload.notification.body,
          type: payload.data.type,
          data: payload.data,
          read: false,
          createdAt: new Date()
        };

        setNotifications(prev => [notification, ...prev]);
        
        // Show toast notification
        toast.info(
          <div>
            <h4>{notification.title}</h4>
            <p>{notification.body}</p>
          </div>
        );
      });

      return () => {
        if (typeof unsubscribe === 'function') {
          unsubscribe();
        }
      };
    }
  }, [user]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = (notificationId: string) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === notificationId
          ? { ...notification, read: true }
          : notification
      )
    );
  };

  const clearAll = () => {
    setNotifications([]);
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        markAsRead,
        clearAll
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}; 