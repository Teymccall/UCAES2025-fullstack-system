// Check all users in the database
const { initializeApp, getApps } = require('firebase/app');
const { getFirestore, collection, getDocs } = require('firebase/firestore');

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

async function checkAllUsers() {
  try {
    console.log('👥 CHECKING ALL USERS IN DATABASE');
    console.log('=' .repeat(50));
    
    // Initialize Firebase
    let app;
    if (getApps().length === 0) {
      app = initializeApp(firebaseConfig);
    } else {
      app = getApps()[0];
    }
    
    const db = getFirestore(app);
    const usersRef = collection(db, 'users');
    
    console.log('🔍 Fetching all users...');
    const snapshot = await getDocs(usersRef);
    
    if (snapshot.empty) {
      console.log('❌ No users found in database');
      return;
    }
    
    console.log(`✅ Found ${snapshot.size} users:\n`);
    
    let userCount = 1;
    snapshot.forEach((doc) => {
      const userData = doc.data();
      console.log(`👤 USER ${userCount}:`);
      console.log(`   Document ID: ${doc.id}`);
      console.log(`   Username: ${userData.username}`);
      console.log(`   Name: ${userData.name}`);
      console.log(`   Email: ${userData.email}`);
      console.log(`   Role: ${userData.role}`);
      console.log(`   Status: ${userData.status}`);
      console.log(`   Department: ${userData.department}`);
      console.log(`   Has Password: ${userData.password ? 'Yes' : 'No'}`);
      console.log(`   Created: ${userData.createdAt ? new Date(userData.createdAt.seconds * 1000).toLocaleString() : 'Unknown'}`);
      console.log('   ' + '-'.repeat(40));
      userCount++;
    });
    
    console.log('\n🎯 SUMMARY:');
    console.log(`   Total Users: ${snapshot.size}`);
    console.log('   All users should be able to login if they have passwords');
    
  } catch (error) {
    console.error('❌ Error checking users:', error);
  }
}

checkAllUsers();














