// check-both-collections.js
// This script checks both student-registrations and students collections

const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs } = require('firebase/firestore');

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCWj01Z1zScFJbTh5ChqsLEEZZdmBOjlUE",
  authDomain: "ucaes2025.firebaseapp.com",
  databaseURL: "https://ucaes2025-default-rtdb.firebaseio.com",
  projectId: "ucaes2025",
  storageBucket: "ucaes2025.appspot.com",
  messagingSenderId: "543217800581",
  appId: "1:543217800581:web:4f97ba0087f694deeea0ec",
};

console.log('Starting collection check script...');

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Function to check a collection
async function checkCollection(collectionName) {
  console.log(`\n\n===== CHECKING ${collectionName.toUpperCase()} COLLECTION =====`);
  
  try {
    const querySnapshot = await getDocs(collection(db, collectionName));
    
    if (querySnapshot.empty) {
      console.log(`No documents found in ${collectionName} collection.`);
      return;
    }
    
    console.log(`Found ${querySnapshot.size} document(s) in ${collectionName} collection:`);
    
    let index = 1;
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      console.log(`\n--- Document ${index} ---`);
      console.log(`ID: ${doc.id}`);
      
      // Print common student fields if they exist
      if (data.surname) console.log(`Name: ${data.surname} ${data.otherNames || ''}`);
      if (data.email) console.log(`Email: ${data.email}`);
      if (data.registrationNumber) console.log(`Registration #: ${data.registrationNumber}`);
      if (data.status) console.log(`Status: ${data.status}`);
      if (data.programme) console.log(`Programme: ${data.programme}`);
      
      // If the document belongs to students collection and has a reference
      if (collectionName === 'students' && data.registrationId) {
        console.log(`Registration Reference: ${data.registrationId}`);
      }
      
      index++;
    });
    
  } catch (error) {
    console.error(`Error checking ${collectionName} collection:`, error);
  }
}

// Main function
async function main() {
  try {
    // First check student-registrations
    await checkCollection('student-registrations');
    
    // Then check students collection
    await checkCollection('students');
    
    console.log('\nCheck completed.');
  } catch (error) {
    console.error('Error in main function:', error);
  }
}

// Run the script
main().catch(console.error); 