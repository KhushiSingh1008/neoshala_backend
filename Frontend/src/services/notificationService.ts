import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import { app } from '../firebase/firebaseConfig';
import { doc, setDoc, collection, addDoc } from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';
import { toast } from 'react-toastify';

const messaging = getMessaging(app);

// Request permission and get FCM token
export const requestNotificationPermission = async (userId: string) => {
  try {
    // First check if the browser supports notifications
    if (!('Notification' in window)) {
      throw new Error('This browser does not support notifications');
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
  return new Promise((resolve) => {
    onMessage(messaging, (payload) => {
      resolve(payload);
    });
  });
};

// Save notification to Firestore
export const saveNotification = async (userId: string, notification: {
  title: string;
  body: string;
  type: 'course_purchase' | 'payment_confirmation';
  data?: any;
}) => {
  try {
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