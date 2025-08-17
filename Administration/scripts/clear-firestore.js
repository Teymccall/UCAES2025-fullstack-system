const admin = require('firebase-admin');
const serviceAccount = require('../serviceAccountKey.json');

// Initialize Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

// List of collections to clear
const collections = [
  'students',
  'courses',
  'programs',
  'users',
  'fees',
  'feeAccounts',
  'registrations',
  'grades',
  'academic-years',
  'semesters',
  'course-assignments',
  'program-courses',
  'student-programs',
  'staff',
  'course-registrations',
  'announcements',
  'departments',
  'faculties',
  'results',
  'notifications',
  'payments',
  'payment-history',
  'academic-records'
];

// Function to delete all documents in a collection
async function deleteCollection(collectionName) {
  console.log(`Clearing collection: ${collectionName}...`);
  try {
    const snapshot = await db.collection(collectionName).get();
    
    if (snapshot.empty) {
      console.log(`Collection ${collectionName} is already empty.`);
      return 0;
    }
    
    // Delete each document
    const batch = db.batch();
    let count = 0;
    
    snapshot.docs.forEach(doc => {
      batch.delete(doc.ref);
      count++;
    });
    
    await batch.commit();
    console.log(`Deleted ${count} documents from ${collectionName}.`);
    return count;
  } catch (error) {
    console.error(`Error clearing collection ${collectionName}:`, error);
    return 0;
  }
}

// Main function to clear all collections
async function clearAllCollections() {
  console.log('Starting database cleanup...');
  
  let totalDeleted = 0;
  const results = {};
  
  for (const collectionName of collections) {
    const deleted = await deleteCollection(collectionName);
    totalDeleted += deleted;
    results[collectionName] = deleted;
  }
  
  console.log('\nDatabase cleanup complete.');
  console.log(`Total documents deleted: ${totalDeleted}`);
  console.log('\nSummary:');
  
  Object.entries(results)
    .sort((a, b) => b[1] - a[1])
    .forEach(([collection, count]) => {
      if (count > 0) {
        console.log(`- ${collection}: ${count} documents`);
      }
    });
  
  // Exit the process
  process.exit(0);
}

// Execute the main function
clearAllCollections().catch(error => {
  console.error('Error in clearAllCollections:', error);
  process.exit(1);
}); 