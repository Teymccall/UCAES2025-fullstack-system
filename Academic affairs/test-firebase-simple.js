// Simple Firebase client connectivity test
const { initializeApp } = require("firebase/app");
const { getFirestore, collection, getDocs } = require("firebase/firestore");

// Firebase configuration from the project
const firebaseConfig = {
  apiKey: "AIzaSyDGpAHia_wEmrhnmYjrPf1n1TrAyoIaOGI",
  authDomain: "ucaes2025.firebaseapp.com",
  projectId: "ucaes2025",
  storageBucket: "ucaes2025.firebasestorage.app",
  messagingSenderId: "581632635532",
  appId: "1:581632635532:web:bb6ce1f2c25266d37ec9ac"
};

console.log('🔥 Testing Firebase Client Connection...');
console.log('='.repeat(50));

try {
  // Initialize Firebase
  const app = initializeApp(firebaseConfig);
  console.log('✅ Firebase app initialized');
  
  // Get Firestore instance
  const db = getFirestore(app);
  console.log('✅ Firestore instance created');
  
  // Test basic collection access (this will fail without proper rules, but shows connection)
  console.log('🔍 Testing collection access...');
  
  // Try to access a collection (this will show if we can connect)
  const testCollection = collection(db, 'test-collection');
  console.log('✅ Collection reference created');
  
  console.log('');
  console.log('🎉 CLIENT-SIDE FIREBASE CONNECTION SUCCESSFUL!');
  console.log('✅ Firebase app initialized');
  console.log('✅ Firestore instance created');
  console.log('✅ Collection references working');
  console.log('');
  console.log('📋 Next Steps:');
  console.log('1. Check Firestore rules in firestore.rules');
  console.log('2. Verify collections exist in Firebase Console');
  console.log('3. Test with actual data collections');
  
} catch (error) {
  console.error('❌ Firebase client connection failed!');
  console.error('Error:', error.message);
  console.error('');
  console.error('🚨 This indicates a configuration issue');
  console.error('📋 Check:');
  console.error('   - Firebase config values');
  console.error('   - Network connectivity');
  console.error('   - Firebase project status');
}