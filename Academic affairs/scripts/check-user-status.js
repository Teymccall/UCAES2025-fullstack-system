// Check the status of a specific user
const { initializeApp, getApps } = require('firebase/app');
const { getFirestore, collection, query, where, getDocs } = require('firebase/firestore');

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

async function checkUserStatus() {
  try {
    console.log('🔍 CHECKING USER STATUS');
    console.log('=' .repeat(40));
    
    // Initialize Firebase
    let app;
    if (getApps().length === 0) {
      app = initializeApp(firebaseConfig);
    } else {
      app = getApps()[0];
    }
    
    const db = getFirestore(app);
    const username = 'mccall123';  // From your login attempt
    
    console.log('🔍 Looking up user:', username);
    const usersRef = collection(db, 'users');
    const userQuery = query(usersRef, where('username', '==', username));
    const snapshot = await getDocs(userQuery);
    
    if (snapshot.empty) {
      console.log('❌ User not found:', username);
      return;
    }
    
    const userData = snapshot.docs[0].data();
    const docId = snapshot.docs[0].id;
    
    console.log('👤 USER DETAILS:');
    console.log('   Document ID:', docId);
    console.log('   Username:', userData.username);
    console.log('   Name:', userData.name);
    console.log('   Email:', userData.email);
    console.log('   Role:', userData.role);
    console.log('   Status:', userData.status);
    console.log('   Department:', userData.department);
    console.log('   Has Password:', userData.password ? 'Yes' : 'No');
    console.log('   Created:', userData.createdAt ? new Date(userData.createdAt.seconds * 1000).toLocaleString() : 'Unknown');
    console.log('   Last Login:', userData.lastLogin ? new Date(userData.lastLogin.seconds * 1000).toLocaleString() : 'Never');
    console.log('   Session Token:', userData.sessionToken ? 'Yes' : 'No');
    
    console.log('\n🎯 STATUS ANALYSIS:');
    if (userData.status === 'active') {
      console.log('✅ Account status is ACTIVE');
    } else {
      console.log('❌ Account status is:', userData.status);
      console.log('   This explains why you got logged out immediately');
    }
    
    if (!userData.password) {
      console.log('⚠️  No password hash found - this account cannot login');
    } else {
      console.log('✅ Password hash exists');
    }
    
  } catch (error) {
    console.error('❌ Error checking user status:', error);
  }
}

checkUserStatus();














