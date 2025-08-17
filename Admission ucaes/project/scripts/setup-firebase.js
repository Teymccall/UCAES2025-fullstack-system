import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🚀 Setting up Firebase for Admissions System...');

// Check if Firebase CLI is installed
try {
  execSync('firebase --version', { stdio: 'pipe' });
  console.log('✅ Firebase CLI is installed');
} catch (error) {
  console.error('❌ Firebase CLI is not installed. Please install it first:');
  console.error('npm install -g firebase-tools');
  process.exit(1);
}

// Check if we're in the correct directory
const currentDir = path.dirname(__dirname);
const packageJsonPath = path.join(currentDir, 'package.json');

if (!fs.existsSync(packageJsonPath)) {
  console.error('❌ Please run this script from the project root directory');
  process.exit(1);
}

// Initialize Firebase project
try {
  console.log('📋 Initializing Firebase project...');
  
  // Check if .firebaserc exists
  const firebasercPath = path.join(currentDir, '.firebaserc');
  if (!fs.existsSync(firebasercPath)) {
    console.log('Creating .firebaserc file...');
    fs.writeFileSync(firebasercPath, JSON.stringify({
      "projects": {
        "default": "ucaes2025"
      }
    }, null, 2));
  }
  
  console.log('✅ Firebase project initialized');
} catch (error) {
  console.error('❌ Error initializing Firebase project:', error.message);
  process.exit(1);
}

// Deploy Firestore rules
try {
  console.log('📋 Deploying Firestore rules...');
  execSync('firebase deploy --only firestore:rules', { 
    stdio: 'inherit',
    cwd: currentDir 
  });
  console.log('✅ Firestore rules deployed');
} catch (error) {
  console.error('❌ Error deploying Firestore rules:', error.message);
  console.log('⚠️ You may need to login to Firebase first: firebase login');
}

// Deploy Firestore indexes
try {
  console.log('📋 Deploying Firestore indexes...');
  execSync('firebase deploy --only firestore:indexes', { 
    stdio: 'inherit',
    cwd: currentDir 
  });
  console.log('✅ Firestore indexes deployed');
} catch (error) {
  console.error('❌ Error deploying Firestore indexes:', error.message);
}

console.log('🎉 Firebase setup completed!');
console.log('');
console.log('Next steps:');
console.log('1. Make sure you have the correct Firebase project selected:');
console.log('   firebase use ucaes2025');
console.log('');
console.log('2. If you need to login to Firebase:');
console.log('   firebase login');
console.log('');
console.log('3. To deploy hosting (when ready):');
console.log('   npm run build');
console.log('   firebase deploy --only hosting'); 