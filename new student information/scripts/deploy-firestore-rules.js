// Script to deploy Firestore rules using the Firebase Admin SDK
const fs = require('fs');
const path = require('path');
const admin = require('firebase-admin');

// Path to the service account key file (you'll need to create this)
const SERVICE_ACCOUNT_PATH = path.join(__dirname, 'serviceAccountKey.json');
// Path to the Firestore rules file
const RULES_FILE_PATH = path.join(__dirname, '..', 'firestore.rules');

// Instructions for manual setup
console.log('=== Firebase Rules Deployment Helper ===');
console.log('\nThis script helps you deploy Firestore rules without the Firebase CLI.');
console.log('\nBefore you can use this script:');
console.log('1. Go to Firebase Console: https://console.firebase.google.com/project/ucaes2025/settings/serviceaccounts/adminsdk');
console.log('2. Click "Generate new private key"');
console.log('3. Download the JSON file');
console.log('4. Save the JSON file as "serviceAccountKey.json" in the same directory as this script');
console.log('\nAfter you have done that, run this script again to deploy your rules.');

// Check if service account file exists
if (!fs.existsSync(SERVICE_ACCOUNT_PATH)) {
  console.log('\n❌ Service account key file not found!');
  console.log(`Please create the file at: ${SERVICE_ACCOUNT_PATH}`);
  process.exit(1);
}

// Check if rules file exists
if (!fs.existsSync(RULES_FILE_PATH)) {
  console.log('\n❌ Firestore rules file not found!');
  console.log(`Expected rules file at: ${RULES_FILE_PATH}`);
  process.exit(1);
}

try {
  // Read the rules file
  const rulesContent = fs.readFileSync(RULES_FILE_PATH, 'utf8');
  console.log('\n✅ Rules file read successfully');
  
  // Initialize Firebase Admin with service account
  const serviceAccount = require(SERVICE_ACCOUNT_PATH);
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
  
  console.log('\n🔄 Deploying Firestore rules...');
  
  // Deploy the rules
  // Note: This is a simplified example. In a real deployment,
  // you would use the Firebase Admin SDK to deploy the rules.
  // However, the Admin SDK doesn't have a direct method for this.
  // You would typically use the REST API or the Firebase CLI.
  
  console.log('\n⚠️ Important: This script cannot directly deploy rules.');
  console.log('The Firebase Admin SDK does not support direct rules deployment.');
  console.log('\nTo deploy your rules:');
  console.log('1. Install Node.js if not already installed');
  console.log('2. Run: npm install -g firebase-tools');
  console.log('3. Run: firebase login');
  console.log('4. Run: firebase deploy --only firestore:rules --project ucaes2025');
  
  console.log('\n📋 Your current rules are:');
  console.log('-----------------------------------');
  console.log(rulesContent);
  console.log('-----------------------------------');
  
} catch (error) {
  console.error('\n❌ Error:', error);
} 