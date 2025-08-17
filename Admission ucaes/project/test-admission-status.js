const { initializeApp } = require('firebase/app');
const { getFirestore, doc, getDoc } = require('firebase/firestore');

const firebaseConfig = {
  apiKey: 'AIzaSyCWj01Z1zScFJbTh5ChqsLEEZZdmBOjlUE',
  authDomain: 'ucaes2025.firebaseapp.com',
  projectId: 'ucaes2025',
  storageBucket: 'ucaes2025.firebasestorage.app',
  messagingSenderId: '543217800581',
  appId: '1:543217800581:web:4f97ba0087f694deeea0ec'
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// This is the exact function from the admission website
const checkAdmissionStatus = async () => {
  try {
    console.log('🔍 Checking admission status...');
    
    // Try centralized system first (systemConfig/academicPeriod)
    const systemConfigRef = doc(db, 'systemConfig', 'academicPeriod');
    const systemConfigDoc = await getDoc(systemConfigRef);
    
    let currentYear = null;
    let yearData = null;
    
    if (systemConfigDoc.exists()) {
      console.log('✅ Using centralized academic year system');
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
    
    const isOpen = yearData.admissionStatus === 'open';
    
    console.log(`📊 Final admission status: ${yearData.admissionStatus} (${isOpen ? 'OPEN' : 'CLOSED'})`);
    
    return {
      isOpen,
      currentYear: yearData.displayName || yearData.year || currentYear,
      admissionStatus: yearData.admissionStatus,
      message: isOpen ? 'Admissions are open' : 'Admissions are currently closed'
    };
  } catch (error) {
    console.error('❌ Error checking admission status:', error);
    return {
      isOpen: false,
      message: 'Error checking admission status'
    };
  }
};

// Test the function
checkAdmissionStatus().then(result => {
  console.log('');
  console.log('🎯 ADMISSION WEBSITE RESULT:');
  console.log('   Status:', result.isOpen ? '🟢 OPEN' : '🔴 CLOSED');
  console.log('   Academic Year:', result.currentYear);
  console.log('   Message:', result.message);
  console.log('');
  console.log('✅ The admission website is now using the academic year set by the Director!');
  process.exit(0);
}).catch(e => { 
  console.error(e); 
  process.exit(1); 
});

