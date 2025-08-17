const { initializeApp } = require('firebase/app');
const { getFirestore, doc, getDoc } = require('firebase/firestore');

// Firebase configuration - EXACTLY the same as the public website
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

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// EXACT function from the public website
async function checkAdmissionStatus() {
  try {
    console.log("🔍 Public Website: Checking admission status...");
    
    // Try centralized system first (systemConfig/academicPeriod)
    const systemConfigRef = doc(db, 'systemConfig', 'academicPeriod');
    const systemConfigDoc = await getDoc(systemConfigRef);
    
    let currentYear = null;
    let yearData = null;
    
    if (systemConfigDoc.exists()) {
      console.log("✅ Using centralized academic year system");
      const systemData = systemConfigDoc.data();
      currentYear = systemData.currentAcademicYearId;
      
      if (currentYear) {
        // Get the academic year document
        const yearRef = doc(db, 'academic-years', currentYear);
        const yearDoc = await getDoc(yearRef);
        
        if (yearDoc.exists()) {
          yearData = yearDoc.data();
          console.log(`📊 Found centralized admission status for ${systemData.currentAcademicYear}: ${yearData.admissionStatus}`);
        }
      }
    }
    
    // Fallback to legacy system (academic-settings/current-year) if centralized system doesn't have data
    if (!currentYear || !yearData) {
      console.log("⚠️ Centralized system not found, falling back to legacy system");
      const settingsRef = doc(db, 'academic-settings', 'current-year');
      const settingsDoc = await getDoc(settingsRef);
      
      if (!settingsDoc.exists()) {
        console.log("⚠️ No current academic year found in either system");
        return {
          isOpen: false,
          message: "No admission period is currently configured"
        };
      }
      
      const data = settingsDoc.data();
      currentYear = data.currentYear;
      
      // Get the academic year document
      const yearRef = doc(db, 'academic-years', currentYear);
      const yearDoc = await getDoc(yearRef);
      
      if (!yearDoc.exists()) {
        console.log("⚠️ Academic year document not found");
        return {
          isOpen: false,
          message: "Admission period not found"
        };
      }
      
      yearData = yearDoc.data();
      console.log(`📊 Using legacy admission status for ${currentYear}: ${yearData.admissionStatus}`);
    }
    
    const isOpen = yearData.admissionStatus === 'open';
    
    console.log(`📊 Final admission status: ${yearData.admissionStatus} (${isOpen ? 'OPEN' : 'CLOSED'})`);
    
    return {
      isOpen,
      currentYear: yearData.displayName || yearData.year || currentYear,
      admissionStatus: yearData.admissionStatus,
      message: isOpen ? "Admissions are open" : "Admissions are currently closed"
    };
  } catch (error) {
    console.error("❌ Public Website: Error checking admission status:", error);
    return {
      isOpen: false,
      message: `Connection error: ${error.message}`
    };
  }
}

async function testPublicWebsiteLogic() {
  console.log('🌐 Testing Public Website Logic');
  console.log('='.repeat(50));
  
  try {
    // Test the exact logic the public website uses
    console.log('\n📋 Testing Public Website Admission Status Check...');
    const status = await checkAdmissionStatus();
    
    console.log('\n📊 Public Website Result:');
    console.log(`   Is Open: ${status.isOpen ? '✅ YES' : '❌ NO'}`);
    console.log(`   Current Year: ${status.currentYear}`);
    console.log(`   Admission Status: ${status.admissionStatus}`);
    console.log(`   Message: ${status.message}`);
    
    // Simulate what the public website would display
    console.log('\n🌐 Public Website Display Simulation:');
    if (status.isOpen) {
      console.log('   ✅ Would show: "Admissions are open"');
      console.log('   ✅ Would display application form');
      console.log('   ✅ Students can apply');
      console.log('   ✅ Green banner with "OPEN" status');
    } else {
      console.log('   ❌ Would show: "Admissions are currently closed"');
      console.log('   ❌ Would hide application form');
      console.log('   ❌ Students cannot apply');
      console.log('   ❌ Red banner with "CLOSED" status');
    }
    
    // Compare with what you're seeing
    console.log('\n🔍 Comparison with Your Observation:');
    console.log(`   Expected (Firebase): ${status.isOpen ? 'OPEN' : 'CLOSED'}`);
    console.log(`   Observed (Website): CLOSED`);
    
    if (status.isOpen) {
      console.log('\n❌ MISMATCH DETECTED!');
      console.log('   Firebase shows OPEN but website shows CLOSED');
      console.log('   This indicates a caching or deployment issue');
      
      console.log('\n🔧 Possible Solutions:');
      console.log('   1. Clear browser cache (Ctrl+F5)');
      console.log('   2. Clear CDN cache if using one');
      console.log('   3. Restart the public website application');
      console.log('   4. Check if the website is deployed to the latest version');
      console.log('   5. Check if there are any environment variables overriding the status');
    } else {
      console.log('\n✅ MATCH DETECTED!');
      console.log('   Both Firebase and website show CLOSED');
      console.log('   The issue is in the Firebase configuration');
    }
    
  } catch (error) {
    console.error('❌ Error testing public website logic:', error);
  }
}

// Run the test
testPublicWebsiteLogic()
  .then(() => {
    console.log('\n✅ Public website logic test completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Public website logic test failed:', error);
    process.exit(1);
  });



