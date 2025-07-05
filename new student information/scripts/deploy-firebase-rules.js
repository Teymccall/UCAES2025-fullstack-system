// Script to deploy Firebase rules
const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

// Get the directory of this script
const scriptDir = __dirname;
// Get the parent directory (project root)
const projectRoot = path.resolve(scriptDir, '..');

console.log('Deploying Firebase rules from directory:', projectRoot);

// Check if firebase.json exists
if (!fs.existsSync(path.join(projectRoot, 'firebase.json'))) {
  console.error('firebase.json not found in project root!');
  process.exit(1);
}

// Check if firestore.rules exists
if (!fs.existsSync(path.join(projectRoot, 'firestore.rules'))) {
  console.error('firestore.rules not found in project root!');
  process.exit(1);
}

// Check if storage.rules exists
if (!fs.existsSync(path.join(projectRoot, 'storage.rules'))) {
  console.error('storage.rules not found in project root!');
  process.exit(1);
}

try {
  // Deploy Firestore rules
  console.log('Deploying Firestore rules...');
  execSync('firebase deploy --only firestore:rules', { 
    cwd: projectRoot,
    stdio: 'inherit'
  });
  
  // Deploy Storage rules
  console.log('Deploying Storage rules...');
  execSync('firebase deploy --only storage:rules', { 
    cwd: projectRoot,
    stdio: 'inherit'
  });
  
  // Deploy Database rules
  console.log('Deploying Database rules...');
  execSync('firebase deploy --only database', { 
    cwd: projectRoot,
    stdio: 'inherit'
  });
  
  console.log('Firebase rules deployed successfully!');
} catch (error) {
  console.error('Error deploying Firebase rules:', error.message);
  process.exit(1);
} 