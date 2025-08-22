// Server-side Firebase configuration for API routes
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDGpAHia_wEmrhnmYjrPf1n1TrAyoIaOGI",
  authDomain: "ucaes2025.firebaseapp.com",
  projectId: "ucaes2025",
  storageBucket: "ucaes2025.firebasestorage.app",
  messagingSenderId: "581632635532",
  appId: "1:581632635532:web:bb6ce1f2c25266d37ec9ac"
};

// Initialize Firebase for server-side use
let app: any;
let db: any;

try {
  // Initialize Firebase if it hasn't been initialized already
  app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
  
  // Get Firestore instance
  db = getFirestore(app);
  
  console.log('✅ Server-side Firebase initialized for API routes');
} catch (error) {
  console.error('❌ Server-side Firebase initialization failed:', error);
  throw error;
}

export { db };
export default app;