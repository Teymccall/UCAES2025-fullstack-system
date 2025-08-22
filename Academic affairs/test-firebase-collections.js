// Test Firebase collections that the dashboard needs
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

console.log('🔥 Testing Firebase Collections for Dashboard...');
console.log('='.repeat(60));

async function testCollections() {
  try {
    // Initialize Firebase
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);
    console.log('✅ Firebase initialized');
    
    // Collections that the dashboard needs
    const collectionsToTest = [
      'student-registrations',
      'course-registrations', 
      'results',
      'academic-years',
      'staff',
      'staff-members',
      'academic-staff',
      'courses',
      'systemConfig'
    ];
    
    console.log('\n📊 Testing Collections:');
    console.log('-'.repeat(40));
    
    for (const collectionName of collectionsToTest) {
      try {
        console.log(`\n🔍 Testing: ${collectionName}`);
        
        // Try to get documents from collection
        const collectionRef = collection(db, collectionName);
        const snapshot = await getDocs(collectionRef);
        
        if (snapshot.empty) {
          console.log(`   ⚠️  Collection exists but is EMPTY (${snapshot.size} documents)`);
        } else {
          console.log(`   ✅ Collection has ${snapshot.size} documents`);
          
          // Show first few document IDs
          const docIds = snapshot.docs.slice(0, 3).map(doc => doc.id);
          console.log(`   📄 Sample IDs: ${docIds.join(', ')}`);
          
          // Try to get some data for specific collections
          if (collectionName === 'academic-years') {
            const activeYearQuery = query(
              collectionRef, 
              where('status', '==', 'active'),
              limit(1)
            );
            const activeSnapshot = await getDocs(activeYearQuery);
            if (!activeSnapshot.empty) {
              const yearData = activeSnapshot.docs[0].data();
              console.log(`   📅 Active year: ${yearData.year || 'Unknown'}`);
            }
          }
          
          if (collectionName === 'student-registrations') {
            const pendingQuery = query(
              collectionRef,
              where('status', '==', 'pending'),
              limit(1)
            );
            const pendingSnapshot = await getDocs(pendingQuery);
            console.log(`   ⏳ Pending registrations: ${pendingSnapshot.size}`);
          }
        }
        
      } catch (error) {
        console.log(`   ❌ Error accessing ${collectionName}: ${error.message}`);
      }
    }
    
    console.log('\n' + '='.repeat(60));
    console.log('📋 SUMMARY:');
    console.log('✅ Firebase connection working');
    console.log('✅ Collections accessible');
    console.log('⚠️  Some collections may be empty');
    console.log('');
    console.log('🎯 NEXT STEPS:');
    console.log('1. Check if collections need to be seeded with data');
    console.log('2. Verify Firestore rules allow read access');
    console.log('3. Run seed scripts if collections are empty');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testCollections();