// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBEYbKntT6Os-nyAz20px5Qmkkt86LzOBQ",
  authDomain: "neoshala.firebaseapp.com",
  projectId: "neoshala",
  storageBucket: "neoshala.firebasestorage.app",
  messagingSenderId: "442565465571",
  appId: "1:442565465571:web:1ad0df6af84f3203d7bcd6",
  measurementId: "G-4ZQZ14HN78"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const auth = getAuth(app);
export const db = getFirestore(app);