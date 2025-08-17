// debug-firebase.js
// This script tests the client-side Firebase initialization and connection

// Import Firebase modules
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs } = require('firebase/firestore');

// Firebase configuration from your project
const firebaseConfig = {
  apiKey: "AIzaSyCWj01Z1zScFJbTh5ChqsLEEZZdmBOjlUE",
  authDomain: "ucaes2025.firebaseapp.com",
  databaseURL: "https://ucaes2025-default-rtdb.firebaseio.com",
  projectId: "ucaes2025",
  storageBucket: "ucaes2025.appspot.com",
  messagingSenderId: "543217800581",
  appId: "1:543217800581:web:4f97ba0087f694deeea0ec",
  measurementId: "G-8E3518ML0D",
};

console.log('Starting Firebase debug script...');
console.log('Firebase Config:', {
  projectId: firebaseConfig.projectId,
  databaseURL: firebaseConfig.databaseURL,
  authDomain: firebaseConfig.authDomain
});

try {
  // Initialize Firebase
  console.log('Initializing Firebase...');
  const app = initializeApp(firebaseConfig);
  console.log('Firebase initialized successfully');

  // Initialize Firestore
  console.log('Getting Firestore instance...');
  const db = getFirestore(app);
  console.log('Firestore instance acquired');

  // Query student registrations
  async function checkStudentRegistrations() {
    try {
      console.log('Attempting to query student-registrations collection...');
      
      const querySnapshot = await getDocs(collection(db, "student-registrations"));
      
      if (querySnapshot.empty) {
        console.log('No student registrations found in the database.');
        return;
      }
      
      console.log(`Found ${querySnapshot.size} student registrations:`);
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        console.log('----------------------------------------');
        console.log(`ID: ${doc.id}`);
        console.log(`Registration Number: ${data.registrationNumber || 'Not assigned'}`);
        console.log(`Name: ${data.surname || ''} ${data.otherNames || ''}`);
        console.log(`Email: ${data.email || 'Not provided'}`);
        console.log(`Status: ${data.status || 'Unknown'}`);
        console.log('----------------------------------------');
      });
      
    } catch (error) {
      console.error('Error querying Firestore:', error);
    }
  }
  
  // Execute the check function
  checkStudentRegistrations()
    .then(() => console.log('Script completed successfully'))
    .catch(error => console.error('Error executing script:', error));
  
} catch (error) {
  console.error('Error initializing Firebase:', error);
} 