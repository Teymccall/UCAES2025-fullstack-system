const { initializeApp } = require('firebase/app');
const { getFirestore, doc, getDoc, collection, getDocs } = require('firebase/firestore');

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCWj01Z1zScFJbTh5ChqsLEEZZdmBOjlUE",
  authDomain: "ucaes2025.firebaseapp.com",
  databaseURL: "https://ucaes2025-default-rtdb.firebaseio.com",
  projectId: "ucaes2025",
  storageBucket: "ucaes2025.appspot.com",
  messagingSenderId: "543217800581",
  appId: "1:543217800581:web:4f97ba0087f694deeea0ec",
  measurementId: "G-8E3518ML0D"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function comprehensiveAdmissionTest() {
  console.log('🧪 Comprehensive Admission System Test');
  console.log('='.repeat(60));
  
  try {
    // Test 1: Check all academic years
    console.log('\n📋 Test 1: Checking all academic years...');
    const academicYearsRef = collection(db, 'academic-years');
    const academicYearsSnapshot = await getDocs(academicYearsRef);
    
    console.log(`Found ${academicYearsSnapshot.size} academic years:`);
    academicYearsSnapshot.forEach(doc => {
      const data = doc.data();
      console.log(`   📅 ${doc.id}: ${data.displayName || data.year} (Status: ${data.status}, Admission: ${data.admissionStatus})`);
    });
    
    // Test 2: Check centralized system
    console.log('\n📋 Test 2: Checking centralized system...');
    const systemConfigRef = doc(db, 'systemConfig', 'academicPeriod');
    const systemConfigDoc = await getDoc(systemConfigRef);
    
    if (systemConfigDoc.exists()) {
      const systemData = systemConfigDoc.data();
      console.log('✅ Centralized system found:');
      console.log(`   Current Academic Year ID: ${systemData.currentAcademicYearId}`);
      console.log(`   Current Academic Year: ${systemData.currentAcademicYear}`);
      console.log(`   Current Semester: ${systemData.currentSemester || 'None'}`);
      console.log(`   Last Updated: ${systemData.lastUpdated}`);
    } else {
      console.log('❌ Centralized system not found');
    }
    
    // Test 3: Check legacy system
    console.log('\n📋 Test 3: Checking legacy system...');
    const legacySettingsRef = doc(db, 'academic-settings', 'current-year');
    const legacySettingsDoc = await getDoc(legacySettingsRef);
    
    if (legacySettingsDoc.exists()) {
      const legacyData = legacySettingsDoc.data();
      console.log('✅ Legacy system found:');
      console.log(`   Current Year: ${legacyData.currentYear}`);
      console.log(`   Admission Status: ${legacyData.admissionStatus}`);
      console.log(`   Max Applications: ${legacyData.maxApplications}`);
    } else {
      console.log('❌ Legacy system not found');
    }
    
    // Test 4: Test admission status check (simulating public website)
    console.log('\n📋 Test 4: Testing admission status check (Public Website)...');
    const admissionStatus = await checkAdmissionStatus();
    
    console.log('📊 Public Website Admission Status:');
    console.log(`   Is Open: ${admissionStatus.isOpen ? '✅ YES' : '❌ NO'}`);
    console.log(`   Current Year: ${admissionStatus.currentYear}`);
    console.log(`   Status: ${admissionStatus.admissionStatus}`);
    console.log(`   Message: ${admissionStatus.message}`);
    
    // Test 5: Test Academic Affairs portal check
    console.log('\n📋 Test 5: Testing Academic Affairs Portal check...');
    const academicAffairsStatus = await checkAcademicAffairsStatus();
    
    console.log('📊 Academic Affairs Portal Status:');
    console.log(`   Is Open: ${academicAffairsStatus.isOpen ? '✅ YES' : '❌ NO'}`);
    console.log(`   Current Year: ${academicAffairsStatus.currentYear}`);
    console.log(`   Status: ${academicAffairsStatus.admissionStatus}`);
    console.log(`   Message: ${academicAffairsStatus.message}`);
    
    // Test 6: Check for consistency
    console.log('\n📋 Test 6: Checking system consistency...');
    const isConsistent = admissionStatus.isOpen === academicAffairsStatus.isOpen;
    const yearMatch = admissionStatus.currentYear === academicAffairsStatus.currentYear;
    
    console.log(`   Status Consistency: ${isConsistent ? '✅ MATCH' : '❌ MISMATCH'}`);
    console.log(`   Year Consistency: ${yearMatch ? '✅ MATCH' : '❌ MISMATCH'}`);
    
    // Test 7: Simulate what the public website sees
    console.log('\n📋 Test 7: Simulating Public Website Display...');
    console.log('🌐 Public Website should show:');
    if (admissionStatus.isOpen) {
      console.log('   ✅ "Admissions are open"');
      console.log('   ✅ Application form should be available');
      console.log('   ✅ Students can submit applications');
    } else {
      console.log('   ❌ "Admissions are currently closed"');
      console.log('   ❌ Application form should be hidden');
      console.log('   ❌ Students cannot submit applications');
    }
    
    // Test 8: Simulate what Academic Affairs portal sees
    console.log('\n📋 Test 8: Simulating Academic Affairs Portal Display...');
    console.log('🏢 Academic Affairs Portal should show:');
    if (academicAffairsStatus.isOpen) {
      console.log('   ✅ "OPEN" status');
      console.log('   ✅ Can manage applications');
      console.log('   ✅ Can view admission statistics');
    } else {
      console.log('   ❌ "CLOSED" status');
      console.log('   ❌ Limited functionality');
    }
    
    // Final summary
    console.log('\n📋 Final Test Summary:');
    console.log('='.repeat(40));
    
    if (admissionStatus.isOpen && academicAffairsStatus.isOpen) {
      console.log('🎉 SUCCESS: Both systems show admissions are OPEN');
      console.log('✅ Public website should work correctly');
      console.log('✅ Academic Affairs portal should work correctly');
      console.log('✅ Students can apply for admission');
    } else if (!admissionStatus.isOpen && !academicAffairsStatus.isOpen) {
      console.log('⚠️  BOTH CLOSED: Both systems show admissions are CLOSED');
      console.log('❌ Public website will show "closed" message');
      console.log('❌ Students cannot apply');
    } else {
      console.log('❌ MISMATCH: Systems show different statuses');
      console.log('❌ This indicates a synchronization issue');
      console.log('❌ Need to run sync script again');
    }
    
    console.log(`\n📊 Current Status:`);
    console.log(`   Public Website: ${admissionStatus.isOpen ? 'OPEN' : 'CLOSED'}`);
    console.log(`   Academic Affairs: ${academicAffairsStatus.isOpen ? 'OPEN' : 'CLOSED'}`);
    console.log(`   Current Year: ${admissionStatus.currentYear}`);
    
  } catch (error) {
    console.error('❌ Error during comprehensive test:', error);
  }
}

