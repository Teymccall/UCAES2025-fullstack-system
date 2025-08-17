// Fix director password hash
const { initializeApp, getApps } = require('firebase/app');
const { getFirestore, collection, query, where, getDocs, doc, updateDoc } = require('firebase/firestore');
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

async function fixDirectorPassword() {
  try {
    console.log('🔧 FIXING DIRECTOR PASSWORD');
    console.log('=' .repeat(40));
    
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
    const correctPassword = 'password123';
    
    console.log('🔍 Finding director user...');
    const usersRef = collection(db, 'users');
    const userQuery = query(usersRef, where('username', '==', username));
    const snapshot = await getDocs(userQuery);
    
    if (snapshot.empty) {
      console.log('❌ User not found');
      return;
    }
    
    const userId = snapshot.docs[0].id;
    const userData = snapshot.docs[0].data();
    
    console.log('✅ User found:', userData.username);
    
    // Generate correct password hash
    console.log('🔐 Generating new password hash...');
    const correctHash = await bcrypt.hash(correctPassword, 10);
    
    // Verify the new hash works
    const testVerification = await bcrypt.compare(correctPassword, correctHash);
    console.log('✅ New hash verified:', testVerification);
    
    // Update user in database
    console.log('💾 Updating user password...');
    const userDocRef = doc(db, 'users', userId);
    await updateDoc(userDocRef, {
      password: correctHash,
      passwordUpdated: new Date()
    });
    
    console.log('✅ Password updated successfully!');
    console.log('\n🎯 LOGIN CREDENTIALS:');
    console.log('   Username: teymccall');
    console.log('   Password: password123');
    console.log('\nYou can now login to Academic Affairs!');
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

fixDirectorPassword();














