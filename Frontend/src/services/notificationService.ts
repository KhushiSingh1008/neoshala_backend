import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import { doc, setDoc, collection, addDoc } from 'firebase/firestore';
import { db, app, isFirebaseConfigured } from '../firebase/firebaseConfig';
import { toast } from 'react-toastify';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Initialize messaging safely only if Firebase is configured and running in a browser
let messaging: ReturnType<typeof getMessaging> | null = null;
try {
  if (isFirebaseConfigured && app && typeof window !== 'undefined' && 'Notification' in window) {
    messaging = getMessaging(app);
  } else {
    console.warn('Firebase messaging is not initialized (missing config or unsupported environment).');
  }
} catch (e) {
  console.error('Failed to initialize Firebase messaging:', e);
  messaging = null;
}

// Request permission and get FCM token
export const requestNotificationPermission = async (userId: string) => {
  try {
    if (!isFirebaseConfigured || !app || !db) {
      console.warn('Notifications are not configured. Skipping permission request.');
      throw new Error('Notifications are not configured');
    }

    // First check if the browser supports notifications
    if (typeof window === 'undefined' || !('Notification' in window)) {
      throw new Error('This browser does not support notifications');
    }

    if (!messaging) {
      console.warn('Firebase messaging is unavailable');
      throw new Error('Notifications are unavailable');
    }

    // Request permission
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      // Get FCM token with your VAPID key
      const token = await getToken(messaging, {
        vapidKey: "BPQvPDqQXwkSBpWKtGYFB_1yKVkGzXqK5lNxYHYxXQ_FV2ZJ2TxzYVLe5Hs-FqU5z3x9c-vQKwVX7yRJYqLNZ-M"
      });

      if (!token) {
        throw new Error('Failed to get notification token');
      }

      // Store the token in Firestore
      await setDoc(doc(db, 'users', userId), {
        fcmToken: token,
        notificationsEnabled: true
      }, { merge: true });

      toast.success('Notifications enabled successfully!');
      return token;
    }
    
    if (permission === 'denied') {
      toast.error('Please enable notifications in your browser settings to receive updates');
      throw new Error('Notification permission denied');
    }

    throw new Error('Notification permission not granted');
  } catch (error: any) {
    console.error('Error getting notification permission:', error);
    toast.error(error.message || 'Failed to enable notifications');
    throw error;
  }
};

// Handle foreground messages
export const onMessageListener = () => {
  if (!messaging) {
    // Return a resolved promise with null when messaging isn't available
    return Promise.resolve(null as any);
  }
  return new Promise((resolve) => {
    onMessage(messaging!, (payload) => {
      resolve(payload);
    });
  });
};

// Save notification to Firestore
export const saveNotification = async (userId: string, notification: {
  title: string;
  body: string;
  type: 'course_purchase' | 'payment_confirmation' | 'course_update';
  data?: any;
}) => {
  try {
    if (!isFirebaseConfigured || !db) return null;

    const notificationRef = await addDoc(collection(db, 'users', userId, 'notifications'), {
      ...notification,
      read: false,
      createdAt: new Date()
    });

    return notificationRef.id;
  } catch (error) {
    console.error('Error saving notification:', error);
    // Don't throw error here to prevent blocking the main flow
    return null;
  }
};

// Send course purchase notification
export const sendCoursePurchaseNotification = async (
  userId: string,
  courseTitle: string,
  paymentDetails: {
    amount: number;
    currency: string;
    transactionId: string;
  }
) => {
  try {
    const notification = {
      title: 'Course Purchase Successful!',
      body: `You have successfully purchased ${courseTitle}`,
      type: 'course_purchase' as const,
      data: {
        courseTitle,
        paymentDetails
      }
    };

    const notificationId = await saveNotification(userId, notification);
    if (notificationId) {
      toast.success('Purchase notification sent!');
    }
  } catch (error) {
    console.error('Error sending course purchase notification:', error);
    // Don't throw error here to prevent blocking the main flow
  }
};

// Function for course rejection notification
export const sendCourseRejectionNotification = async (
  userId: string,
  courseTitle: string,
  rejectionReason: string
) => {
  try {
    const notification = {
      title: 'Course Rejected',
      body: `Your course "${courseTitle}" has been rejected. Reason: ${rejectionReason}`,
      type: 'course_update' as const,
      data: {
        courseTitle,
        rejectionReason,
        status: 'rejected'
      }
    };

    const notificationId = await saveNotification(userId, notification);
    if (notificationId) {
      toast.error('Your course was rejected');
    }
  } catch (error) {
    console.error('Error sending course rejection notification:', error);
    // Don't throw error here to prevent blocking the main flow
  }
};

// Function to get notifications for a user
export const getNotificationsForUser = async (userId: string) => {
  try {
    const token = localStorage.getItem('token');
    
    if (!token || !userId) {
      console.error('Missing token or userId for fetching notifications');
      return { notifications: [], unreadCount: 0 };
    }
    
    console.log(`Fetching notifications for user ${userId}`);
    
    const response = await fetch(`${API_URL}/api/notifications/${userId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('Error response from notifications API:', errorData);
      throw new Error(errorData.message || 'Failed to fetch notifications');
    }
    
    const data = await response.json();
    console.log('Notifications fetched successfully:', data);
    return data;
  } catch (error) {
    console.error('Failed to fetch notifications:', error);
    return { notifications: [], unreadCount: 0 };
  }
}; 