// Simulate public website admission status check
async function checkAdmissionStatus() {
  try {
    // Try centralized system first
    const systemConfigRef = doc(db, 'systemConfig', 'academicPeriod');
    const systemConfigDoc = await getDoc(systemConfigRef);
    
    let currentYear = null;
    let yearData = null;
    
    if (systemConfigDoc.exists()) {
      const systemData = systemConfigDoc.data();
      currentYear = systemData.currentAcademicYearId;
      
      if (currentYear) {
        const yearRef = doc(db, 'academic-years', currentYear);
        const yearDoc = await getDoc(yearRef);
        
        if (yearDoc.exists()) {
          yearData = yearDoc.data();
        }
      }
    }
    
    // Fallback to legacy system
    if (!currentYear || !yearData) {
      const settingsRef = doc(db, 'academic-settings', 'current-year');
      const settingsDoc = await getDoc(settingsRef);
      
      if (!settingsDoc.exists()) {
        return {
          isOpen: false,
          message: "No admission period is currently configured"
        };
      }
      
      const data = settingsDoc.data();
      currentYear = data.currentYear;
      
      const yearRef = doc(db, 'academic-years', currentYear);
      const yearDoc = await getDoc(yearRef);
      
      if (!yearDoc.exists()) {
        return {
          isOpen: false,
          message: "Admission period not found"
        };
      }
      
      yearData = yearDoc.data();
    }
    
    const isOpen = yearData.admissionStatus === 'open';
    
    return {
      isOpen,
      currentYear: yearData.displayName || yearData.year || currentYear,
      admissionStatus: yearData.admissionStatus,
      message: isOpen ? "Admissions are open" : "Admissions are currently closed"
    };
  } catch (error) {
    return {
      isOpen: false,
      message: `Connection error: ${error.message}`
    };
  }
}

// Simulate Academic Affairs portal admission status check
async function checkAcademicAffairsStatus() {
  try {
    const systemConfigRef = doc(db, 'systemConfig', 'academicPeriod');
    const systemConfigDoc = await getDoc(systemConfigRef);
    
    if (!systemConfigDoc.exists()) {
      return {
        isOpen: false,
        message: "No academic period configured"
      };
    }
    
    const systemData = systemConfigDoc.data();
    const currentYear = systemData.currentAcademicYearId;
    
    if (!currentYear) {
      return {
        isOpen: false,
        message: "No current academic year set"
      };
    }
    
    const yearRef = doc(db, 'academic-years', currentYear);
    const yearDoc = await getDoc(yearRef);
    
    if (!yearDoc.exists()) {
      return {
        isOpen: false,
        message: "Academic year not found"
      };
    }
    
    const yearData = yearDoc.data();
    const isOpen = yearData.admissionStatus === 'open';
    
    return {
      isOpen,
      currentYear: yearData.displayName || yearData.year || currentYear,
      admissionStatus: yearData.admissionStatus,
      message: isOpen ? "Admissions are open" : "Admissions are currently closed"
    };
  } catch (error) {
    return {
      isOpen: false,
      message: `Connection error: ${error.message}`
    };
  }
}

// Run the comprehensive test
comprehensiveAdmissionTest()
  .then(() => {
    console.log('\n✅ Comprehensive test completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Comprehensive test failed:', error);
    process.exit(1);
  });



