const { initializeApp } = require('firebase/app');
const { getFirestore, collection, query, where, getDocs } = require('firebase/firestore');

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyAuyOY9_N1P-JiSScRZtPqLJgRjpFoP7e4",
  authDomain: "ucaes2025.firebaseapp.com",
  projectId: "ucaes2025",
  storageBucket: "ucaes2025.appspot.com",
  messagingSenderId: "43080328075",
  appId: "1:43080328075:web:9c158b0bf08de7aa4b12f5"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function testDataForLetterGeneration() {
  try {
    console.log('🧪 Testing data preparation for admission letter...');
    
    const applicationId = 'UCAES20260003';
    
    // Step 1: Fetch application data
    console.log(`📋 Step 1: Fetching application ${applicationId}...`);
    const admissionsRef = collection(db, 'admission-applications');
    const q = query(admissionsRef, where('applicationId', '==', applicationId));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      console.log('❌ Application not found');
      return;
    }

    const applicationData = querySnapshot.docs[0].data();
    console.log('✅ Application found');
    console.log(`   Status: ${applicationData.applicationStatus}`);
    console.log(`   Name: ${applicationData.personalInfo?.firstName} ${applicationData.personalInfo?.lastName}`);
    console.log(`   Program: ${applicationData.programSelection?.firstChoice}`);
    console.log(`   Study Mode: ${applicationData.academicInfo?.studyMode}`);
    console.log(`   Level: ${applicationData.academicInfo?.level}`);

    // Check if application is approved
    if (applicationData.applicationStatus !== 'accepted') {
      console.log('❌ Application not approved - cannot generate letter');
      return;
    }

    // Step 2: Prepare student data
    console.log('\n📋 Step 2: Preparing student data...');
    
    const studentData = {
      applicationId: applicationData.applicationId,
      name: `${applicationData.personalInfo?.firstName || ''} ${applicationData.personalInfo?.lastName || ''}`.trim(),
      program: applicationData.programSelection?.firstChoice || 'Unknown Program',
      level: applicationData.academicInfo?.level || 'undergraduate',
      studyMode: applicationData.academicInfo?.studyMode || 'Regular',
      email: applicationData.contactInfo?.email || '',
      address: applicationData.contactInfo?.address || ''
    };

    console.log('✅ Student data prepared:');
    console.log('   Name:', studentData.name);
    console.log('   Program:', studentData.program);
    console.log('   Level:', studentData.level);
    console.log('   Study Mode:', studentData.studyMode);

    // Step 3: Test fee calculation
    console.log('\n📋 Step 3: Testing fee calculation...');
    
    // Import the fee structure function (simplified test)
    console.log(`   Looking up fees for level "${studentData.level}" and mode "${studentData.studyMode}"`);
    
    // Test different level normalization
    let normalizedLevel = studentData.level.replace(/^Level\s*/i, '').replace(/^L/i, '');
    console.log(`   Normalized level: "${normalizedLevel}"`);
    
    if (normalizedLevel.toLowerCase() === 'undergraduate' || normalizedLevel.toLowerCase() === 'hnd1' || normalizedLevel.toLowerCase() === 'year1') {
      normalizedLevel = '100';
      console.log(`   Mapped to level: "${normalizedLevel}"`);
    }

    console.log('✅ All data preparation steps completed successfully!');

  } catch (error) {
    console.error('💥 Error during test:', error);
  }
}

testDataForLetterGeneration();




























