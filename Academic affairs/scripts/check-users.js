const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

try {
  // Try to find or create a service account key file
  let serviceAccount;
  const serviceAccountPath = path.join(__dirname, '../serviceAccountKey.json');
  
  if (fs.existsSync(serviceAccountPath)) {
    serviceAccount = require(serviceAccountPath);
    console.log('Found existing service account key');
  } else {
    console.error('Service account key not found at:', serviceAccountPath);
    console.log('Please follow these steps to create a service account key:');
    console.log('1. Go to Firebase Console: https://console.firebase.google.com/');
    console.log('2. Select your project "collage-of-agricuture"');
    console.log('3. Click on the gear icon (⚙️) next to "Project Overview" to open Project settings');
    console.log('4. Navigate to the "Service accounts" tab');
    console.log('5. Click "Generate new private key" button');
    console.log('6. Save the downloaded JSON file as "serviceAccountKey.json" in the Academic affairs folder');
    process.exit(1);
  }

  // Initialize Firebase Admin
  if (admin.apps.length === 0) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
  }

  const db = admin.firestore();

  // Check if users collection exists and has documents
  async function checkUsers() {
    try {
      console.log('Checking users collection...');
      const usersSnapshot = await db.collection('users').get();
      
      if (usersSnapshot.empty) {
        console.log('No users found in the database.');
        console.log('Consider running the app to trigger createInitialUsers()');
      } else {
        console.log(`Found ${usersSnapshot.size} users:`);
        
        usersSnapshot.forEach(doc => {
          const userData = doc.data();
          console.log(`- ${userData.username} (${userData.role}): ${userData.email}`);
        });
      }
    } catch (error) {
      console.error('Error checking users:', error);
    } finally {
      process.exit(0);
    }
  }

  checkUsers();
} catch (error) {
  console.error('Script error:', error);
  process.exit(1);
} 