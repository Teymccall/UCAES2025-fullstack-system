// Import Firebase Admin using CommonJS
const { initializeApp, cert, getApps } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const { getAuth } = require('firebase-admin/auth');

// Initialize Firebase Admin
const serviceAccount = require('../ucaes2025-firebase-adminsdk-fbsvc-c70a08a455.json');

const adminApp = !getApps().length
  ? initializeApp({
      credential: cert(serviceAccount),
      databaseURL: "https://ucaes2025-default-rtdb.firebaseio.com",
    })
  : getApps()[0];

const adminDb = getFirestore(adminApp);
const adminAuth = getAuth(adminApp);

async function checkBerniceAuth() {
  console.log('🔍 Checking bernice\'s authentication and application linkage...');
  
  try {
    // 1. Find bernice's application
    const applicationsRef = adminDb.collection('admission-applications');
    const appSnapshot = await applicationsRef.where('contactInfo.email', '==', '12@gmail.com').get();
    
    if (appSnapshot.empty) {
      console.log('❌ No application found for 12@gmail.com');
      return;
    }
    
    const appDoc = appSnapshot.docs[0];
    const appData = appDoc.data();
    
    console.log('\n📋 Application Data:');
    console.log(`   - Document ID: ${appDoc.id}`);
    console.log(`   - Application ID: ${appData.applicationId}`);
    console.log(`   - User ID in application: ${appData.userId}`);
    console.log(`   - Email: ${appData.contactInfo?.email}`);
    console.log(`   - Status: ${appData.applicationStatus}`);
    
    // 2. Check if user exists in Firebase Auth
    try {
      const userRecord = await adminAuth.getUser(appData.userId);
      console.log('\n👤 Firebase Auth User:');
      console.log(`   - UID: ${userRecord.uid}`);
      console.log(`   - Email: ${userRecord.email}`);
      console.log(`   - Display Name: ${userRecord.displayName}`);
      console.log(`   - Email Verified: ${userRecord.emailVerified}`);
      console.log(`   - Creation Time: ${userRecord.metadata.creationTime}`);
      
      // Check if email matches
      if (userRecord.email === appData.contactInfo?.email) {
        console.log('✅ Email matches between Auth and Application');
      } else {
        console.log(`❌ Email mismatch! Auth: ${userRecord.email}, App: ${appData.contactInfo?.email}`);
      }
      
    } catch (authError) {
      if (authError.code === 'auth/user-not-found') {
        console.log('❌ User not found in Firebase Auth');
        console.log('💡 This means bernice needs to register/login properly');
      } else {
        console.log('❌ Error fetching user from Auth:', authError.message);
      }
    }
    
    // 3. Check what the getApplicationDataByUserId function would return
    console.log('\n🔍 Testing getApplicationDataByUserId function...');
    const testQuery = await applicationsRef.where('userId', '==', appData.userId).get();
    
    if (!testQuery.empty) {
      const foundDoc = testQuery.docs[0];
      const foundData = foundDoc.data();
      console.log('✅ getApplicationDataByUserId would find:');
      console.log(`   - Document ID: ${foundDoc.id}`);
      console.log(`   - Application ID: ${foundData.applicationId}`);
      console.log(`   - This is what should be returned to AuthContext`);
    } else {
      console.log('❌ getApplicationDataByUserId would return null');
    }
    
    return { success: true };
    
  } catch (error) {
    console.error('❌ Error checking bernice auth:', error);
    return { success: false, error: error.message };
  }
}

// Run the check
checkBerniceAuth()
  .then(result => {
    if (result && result.success) {
      console.log('\n✅ Auth check completed!');
    } else {
      console.log('\n❌ Auth check failed!');
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


