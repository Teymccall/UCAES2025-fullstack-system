// test-firebase-connection.js
const admin = require('firebase-admin');
const path = require('path');

// Get the path to the service account key
const serviceAccountPath = path.join(process.cwd(), 'serviceAccountKey.json');
console.log('Looking for service account key at:', serviceAccountPath);

try {
  // Initialize Firebase Admin with explicit service account
  const serviceAccount = require(serviceAccountPath);
  console.log('Service account loaded successfully');
  
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: 'https://ucaes2025-default-rtdb.firebaseio.com'
  });
  
  console.log('Firebase Admin SDK initialized');
  
  const db = admin.firestore();
  
  async function checkStudentRegistrations() {
    try {
      console.log('Querying student-registrations collection...');
      
      const snapshot = await db.collection('student-registrations').limit(10).get();
      
      if (snapshot.empty) {
        console.log('No student registrations found in the database.');
        return;
      }
      
      console.log(`Found ${snapshot.size} student registrations:`);
      console.log('----------------------------------------');
      
      snapshot.forEach((doc) => {
        const data = doc.data();
        
        console.log(`ID: ${doc.id}`);
        console.log(`Registration Number: ${data.registrationNumber || 'Not assigned'}`);
        console.log(`Name: ${data.surname || ''} ${data.otherNames || ''}`);
        console.log(`Date of Birth: ${data.dateOfBirth || 'Not provided'}`);
        console.log(`Email: ${data.email || 'Not provided'}`);
        console.log('----------------------------------------');
      });
      
    } catch (error) {
      console.error('Error querying Firestore:', error);
    }
  }
  
  checkStudentRegistrations().then(() => {
    console.log('Done checking student registrations');
  }).catch(error => {
    console.error('Error in main function:', error);
  });
  
} catch (error) {
  console.error('Error initializing Firebase Admin SDK:', error);
} 