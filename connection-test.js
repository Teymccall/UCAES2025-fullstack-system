// connection-test.js
// Simple script to test Firebase connectivity

// Import Firebase modules
const { initializeApp } = require('firebase/app');
const { getAuth, signInAnonymously } = require('firebase/auth');
const { getFirestore, enableIndexedDbPersistence } = require('firebase/firestore');

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCWj01Z1zScFJbTh5ChqsLEEZZdmBOjlUE",
  authDomain: "ucaes2025.firebaseapp.com",
  databaseURL: "https://ucaes2025-default-rtdb.firebaseio.com",
  projectId: "ucaes2025",
  storageBucket: "ucaes2025.appspot.com",
  messagingSenderId: "543217800581",
  appId: "1:543217800581:web:4f97ba0087f694deeea0ec"
};

console.log('Starting Firebase connectivity test...');

async function testFirebaseConnectivity() {
  try {
    // Initialize Firebase
    console.log('Step 1: Initializing Firebase app...');
    const app = initializeApp(firebaseConfig);
    console.log('Firebase app initialized successfully');
    
    // Initialize Firestore
    console.log('Step 2: Initializing Firestore...');
    const db = getFirestore(app);
    console.log('Firestore initialized successfully');
    
    // Initialize Auth
    console.log('Step 3: Initializing Authentication...');
    const auth = getAuth(app);
    console.log('Authentication initialized successfully');
    
    // Try anonymous authentication
    console.log('Step 4: Testing anonymous authentication...');
    try {
      await signInAnonymously(auth);
      console.log('Anonymous authentication successful!');
      console.log('User:', auth.currentUser?.uid);
    } catch (authError) {
      console.error('Anonymous authentication failed:', authError);
    }
    
    // Try enabling offline persistence
    console.log('Step 5: Testing offline persistence...');
    try {
      await enableIndexedDbPersistence(db);
      console.log('Offline persistence enabled successfully');
    } catch (persistenceError) {
      if (persistenceError.code === 'failed-precondition') {
        console.error('Multiple tabs open, persistence can only be enabled in one tab at a time');
      } else if (persistenceError.code === 'unimplemented') {
        console.error('The current browser does not support all of the features required to enable persistence');
      } else {
        console.error('Error enabling persistence:', persistenceError);
      }
    }
    
    console.log('\nConnectivity test complete. If there are any errors above, they may indicate why your registration data is not being properly saved.');
    console.log('\nPossible issues:');
    console.log('1. Internet connectivity - Are you connected to the internet?');
    console.log('2. Firebase project status - Is your Firebase project active?');
    console.log('3. Firebase rules - Do the security rules allow writes to both collections?');
    console.log('4. Multiple tabs - Are multiple tabs creating conflicts?');
    
  } catch (error) {
    console.error('Error during Firebase connectivity test:', error);
  }
}

// Run the test
testFirebaseConnectivity().catch(error => {
  console.error('Fatal error during testing:', error);
}); 