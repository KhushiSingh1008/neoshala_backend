import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import { useAuth } from './AuthContext';
import { requestNotificationPermission, onMessageListener, getNotificationsForUser } from '../services/notificationService';
import { toast } from 'react-toastify';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

interface Notification {
  id: string;
  title: string;
  body: string;
  type: 'course_purchase' | 'payment_confirmation' | 'course_update';
  data?: any;
  read: boolean;
  createdAt: Date;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  markAsRead: (notificationId: string) => void;
  clearAll: () => void;
  fetchNotifications: () => Promise<void>;
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

  const fetchNotifications = useCallback(async () => {
    if (!user?._id) return;
    
    try {
      const result = await getNotificationsForUser(user._id);
      console.log('Fetched notifications:', result);
      
      if (result?.notifications) {
        // Map backend notifications to our format
        const mappedNotifications = result.notifications.map((notification: any) => ({
          id: notification._id,
          title: notification.title,
          body: notification.message,
          type: notification.type,
          data: notification.data,
          read: notification.read,
          createdAt: new Date(notification.createdAt)
        }));
        
        setNotifications(mappedNotifications);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  }, [user?._id]);

  useEffect(() => {
    if (user) {
      // Fetch notifications from the API
      fetchNotifications();
      
      // Request notification permission when user logs in
      requestNotificationPermission(user.id)
        .catch(error => console.error('Error requesting notification permission:', error));

      // Listen for foreground messages
      const messageListener = onMessageListener();
      messageListener
        .then((payload: any) => {
          if (!payload) return;
          
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
          
          // Refresh notifications after receiving a new one
          fetchNotifications();
        })
        .catch(err => console.error("Failed to receive foreground message:", err));

      return () => {
        // No cleanup needed for the promise-based listener
      };
    }
  }, [user, fetchNotifications]);

  const unreadCount = useMemo(() => notifications.filter(n => !n.read).length, [notifications]);

  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        console.error('Missing token for marking notification as read');
        return;
      }
      
      // Call the API to mark as read
      const response = await fetch(`${API_URL}/api/notifications/${notificationId}/read`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to mark notification as read');
      }
      
      // Update local state
      setNotifications(prev =>
        prev.map(notification =>
          notification.id === notificationId
            ? { ...notification, read: true }
            : notification
        )
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  }, []);

  const clearAll = useCallback(async () => {
    try {
      if (!user?._id) return;
      
      const token = localStorage.getItem('token');
      
      if (!token) {
        console.error('Missing token for clearing notifications');
        return;
      }
      
      // Call the API to clear all notifications
      const response = await fetch(`${API_URL}/api/notifications/user/${user._id}/clear`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to clear notifications');
      }
      
      // Clear the local state
      setNotifications([]);
      toast.success('All notifications cleared');
    } catch (error) {
      console.error('Error clearing notifications:', error);
      toast.error('Failed to clear notifications');
    }
  }, [user?._id]);

  const value = useMemo(() => ({
    notifications,
    unreadCount,
    markAsRead,
    clearAll,
    fetchNotifications
  }), [notifications, unreadCount, markAsRead, clearAll, fetchNotifications]);

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}; 