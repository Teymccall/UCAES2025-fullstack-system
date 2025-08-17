// Test script to verify service connection between Academic Affairs and Fees Portal
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, query, where, getDocs, orderBy, limit } = require('firebase/firestore');

// Firebase configuration - same as both systems
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

async function testServiceConnection() {
  try {
    console.log('🔍 TESTING SERVICE CONNECTION BETWEEN ACADEMIC AFFAIRS AND FEES PORTAL');
    console.log('=' .repeat(70));
    
    // Initialize Firebase
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);
    
    console.log('✅ Firebase initialized successfully');
    console.log('📊 Project ID:', firebaseConfig.projectId);
    
    // Test 1: Check if fee-services collection exists and has data
    console.log('\n1️⃣ CHECKING FEE-SERVICES COLLECTION...');
    
    const servicesRef = collection(db, 'fee-services');
    const servicesQuery = query(
      servicesRef,
      where('isActive', '==', true),
      orderBy('category'),
      orderBy('name')
    );
    
    const servicesSnapshot = await getDocs(servicesQuery);
    
    if (servicesSnapshot.empty) {
      console.log('❌ No active services found in fee-services collection');
      console.log('💡 This means either:');
      console.log('   - No services have been created by Director of Academic Affairs');
      console.log('   - All services are marked as inactive');
      console.log('   - There\'s a database connection issue');
    } else {
      console.log(`✅ Found ${servicesSnapshot.size} active services:`);
      
      servicesSnapshot.forEach((doc) => {
        const service = doc.data();
        console.log(`   📋 ${service.name} - ¢${service.amount} (${service.type})`);
        console.log(`       Category: ${service.category}`);
        console.log(`       Created by: ${service.createdBy}`);
        console.log(`       Created: ${service.createdAt}`);
        console.log(`       Programmes: ${service.forProgrammes?.join(', ') || 'All'}`);
        console.log(`       Levels: ${service.forLevels?.join(', ') || 'All'}`);
        console.log('');
      });
    }
    
    // Test 2: Check all services (including inactive ones)
    console.log('\n2️⃣ CHECKING ALL SERVICES (INCLUDING INACTIVE)...');
    
    const allServicesQuery = query(servicesRef, orderBy('createdAt', 'desc'));
    const allServicesSnapshot = await getDocs(allServicesQuery);
    
    if (allServicesSnapshot.empty) {
      console.log('❌ No services found at all in fee-services collection');
      console.log('💡 This means the collection is empty or doesn\'t exist');
    } else {
      console.log(`📊 Total services in collection: ${allServicesSnapshot.size}`);
      
      const activeCount = allServicesSnapshot.docs.filter(doc => doc.data().isActive).length;
      const inactiveCount = allServicesSnapshot.size - activeCount;
      
      console.log(`   ✅ Active: ${activeCount}`);
      console.log(`   ❌ Inactive: ${inactiveCount}`);
    }
    
    // Test 3: Check service-requests collection
    console.log('\n3️⃣ CHECKING SERVICE-REQUESTS COLLECTION...');
    
    const requestsRef = collection(db, 'service-requests');
    const requestsQuery = query(requestsRef, orderBy('requestDate', 'desc'));
    const requestsSnapshot = await getDocs(requestsQuery);
    
    if (requestsSnapshot.empty) {
      console.log('📝 No service requests found (this is normal for a new system)');
    } else {
      console.log(`📝 Found ${requestsSnapshot.size} service requests`);
    }
    
    // Test 4: Check if we can read from the collection
    console.log('\n4️⃣ TESTING READ ACCESS...');
    
    try {
      const testQuery = query(servicesRef, limit(1));
      const testSnapshot = await getDocs(testQuery);
      console.log('✅ Read access to fee-services collection: SUCCESS');
    } catch (error) {
      console.log('❌ Read access to fee-services collection: FAILED');
      console.log('   Error:', error.message);
    }
    
    console.log('\n' + '=' .repeat(70));
    console.log('🎯 RECOMMENDATIONS:');
    
    if (allServicesSnapshot.empty) {
      console.log('1. Create some test services in Academic Affairs system');
      console.log('2. Verify they appear in Firebase console');
      console.log('3. Check if Fees Portal can read them');
    } else if (servicesSnapshot.empty) {
      console.log('1. Check why all services are marked as inactive');
      console.log('2. Verify service creation process in Academic Affairs');
      console.log('3. Check if isActive field is being set correctly');
    } else {
      console.log('1. Services exist and are active ✅');
      console.log('2. Check if Fees Portal API is working');
      console.log('3. Verify student programme/level filtering');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    console.log('💡 Check Firebase configuration and permissions');
  }
}

// Run the test
testServiceConnection();
