// Script to check Firebase data for programs and courses

// Import Firebase modules
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs } = require('firebase/firestore');

// Firebase configuration from Academic affairs
const firebaseConfig = {
  apiKey: "AIzaSyCWj01Z1zScFJbTh5ChqsLEEZZdmBOjlUE",
  authDomain: "ucaes2025.firebaseapp.com",
  databaseURL: "https://ucaes2025-default-rtdb.firebaseio.com",
  projectId: "ucaes2025",
  storageBucket: "ucaes2025.appspot.com",
  messagingSenderId: "543217800581",
  appId: "1:543217800581:web:4f97ba0087f694deeea0ec",
  measurementId: "G-8E3518ML0D"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Collections to check
const collectionsToCheck = [
  'programs',
  'academic-programs',
  'courses',
  'academic-courses',
  'academic-years',
  'semesters'
];

// Function to check each collection
async function checkCollection(collectionName) {
  try {
    console.log(`\n--- Checking ${collectionName} collection ---`);
    const querySnapshot = await getDocs(collection(db, collectionName));
    
    console.log(`Found ${querySnapshot.size} documents in ${collectionName}`);
    
    if (querySnapshot.size > 0) {
      // Show sample data (first 2 documents)
      console.log("\nSample data:");
      querySnapshot.docs.slice(0, 2).forEach((doc) => {
        console.log(`ID: ${doc.id}`);
        console.log(JSON.stringify(doc.data(), null, 2));
        console.log("---");
      });
    }
  } catch (error) {
    console.error(`Error checking ${collectionName}:`, error);
  }
}

// Main function
async function checkAllCollections() {
  console.log("Starting Firebase data check...");
  
  for (const collectionName of collectionsToCheck) {
    await checkCollection(collectionName);
  }
  
  console.log("\nFirebase data check completed!");
}

// Run the check
checkAllCollections(); 