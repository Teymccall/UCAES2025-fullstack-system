// Find the correct password for mccall123 by testing against the stored hash
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

async function findCorrectPassword() {
  try {
    console.log('🔍 FINDING CORRECT PASSWORD FOR MCCALL123');
    console.log('=' .repeat(50));
    
    // Initialize Firebase
    let app;
    if (getApps().length === 0) {
      app = initializeApp(firebaseConfig);
    } else {
      app = getApps()[0];
    }
    
    const db = getFirestore(app);
    const username = 'mccall123';
    
    console.log('🔍 Getting user data...');
    const usersRef = collection(db, 'users');
    const userQuery = query(usersRef, where('username', '==', username));
    const snapshot = await getDocs(userQuery);
    
    if (snapshot.empty) {
      console.log('❌ User not found:', username);
      return;
    }
    
    const userData = snapshot.docs[0].data();
    const storedHash = userData.password;
    
    console.log('✅ User found:', userData.name);
    console.log('   Email:', userData.email);
    console.log('   Has password hash:', !!storedHash);
    
    if (!storedHash) {
      console.log('❌ No password hash found for this user');
      return;
    }
    
    // Test common passwords
    const passwordsToTest = [
      'test123456',    // From the signup test
      'mccall123',     // Username as password
      'password123',   // Common default
      'director2025',  // Common director password
      'admin123',      // Admin password
      'ucaes2025',     // University password
      'mccalll',       // The user's name
      'zmccall',       // Part of email
    ];
    
    console.log('\n🔐 Testing passwords against stored hash...');
    
    for (const password of passwordsToTest) {
      try {
        const isValid = await bcrypt.compare(password, storedHash);
        if (isValid) {
          console.log(`🎉 FOUND CORRECT PASSWORD: "${password}"`);
          console.log('\n✅ LOGIN CREDENTIALS:');
          console.log('   Username: mccall123');
          console.log(`   Password: ${password}`);
          console.log('\nYou can now login with these credentials!');
          return;
        } else {
          console.log(`   ❌ "${password}" - incorrect`);
        }
      } catch (error) {
        console.log(`   ❌ "${password}" - error testing`);
      }
    }
    
    console.log('\n❌ None of the common passwords worked');
    console.log('💡 You might need to create a new account or reset this password');
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

findCorrectPassword();














