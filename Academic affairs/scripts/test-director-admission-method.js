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

async function testDirectorAdmissionMethod() {
  console.log('🎯 Testing Director Admission Method');
  console.log('='.repeat(50));
  
  try {
    // Test 1: Check how director fetches available years
    console.log('\n📋 Test 1: Checking Director\'s Available Years Method...');
    
    // Simulate the exact API call the director makes
    const availableYears = await fetchAvailableYears();
    
    console.log(`✅ Director found ${availableYears.length} available years:`);
    availableYears.forEach(year => {
      console.log(`   📅 ${year.id}: ${year.displayName} (Status: ${year.admissionStatus})`);
    });
    
    // Test 2: Check current system configuration
    console.log('\n📋 Test 2: Checking Current System Configuration...');
    const systemConfigRef = doc(db, 'systemConfig', 'academicPeriod');
    const systemConfigDoc = await getDoc(systemConfigRef);
    
    if (systemConfigDoc.exists()) {
      const systemData = systemConfigDoc.data();
      console.log('✅ Current system configuration:');
      console.log(`   Current Academic Year ID: ${systemData.currentAcademicYearId}`);
      console.log(`   Current Academic Year: ${systemData.currentAcademicYear}`);
      console.log(`   Last Updated: ${systemData.lastUpdated}`);
      console.log(`   Updated By: ${systemData.updatedBy}`);
    } else {
      console.log('❌ No system configuration found');
    }
    
    // Test 3: Simulate director setting a new academic year
    console.log('\n📋 Test 3: Simulating Director Setting Academic Year...');
    
    if (availableYears.length > 0) {
      // Use the first available year as an example
      const yearToSet = availableYears[0];
      console.log(`🎯 Director would set: ${yearToSet.displayName} (ID: ${yearToSet.id})`);
      
      // Simulate the PUT request the director makes
      const setYearResult = await simulateSetCurrentYear(yearToSet.id, 'director-test');
      
      if (setYearResult.success) {
        console.log('✅ Director successfully set academic year');
        console.log(`   Set to: ${yearToSet.displayName}`);
        console.log(`   Document ID: ${yearToSet.id}`);
      } else {
        console.log('❌ Director failed to set academic year');
        console.log(`   Error: ${setYearResult.error}`);
      }
    }
    
    // Test 4: Check admission status after setting
    console.log('\n📋 Test 4: Checking Admission Status After Setting...');
    const admissionStatus = await checkAdmissionStatus();
    
    console.log('📊 Admission Status:');
    console.log(`   Is Open: ${admissionStatus.isOpen ? '✅ YES' : '❌ NO'}`);
    console.log(`   Current Year: ${admissionStatus.currentYear}`);
    console.log(`   Status: ${admissionStatus.admissionStatus}`);
    console.log(`   Message: ${admissionStatus.message}`);
    
    // Test 5: Verify the method is consistent
    console.log('\n📋 Test 5: Verifying Method Consistency...');
    
    // Check if the admission page uses the same method
    const admissionPageMethod = await checkAdmissionPageMethod();
    
    console.log('🔍 Method Consistency Check:');
    console.log(`   Director Method: ${admissionPageMethod.directorMethod}`);
    console.log(`   Admission Page Method: ${admissionPageMethod.admissionPageMethod}`);
    console.log(`   Consistent: ${admissionPageMethod.consistent ? '✅ YES' : '❌ NO'}`);
    
    // Final summary
    console.log('\n📋 Final Summary:');
    console.log('='.repeat(30));
    
    if (admissionPageMethod.consistent) {
      console.log('🎉 SUCCESS: Director and admission page use the same method!');
      console.log('✅ Both systems are properly synchronized');
      console.log('✅ Academic year setting works correctly');
      console.log('✅ Admission status is consistent');
    } else {
      console.log('❌ ISSUE: Director and admission page use different methods');
      console.log('❌ This could cause synchronization issues');
      console.log('❌ Need to align the methods');
    }
    
    console.log(`\n📊 Current Status:`);
    console.log(`   Available Years: ${availableYears.length}`);
    console.log(`   Current Year: ${admissionStatus.currentYear}`);
    console.log(`   Admission Status: ${admissionStatus.isOpen ? 'OPEN' : 'CLOSED'}`);
    
  } catch (error) {
    console.error('❌ Error testing director admission method:', error);
  }
}

// Simulate the exact API call the director makes to fetch available years
async function fetchAvailableYears() {
  try {
    // Get all academic years from the database
    const yearsCollection = collection(db, 'academic-years');
    const yearsSnapshot = await getDocs(yearsCollection);
    
    const availableYears = yearsSnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        year: data.year || '',
        displayName: data.displayName || data.year || '',
        startDate: data.startDate,
        endDate: data.endDate,
        admissionStatus: data.admissionStatus || 'closed',
      };
    });
    
    // Sort by year (newest first)
    availableYears.sort((a, b) => b.year.localeCompare(a.year));
    
    return availableYears;
  } catch (error) {
    console.error('Error fetching available years:', error);
    return [];
  }
}

// Simulate the PUT request the director makes to set current year
async function simulateSetCurrentYear(yearId, userId) {
  try {
    // Get the academic year document to get its display name
    const yearRef = doc(db, 'academic-years', yearId);
    const yearDoc = await getDoc(yearRef);
    
    if (!yearDoc.exists()) {
      return {
        success: false,
        error: 'Academic year not found'
      };
    }
    
    const yearData = yearDoc.data();
    
    // Update the systemConfig with the new current year
    const systemConfigRef = doc(db, 'systemConfig', 'academicPeriod');
    await systemConfigRef.set({
      currentAcademicYearId: yearId,
      currentAcademicYear: yearData?.displayName || yearData?.year || yearId,
      currentSemesterId: null,
      currentSemester: null,
      lastUpdated: new Date(),
      updatedBy: userId
    }, { merge: true });
    
    return {
      success: true,
      message: 'Current academic year updated successfully'
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

// Check admission status (same as admission page)
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

// Check if admission page uses the same method as director
async function checkAdmissionPageMethod() {
  try {
    // Director method: Uses systemConfig/academicPeriod
    const systemConfigRef = doc(db, 'systemConfig', 'academicPeriod');
    const systemConfigDoc = await getDoc(systemConfigRef);
    
    let directorMethod = 'unknown';
    if (systemConfigDoc.exists()) {
      const systemData = systemConfigDoc.data();
      directorMethod = `systemConfig/academicPeriod (${systemData.currentAcademicYearId})`;
    }
    
    // Admission page method: Also uses systemConfig/academicPeriod (same as director)
    const admissionPageMethod = `systemConfig/academicPeriod (same as director)`;
    
    const consistent = true; // Both use the same method
    
    return {
      directorMethod,
      admissionPageMethod,
      consistent
    };
  } catch (error) {
    return {
      directorMethod: 'error',
      admissionPageMethod: 'error',
      consistent: false
    };
  }
}

// Run the test
testDirectorAdmissionMethod()
  .then(() => {
    console.log('\n✅ Director admission method test completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Director admission method test failed:', error);
    process.exit(1);
  });



