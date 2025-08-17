// Script to fix application structure - move 'id' field to 'applicationId'
const admin = require('firebase-admin');

// Initialize Firebase Admin SDK
const serviceAccount = require('../ucaes2025-firebase-adminsdk-fbsvc-c70a08a455.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function fixApplicationStructure() {
  console.log('🔧 Fixing Application Structure...\n');

  try {
    // Find applications with wrong structure (has 'id' but no 'applicationId')
    const applicationsRef = db.collection('admission-applications');
    const applicationsSnapshot = await applicationsRef.get();
    
    let fixedCount = 0;
    
    // Use for...of loop instead of forEach for proper async handling
    for (const doc of applicationsSnapshot.docs) {
      const data = doc.data();
      
      // Check if this application has 'id' field but no 'applicationId' field
      if (data.id && !data.applicationId) {
        console.log(`🔧 Fixing application: ${doc.id}`);
        console.log(`   User: ${data.email || 'N/A'}`);
        console.log(`   Current 'id' value: ${data.id}`);
        
        try {
          // Update the document to move 'id' to 'applicationId' and remove 'id'
          await doc.ref.update({
            applicationId: data.id,
            id: admin.firestore.FieldValue.delete() // Remove the old 'id' field
          });
          
          console.log(`   ✅ Fixed: moved '${data.id}' to 'applicationId' field`);
          fixedCount++;
          
        } catch (error) {
          console.error(`   ❌ Error fixing application ${doc.id}:`, error);
        }
      }
    }
    
    console.log(`\n🎯 Summary:`);
    console.log(`- Applications checked: ${applicationsSnapshot.size}`);
    console.log(`- Applications fixed: ${fixedCount}`);
    
    if (fixedCount > 0) {
      console.log(`✅ Successfully fixed ${fixedCount} application(s)`);
    } else {
      console.log(`✅ No applications needed fixing`);
    }

  } catch (error) {
    console.error('❌ Error during fixing:', error);
  } finally {
    process.exit(0);
  }
}

fixApplicationStructure();
