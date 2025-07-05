// check-student-registration.js

const { initializeApp, applicationDefault } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

// Initialize Firebase Admin SDK
initializeApp({
  credential: applicationDefault(),
});

const db = getFirestore();

async function main() {
  try {
    const snapshot = await db.collection('student-registrations').limit(1).get();
    if (snapshot.empty) {
      console.log('No student registrations found.');
      return;
    }
    snapshot.forEach(doc => {
      console.log('Document ID:', doc.id);
      console.log('Data:', JSON.stringify(doc.data(), null, 2));
    });
  } catch (error) {
    console.error('Error fetching student registration:', error);
  }
}

main(); 