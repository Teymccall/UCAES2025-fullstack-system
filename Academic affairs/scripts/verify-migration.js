const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const fs = require('fs');
const path = require('path');

// Initialize Firebase Admin
try {
  let serviceAccount;
  try {
    // Look for service account key in several locations
    const possiblePaths = [
      '../serviceAccountKey.json', 
      '../../new student portal/serviceAccountKey.json',
      '../../new student information/serviceAccountKey.json'
    ];
    
    for (const relativePath of possiblePaths) {
      try {
        const fullPath = path.join(__dirname, relativePath);
        if (fs.existsSync(fullPath)) {
          serviceAccount = require(fullPath);
          console.log(`Using service account from: ${relativePath}`);
          break;
        }
      } catch (err) {
        // Continue to next path
      }
    }
    
    // If no file found, check for environment variable
    if (!serviceAccount) {
      if (process.env.FIREBASE_SERVICE_ACCOUNT) {
        serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
        console.log('Using service account from environment variable');
      } else {
        throw new Error('No service account key found');
      }
    }
  } catch (err) {
    console.log('Service account key not found, checking for environment variable...');
    if (process.env.FIREBASE_SERVICE_ACCOUNT) {
      serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    } else {
      throw new Error('No service account key found');
    }
  }

  initializeApp({
    credential: cert(serviceAccount),
    databaseURL: 'https://ucaes2025-default-rtdb.firebaseio.com',
    projectId: 'ucaes2025'
  });

  console.log('Firebase Admin initialized successfully for project: ucaes2025');
} catch (error) {
  console.error('Error initializing Firebase Admin:', error);
  process.exit(1);
}

const db = getFirestore();

// Collections to verify
const collections = [
  'academic-programs',
  'academic-courses',
  'academic-years',
  'academic-semesters',
  'academic-staff'
];

// Function to count documents in a collection
async function countDocuments(collectionName) {
  const snapshot = await db.collection(collectionName).get();
  return snapshot.size;
}

// Function to get a sample document from a collection
async function getSampleDocument(collectionName) {
  const snapshot = await db.collection(collectionName).limit(1).get();
  if (snapshot.empty) {
    return null;
  }
  
  const doc = snapshot.docs[0];
  return {
    id: doc.id,
    ...doc.data()
  };
}

// Function to check if a collection exists
async function collectionExists(collectionName) {
  try {
    const collections = await db.listCollections();
    return collections.some(collection => collection.id === collectionName);
  } catch (error) {
    console.error(`Error checking if collection ${collectionName} exists:`, error);
    return false;
  }
}

// Main verification function
async function verifyMigration() {
  console.log('=== FIREBASE MIGRATION VERIFICATION ===');
  console.log('Project ID:', 'ucaes2025');
  console.log('Verifying collections...\n');
  
  let allCollectionsExist = true;
  
  for (const collectionName of collections) {
    const exists = await collectionExists(collectionName);
    
    if (exists) {
      const count = await countDocuments(collectionName);
      console.log(`✅ Collection ${collectionName} exists with ${count} documents`);
      
      if (count > 0) {
        const sample = await getSampleDocument(collectionName);
        console.log(`   Sample document ID: ${sample.id}`);
        console.log(`   Fields: ${Object.keys(sample).filter(key => key !== 'id').join(', ')}`);
      }
    } else {
      console.log(`❌ Collection ${collectionName} does not exist`);
      allCollectionsExist = false;
    }
    
    console.log();
  }
  
  if (allCollectionsExist) {
    console.log('✅ All collections verified successfully!');
    console.log('Migration appears to be complete.');
  } else {
    console.log('❌ Some collections are missing.');
    console.log('Please run the seed-academic-data.js script to populate missing collections.');
  }
}

// Run the verification
verifyMigration()
  .then(() => {
    console.log('Verification complete');
    process.exit(0);
  })
  .catch(error => {
    console.error('Error during verification:', error);
    process.exit(1);
  }); 