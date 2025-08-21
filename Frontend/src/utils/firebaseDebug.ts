import { auth, db } from '../firebase/firebaseConfig';
import { connectAuthEmulator, connectFirestoreEmulator } from 'firebase/auth';

export const debugFirebaseConfig = () => {
  console.log('🔥 Firebase Debug Information:');
  console.log('Auth Domain:', import.meta.env.VITE_FIREBASE_AUTH_DOMAIN);
  console.log('Project ID:', import.meta.env.VITE_FIREBASE_PROJECT_ID);
  console.log('API Key exists:', !!import.meta.env.VITE_FIREBASE_API_KEY);
  console.log('Auth instance:', auth);
  console.log('Firestore instance:', db);
  console.log('Current user:', auth.currentUser);
  
  // Check if we're in development mode
  if (import.meta.env.DEV) {
    console.log('🚧 Running in development mode');
  }
  
  // Check environment variables
  const requiredEnvVars = [
    'VITE_FIREBASE_API_KEY',
    'VITE_FIREBASE_AUTH_DOMAIN',
    'VITE_FIREBASE_PROJECT_ID',
    'VITE_FIREBASE_STORAGE_BUCKET',
    'VITE_FIREBASE_MESSAGING_SENDER_ID',
    'VITE_FIREBASE_APP_ID'
  ];
  
  const missingVars = requiredEnvVars.filter(varName => !import.meta.env[varName]);
  
  if (missingVars.length > 0) {
    console.error('❌ Missing environment variables:', missingVars);
  } else {
    console.log('✅ All required environment variables are present');
  }
};

// Call this function to debug Firebase setup
if (import.meta.env.DEV) {
  debugFirebaseConfig();
}