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

async function checkSpecificDocument() {
  console.log('🔍 Checking Specific Document Issue');
  console.log('='.repeat(50));
  
  try {
    // Check the problematic document ID
    const problematicDocId = '4805S56jE2DjOekq6b42';
    console.log(`\n📋 Checking document: ${problematicDocId}`);
    
    const docRef = doc(db, 'academic-years', problematicDocId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data();
      console.log('✅ Document found:');
      console.log(`   ID: ${docSnap.id}`);
      console.log(`   Year: ${data.year}`);
      console.log(`   Display Name: ${data.displayName}`);
      console.log(`   Status: ${data.status}`);
      console.log(`   Admission Status: ${data.admissionStatus}`);
      console.log(`   Start Date: ${data.startDate}`);
      console.log(`   End Date: ${data.endDate}`);
    } else {
      console.log('❌ Document not found');
    }
    
    // Check the correct document ID
    console.log('\n📋 Checking correct document: 2020-2021');
    
    const correctDocRef = doc(db, 'academic-years', '2020-2021');
    const correctDocSnap = await getDoc(correctDocRef);
    
    if (correctDocSnap.exists()) {
      const correctData = correctDocSnap.data();
      console.log('✅ Correct document found:');
      console.log(`   ID: ${correctDocSnap.id}`);
      console.log(`   Year: ${correctData.year}`);
      console.log(`   Display Name: ${correctData.displayName}`);
      console.log(`   Status: ${correctData.status}`);
      console.log(`   Admission Status: ${correctData.admissionStatus}`);
      console.log(`   Start Date: ${correctData.startDate}`);
      console.log(`   End Date: ${correctData.endDate}`);
    } else {
      console.log('❌ Correct document not found');
    }
    
    // Check current system configuration
    console.log('\n📋 Checking current system configuration...');
    
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
    
    // Analysis
    console.log('\n📋 Analysis:');
    console.log('='.repeat(30));
    
    if (docSnap.exists() && correctDocSnap.exists()) {
      const data = docSnap.data();
      const correctData = correctDocSnap.data();
      
      console.log('🔍 Issue Analysis:');
      console.log(`   Problematic Document (${problematicDocId}):`);
      console.log(`     - Year: ${data.year}`);
      console.log(`     - Admission Status: ${data.admissionStatus}`);
      console.log(`     - Display Name: ${data.displayName}`);
      
      console.log(`   Correct Document (2020-2021):`);
      console.log(`     - Year: ${correctData.year}`);
      console.log(`     - Admission Status: ${correctData.admissionStatus}`);
      console.log(`     - Display Name: ${correctData.displayName}`);
      
      if (data.admissionStatus === 'closed' && correctData.admissionStatus === 'open') {
        console.log('\n❌ PROBLEM IDENTIFIED:');
        console.log('   The system is pointing to the wrong document!');
        console.log('   - Wrong document has admissionStatus: "closed"');
        console.log('   - Correct document has admissionStatus: "open"');
        console.log('   - This is why admissions show as CLOSED');
      }
    }
    
    // Solution
    console.log('\n📋 Solution:');
    console.log('='.repeat(20));
    console.log('✅ Need to update systemConfig to point to "2020-2021" instead of the problematic document ID');
    console.log('✅ This will fix the admission status to show as OPEN');
    
  } catch (error) {
    console.error('❌ Error checking documents:', error);
  }
}

// Run the check
checkSpecificDocument()
  .then(() => {
    console.log('\n✅ Document check completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Document check failed:', error);
    process.exit(1);
  });




