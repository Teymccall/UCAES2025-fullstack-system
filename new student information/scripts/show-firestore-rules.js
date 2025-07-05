// Script to display Firestore rules and provide deployment instructions
const fs = require('fs');
const path = require('path');

// Path to the Firestore rules file
const RULES_FILE_PATH = path.join(__dirname, '..', 'firestore.rules');

console.log('=== Firebase Rules Helper ===');

// Check if rules file exists
if (!fs.existsSync(RULES_FILE_PATH)) {
  console.log('\n❌ Firestore rules file not found!');
  console.log(`Expected rules file at: ${RULES_FILE_PATH}`);
  process.exit(1);
}

try {
  // Read the rules file
  const rulesContent = fs.readFileSync(RULES_FILE_PATH, 'utf8');
  
  console.log('\n📋 Your current Firestore rules are:');
  console.log('-----------------------------------');
  console.log(rulesContent);
  console.log('-----------------------------------');
  
  console.log('\n✅ These rules will:');
  console.log('1. Deny all access by default');
  console.log('2. Allow anyone to create new student registrations');
  console.log('3. Allow only authenticated users to read their data');
  console.log('4. Allow anyone to read academic years data');
  
  console.log('\n📝 To deploy these rules to Firebase:');
  console.log('1. Install Node.js if not already installed: https://nodejs.org/');
  console.log('2. Open a command prompt/terminal');
  console.log('3. Run: npm install -g firebase-tools');
  console.log('4. Run: firebase login');
  console.log('5. Navigate to this directory');
  console.log('6. Run: firebase deploy --only firestore:rules --project ucaes2025');
  
  console.log('\n🔐 For the Admin SDK in the student portal:');
  console.log('1. Go to Firebase Console: https://console.firebase.google.com/project/ucaes2025/settings/serviceaccounts/adminsdk');
  console.log('2. Click "Generate new private key"');
  console.log('3. Download the JSON file');
  console.log('4. Open the .env.local file in the students portal directory');
  console.log('5. Add the client_email and private_key from the JSON file');
  
} catch (error) {
  console.error('\n❌ Error:', error);
} 