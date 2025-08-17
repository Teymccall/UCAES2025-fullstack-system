// simple-check.js - A simpler script with more error logging

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

console.log('Starting simple Firebase check with detailed error logging...');

// Initialize Firebase with error handling
let app;
let db;
try {
  console.log('Initializing Firebase...');
  app = initializeApp(firebaseConfig);
  console.log('Firebase app initialized successfully');
  
  db = getFirestore(app);
  console.log('Firestore initialized successfully');
} catch (error) {
  console.error('Error initializing Firebase:', error);
  process.exit(1);
}

// Simpler function to check collections
async function checkCollection(collectionName) {
  console.log(`\n===== CHECKING ${collectionName} COLLECTION =====`);
  
  try {
    console.log(`Fetching documents from ${collectionName}...`);
    const querySnapshot = await getDocs(collection(db, collectionName));
    
    if (querySnapshot.empty) {
      console.log(`No documents found in ${collectionName} collection.`);
      return;
    }
    
    console.log(`Found ${querySnapshot.size} document(s) in ${collectionName} collection.`);
    
    // Only print the first document as a sample
    if (querySnapshot.size > 0) {
      console.log(`\nSample document data:`);
      const doc = querySnapshot.docs[0];
      console.log(`ID: ${doc.id}`);
      try {
        const data = doc.data();
        console.log(`Data: ${JSON.stringify(data, null, 2)}`);
      } catch (error) {
        console.error(`Error accessing document data:`, error);
      }
    }
    
    // List all document IDs
    console.log(`\nAll document IDs in ${collectionName}:`);
    querySnapshot.forEach((doc, index) => {
      console.log(`${index + 1}. ${doc.id}`);
    });
    
  } catch (error) {
    console.error(`Error checking ${collectionName} collection:`, error.message);
    console.error(`Stack trace:`, error.stack);
  }
}

// Main function
async function main() {
  try {
    // Check both collections
    await checkCollection('student-registrations');
    await checkCollection('students');
    
    console.log('\nCheck completed successfully.');
  } catch (error) {
    console.error('\nError in main function:', error.message);
    console.error('Stack trace:', error.stack);
  }
}

// Add global error handler
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Run the script with a timeout
console.log('Running main function...');
main().catch(error => {
  console.error('Error caught in main:', error);
}).finally(() => {
  // Add a delay before exit to ensure Firebase operations complete
  console.log('Finishing execution...');
  setTimeout(() => {
    console.log('Script completed.');
  }, 5000);
}); 