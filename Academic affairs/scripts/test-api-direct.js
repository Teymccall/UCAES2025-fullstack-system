const { initializeApp, getApps, cert } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");
const fs = require('fs');
const path = require('path');

async function testAPILogic() {
  console.log("🧪 Testing API Logic Directly")
  console.log("=" .repeat(40))
  
  try {
    console.log('🔍 Starting admission settings fetch...');
    
    // Load service account
    const serviceAccountPath = path.join(process.cwd(), '..', 'ucaes2025-firebase-adminsdk-fbsvc-c70a08a455.json');
    
    if (!fs.existsSync(serviceAccountPath)) {
      throw new Error(`Service account not found at ${serviceAccountPath}`);
    }
    
    const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
    console.log('✅ Service account loaded for project:', serviceAccount.project_id);
    
    // Initialize Firebase Admin with explicit credentials
    let app;
    const existingApps = getApps();
    
    // Use existing app if available, otherwise create new one
    if (existingApps.length > 0) {
      app = existingApps[0];
      console.log('✅ Using existing Firebase Admin app');
    } else {
      app = initializeApp({
        credential: cert(serviceAccount),
        databaseURL: "https://ucaes2025-default-rtdb.firebaseio.com",
        projectId: serviceAccount.project_id
      });
      console.log('✅ Created new Firebase Admin app');
    }
    console.log('✅ Firebase Admin app initialized');
    
    // Get Firestore instance
    const adminDb = getFirestore(app);
    console.log('✅ Firestore instance created');
    
    // Get current year from systemConfig (centralized system)
    const systemConfigRef = adminDb.collection('systemConfig').doc('academicPeriod');
    const systemConfigDoc = await systemConfigRef.get();
    
    let currentYear = null;
    if (systemConfigDoc.exists) {
      const systemData = systemConfigDoc.data();
      console.log('✅ Found systemConfig:', systemData);
      
      if (systemData?.currentAcademicYearId) {
        // Get the actual academic year document
        const yearRef = adminDb.collection('academic-years').doc(systemData.currentAcademicYearId);
        const yearDoc = await yearRef.get();
        
        if (yearDoc.exists) {
          const yearData = yearDoc.data();
          currentYear = {
            id: yearDoc.id,
            year: yearData?.year || '',
            displayName: yearData?.displayName || yearData?.year || '',
            admissionStatus: yearData?.admissionStatus || 'closed',
            startDate: yearData?.startDate ? (typeof yearData.startDate.toDate === 'function' ? yearData.startDate.toDate().toISOString() : yearData.startDate) : '',
            endDate: yearData?.endDate ? (typeof yearData.endDate.toDate === 'function' ? yearData.endDate.toDate().toISOString() : yearData.endDate) : '',
            maxApplications: yearData?.maxApplications || null,
            currentApplications: yearData?.currentApplications || 0,
            admissionStartDate: yearData?.admissionStartDate ? (typeof yearData.admissionStartDate.toDate === 'function' ? yearData.admissionStartDate.toDate().toISOString() : yearData.admissionStartDate) : '',
            admissionEndDate: yearData?.admissionEndDate ? (typeof yearData.admissionEndDate.toDate === 'function' ? yearData.admissionEndDate.toDate().toISOString() : yearData.admissionEndDate) : ''
          };
          console.log('✅ Found current academic year:', currentYear);
        }
      }
    } else {
      console.log('⚠️ No systemConfig found - director needs to set current academic year');
    }
    
    // Get all academic years using Firebase Admin SDK
    console.log('🔍 Fetching all academic years...');
    const yearsCollection = adminDb.collection('academic-years');
    const yearsSnapshot = await yearsCollection.get();
    const availableYears = yearsSnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        year: data.year || '',
        displayName: data.displayName || data.year || '',
        startDate: data.startDate ? (typeof data.startDate.toDate === 'function' ? data.startDate.toDate().toISOString() : data.startDate) : '',
        endDate: data.endDate ? (typeof data.endDate.toDate === 'function' ? data.endDate.toDate().toISOString() : data.endDate) : '',
        admissionStatus: data.admissionStatus || 'closed',
      };
    });
    
    // Sort in JavaScript
    availableYears.sort((a, b) => b.year.localeCompare(a.year));
    
    console.log(`✅ Found ${availableYears.length} academic years`);
    
    // Simple statistics
    const statistics = {
      totalApplications: 0,
      maxApplications: currentYear?.maxApplications || null,
      admissionStartDate: currentYear?.admissionStartDate || '',
      admissionEndDate: currentYear?.admissionEndDate || ''
    };
    
    const apiResponse = {
      success: true,
      currentYear,
      statistics,
      availableYears
    };
    
    console.log('\n📊 API Response Preview:');
    console.log('Success:', apiResponse.success);
    console.log('Current Year:', apiResponse.currentYear?.displayName || 'None');
    console.log('Available Years Count:', apiResponse.availableYears.length);
    
    // Test JSON serialization
    console.log('\n🔄 Testing JSON serialization...');
    const jsonString = JSON.stringify(apiResponse);
    console.log('✅ JSON serialization successful');
    console.log('Response size:', jsonString.length, 'characters');
    
    console.log('\n🎉 API Logic Test Completed Successfully!');
    console.log('The API should work correctly now.');
    
  } catch (error) {
    console.error('❌ API Logic Test Failed:', error);
    console.log('\nError details:');
    console.log(`   Message: ${error.message}`);
    console.log(`   Stack: ${error.stack}`);
  }
}

// Run the test
testAPILogic()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Test failed:", error);
    process.exit(1);
  });