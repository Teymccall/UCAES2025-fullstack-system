// Simple script to check Firebase configuration
const admin = require('firebase-admin');

// You'll need to initialize with your service account
// For now, this is a template to show what to check

async function checkFirebaseConfig() {
  console.log("🔍 Checking Firebase Configuration...");
  
  try {
    // Initialize Firebase Admin (you'll need your service account key)
    // const serviceAccount = require('./path-to-service-account-key.json');
    // admin.initializeApp({
    //   credential: admin.credential.cert(serviceAccount)
    // });
    
    // const db = admin.firestore();
    
    console.log("📋 What to check in Firebase Console:");
    console.log("");
    console.log("1. Go to Firebase Console → Firestore Database");
    console.log("2. Check collection: systemConfig");
    console.log("3. Check document: academicPeriod");
    console.log("4. Current values should be:");
    console.log("   - currentAcademicYear: '2020-2021' (PROBLEM!)");
    console.log("   - currentSemester: 'Second Semester'");
    console.log("");
    console.log("5. Update to:");
    console.log("   - currentAcademicYear: '2024-2025'");
    console.log("   - currentSemester: 'First Semester'");
    console.log("");
    console.log("🎯 OR use Director Portal:");
    console.log("1. Login as Director of Academic Affairs");
    console.log("2. Go to Academic Management");
    console.log("3. Set current academic year and semester");
    console.log("4. This will automatically update systemConfig");
    
  } catch (error) {
    console.error("Error:", error.message);
  }
}

checkFirebaseConfig();

