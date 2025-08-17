// Script to check registration IDs in Firebase
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
  measurementId: "G-8E3518ML0D"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function checkRegistrationIds() {
  try {
    console.log('Checking registration IDs in Firebase...');
    
    // Collections to check
    const collectionsToCheck = [
      'student-registrations',
      'registered-students',
      'students'
    ];
    
    for (const collectionName of collectionsToCheck) {
      try {
        console.log(`\nChecking ${collectionName} collection:`);
        const querySnapshot = await getDocs(collection(db, collectionName));
        
        console.log(`Found ${querySnapshot.size} documents in ${collectionName}`);
        
        if (querySnapshot.size > 0) {
          // Check for ID fields in each document
          const idFields = {
            studentId: 0,
            registrationId: 0,
            studentIndexNumber: 0,
            indexNumber: 0,
            nationalId: 0,
            documentId: querySnapshot.size // All documents have a document ID
          };
          
          // Check each document for ID fields
          querySnapshot.forEach(doc => {
            const data = doc.data();
            
            if (data.studentId) idFields.studentId++;
            if (data.registrationId) idFields.registrationId++;
            if (data.studentIndexNumber) idFields.studentIndexNumber++;
            if (data.indexNumber) idFields.indexNumber++;
            if (data.nationalId) idFields.nationalId++;
          });
          
          console.log('ID fields found:');
          Object.entries(idFields).forEach(([field, count]) => {
            console.log(`- ${field}: ${count} documents (${Math.round(count / querySnapshot.size * 100)}%)`);
          });
          
          // Show examples of each ID type
          console.log('\nExample IDs:');
          const exampleDoc = querySnapshot.docs[0].data();
          const docId = querySnapshot.docs[0].id;
          
          console.log(`- Document ID: ${docId}`);
          if (exampleDoc.studentId) console.log(`- studentId: ${exampleDoc.studentId}`);
          if (exampleDoc.registrationId) console.log(`- registrationId: ${exampleDoc.registrationId}`);
          if (exampleDoc.studentIndexNumber) console.log(`- studentIndexNumber: ${exampleDoc.studentIndexNumber}`);
          if (exampleDoc.indexNumber) console.log(`- indexNumber: ${exampleDoc.indexNumber}`);
          if (exampleDoc.nationalId) console.log(`- nationalId: ${exampleDoc.nationalId}`);
          
          // Show the first 5 documents with their IDs
          console.log('\nFirst 5 documents with IDs:');
          querySnapshot.docs.slice(0, 5).forEach(doc => {
            const data = doc.data();
            console.log(`Document ${doc.id}:`);
            console.log(`- studentId: ${data.studentId || 'N/A'}`);
            console.log(`- registrationId: ${data.registrationId || 'N/A'}`);
            console.log(`- studentIndexNumber: ${data.studentIndexNumber || 'N/A'}`);
            console.log(`- indexNumber: ${data.indexNumber || 'N/A'}`);
            console.log(`- nationalId: ${data.nationalId || 'N/A'}`);
            console.log('---');
          });
        }
      } catch (error) {
        console.error(`Error checking ${collectionName}:`, error);
      }
    }
    
  } catch (error) {
    console.error('Error checking registration IDs:', error);
  }
}

checkRegistrationIds(); 