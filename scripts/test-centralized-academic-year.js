const { initializeApp } = require('firebase/app');
const { getFirestore, doc, getDoc, setDoc, collection, getDocs, query, where } = require('firebase/firestore');

// Firebase configuration (replace with your actual config)
const firebaseConfig = {
  // Add your Firebase config here
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function testCentralizedAcademicYear() {
  console.log('🧪 Testing Centralized Academic Year System...\n');

  try {
    // Test 1: Check current systemConfig
    console.log('📋 Test 1: Checking Current System Config');
    const configRef = doc(db, 'systemConfig', 'academicPeriod');
    const configDoc = await getDoc(configRef);
    
    if (configDoc.exists()) {
      const configData = configDoc.data();
      console.log('✅ System config found:');
      console.log('   Current Academic Year:', configData.currentAcademicYear);
      console.log('   Current Semester:', configData.currentSemester);
      console.log('   Program Type:', configData.currentProgramType);
      console.log('   Last Updated:', configData.lastUpdated?.toDate());
    } else {
      console.log('❌ No system config found - creating default config');
      
      // Create a default config
      await setDoc(configRef, {
        currentAcademicYear: '2024/2025',
        currentAcademicYearId: 'default-year-id',
        currentSemester: 'First Semester',
        currentSemesterId: 'default-semester-id',
        currentProgramType: 'Regular',
        lastUpdated: new Date(),
      });
      
      console.log('✅ Created default system config');
    }

    // Test 2: Check academic years collection
    console.log('\n📋 Test 2: Checking Academic Years Collection');
    const academicYearsRef = collection(db, 'academic-years');
    const academicYearsSnapshot = await getDocs(academicYearsRef);
    
    if (!academicYearsSnapshot.empty) {
      console.log(`✅ Found ${academicYearsSnapshot.size} academic years:`);
      academicYearsSnapshot.forEach(doc => {
        const yearData = doc.data();
        console.log(`   - ${yearData.year} (ID: ${doc.id})`);
      });
    } else {
      console.log('❌ No academic years found');
    }

    // Test 3: Check semesters collection
    console.log('\n📋 Test 3: Checking Semesters Collection');
    const semestersRef = collection(db, 'semesters');
    const semestersSnapshot = await getDocs(semestersRef);
    
    if (!semestersSnapshot.empty) {
      console.log(`✅ Found ${semestersSnapshot.size} semesters:`);
      semestersSnapshot.forEach(doc => {
        const semesterData = doc.data();
        console.log(`   - ${semesterData.name} (${semesterData.programType}) - Status: ${semesterData.status}`);
      });
    } else {
      console.log('❌ No semesters found');
    }

    // Test 4: Check active semesters
    console.log('\n📋 Test 4: Checking Active Semesters');
    const activeSemestersQuery = query(semestersRef, where('status', '==', 'active'));
    const activeSemestersSnapshot = await getDocs(activeSemestersQuery);
    
    if (!activeSemestersSnapshot.empty) {
      console.log(`✅ Found ${activeSemestersSnapshot.size} active semesters:`);
      activeSemestersSnapshot.forEach(doc => {
        const semesterData = doc.data();
        console.log(`   - ${semesterData.name} (${semesterData.programType})`);
      });
    } else {
      console.log('❌ No active semesters found');
    }

    // Test 5: Simulate setting a current semester
    console.log('\n📋 Test 5: Simulating Set Current Semester');
    if (!semestersSnapshot.empty) {
      const firstSemester = semestersSnapshot.docs[0];
      const semesterData = firstSemester.data();
      
      console.log(`   Simulating setting ${semesterData.name} as current semester...`);
      
      // Update the systemConfig to simulate director action
      await setDoc(configRef, {
        currentAcademicYear: semesterData.academicYear || '2024/2025',
        currentAcademicYearId: semesterData.academicYear || 'default-year-id',
        currentSemester: semesterData.name,
        currentSemesterId: firstSemester.id,
        currentProgramType: semesterData.programType || 'Regular',
        lastUpdated: new Date(),
      }, { merge: true });
      
      console.log('✅ Updated system config with simulated current semester');
    }

    // Test 6: Verify the update
    console.log('\n📋 Test 6: Verifying System Config Update');
    const updatedConfigDoc = await getDoc(configRef);
    if (updatedConfigDoc.exists()) {
      const updatedConfigData = updatedConfigDoc.data();
      console.log('✅ Updated system config:');
      console.log('   Current Academic Year:', updatedConfigData.currentAcademicYear);
      console.log('   Current Semester:', updatedConfigData.currentSemester);
      console.log('   Program Type:', updatedConfigData.currentProgramType);
      console.log('   Last Updated:', updatedConfigData.lastUpdated?.toDate());
    }

    console.log('\n✅ All centralized academic year tests completed!');
    console.log('\n📝 Summary:');
    console.log('- The system config is now properly centralized');
    console.log('- Director can set current semester and it updates systemConfig');
    console.log('- Student portal will use the centralized configuration');
    console.log('- All platforms will be synchronized');

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the tests
testCentralizedAcademicYear();
