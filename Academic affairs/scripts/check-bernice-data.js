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

async function checkBerniceData() {
  console.log('🔍 Checking bernice\'s application data...');
  
  try {
    // Find bernice's application by email
    const applicationsRef = adminDb.collection('admission-applications');
    const snapshot = await applicationsRef.where('contactInfo.email', '==', '12@gmail.com').get();
    
    if (snapshot.empty) {
      console.log('❌ No application found for bernice (12@gmail.com)');
      return;
    }
    
    const doc = snapshot.docs[0];
    const data = doc.data();
    
    console.log('\n📋 Bernice\'s Application Data:');
    console.log(`   - Document ID: ${doc.id}`);
    console.log(`   - Application ID field: ${data.applicationId || 'MISSING'}`);
    console.log(`   - User ID: ${data.userId}`);
    console.log(`   - Application Status: ${data.applicationStatus || 'MISSING'}`);
    console.log(`   - Payment Status: ${data.paymentStatus || 'MISSING'}`);
    console.log(`   - Name: ${data.personalInfo?.firstName} ${data.personalInfo?.lastName}`);
    console.log(`   - Submitted At: ${data.submittedAt || 'MISSING'}`);
    console.log(`   - Created At: ${data.createdAt}`);
    console.log(`   - Updated At: ${data.updatedAt || 'MISSING'}`);
    
    // Check if applicationId matches what's shown in status page
    if (data.applicationId === 'UCAES20260002') {
      console.log('✅ Application ID matches what\'s shown in status page');
    } else {
      console.log(`❌ Application ID mismatch! Expected: UCAES20260002, Found: ${data.applicationId || 'MISSING'}`);
    }
    
    // Check if application is actually submitted
    if (data.applicationStatus && data.applicationStatus !== 'draft') {
      console.log(`✅ Application is submitted with status: ${data.applicationStatus}`);
    } else {
      console.log('❌ Application status is missing or still draft');
    }
    
    // Check user authentication data
    console.log('\n🔍 Checking user auth data...');
    try {
      const usersRef = adminDb.collection('users');
      const userSnapshot = await usersRef.where('email', '==', '12@gmail.com').get();
      
      if (!userSnapshot.empty) {
        const userDoc = userSnapshot.docs[0];
        const userData = userDoc.data();
        console.log(`   - User Doc ID: ${userDoc.id}`);
        console.log(`   - User ID in applications: ${data.userId}`);
        console.log(`   - Match: ${userDoc.id === data.userId ? '✅' : '❌'}`);
      } else {
        console.log('❌ No user document found in users collection');
      }
    } catch (userError) {
      console.log('❌ Error checking user data:', userError.message);
    }
    
    return { success: true, data };
    
  } catch (error) {
    console.error('❌ Error checking bernice data:', error);
    return { success: false, error: error.message };
  }
}

// Run the check
checkBerniceData()
  .then(result => {
    if (result && result.success) {
      console.log('\n✅ Data check completed!');
      console.log('\n💡 Next steps:');
      console.log('   1. Fix AuthContext to use applicationId field instead of document ID');
      console.log('   2. Ensure status page loads correct application data');
    } else {
      console.log('\n❌ Data check failed!');
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


