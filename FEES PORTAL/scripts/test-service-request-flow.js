// Test script to verify the complete service request flow
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, query, where, getDocs, orderBy } = require('firebase/firestore');

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

async function testServiceRequestFlow() {
  try {
    console.log('🧪 TESTING COMPLETE SERVICE REQUEST FLOW');
    console.log('=' .repeat(60));
    
    // Initialize Firebase
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);
    
    console.log('✅ Firebase initialized successfully');
    
    // Test 1: Check if service-requests collection exists and has data
    console.log('\n1️⃣ CHECKING SERVICE-REQUESTS COLLECTION...');
    
    const requestsRef = collection(db, 'service-requests');
    const requestsQuery = query(
      requestsRef,
      orderBy('requestDate', 'desc')
    );
    
    const requestsSnapshot = await getDocs(requestsQuery);
    
    if (requestsSnapshot.empty) {
      console.log('❌ No service requests found in service-requests collection');
      console.log('💡 This means either:');
      console.log('   - No service requests have been created yet');
      console.log('   - There\'s a database connection issue');
      console.log('   - The collection name is different');
    } else {
      console.log(`✅ Found ${requestsSnapshot.size} service requests:`);
      
      requestsSnapshot.forEach((doc) => {
        const request = doc.data();
        console.log(`   📋 ID: ${doc.id}`);
        console.log(`       Student: ${request.studentId} - ${request.studentName}`);
        console.log(`       Status: ${request.status}`);
        console.log(`       Services: ${request.services?.length || 0} services`);
        console.log(`       Total Amount: ¢${request.totalAmount || 0}`);
        console.log(`       Request Date: ${request.requestDate}`);
        console.log(`       Created: ${request.createdAt || 'N/A'}`);
        console.log('');
      });
    }
    
    // Test 2: Check specific student requests (if we have any)
    if (requestsSnapshot.size > 0) {
      console.log('\n2️⃣ CHECKING SPECIFIC STUDENT REQUESTS...');
      
      const firstRequest = requestsSnapshot.docs[0].data();
      const studentId = firstRequest.studentId;
      
      console.log(`🔍 Looking for requests from student: ${studentId}`);
      
      const studentQuery = query(
        requestsRef,
        where('studentId', '==', studentId),
        orderBy('requestDate', 'desc')
      );
      
      const studentSnapshot = await getDocs(studentQuery);
      
      if (studentSnapshot.empty) {
        console.log('❌ No requests found for this student');
      } else {
        console.log(`✅ Found ${studentSnapshot.size} requests for student ${studentId}:`);
        
        studentSnapshot.forEach((doc) => {
          const request = doc.data();
          console.log(`   📋 Request ID: ${doc.id}`);
          console.log(`       Status: ${request.status}`);
          console.log(`       Services: ${request.services?.length || 0} services`);
          console.log(`       Total: ¢${request.totalAmount || 0}`);
        });
      }
    }
    
    // Test 3: Check fee-services collection to see what services exist
    console.log('\n3️⃣ CHECKING FEE-SERVICES COLLECTION...');
    
    const servicesRef = collection(db, 'fee-services');
    const servicesQuery = query(
      servicesRef,
      where('isActive', '==', true),
      orderBy('name')
    );
    
    const servicesSnapshot = await getDocs(servicesQuery);
    
    if (servicesSnapshot.empty) {
      console.log('❌ No active services found');
    } else {
      console.log(`✅ Found ${servicesSnapshot.size} active services:`);
      
      servicesSnapshot.forEach((doc) => {
        const service = doc.data();
        console.log(`   📋 ${service.name} - ¢${service.amount} (${service.type})`);
        console.log(`       ID: ${doc.id}`);
        console.log(`       Category: ${service.category}`);
      });
    }
    
    console.log('\n' + '=' .repeat(60));
    console.log('🎯 RECOMMENDATIONS:');
    
    if (requestsSnapshot.empty) {
      console.log('1. Create a test service request in the Fees Portal');
      console.log('2. Check if it appears in Firebase console');
      console.log('3. Verify the collection name is "service-requests"');
    } else {
      console.log('1. Service requests exist in database ✅');
      console.log('2. Check if the Fees Portal can read them');
      console.log('3. Verify the user authentication is working');
      console.log('4. Check browser console for any errors');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    console.log('💡 Check Firebase configuration and permissions');
  }
}

// Run the test
testServiceRequestFlow();
