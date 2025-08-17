// Test script to check authentication state and permissions
const admin = require('firebase-admin');

// Initialize Firebase Admin SDK
const serviceAccount = require('../ucaes2025-firebase-adminsdk-fbsvc-c70a08a455.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function testAuthenticationState() {
  console.log('🔍 Testing Authentication State and Permissions...\n');

  try {
    // 1. Check if we can access basic collections
    console.log('1. Testing basic Firestore access...');
    
    try {
      const programsRef = db.collection('academic-programs');
      const programsSnapshot = await programsRef.get();
      console.log(`✅ Academic Programs: Successfully accessed ${programsSnapshot.size} documents`);
    } catch (error) {
      console.log(`❌ Academic Programs: ${error.message}`);
    }

    try {
      const coursesRef = db.collection('academic-courses');
      const coursesSnapshot = await coursesRef.get();
      console.log(`✅ Academic Courses: Successfully accessed ${coursesSnapshot.size} documents`);
    } catch (error) {
      console.log(`❌ Academic Courses: ${error.message}`);
    }

    try {
      const staffRef = db.collection('academic-staff');
      const staffSnapshot = await staffRef.get();
      console.log(`✅ Academic Staff: Successfully accessed ${staffSnapshot.size} documents`);
    } catch (error) {
      console.log(`❌ Academic Staff: ${error.message}`);
    }

    try {
      const semestersRef = db.collection('academic-semesters');
      const semestersSnapshot = await semestersRef.get();
      console.log(`✅ Academic Semesters: Successfully accessed ${semestersSnapshot.size} documents`);
    } catch (error) {
      console.log(`❌ Academic Semesters: ${error.message}`);
    }

    // 2. Check users collection
    console.log('\n2. Testing users collection...');
    try {
      const usersRef = db.collection('users');
      const usersSnapshot = await usersRef.get();
      console.log(`✅ Users: Successfully accessed ${usersSnapshot.size} documents`);
      
      // Check for director user
      const directorUsers = usersSnapshot.docs.filter(doc => doc.data().role === 'director');
      console.log(`📊 Found ${directorUsers.length} director users`);
      
      if (directorUsers.length > 0) {
        directorUsers.forEach((doc, index) => {
          const data = doc.data();
          console.log(`   ${index + 1}. ${data.username} (${data.email}) - Status: ${data.status}`);
        });
      }
    } catch (error) {
      console.log(`❌ Users: ${error.message}`);
    }

    // 3. Check admission applications
    console.log('\n3. Testing admission applications...');
    try {
      const applicationsRef = db.collection('admission-applications');
      const applicationsSnapshot = await applicationsRef.get();
      console.log(`✅ Admission Applications: Successfully accessed ${applicationsSnapshot.size} documents`);
    } catch (error) {
      console.log(`❌ Admission Applications: ${error.message}`);
    }

    // 4. Test specific collections that might be causing issues
    console.log('\n4. Testing specific collections...');
    
    const collectionsToTest = [
      'academic-programs',
      'academic-courses', 
      'academic-staff',
      'academic-semesters',
      'academic-years',
      'users',
      'admission-applications'
    ];

    for (const collectionName of collectionsToTest) {
      try {
        const ref = db.collection(collectionName);
        const snapshot = await ref.limit(1).get();
        console.log(`✅ ${collectionName}: Accessible (${snapshot.size} sample documents)`);
      } catch (error) {
        console.log(`❌ ${collectionName}: ${error.message}`);
      }
    }

    console.log('\n🎯 Summary:');
    console.log('- If you see ❌ errors above, there are permission issues');
    console.log('- If you see ✅ success messages, the collections are accessible');
    console.log('- The issue might be in the frontend authentication, not the backend');

  } catch (error) {
    console.error('❌ Error during testing:', error);
  } finally {
    process.exit(0);
  }
}

testAuthenticationState();


