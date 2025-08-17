// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app"
import { getAnalytics } from "firebase/analytics"
import { getFirestore } from "firebase/firestore"
import { getStorage } from "firebase/storage"
import { getAuth, signInAnonymously } from "firebase/auth"
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCWj01Z1zScFJbTh5ChqsLEEZZdmBOjlUE",
  authDomain: "ucaes2025.firebaseapp.com",
  databaseURL: "https://ucaes2025-default-rtdb.firebaseio.com",
  projectId: "ucaes2025",
  storageBucket: "ucaes2025.firebasestorage.app",
  messagingSenderId: "543217800581",
  appId: "1:543217800581:web:4f97ba0087f694deeea0ec",
  measurementId: "G-8E3518ML0D",
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)

// Initialize Firebase services
export const db = getFirestore(app)
export const storage = getStorage(app)
export const auth = getAuth(app)

// Initialize auth state without automatic anonymous sign-in
// Anonymous auth can conflict with user registration
if (typeof window !== 'undefined') {
  auth.onAuthStateChanged((user) => {
    if (user) {
      console.log("Firebase: User authenticated:", user.uid);
    } else {
      console.log("Firebase: No user authenticated");
    }
  });
}

// Initialize Analytics only on client side
export const analytics = typeof window !== "undefined" ? getAnalytics(app) : null

// Log initialization for debugging
console.log("Firebase initialized with project:", firebaseConfig.projectId);
console.log("Storage bucket:", firebaseConfig.storageBucket);

export default app
