// Test password hashing and verification
const { initializeApp, getApps } = require('firebase/app');
const { getFirestore, collection, query, where, getDocs } = require('firebase/firestore');
const bcrypt = require('bcryptjs');

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCWj01Z1zScFJbTh5ChqsLEEZZdmBOjlUE",
  authDomain: "ucaes2025.firebaseapp.com",
  databaseURL: "https://ucaes2025-default-rtdb.firebaseio.com",
  projectId: "ucaes2025",
  storageBucket: "ucaes2025.firebasestorage.app",
  messagingSenderId: "543217800581",
  appId: "1:543217800581:web:4f97ba0087f694deeea0ec",
  measurementId: "G-8E3518ML0D"
};

async function testPasswordHash() {
  try {
    console.log('🔐 TESTING PASSWORD HASH VERIFICATION');
    console.log('=' .repeat(50));
    
    // Initialize Firebase
    let app;
    if (getApps().length === 0) {
      app = initializeApp(firebaseConfig);
    } else {
      app = getApps()[0];
    }
    
    const db = getFirestore(app);
    
    // Get user data
    const username = 'teymccall';
    const plainPassword = 'password123';
    
    console.log('🔍 Getting user from database...');
    const usersRef = collection(db, 'users');
    const userQuery = query(usersRef, where('username', '==', username));
    const snapshot = await getDocs(userQuery);
    
    if (snapshot.empty) {
      console.log('❌ User not found');
      return;
    }
    
    const userData = snapshot.docs[0].data();
    const storedHash = userData.password;
    
    console.log('✅ User found:');
    console.log('   Username:', userData.username);
    console.log('   Stored hash length:', storedHash ? storedHash.length : 'No hash');
    console.log('   Hash starts with:', storedHash ? storedHash.substring(0, 10) + '...' : 'No hash');
    
    // Test password verification
    console.log('\n🔐 Testing password verification...');
    console.log('   Plain password:', plainPassword);
    
    if (storedHash) {
      const isValid = await bcrypt.compare(plainPassword, storedHash);
      console.log('   Verification result:', isValid);
      
      if (!isValid) {
        console.log('\n🔧 Password mismatch - regenerating hash...');
        const newHash = await bcrypt.hash(plainPassword, 10);
        console.log('   New hash:', newHash.substring(0, 20) + '...');
        
        // Test the new hash
        const newIsValid = await bcrypt.compare(plainPassword, newHash);
        console.log('   New hash works:', newIsValid);
      }
    } else {
      console.log('❌ No password hash stored');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

testPasswordHash();














