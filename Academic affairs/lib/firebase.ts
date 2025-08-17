'use client';

import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";
import { getAuth, connectAuthEmulator } from "firebase/auth";
import { getStorage, connectStorageEmulator } from "firebase/storage";
import { getAnalytics } from "firebase/analytics";

// Firebase configuration - matches new student portal and student information system
const firebaseConfig = {
  apiKey: "AIzaSyCWj01Z1zScFJbTh5ChqsLEEZZdmBOjlUE",
  authDomain: "ucaes2025.firebaseapp.com",
  databaseURL: "https://ucaes2025-default-rtdb.firebaseio.com",
  projectId: "ucaes2025",
  storageBucket: "ucaes2025.firebasestorage.app",
  messagingSenderId: "543217800581",
  appId: "1:543217800581:web:4f97ba0087f694deeea0ec",
  measurementId: "G-8E3518ML0D"
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

  // Initialize Analytics only in browser environment
  if (typeof window !== 'undefined') {
    analytics = getAnalytics(app);
  }

  console.log('Firebase initialized for academic affairs with project ID:', firebaseConfig.projectId);
  console.log('Database instance:', db ? 'SUCCESS' : 'FAILED');
} catch (error) {
  console.error('Firebase initialization error:', error);
  throw error;
}

// Export the initialized services
export { auth, db, storage };

export default app;
