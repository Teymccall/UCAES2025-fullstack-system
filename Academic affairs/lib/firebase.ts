'use client';

import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";
import { getAuth, connectAuthEmulator } from "firebase/auth";
import { getStorage, connectStorageEmulator } from "firebase/storage";
// import { getAnalytics } from "firebase/analytics"; // Disabled to prevent API key errors

// Firebase configuration - updated to match working configuration
const firebaseConfig = {
  apiKey: "AIzaSyDGpAHia_wEmrhnmYjrPf1n1TrAyoIaOGI",
  authDomain: "ucaes2025.firebaseapp.com",
  projectId: "ucaes2025",
  storageBucket: "ucaes2025.firebasestorage.app",
  messagingSenderId: "581632635532",
  appId: "1:581632635532:web:bb6ce1f2c25266d37ec9ac",
  // measurementId: "G-PLACEHOLDER" // Analytics disabled
};

// Initialize Firebase with proper error handling
let app: any;
let auth: any;
let db: any;
let storage: any;
let analytics: any = null;

try {
  // Initialize Firebase if it hasn't been initialized already
  app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

  // Initialize Firebase services with error checking
  auth = getAuth(app);
  db = getFirestore(app);
  storage = getStorage(app);

  // Analytics disabled to prevent API key errors
  // if (typeof window !== 'undefined') {
  //   try {
  //     analytics = getAnalytics(app);
  //     console.log('Firebase Analytics initialized successfully');
  //   } catch (analyticsError) {
  //     console.warn('Firebase Analytics initialization failed (this is optional):', analyticsError);
  //     analytics = null;
  //   }
  // }

  console.log('Firebase initialized for academic affairs with project ID:', firebaseConfig.projectId);
  console.log('Database instance:', db ? 'SUCCESS' : 'FAILED');
} catch (error) {
  console.error('Firebase initialization error:', error);
  throw error;
}

// Export the initialized services
export { auth, db, storage };

export default app;
