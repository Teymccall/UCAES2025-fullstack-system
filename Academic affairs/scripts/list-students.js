// Script to list all students in possible Firestore collections

const { initializeApp, applicationDefault } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

// Initialize Firebase Admin
initializeApp({
  credential: applicationDefault(),
});

const db = getFirestore();

// List of possible student collections to check
const collectionsToCheck = [
  'students',
  'student-registrations',
  'new student information/students',
  'new student portal/students',
  'Academic affairs/students',
];

async function listStudents() {
  for (const collectionPath of collectionsToCheck) {
    try {
      const snapshot = await db.collection(collectionPath).get();
      if (snapshot.empty) {
        console.log(`No students found in collection: ${collectionPath}`);
        continue;
      }
      console.log(`\n--- Students in collection: ${collectionPath} ---`);
      snapshot.forEach(doc => {
        const data = doc.data();
        console.log({
          id: doc.id,
          registrationNumber: data.registrationNumber || data.indexNumber || data.studentIndexNumber || 'N/A',
          name: data.name || `${data.surname || ''} ${data.otherNames || ''}`.trim(),
          program: data.program || data.programme || 'N/A',
          level: data.level || data.levelNumber || data.entryLevel || 'N/A',
          gender: data.gender || 'N/A',
          studyMode: data.studyMode || data.mode || 'N/A',
          status: data.status || 'N/A',
        });
      });
    } catch (error) {
      console.error(`Error reading collection ${collectionPath}:`, error.message);
    }
  }
}

listStudents().then(() => {
  console.log('\nDone listing students.');
  process.exit(0);
}); 