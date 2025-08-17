// Test teymccall login with actual credentials
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

async function testTeymccallLogin() {
  try {
    console.log('🔐 TESTING TEYMCCALL LOGIN CREDENTIALS');
    console.log('=' .repeat(50));
    
    // Initialize Firebase
    let app;
    if (getApps().length === 0) {
      app = initializeApp(firebaseConfig);
    } else {
      app = getApps()[0];
    }
    
    const db = getFirestore(app);
    
    // Test credentials
    const username = 'teymccall';
    const passwords = ['achumboro', 'password123', 'teymccall', 'admin'];
    
    console.log('🔍 Getting user from database...');
    const usersRef = collection(db, 'users');
    const userQuery = query(usersRef, where('username', '==', username));
    const snapshot = await getDocs(userQuery);
    
    if (snapshot.empty) {
      console.log('❌ User teymccall not found in database');
      return;
    }
    
    const userData = snapshot.docs[0].data();
    const storedHash = userData.password;
    
    console.log('✅ User found:');
    console.log('   Username:', userData.username);
    console.log('   Email:', userData.email);
    console.log('   Role:', userData.role);
    console.log('   Status:', userData.status);
    console.log('   Has Password Hash:', !!storedHash);
    
    console.log('\n🔐 Testing different passwords...');
    
    for (const password of passwords) {
      if (storedHash) {
        const isValid = await bcrypt.compare(password, storedHash);
        console.log(`   Password "${password}": ${isValid ? '✅ WORKS' : '❌ FAILS'}`);
        
        if (isValid) {
          console.log(`\n🎯 SUCCESS! The correct password is: "${password}"`);
          console.log('\nYou can login with:');
          console.log('   Username: teymccall');
          console.log(`   Password: ${password}`);
        }
      }
    }
    
    if (!storedHash) {
      console.log('\n❌ No password hash stored for this user');
      console.log('This user needs a password to be set');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

testTeymccallLogin();














