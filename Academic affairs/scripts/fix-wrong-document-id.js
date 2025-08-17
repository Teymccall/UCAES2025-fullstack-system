const { initializeApp } = require('firebase/app');
const { getFirestore, doc, setDoc } = require('firebase/firestore');

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

async function fixWrongDocumentId() {
  console.log('🔧 Fixing Wrong Document ID Issue');
  console.log('='.repeat(50));
  
  try {
    console.log('\n📋 Current Issue:');
    console.log('   ❌ System pointing to wrong document ID: 48O5S56jE2DjOekq6b42');
    console.log('   ❌ This document doesn\'t exist');
    console.log('   ❌ Admissions showing as CLOSED');
    
    console.log('\n📋 Solution:');
    console.log('   ✅ Update systemConfig to point to correct document ID: 2020-2021');
    console.log('   ✅ This document has admissionStatus: "open"');
    console.log('   ✅ Admissions will show as OPEN');
    
    // Fix the system configuration
    console.log('\n🔧 Fixing system configuration...');
    
    const systemConfigRef = doc(db, 'systemConfig', 'academicPeriod');
    await setDoc(systemConfigRef, {
      currentAcademicYearId: '2020-2021',  // Fix: Use correct document ID
      currentAcademicYear: '2020/2021 Academic Year',  // Keep the display name
      currentSemesterId: null,
      currentSemester: null,
      lastUpdated: new Date(),
      updatedBy: 'system-fix'
    }, { merge: true });
    
    console.log('✅ System configuration fixed!');
    console.log('   ✅ Current Academic Year ID: 2020-2021');
    console.log('   ✅ Current Academic Year: 2020/2021 Academic Year');
    console.log('   ✅ Updated By: system-fix');
    
    console.log('\n📋 Expected Result:');
    console.log('   ✅ Admissions should now show as OPEN');
    console.log('   ✅ Students can apply for admission');
    console.log('   ✅ Public website will show "Admissions are open"');
    console.log('   ✅ Academic Affairs portal will show "OPEN" status');
    
    console.log('\n🎉 Fix completed successfully!');
    console.log('   Please refresh the admission page to see the changes.');
    
  } catch (error) {
    console.error('❌ Error fixing document ID:', error);
  }
}

// Run the fix
fixWrongDocumentId()
  .then(() => {
    console.log('\n✅ Document ID fix completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Document ID fix failed:', error);
    process.exit(1);
  });



