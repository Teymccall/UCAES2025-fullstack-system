// Simple Firebase debug script
console.log('Starting simple Firebase debug script...');

// Import Firebase modules
const firebase = require('firebase/app');

// Firebase configuration from your project
const firebaseConfig = {
  apiKey: "AIzaSyCWj01Z1zScFJbTh5ChqsLEEZZdmBOjlUE",
  authDomain: "ucaes2025.firebaseapp.com",
  projectId: "ucaes2025",
};

try {
  // Initialize Firebase
  console.log('Initializing Firebase...');
  const app = firebase.initializeApp(firebaseConfig);
  console.log('Firebase initialized successfully with project:', app.options.projectId);
} catch (error) {
  console.error('Error initializing Firebase:', error);
} 