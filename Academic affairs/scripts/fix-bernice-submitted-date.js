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

async function fixBerniceSubmittedDate() {
  console.log('🔧 Fixing bernice\'s missing submittedAt field...');
  
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
    
    console.log('\n📋 Current Application Data:');
    console.log(`   - Application ID: ${data.applicationId}`);
    console.log(`   - Status: ${data.applicationStatus}`);
    console.log(`   - Payment: ${data.paymentStatus}`);
    console.log(`   - Submitted At: ${data.submittedAt || 'MISSING'}`);
    console.log(`   - Created At: ${data.createdAt}`);
    console.log(`   - Updated At: ${data.updatedAt || 'MISSING'}`);
    
    // If application is submitted but submittedAt is missing, add it
    if (data.applicationStatus === 'submitted' && !data.submittedAt) {
      console.log('\n🔄 Adding missing submittedAt field...');
      
      // Use updatedAt if available, otherwise use current time
      const submittedAt = data.updatedAt || new Date().toISOString();
      
      await doc.ref.update({
        submittedAt: submittedAt
      });
      
      console.log(`✅ Added submittedAt: ${submittedAt}`);
    } else if (data.submittedAt) {
      console.log('✅ submittedAt field already exists');
    } else {
      console.log('ℹ️ Application not submitted yet, no need to add submittedAt');
    }
    
    // Also fix the createdAt field if it's an object instead of string
    if (data.createdAt && typeof data.createdAt === 'object' && data.createdAt.toDate) {
      console.log('\n🔄 Converting createdAt from Timestamp to string...');
      
      const createdAtString = data.createdAt.toDate().toISOString();
      
      await doc.ref.update({
        createdAt: createdAtString
      });
      
      console.log(`✅ Converted createdAt: ${createdAtString}`);
    }
    
    // Verify the update
    console.log('\n📊 Verifying updates...');
    const updatedDoc = await doc.ref.get();
    const updatedData = updatedDoc.data();
    
    console.log(`   - Application ID: ${updatedData.applicationId}`);
    console.log(`   - Status: ${updatedData.applicationStatus}`);
    console.log(`   - Payment: ${updatedData.paymentStatus}`);
    console.log(`   - Submitted At: ${updatedData.submittedAt}`);
    console.log(`   - Created At: ${updatedData.createdAt}`);
    console.log(`   - Updated At: ${updatedData.updatedAt}`);
    
    return { success: true };
    
  } catch (error) {
    console.error('❌ Error fixing bernice submitted date:', error);
    return { success: false, error: error.message };
  }
}

// Run the fix
fixBerniceSubmittedDate()
  .then(result => {
    if (result && result.success) {
      console.log('\n✅ Fix completed successfully!');
      console.log('💡 Now the status page should show proper submitted date');
    } else {
      console.log('\n❌ Fix failed!');
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


