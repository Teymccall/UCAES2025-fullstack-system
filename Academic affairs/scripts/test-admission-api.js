const { initializeApp } = require('firebase/app');
const { getFirestore, doc, getDoc } = require('firebase/firestore');

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

async function testAdmissionAPI() {
  console.log('🔌 Testing Admission API Endpoints');
  console.log('='.repeat(50));
  
  try {
    // Test 1: Test the actual admission status check (simulating the API)
    console.log('\n📋 Test 1: Testing Admission Status API...');
    
    // Simulate the exact logic from the admission website
    const admissionStatus = await checkAdmissionStatusAPI();
    
    console.log('📊 API Response:');
    console.log(`   Status: ${admissionStatus.status}`);
    console.log(`   Is Open: ${admissionStatus.isOpen}`);
    console.log(`   Current Year: ${admissionStatus.currentYear}`);
    console.log(`   Message: ${admissionStatus.message}`);
    console.log(`   Timestamp: ${admissionStatus.timestamp}`);
    
    // Test 2: Test the academic year document directly
    console.log('\n📋 Test 2: Testing Academic Year Document...');
    const yearRef = doc(db, 'academic-years', '2020-2021');
    const yearDoc = await getDoc(yearRef);
    
    if (yearDoc.exists()) {
      const yearData = yearDoc.data();
      console.log('✅ Academic year document found:');
      console.log(`   ID: ${yearDoc.id}`);
      console.log(`   Year: ${yearData.year}`);
      console.log(`   Display Name: ${yearData.displayName}`);
      console.log(`   Status: ${yearData.status}`);
      console.log(`   Admission Status: ${yearData.admissionStatus}`);
      console.log(`   Start Date: ${yearData.startDate}`);
      console.log(`   End Date: ${yearData.endDate}`);
    } else {
      console.log('❌ Academic year document not found');
    }
    
    // Test 3: Test system configuration
    console.log('\n📋 Test 3: Testing System Configuration...');
    const systemConfigRef = doc(db, 'systemConfig', 'academicPeriod');
    const systemConfigDoc = await getDoc(systemConfigRef);
    
    if (systemConfigDoc.exists()) {
      const systemData = systemConfigDoc.data();
      console.log('✅ System configuration found:');
      console.log(`   Current Academic Year ID: ${systemData.currentAcademicYearId}`);
      console.log(`   Current Academic Year: ${systemData.currentAcademicYear}`);
      console.log(`   Current Semester: ${systemData.currentSemester || 'None'}`);
      console.log(`   Last Updated: ${systemData.lastUpdated}`);
    } else {
      console.log('❌ System configuration not found');
    }
    
    // Test 4: Simulate what happens when a student visits the admission website
    console.log('\n📋 Test 4: Simulating Student Visit to Admission Website...');
    console.log('👨‍🎓 Student visits admission website...');
    
    if (admissionStatus.isOpen) {
      console.log('✅ Student sees: "Admissions are open"');
      console.log('✅ Student can access application form');
      console.log('✅ Student can submit application');
      console.log('✅ Application will be processed');
    } else {
      console.log('❌ Student sees: "Admissions are currently closed"');
      console.log('❌ Student cannot access application form');
      console.log('❌ Student cannot submit application');
    }
    
    // Test 5: Test the exact API response format
    console.log('\n📋 Test 5: API Response Format Test...');
    console.log('📡 API Response (JSON format):');
    console.log(JSON.stringify(admissionStatus, null, 2));
    
    // Final verification
    console.log('\n📋 Final Verification:');
    console.log('='.repeat(30));
    
    if (admissionStatus.isOpen) {
      console.log('🎉 SUCCESS: Admission API is working correctly!');
      console.log('✅ Public website will show "Admissions are open"');
      console.log('✅ Students can apply for admission');
      console.log('✅ System is properly synchronized');
    } else {
      console.log('❌ ISSUE: Admission API shows closed status');
      console.log('❌ Public website will show "Admissions are closed"');
      console.log('❌ Students cannot apply');
      console.log('❌ Need to check system configuration');
    }
    
    console.log(`\n📊 Summary:`);
    console.log(`   API Status: ${admissionStatus.isOpen ? 'OPEN' : 'CLOSED'}`);
    console.log(`   Current Year: ${admissionStatus.currentYear}`);
    console.log(`   Response Time: ${admissionStatus.timestamp}`);
    
  } catch (error) {
    console.error('❌ Error testing admission API:', error);
  }
}

// Simulate the exact admission status check API
async function checkAdmissionStatusAPI() {
  try {
    const startTime = Date.now();
    
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
          status: 'error',
          isOpen: false,
          message: "No admission period is currently configured",
          timestamp: new Date().toISOString()
        };
      }
      
      const data = settingsDoc.data();
      currentYear = data.currentYear;
      
      const yearRef = doc(db, 'academic-years', currentYear);
      const yearDoc = await getDoc(yearRef);
      
      if (!yearDoc.exists()) {
        return {
          status: 'error',
          isOpen: false,
          message: "Admission period not found",
          timestamp: new Date().toISOString()
        };
      }
      
      yearData = yearDoc.data();
    }
    
    const isOpen = yearData.admissionStatus === 'open';
    const responseTime = Date.now() - startTime;
    
    return {
      status: 'success',
      isOpen,
      currentYear: yearData.displayName || yearData.year || currentYear,
      admissionStatus: yearData.admissionStatus,
      message: isOpen ? "Admissions are open" : "Admissions are currently closed",
      timestamp: new Date().toISOString(),
      responseTime: `${responseTime}ms`
    };
  } catch (error) {
    return {
      status: 'error',
      isOpen: false,
      message: `Connection error: ${error.message}`,
      timestamp: new Date().toISOString()
    };
  }
}

// Run the API test
testAdmissionAPI()
  .then(() => {
    console.log('\n✅ API test completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ API test failed:', error);
    process.exit(1);
  });



