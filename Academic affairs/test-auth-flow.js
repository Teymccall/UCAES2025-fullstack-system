// Test authentication flow and users collection
const { initializeApp } = require("firebase/app");
const { getFirestore, collection, getDocs, doc, getDoc, query, where } = require("firebase/firestore");

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDGpAHia_wEmrhnmYjrPf1n1TrAyoIaOGI",
  authDomain: "ucaes2025.firebaseapp.com",
  projectId: "ucaes2025",
  storageBucket: "ucaes2025.firebasestorage.app",
  messagingSenderId: "581632635532",
  appId: "1:581632635532:web:bb6ce1f2c25266d37ec9ac"
};

console.log('🔐 Testing Authentication Flow...');
console.log('='.repeat(50));

async function testAuthFlow() {
  try {
    // Initialize Firebase
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);
    console.log('✅ Firebase initialized');
    
    // Check users collection
    console.log('\n👥 Checking users collection...');
    const usersRef = collection(db, 'users');
    const usersSnapshot = await getDocs(usersRef);
    
    if (usersSnapshot.empty) {
      console.log('   ⚠️  Users collection is EMPTY!');
      console.log('   🚨 This will cause authentication failures');
      console.log('   📋 Need to create at least one director user');
    } else {
      console.log(`   ✅ Users collection has ${usersSnapshot.size} users`);
      
      // Show user details
      usersSnapshot.forEach((userDoc) => {
        const userData = userDoc.data();
        console.log(`   👤 User: ${userData.name || 'Unknown'} (${userDoc.id})`);
        console.log(`      Role: ${userData.role || 'No role'}`);
        console.log(`      Permissions: ${(userData.permissions || []).join(', ') || 'None'}`);
      });
    }
    
    // Check if there's a director user
    console.log('\n🎯 Checking for director user...');
    const directorQuery = query(usersRef, where('role', '==', 'director'));
    const directorSnapshot = await getDocs(directorQuery);
    
    if (directorSnapshot.empty) {
      console.log('   ❌ No director user found!');
      console.log('   🚨 Dashboard will not work without a director user');
    } else {
      console.log(`   ✅ Found ${directorSnapshot.size} director user(s)`);
      directorSnapshot.forEach((doc) => {
        const data = doc.data();
        console.log(`      Director: ${data.name || 'Unknown'} (${doc.id})`);
      });
    }
    
    // Test API authentication simulation
    console.log('\n🔑 Testing API authentication simulation...');
    if (!usersSnapshot.empty) {
      const firstUser = usersSnapshot.docs[0];
      const userData = firstUser.data();
      
      console.log(`   📋 Testing with user: ${userData.name || 'Unknown'} (${firstUser.id})`);
      console.log(`   🎭 Role: ${userData.role || 'No role'}`);
      
      // Check if user has view_dashboard permission
      const hasPermission = userData.permissions && userData.permissions.includes('view_dashboard');
      console.log(`   ✅ Has view_dashboard permission: ${hasPermission ? 'YES' : 'NO'}`);
      
      if (hasPermission) {
        console.log('   🎉 User can access dashboard!');
      } else {
        console.log('   ⚠️  User cannot access dashboard - missing permission');
      }
    }
    
    console.log('\n' + '='.repeat(50));
    console.log('📋 AUTHENTICATION SUMMARY:');
    
    if (usersSnapshot.empty) {
      console.log('❌ CRITICAL: No users in system');
      console.log('❌ Dashboard will not work');
      console.log('❌ Need to create director user');
    } else if (directorSnapshot.empty) {
      console.log('⚠️  WARNING: No director user found');
      console.log('⚠️  Dashboard may not work properly');
      console.log('✅ Users exist but need director role');
    } else {
      console.log('✅ Users collection populated');
      console.log('✅ Director user exists');
      console.log('✅ Dashboard should work');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testAuthFlow();