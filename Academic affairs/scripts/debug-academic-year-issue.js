const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, doc, getDoc } = require('firebase/firestore');

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

async function debugAcademicYearIssue() {
  console.log('🔍 Debugging Academic Year Issue...');
  console.log('='.repeat(50));
  
  try {
    // 1. Check all academic years in the collection
    console.log('\n📋 1. All Academic Years in Collection:');
    console.log('-'.repeat(40));
    
    const yearsRef = collection(db, 'academic-years');
    const yearsSnapshot = await getDocs(yearsRef);
    
    if (yearsSnapshot.empty) {
      console.log('❌ No academic years found in the collection!');
      return;
    }
    
    console.log(`✅ Found ${yearsSnapshot.size} academic year(s):`);
    const academicYears = [];
    
    yearsSnapshot.forEach(doc => {
      const data = doc.data();
      const yearInfo = {
        id: doc.id,
        year: data.year || 'N/A',
        displayName: data.displayName || 'N/A',
        status: data.status || 'N/A',
        startDate: data.startDate || 'N/A',
        endDate: data.endDate || 'N/A'
      };
      academicYears.push(yearInfo);
      
      console.log(`\n📄 Document ID: ${doc.id}`);
      console.log(`   Year: ${yearInfo.year}`);
      console.log(`   Display Name: ${yearInfo.displayName}`);
      console.log(`   Status: ${yearInfo.status}`);
      console.log(`   Start Date: ${yearInfo.startDate}`);
      console.log(`   End Date: ${yearInfo.endDate}`);
    });
    
    // 2. Check systemConfig
    console.log('\n📋 2. System Configuration:');
    console.log('-'.repeat(40));
    
    try {
      const systemConfigRef = doc(db, 'systemConfig', 'academicPeriod');
      const systemConfigDoc = await getDoc(systemConfigRef);
      
      if (systemConfigDoc.exists()) {
        const systemData = systemConfigDoc.data();
        console.log('✅ SystemConfig found:');
        console.log(`   Current Academic Year ID: ${systemData.currentAcademicYearId || 'N/A'}`);
        console.log(`   Current Academic Year: ${systemData.currentAcademicYear || 'N/A'}`);
        console.log(`   Current Semester ID: ${systemData.currentSemesterId || 'N/A'}`);
        console.log(`   Current Semester: ${systemData.currentSemester || 'N/A'}`);
        console.log(`   Last Updated: ${systemData.lastUpdated || 'N/A'}`);
        console.log(`   Updated By: ${systemData.updatedBy || 'N/A'}`);
        
        // Check if the currentAcademicYearId exists in academic-years collection
        if (systemData.currentAcademicYearId) {
          const currentYearRef = doc(db, 'academic-years', systemData.currentAcademicYearId);
          const currentYearDoc = await getDoc(currentYearRef);
          
          if (currentYearDoc.exists) {
            console.log(`✅ Current academic year document exists: ${systemData.currentAcademicYearId}`);
          } else {
            console.log(`❌ Current academic year document NOT found: ${systemData.currentAcademicYearId}`);
            console.log('💡 This is the issue! The systemConfig references a document that doesn\'t exist.');
          }
        }
      } else {
        console.log('❌ No systemConfig found');
      }
    } catch (error) {
      console.log('❌ Error checking systemConfig:', error.message);
    }
    
    // 3. Test specific document IDs that might be causing issues
    console.log('\n📋 3. Testing Specific Document IDs:');
    console.log('-'.repeat(40));
    
    const testIds = ['2020-2021', '2026-2027', '2025', '2024-2025'];
    
    for (const testId of testIds) {
      try {
        const testRef = doc(db, 'academic-years', testId);
        const testDoc = await getDoc(testRef);
        
        if (testDoc.exists) {
          const data = testDoc.data();
          console.log(`✅ Document ${testId} exists:`);
          console.log(`   Year: ${data.year || 'N/A'}`);
          console.log(`   Display Name: ${data.displayName || 'N/A'}`);
          console.log(`   Status: ${data.status || 'N/A'}`);
        } else {
          console.log(`❌ Document ${testId} does NOT exist`);
        }
      } catch (error) {
        console.log(`❌ Error checking ${testId}:`, error.message);
      }
    }
    
    // 4. Summary and recommendations
    console.log('\n📋 4. Summary and Recommendations:');
    console.log('-'.repeat(40));
    
    console.log('🔍 Issue Analysis:');
    console.log('   - The admissions page is trying to set "2020-2021" as current year');
    console.log('   - But this document ID doesn\'t exist in the academic-years collection');
    console.log('   - The director has created years with different document IDs');
    
    console.log('\n💡 Recommendations:');
    console.log('   1. Check what document ID the director actually created');
    console.log('   2. Either create the missing "2020-2021" document');
    console.log('   3. Or update the dropdown to show the correct available years');
    console.log('   4. Ensure the systemConfig.currentAcademicYearId matches an existing document');
    
    console.log('\n🛠️ Available Document IDs:');
    academicYears.forEach(year => {
      console.log(`   - ${year.id} (${year.displayName})`);
    });
    
  } catch (error) {
    console.error('❌ Error during debugging:', error);
  }
}

// Run the debug function
debugAcademicYearIssue()
  .then(() => {
    console.log('\n✅ Debug completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Debug failed:', error);
    process.exit(1);
  });

