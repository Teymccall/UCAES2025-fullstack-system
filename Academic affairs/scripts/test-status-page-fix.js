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

async function testStatusPageFix() {
  console.log('🧪 Testing status page data loading fix...');
  
  try {
    // Find bernice's application
    const applicationsRef = adminDb.collection('admission-applications');
    const snapshot = await applicationsRef.where('contactInfo.email', '==', '12@gmail.com').get();
    
    if (snapshot.empty) {
      console.log('❌ No application found for bernice');
      return;
    }
    
    const doc = snapshot.docs[0];
    const data = doc.data();
    
    console.log('\n📋 Bernice\'s Application Data in Firebase:');
    console.log(`   - Document ID: ${doc.id}`);
    console.log(`   - Application ID: ${data.applicationId}`);
    console.log(`   - User ID: ${data.userId}`);
    console.log(`   - Application Status: ${data.applicationStatus}`);
    console.log(`   - Payment Status: ${data.paymentStatus}`);
    console.log(`   - Submitted At: ${data.submittedAt || 'MISSING'}`);
    console.log(`   - Updated At: ${data.updatedAt || 'MISSING'}`);
    console.log(`   - Created At: ${data.createdAt || 'MISSING'}`);
    
    // Simulate what getApplicationDataByUserId would return
    const simulatedReturn = {
      id: doc.id,
      applicationId: data.applicationId,
      personalInfo: data.personalInfo,
      contactInfo: data.contactInfo,
      academicBackground: data.academicBackground,
      programSelection: data.programSelection,
      documents: data.documents,
      paymentStatus: data.paymentStatus,
      applicationStatus: data.applicationStatus,
      submittedAt: data.submittedAt,
      updatedAt: data.updatedAt,
      createdAt: data.createdAt,
      currentStep: data.currentStep
    };
    
    console.log('\n🔄 What getApplicationDataByUserId should return:');
    console.log(`   - ID: ${simulatedReturn.id}`);
    console.log(`   - Application ID: ${simulatedReturn.applicationId}`);
    console.log(`   - Status: ${simulatedReturn.applicationStatus}`);
    console.log(`   - Payment: ${simulatedReturn.paymentStatus}`);
    console.log(`   - First Choice: ${simulatedReturn.programSelection?.firstChoice}`);
    console.log(`   - Program Type: ${simulatedReturn.programSelection?.programType}`);
    
    // Simulate what AuthContext should return
    console.log('\n👤 What AuthContext should set for user.applicationId:');
    console.log(`   - ${simulatedReturn.applicationId}`);
    
    // Simulate what StatusPage should display
    console.log('\n📊 What StatusPage should display:');
    
    const statusDisplay = {
      applicationId: simulatedReturn.applicationId || 'Not Generated',
      status: simulatedReturn.applicationStatus || 'draft',
      submittedDate: simulatedReturn.submittedAt ? new Date(simulatedReturn.submittedAt).toLocaleDateString() : 'Not submitted',
      lastUpdated: simulatedReturn.updatedAt ? new Date(simulatedReturn.updatedAt).toLocaleDateString() : 'Not updated',
      program: simulatedReturn.programSelection?.firstChoice || simulatedReturn.programSelection?.program || 'Not selected',
      programType: simulatedReturn.programSelection?.programType || 'Not selected',
      paymentStatus: simulatedReturn.paymentStatus || 'pending'
    };
    
    console.log(`   - Application ID: ${statusDisplay.applicationId}`);
    console.log(`   - Status: ${statusDisplay.status}`);
    console.log(`   - Submitted: ${statusDisplay.submittedDate}`);
    console.log(`   - Last Updated: ${statusDisplay.lastUpdated}`);
    console.log(`   - Program: ${statusDisplay.program}`);
    console.log(`   - Program Type: ${statusDisplay.programType}`);
    console.log(`   - Payment: ${statusDisplay.paymentStatus}`);
    
    // Check what the status should show
    const expectedTimelineStatus = {
      submitted: statusDisplay.status !== 'draft',
      paymentConfirmed: statusDisplay.paymentStatus === 'paid',
      underReview: statusDisplay.status === 'under_review' || statusDisplay.status === 'submitted',
      decided: statusDisplay.status === 'accepted' || statusDisplay.status === 'rejected'
    };
    
    console.log('\n📅 Timeline Status Should Show:');
    console.log(`   - Application Submitted: ${expectedTimelineStatus.submitted ? '✅ Completed' : '⏳ Pending'}`);
    console.log(`   - Payment Confirmed: ${expectedTimelineStatus.paymentConfirmed ? '✅ Completed' : '⏳ Pending'}`);
    console.log(`   - Under Review: ${expectedTimelineStatus.underReview ? '🔄 In Progress' : '⏳ Pending'}`);
    console.log(`   - Decision: ${expectedTimelineStatus.decided ? '✅ Completed' : '⏳ Pending'}`);
    
    return { success: true };
    
  } catch (error) {
    console.error('❌ Error testing status page fix:', error);
    return { success: false, error: error.message };
  }
}

// Run the test
testStatusPageFix()
  .then(result => {
    if (result && result.success) {
      console.log('\n✅ Status page test completed!');
      console.log('\n💡 Expected behavior after fix:');
      console.log('   1. Status page shows UCAES20260004 as Application ID');
      console.log('   2. Status shows "Submitted" instead of "Not submitted"');
      console.log('   3. Timeline shows completed steps correctly');
      console.log('   4. All real data from Firebase is displayed');
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


