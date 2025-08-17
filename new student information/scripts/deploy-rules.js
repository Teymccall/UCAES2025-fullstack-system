// A simple script to deploy Firestore rules using the Firebase CLI
const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');

// Path to the Firebase project directory
const PROJECT_DIR = path.join(__dirname, '..');

// Check if rules file exists
const RULES_FILE_PATH = path.join(PROJECT_DIR, 'firestore.rules');
if (!fs.existsSync(RULES_FILE_PATH)) {
  console.log('\n❌ Firestore rules file not found!');
  console.log(`Expected rules file at: ${RULES_FILE_PATH}`);
  process.exit(1);
}

console.log('=== Firestore Rules Deployment ===');
console.log('\nThis script will deploy the Firestore rules from:');
console.log(RULES_FILE_PATH);

// Read the rules file to show what will be deployed
const rulesContent = fs.readFileSync(RULES_FILE_PATH, 'utf8');
console.log('\n📋 Rules to be deployed:');
console.log('-----------------------------------');
console.log(rulesContent);
console.log('-----------------------------------');

console.log('\n🔄 Deploying Firestore rules...');

// Execute the Firebase CLI command to deploy rules
const command = `firebase deploy --only firestore:rules --project ucaes2025`;

exec(command, { cwd: PROJECT_DIR }, (error, stdout, stderr) => {
  if (error) {
    console.error(`\n❌ Error deploying rules: ${error.message}`);
    
    // Check if Firebase CLI is installed
    if (error.message.includes('command not found') || error.message.includes('not recognized')) {
      console.log('\n⚠️ Firebase CLI not found. Please install it:');
      console.log('npm install -g firebase-tools');
      console.log('Then run: firebase login');
    }
    
    console.error('\nCommand output:', stderr || stdout);
    process.exit(1);
  }
  
  console.log('\n✅ Firebase deployment output:');
  console.log(stdout);
  
  console.log('\n✅ Firestore rules deployed successfully!');
  console.log('You should now be able to submit student registrations.');
}); 