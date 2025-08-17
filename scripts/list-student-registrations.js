// Script to list course registrations for a student for a given academic year and semester
const admin = require('firebase-admin');
const serviceAccount = require('../new student portal/ucaes2025-firebase-adminsdk-fbsvc-9706f9c1a0.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

// Change these values to test
const studentId = process.argv[2]; // e.g. "STUDENT123"
const academicYear = process.argv[3]; // e.g. "2025-2026"
const semester = process.argv[4]; // e.g. "First"

async function listRegistrations() {
  if (!studentId || !academicYear || !semester) {
    console.log('Usage: node list-student-registrations.js <studentId> <academicYear> <semester>');
    process.exit(1);
  }

  const snapshot = await db.collection('courseRegistrations')
    .where('studentId', '==', studentId)
    .where('academicYear', '==', academicYear)
    .where('semester', '==', semester)
    .get();

  if (snapshot.empty) {
    console.log(`No registrations found for ${studentId} in ${academicYear} - ${semester}`);
  } else {
    console.log(`Registrations for ${studentId} in ${academicYear} - ${semester}:`);
    snapshot.forEach(doc => {
      console.log(doc.id, doc.data());
    });
  }
  process.exit(0);
}

listRegistrations();
