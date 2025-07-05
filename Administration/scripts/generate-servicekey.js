/**
 * Generate Service Account Key Instructions
 * 
 * To clear Firestore data using Firebase Admin, you need a service account key.
 * Follow these steps to create one:
 * 
 * 1. Go to Firebase Console: https://console.firebase.google.com/
 * 2. Select your project "collage-of-agricuture"
 * 3. Click on the gear icon (⚙️) next to "Project Overview" to open Project settings
 * 4. Navigate to the "Service accounts" tab
 * 5. Click "Generate new private key" button
 * 6. Save the downloaded JSON file as "serviceAccountKey.json" in the Administration folder
 * 7. IMPORTANT: Never commit this file to version control or share it
 * 
 * After completing these steps, you can run the clear-firestore.js script:
 * 
 * npm install firebase-admin
 * node scripts/clear-firestore.js
 */

console.log(`
============================================================
                GENERATE SERVICE ACCOUNT KEY
============================================================

To clear Firestore data using Firebase Admin, you need a service account key.
Follow these steps to create one:

1. Go to Firebase Console: https://console.firebase.google.com/
2. Select your project "collage-of-agricuture"
3. Click on the gear icon (⚙️) next to "Project Overview" to open Project settings
4. Navigate to the "Service accounts" tab
5. Click "Generate new private key" button
6. Save the downloaded JSON file as "serviceAccountKey.json" in the Administration folder
7. IMPORTANT: Never commit this file to version control or share it

After completing these steps, you can run the clear-firestore.js script:

npm install firebase-admin
node scripts/clear-firestore.js

============================================================
`); 