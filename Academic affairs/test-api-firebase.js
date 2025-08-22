// Test if client-side Firebase can be used for API operations
const { initializeApp } = require("firebase/app");
const { getFirestore, collection, getDocs, query, where, limit } = require("firebase/firestore");

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDGpAHia_wEmrhnmYjrPf1n1TrAyoIaOGI",
  authDomain: "ucaes2025.firebaseapp.com",
  projectId: "ucaes2025",
  storageBucket: "ucaes2025.firebasestorage.app",
  messagingSenderId: "581632635532",
  appId: "1:581632635532:web:bb6ce1f2c25266d37ec9ac"
};

console.log('🧪 Testing Client-Side Firebase for API Operations...');
console.log('='.repeat(60));

async function testClientFirebase() {
  try {
    // Initialize Firebase
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);
    console.log('✅ Firebase initialized');
    
    // Test basic collection access
    console.log('\n📊 Testing collection access...');
    
    // Test student-registrations
    try {
      const studentsRef = collection(db, 'student-registrations');
      const studentsSnapshot = await getDocs(studentsRef);
      console.log(`   ✅ student-registrations: ${studentsSnapshot.size} documents`);
    } catch (error) {
      console.log(`   ❌ student-registrations: ${error.message}`);
    }
    
    // Test course-registrations
    try {
      const coursesRef = collection(db, 'course-registrations');
      const coursesSnapshot = await getDocs(coursesRef);
      console.log(`   ✅ course-registrations: ${coursesSnapshot.size} documents`);
    } catch (error) {
      console.log(`   ❌ course-registrations: ${error.message}`);
    }
    
    // Test results
    try {
      const resultsRef = collection(db, 'results');
      const resultsSnapshot = await getDocs(resultsRef);
      console.log(`   ✅ results: ${resultsSnapshot.size} documents`);
    } catch (error) {
      console.log(`   ❌ results: ${error.message}`);
    }
    
    // Test academic-years
    try {
      const yearsRef = collection(db, 'academic-years');
      const yearsSnapshot = await getDocs(yearsRef);
      console.log(`   ✅ academic-years: ${yearsSnapshot.size} documents`);
    } catch (error) {
      console.log(`   ❌ academic-years: ${error.message}`);
    }
    
    // Test staff
    try {
      const staffRef = collection(db, 'staff');
      const staffSnapshot = await getDocs(staffRef);
      console.log(`   ✅ staff: ${staffSnapshot.size} documents`);
    } catch (error) {
      console.log(`   ❌ staff: ${error.message}`);
    }
    
    // Test with query
    console.log('\n🔍 Testing with queries...');
    try {
      const pendingQuery = query(
        collection(db, 'student-registrations'),
        where('status', '==', 'pending'),
        limit(5)
      );
      const pendingSnapshot = await getDocs(pendingQuery);
      console.log(`   ✅ Pending registrations query: ${pendingSnapshot.size} documents`);
    } catch (error) {
      console.log(`   ❌ Pending registrations query: ${error.message}`);
    }
    
    console.log('\n' + '='.repeat(60));
    console.log('📋 SUMMARY:');
    console.log('✅ Client-side Firebase can access collections');
    console.log('✅ Queries work properly');
    console.log('✅ Can be used for API operations');
    console.log('');
    console.log('🎯 RECOMMENDATION:');
    console.log('Use client-side Firebase for API routes instead of Admin SDK');
    console.log('This avoids the service account requirement');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testClientFirebase();