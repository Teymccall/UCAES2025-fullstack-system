/**
 * Firebase Rules Deployment Script
 * 
 * This script helps deploy the updated Firestore and Realtime Database security rules.
 * It requires the Firebase CLI to be installed and authenticated.
 */

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

// Check if Firebase CLI is installed
function checkFirebaseCLI() {
  try {
    execSync('firebase --version', { stdio: 'pipe' });
    console.log('Firebase CLI is installed.');
    return true;
  } catch (error) {
    console.error('Firebase CLI is not installed. Please install it using:');
    console.error('npm install -g firebase-tools');
    return false;
  }
}

// Check if user is logged in to Firebase
function checkFirebaseLogin() {
  try {
    const output = execSync('firebase projects:list --json', { stdio: 'pipe' }).toString();
    const projects = JSON.parse(output);
    
    if (projects && projects.length > 0) {
      console.log('Logged in to Firebase.');
      return true;
    } else {
      console.error('Not logged in to Firebase or no projects available.');
      console.error('Please login using: firebase login');
      return false;
    }
  } catch (error) {
    console.error('Not logged in to Firebase. Please login using:');
    console.error('firebase login');
    return false;
  }
}

// Deploy Firebase rules
function deployRules() {
  try {
    console.log('Deploying Firestore rules...');
    execSync('firebase deploy --only firestore:rules', { stdio: 'inherit' });
    
    console.log('Deploying Firestore indexes...');
    execSync('firebase deploy --only firestore:indexes', { stdio: 'inherit' });
    
    console.log('Deploying Database rules...');
    execSync('firebase deploy --only database', { stdio: 'inherit' });
    
    console.log('All rules deployed successfully!');
    return true;
  } catch (error) {
    console.error('Error deploying rules:', error.message);
    return false;
  }
}

// Main function
function main() {
  console.log('Starting Firebase rules deployment...');
  
  if (!checkFirebaseCLI()) {
    return;
  }
  
  if (!checkFirebaseLogin()) {
    return;
  }
  
  deployRules();
}

// Run the main function
main(); 