import { Auth, User } from 'firebase/auth';
import { Firestore } from 'firebase/firestore';
import { FirebaseApp } from 'firebase/app';
import { auth as firebaseAuth, db as firebaseDb, app as firebaseApp, isFirebaseConfigured } from '../firebase/firebaseConfig';

export const checkFirebaseConnection = async () => {
  console.log('🔥 Checking Firebase Connection...');
  
  try {
    // If config is missing, avoid accessing undefined instances
    if (!isFirebaseConfigured || !firebaseApp || !firebaseAuth || !firebaseDb) {
      console.warn('Firebase is not fully configured. Skipping deep connection checks.');
      console.log('Environment Variables Check:');
      console.log('VITE_FIREBASE_API_KEY exists:', !!import.meta.env.VITE_FIREBASE_API_KEY);
      console.log('VITE_FIREBASE_AUTH_DOMAIN exists:', !!import.meta.env.VITE_FIREBASE_AUTH_DOMAIN);
      console.log('VITE_FIREBASE_PROJECT_ID exists:', !!import.meta.env.VITE_FIREBASE_PROJECT_ID);
      return false;
    }

    const app = firebaseApp as FirebaseApp;
    const auth = firebaseAuth as Auth;
    const db = firebaseDb as Firestore;

    // Check Firebase App
    console.log('Firebase App initialized:', !!app);
    console.log('Firebase App name:', app.name);

    // Check Auth
    console.log('Auth instance:', !!auth);
    console.log('Auth initialized:', (auth as any).app === app);
    
    // Check Firestore
    console.log('Firestore instance:', !!db);
    console.log('Firestore initialized:', (db as any).app === app);
    
    // Test connection by trying to get current user
    console.log('Current user:', auth.currentUser);
    
    // Add auth state listener
    const unsubscribe = auth.onAuthStateChanged(
      (user: User | null) => {
        console.log('Auth state changed:', user ? `User logged in (${user?.email})` : 'No user');
        if (user) {
          console.log('User ID:', user.uid);
          console.log('Email verified:', user.emailVerified);
        }
      },
      (error: Error) => {
        console.error('Auth state change error:', error);
      }
    );

    // Cleanup listener after 5 seconds to prevent memory leaks
    setTimeout(() => {
      unsubscribe();
      console.log('Auth state listener cleaned up');
    }, 5000);
    
    // Check environment variables
    console.log('Environment Variables Check:');
    console.log('VITE_FIREBASE_API_KEY exists:', !!import.meta.env.VITE_FIREBASE_API_KEY);
    console.log('VITE_FIREBASE_AUTH_DOMAIN exists:', !!import.meta.env.VITE_FIREBASE_AUTH_DOMAIN);
    console.log('VITE_FIREBASE_PROJECT_ID exists:', !!import.meta.env.VITE_FIREBASE_PROJECT_ID);
    
    console.log('✅ Firebase instances are properly initialized');
    return true;
  } catch (error) {
    console.error('❌ Firebase connection error:', error);
    if (error instanceof Error) {
      console.error('Error details:', error.message);
      console.error('Error stack:', error.stack);
    }
    return false;
  }
};

// Call this function to test Firebase connection in development
if (import.meta.env.DEV) {
  checkFirebaseConnection().then(success => {
    console.log('Firebase connection check completed:', success ? '✅ Success' : '❌ Failed');
  });
}