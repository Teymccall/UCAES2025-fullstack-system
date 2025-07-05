/**
 * Script to check for existing student registrations in Firebase
 * This will list the first 10 student registrations from the database
 */

const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, limit, query } = require('firebase/firestore');

// Firebase configuration
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

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function listStudentRegistrations() {
  try {
    console.log('Connecting to Firebase...');
    console.log(`Project ID: ${firebaseConfig.projectId}`);
    
    // Get reference to the student-registrations collection
    const registrationsRef = collection(db, 'student-registrations');
    
    // Create a query to get the first 10 registrations
    const q = query(registrationsRef, limit(10));
    
    console.log('Fetching student registrations...');
    
    // Execute the query
    const querySnapshot = await getDocs(q);
    
    // Check if we got any results
    if (querySnapshot.empty) {
      console.log('No student registrations found in the database.');
      return;
    }
    
    // Print the number of registrations
    console.log(`Found ${querySnapshot.size} student registrations:`);
    console.log('----------------------------------------');
    
    // Loop through the results
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      
      console.log(`ID: ${doc.id}`);
      console.log(`Registration Number: ${data.registrationNumber || 'Not assigned'}`);
      console.log(`Student Index: ${data.studentIndexNumber || 'Not assigned'}`);
      console.log(`Name: ${data.surname} ${data.otherNames}`);
      console.log(`Date of Birth: ${data.dateOfBirth || 'Not provided'}`);
      console.log(`Email: ${data.email}`);
      console.log(`Programme: ${data.programme || 'Not assigned'}`);
      console.log(`Status: ${data.status || 'Unknown'}`);
      console.log('----------------------------------------');
    });
  } catch (error) {
    console.error('Error fetching student registrations:', error);
  }
}

// Run the function
listStudentRegistrations().then(() => {
  console.log('Script completed.');
  process.exit(0);
}).catch((error) => {
  console.error('Script failed:', error);
  process.exit(1);
}); 