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

async function deepFirebaseAnalysis() {
  console.log('🔍 Deep Firebase Analysis - Why Public Website Still Shows Closed');
  console.log('='.repeat(70));
  
  try {
    // 1. Check all possible admission status configurations
    console.log('\n📋 1. Checking All Admission Status Configurations...');
    
    // Check centralized system
    console.log('\n🔍 Centralized System (systemConfig/academicPeriod):');
    const systemConfigRef = doc(db, 'systemConfig', 'academicPeriod');
    const systemConfigDoc = await getDoc(systemConfigRef);
    
    if (systemConfigDoc.exists()) {
      const systemData = systemConfigDoc.data();
      console.log('✅ Found:');
      console.log(`   Current Academic Year ID: ${systemData.currentAcademicYearId}`);
      console.log(`   Current Academic Year: ${systemData.currentAcademicYear}`);
      console.log(`   Last Updated: ${systemData.lastUpdated}`);
      console.log(`   Updated By: ${systemData.updatedBy}`);
      
      // Check the academic year document it points to
      if (systemData.currentAcademicYearId) {
        const yearRef = doc(db, 'academic-years', systemData.currentAcademicYearId);
        const yearDoc = await getDoc(yearRef);
        
        if (yearDoc.exists()) {
          const yearData = yearDoc.data();
          console.log(`   📅 Academic Year Document (${systemData.currentAcademicYearId}):`);
          console.log(`      Year: ${yearData.year}`);
          console.log(`      Display Name: ${yearData.displayName}`);
          console.log(`      Status: ${yearData.status}`);
          console.log(`      Admission Status: ${yearData.admissionStatus}`);
        } else {
          console.log(`   ❌ Academic Year Document (${systemData.currentAcademicYearId}) NOT FOUND`);
        }
      }
    } else {
      console.log('❌ No centralized system found');
    }
    
    // Check legacy system
    console.log('\n🔍 Legacy System (academic-settings/current-year):');
    const legacySettingsRef = doc(db, 'academic-settings', 'current-year');
    const legacySettingsDoc = await getDoc(legacySettingsRef);
    
    if (legacySettingsDoc.exists()) {
      const legacyData = legacySettingsDoc.data();
      console.log('✅ Found:');
      console.log(`   Current Year: ${legacyData.currentYear}`);
      console.log(`   Admission Status: ${legacyData.admissionStatus}`);
      console.log(`   Max Applications: ${legacyData.maxApplications}`);
      console.log(`   Updated At: ${legacyData.updatedAt}`);
      console.log(`   Updated By: ${legacyData.updatedBy}`);
    } else {
      console.log('❌ No legacy system found');
    }
    
    // 2. Check all academic year documents
    console.log('\n📋 2. Checking All Academic Year Documents...');
    const yearsCollection = collection(db, 'academic-years');
    const yearsSnapshot = await getDocs(yearsCollection);
    
    console.log(`Found ${yearsSnapshot.size} academic year documents:`);
    yearsSnapshot.forEach(doc => {
      const data = doc.data();
      console.log(`   📅 ${doc.id}:`);
      console.log(`      Year: ${data.year}`);
      console.log(`      Display Name: ${data.displayName}`);
      console.log(`      Status: ${data.status}`);
      console.log(`      Admission Status: ${data.admissionStatus}`);
    });
    
    // 3. Check if there are any other admission-related collections
    console.log('\n📋 3. Checking for Other Admission-Related Collections...');
    
    // Check if there's an admission-settings collection
    try {
      const admissionSettingsRef = doc(db, 'admission-settings', 'current');
      const admissionSettingsDoc = await getDoc(admissionSettingsRef);
      
      if (admissionSettingsDoc.exists()) {
        const admissionData = admissionSettingsDoc.data();
        console.log('✅ Found admission-settings/current:');
        console.log(`   Data: ${JSON.stringify(admissionData, null, 2)}`);
      } else {
        console.log('❌ No admission-settings/current found');
      }
    } catch (error) {
      console.log('❌ Error checking admission-settings:', error.message);
    }
    
    // 4. Simulate the exact logic the public website uses
    console.log('\n📋 4. Simulating Public Website Logic...');
    
    // Try centralized system first
    let publicWebsiteStatus = null;
    
    if (systemConfigDoc.exists()) {
      const systemData = systemConfigDoc.data();
      const currentYear = systemData.currentAcademicYearId;
      
      if (currentYear) {
        const yearRef = doc(db, 'academic-years', currentYear);
        const yearDoc = await getDoc(yearRef);
        
        if (yearDoc.exists()) {
          const yearData = yearDoc.data();
          publicWebsiteStatus = {
            source: 'centralized',
            isOpen: yearData.admissionStatus === 'open',
            currentYear: yearData.displayName || yearData.year || currentYear,
            admissionStatus: yearData.admissionStatus,
            documentId: currentYear
          };
        }
      }
    }
    
    // Fallback to legacy system
    if (!publicWebsiteStatus && legacySettingsDoc.exists()) {
      const legacyData = legacySettingsDoc.data();
      const currentYear = legacyData.currentYear;
      
      if (currentYear) {
        const yearRef = doc(db, 'academic-years', currentYear);
        const yearDoc = await getDoc(yearRef);
        
        if (yearDoc.exists()) {
          const yearData = yearDoc.data();
          publicWebsiteStatus = {
            source: 'legacy',
            isOpen: yearData.admissionStatus === 'open',
            currentYear: yearData.displayName || yearData.year || currentYear,
            admissionStatus: yearData.admissionStatus,
            documentId: currentYear
          };
        }
      }
    }
    
    // 5. Analysis Results
    console.log('\n📋 5. Public Website Status Analysis...');
    
    if (publicWebsiteStatus) {
      console.log('✅ Public Website would show:');
      console.log(`   Source: ${publicWebsiteStatus.source}`);
      console.log(`   Is Open: ${publicWebsiteStatus.isOpen ? 'YES' : 'NO'}`);
      console.log(`   Current Year: ${publicWebsiteStatus.currentYear}`);
      console.log(`   Admission Status: ${publicWebsiteStatus.admissionStatus}`);
      console.log(`   Document ID: ${publicWebsiteStatus.documentId}`);
      
      if (publicWebsiteStatus.isOpen) {
        console.log('   ✅ Should show "Admissions are open"');
      } else {
        console.log('   ❌ Should show "Admissions are closed"');
      }
    } else {
      console.log('❌ Public Website would show: No admission period configured');
    }
    
    // 6. Compare with Academic Affairs Portal
    console.log('\n📋 6. Academic Affairs Portal vs Public Website Comparison...');
    
    if (systemConfigDoc.exists()) {
      const systemData = systemConfigDoc.data();
      console.log('🏢 Academic Affairs Portal reads from:');
      console.log(`   systemConfig/academicPeriod`);
      console.log(`   Current Academic Year ID: ${systemData.currentAcademicYearId}`);
      
      if (publicWebsiteStatus) {
        console.log('\n🌐 Public Website reads from:');
        console.log(`   ${publicWebsiteStatus.source} system`);
        console.log(`   Document ID: ${publicWebsiteStatus.documentId}`);
        
        if (systemData.currentAcademicYearId === publicWebsiteStatus.documentId) {
          console.log('\n✅ Both systems point to the same document');
        } else {
          console.log('\n❌ Systems point to different documents!');
          console.log('   This is the cause of the mismatch!');
        }
      }
    }
    
    // 7. Recommendations
    console.log('\n📋 7. Recommendations...');
    console.log('='.repeat(30));
    
    if (publicWebsiteStatus && !publicWebsiteStatus.isOpen) {
      console.log('🔧 To fix the public website:');
      console.log(`   1. Ensure document ${publicWebsiteStatus.documentId} has admissionStatus: "open"`);
      console.log(`   2. Or update systemConfig to point to a document with admissionStatus: "open"`);
      console.log(`   3. Check if there are any caching issues on the public website`);
    } else if (publicWebsiteStatus && publicWebsiteStatus.isOpen) {
      console.log('✅ Public website should show OPEN status');
      console.log('   If it still shows closed, check for:');
      console.log('   1. Browser caching issues');
      console.log('   2. CDN caching issues');
      console.log('   3. Application-level caching');
    }
    
  } catch (error) {
    console.error('❌ Error during deep analysis:', error);
  }
}

// Run the analysis
deepFirebaseAnalysis()
  .then(() => {
    console.log('\n✅ Deep Firebase analysis completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Deep Firebase analysis failed:', error);
    process.exit(1);
  });



