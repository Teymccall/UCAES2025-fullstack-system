// Script to prepare Firestore rules for deployment
const fs = require('fs');
const path = require('path');

// Path to the Firestore rules file
const RULES_FILE_PATH = path.join(__dirname, '..', 'firestore.rules');

console.log('=== Firebase Rules Deployment Helper ===');

// Check if rules file exists
if (!fs.existsSync(RULES_FILE_PATH)) {
  console.error(`❌ Firestore rules file not found at: ${RULES_FILE_PATH}`);
  process.exit(1);
}

try {
  // Read the rules file
  const rulesContent = fs.readFileSync(RULES_FILE_PATH, 'utf8');
  
  console.log('\n✅ Your Firestore rules are ready for deployment:');
  console.log('-----------------------------------');
  console.log(rulesContent);
  console.log('-----------------------------------');
  
  // Create a deployment script file
  const deployScriptPath = path.join(__dirname, 'deploy-rules.bat');
  const deployScript = `@echo off
echo === Deploying Firestore Rules ===
echo.
echo Make sure you have installed Firebase CLI with: npm install -g firebase-tools
echo.
firebase login
firebase use ucaes2025
firebase deploy --only firestore:rules
echo.
echo Done! Press any key to exit.
pause > nul
`;

  fs.writeFileSync(deployScriptPath, deployScript);
  console.log(`\n✅ Created deployment script at: ${deployScriptPath}`);
  
  console.log('\n📝 To deploy these rules to Firebase:');
  console.log('1. Make sure you have Node.js installed: https://nodejs.org/');
  console.log('2. Install Firebase CLI globally: npm install -g firebase-tools');
  console.log('3. Run the deployment script: scripts\\deploy-rules.bat');
  console.log('\n🔒 After deployment, your Firestore database will be secure with these rules:');
  console.log('- Default deny all access');
  console.log('- Allow anyone to create new student registrations');
  console.log('- Allow only authenticated users to read their data');
  console.log('- Allow anyone to read academic years data');
  
} catch (error) {
  console.error('❌ Error:', error);
} 