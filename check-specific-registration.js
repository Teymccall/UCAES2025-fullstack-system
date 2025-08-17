// check-specific-registration.js
// This script checks for a specific registration ID in both collections

const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, query, where, doc, getDoc } = require('firebase/firestore');

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

console.log('Starting specific registration check...');
console.log('Looking for registration ID: 9T1HfMWxfvWIkmOrKaBn');

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Function to check a specific document in a collection
async function checkSpecificDoc(collectionName, docId) {
  console.log(`\n===== CHECKING FOR DOCUMENT ${docId} IN ${collectionName} =====`);
  
  try {
    const docRef = doc(db, collectionName, docId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      console.log(`Document found in ${collectionName}!`);
      console.log('Document data:', JSON.stringify(docSnap.data(), null, 2));
      return true;
    } else {
      console.log(`Document not found in ${collectionName} with ID: ${docId}`);
      return false;
    }
  } catch (error) {
    console.error(`Error checking document in ${collectionName}:`, error);
    return false;
  }
}

// Function to check if a document exists with registrationId field
async function checkDocWithRegistrationId(collectionName, registrationId) {
  console.log(`\n===== CHECKING FOR DOCUMENTS WITH registrationId: ${registrationId} IN ${collectionName} =====`);
  
  try {
    const q = query(collection(db, collectionName), where("registrationId", "==", registrationId));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      console.log(`No documents found in ${collectionName} with registrationId: ${registrationId}`);
      return false;
    }
    
    console.log(`Found ${querySnapshot.size} document(s) in ${collectionName} with matching registrationId:`);
    querySnapshot.forEach((doc) => {
      console.log(`Document ID: ${doc.id}`);
      console.log('Document data:', JSON.stringify(doc.data(), null, 2));
    });
    return true;
  } catch (error) {
    console.error(`Error querying ${collectionName}:`, error);
    return false;
  }
}

// Function to check all documents in a collection
async function checkAllDocsInCollection(collectionName) {
  console.log(`\n===== LISTING ALL DOCUMENTS IN ${collectionName} =====`);
  
  try {
    const querySnapshot = await getDocs(collection(db, collectionName));
    
    if (querySnapshot.empty) {
      console.log(`No documents found in ${collectionName} collection.`);
      return;
    }
    
    console.log(`Found ${querySnapshot.size} document(s) in ${collectionName} collection:`);
    querySnapshot.forEach((doc) => {
      console.log(`\nDocument ID: ${doc.id}`);
      // Print only key fields to reduce output size
      const data = doc.data();
      const summary = {
        email: data.email || 'N/A',
        name: `${data.surname || ''} ${data.otherNames || ''}`.trim() || 'N/A',
        registrationNumber: data.registrationNumber || 'N/A',
        status: data.status || 'N/A',
        registrationId: data.registrationId || 'N/A',
      };
      console.log('Summary:', summary);
    });
  } catch (error) {
    console.error(`Error listing documents in ${collectionName}:`, error);
  }
}

// Main function
async function main() {
  try {
    // Check for the specific registration ID in student-registrations collection
    console.log("\n\n----- PART 1: DIRECT ID LOOKUP -----");
    const registrationFound = await checkSpecificDoc('student-registrations', '9T1HfMWxfvWIkmOrKaBn');
    
    // Check for documents in students collection with this registrationId
    console.log("\n\n----- PART 2: REFERENCE LOOKUP -----");
    const studentWithRegIdFound = await checkDocWithRegistrationId('students', '9T1HfMWxfvWIkmOrKaBn');
    
    // If we didn't find the specific registration, list all documents to see what's there
    if (!registrationFound || !studentWithRegIdFound) {
      console.log("\n\n----- PART 3: LISTING ALL DOCUMENTS -----");
      console.log("Since the specific registration wasn't found, listing all documents for inspection:");
      await checkAllDocsInCollection('student-registrations');
      await checkAllDocsInCollection('students');
    }
    
    console.log('\nCheck completed.');
  } catch (error) {
    console.error('Error in main function:', error);
  }
}

// Run the script
main().catch(console.error); 