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

async function checkApplicationIds() {
  console.log('🔍 Checking application IDs in admission applications...');
  
  try {
    const applicationsRef = adminDb.collection('admission-applications');
    const snapshot = await applicationsRef.get();
    
    console.log(`📊 Found ${snapshot.docs.length} applications`);
    
    for (let i = 0; i < snapshot.docs.length; i++) {
      const doc = snapshot.docs[i];
      const data = doc.data();
      
      console.log(`\n📄 Application ${i + 1} (Document ID: ${doc.id}):`);
      console.log(`   - Name: ${data.personalInfo?.firstName || 'N/A'} ${data.personalInfo?.lastName || 'N/A'}`);
      console.log(`   - Email: ${data.contactInfo?.email || 'N/A'}`);
      console.log(`   - Status: ${data.applicationStatus || 'N/A'}`);
      console.log(`   - User ID: ${data.userId || 'N/A'}`);
      console.log(`   - Created At: ${data.createdAt || 'N/A'}`);
      
      // Check application ID field
      if (data.applicationId) {
        console.log(`   ✅ Application ID: ${data.applicationId} (PROPER FORMAT)`);
      } else {
        console.log(`   ❌ Application ID: Missing - using Document ID as fallback`);
        console.log(`   🔧 Recommended: Generate proper UCAES format ID`);
      }
      
      // Check if this looks like a proper UCAES ID
      if (data.applicationId && data.applicationId.startsWith('UCAES')) {
        const year = data.applicationId.substring(5, 9);
        const sequence = data.applicationId.substring(9);
        console.log(`   📋 Breakdown: UCAES + ${year} + ${sequence}`);
      }
      
      console.log('\n   ═══════════════════════════════════════');
    }
    
    // Check application counters
    console.log('\n🔢 Checking application counters...');
    const countersRef = adminDb.collection('application-counters');
    const countersSnapshot = await countersRef.get();
    
    if (countersSnapshot.empty) {
      console.log('❌ No application counters found');
    } else {
      countersSnapshot.forEach(counterDoc => {
        const counterData = counterDoc.data();
        console.log(`✅ Counter ${counterDoc.id}: Last number = ${counterData.lastNumber}, Year = ${counterData.year}`);
      });
    }
    
    return { success: true };
    
  } catch (error) {
    console.error('❌ Error checking application IDs:', error);
    return { success: false, error: error.message };
  }
}

// Run the check
checkApplicationIds()
  .then(result => {
    if (result.success) {
      console.log('\n✅ Application ID check completed!');
      console.log('\n💡 Recommendations:');
      console.log('   1. Applications with missing applicationId should be updated');
      console.log('   2. Use format: UCAES + Year + 4-digit sequence (e.g., UCAES20250001)');
      console.log('   3. Academic Affairs API should use applicationId field, not document ID');
    } else {
      console.log('\n❌ Check failed!');
      console.log(`🚨 Error: ${result.error}`);
    }
    process.exit(result.success ? 0 : 1);
  })
  .catch(error => {
    console.error('💥 Unexpected error:', error);
    process.exit(1);
  });


