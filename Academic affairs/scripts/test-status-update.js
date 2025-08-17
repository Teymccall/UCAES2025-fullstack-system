// Import Firebase Admin using CommonJS
const { initializeApp, cert, getApps } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

// Initialize Firebase Admin
const serviceAccount = require('../ucaes2025-firebase-adminsdk-fbsvc-c70a08a455.json');

const adminApp = !getApps().length
  ? initializeApp({
      credential: cert(serviceAccount),
      databaseURL: "https://ucaes2025-default-rtdb.firebaseio.com",
    })
  : getApps()[0];

const adminDb = getFirestore(adminApp);

async function testStatusUpdate() {
  console.log('🧪 Testing application status update system...');
  
  try {
    // Get an application to test with
    const applicationsRef = adminDb.collection('admission-applications');
    const snapshot = await applicationsRef.limit(1).get();
    
    if (snapshot.empty) {
      console.log('❌ No applications found to test with');
      return;
    }
    
    const testApp = snapshot.docs[0];
    const appData = testApp.data();
    
    console.log(`📋 Testing with application: ${appData.applicationId || testApp.id}`);
    console.log(`   - Name: ${appData.personalInfo?.firstName} ${appData.personalInfo?.lastName}`);
    console.log(`   - Current Status: ${appData.applicationStatus || 'draft'}`);
    
    // Test the status update API
    const applicationId = appData.applicationId;
    
    if (!applicationId) {
      console.log('❌ Application has no applicationId field, cannot test API');
      return;
    }
    
    console.log('\n🔄 Testing status update to "under_review"...');
    
    try {
      const response = await fetch(`http://localhost:3001/api/admissions/applications/${applicationId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          applicationStatus: 'under_review',
          reviewNotes: 'Application is being reviewed by the admissions committee.'
        }),
      });
      
      const result = await response.json();
      
      if (result.success) {
        console.log('✅ Status update API worked successfully');
        console.log(`   - New Status: ${result.newStatus}`);
        
        // Verify the update in Firebase
        const updatedDoc = await testApp.ref.get();
        const updatedData = updatedDoc.data();
        
        console.log('\n📊 Verification from Firebase:');
        console.log(`   - Status: ${updatedData.applicationStatus}`);
        console.log(`   - Review Notes: ${updatedData.reviewNotes}`);
        console.log(`   - Last Reviewed By: ${updatedData.lastReviewedBy}`);
        console.log(`   - Last Reviewed At: ${updatedData.lastReviewedAt}`);
        
        // Test getting the updated application
        console.log('\n🔍 Testing single application fetch...');
        const getResponse = await fetch(`http://localhost:3001/api/admissions/applications/${applicationId}`);
        const getResult = await getResponse.json();
        
        if (getResult.success) {
          console.log('✅ Single application fetch worked');
          console.log(`   - Application ID: ${getResult.application.applicationId}`);
          console.log(`   - Status: ${getResult.application.applicationStatus}`);
          console.log(`   - Review Notes: ${getResult.application.reviewNotes}`);
        } else {
          console.log('❌ Single application fetch failed:', getResult.error);
        }
        
      } else {
        console.log('❌ Status update API failed:', result.error);
      }
      
    } catch (fetchError) {
      console.log('❌ API request failed:', fetchError.message);
      console.log('💡 Make sure the Academic Affairs server is running on port 3001');
    }
    
    return { success: true };
    
  } catch (error) {
    console.error('❌ Error testing status update:', error);
    return { success: false, error: error.message };
  }
}

// Run the test
testStatusUpdate()
  .then(result => {
    if (result && result.success) {
      console.log('\n✅ Status update test completed!');
      console.log('\n💡 To test the complete flow:');
      console.log('   1. Director updates status in Academic Affairs dashboard');
      console.log('   2. Applicant clicks "Refresh Status" in Admissions website');
      console.log('   3. Applicant sees updated status immediately');
    } else {
      console.log('\n❌ Test failed!');
      if (result && result.error) {
        console.log(`🚨 Error: ${result.error}`);
      }
    }
    process.exit(result && result.success ? 0 : 1);
  })
  .catch(error => {
    console.error('💥 Unexpected error:', error);
    process.exit(1);
  });


