// Script to fix missing submittedAt dates for existing applications
const admin = require('firebase-admin');

// Initialize Firebase Admin SDK
const serviceAccount = require('../ucaes2025-firebase-adminsdk-fbsvc-c70a08a455.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function fixSubmissionDates() {
  console.log('🔧 Fixing Missing Submission Dates...\n');

  try {
    // Get all applications
    const applicationsRef = db.collection('admission-applications');
    const applicationsSnapshot = await applicationsRef.get();
    
    console.log(`📊 Found ${applicationsSnapshot.size} applications`);
    
    let fixedCount = 0;
    let skippedCount = 0;
    
    for (const doc of applicationsSnapshot.docs) {
      const data = doc.data();
      const docId = doc.id;
      
      // Check if application is submitted but missing submittedAt
      if (data.applicationStatus === 'submitted' && !data.submittedAt) {
        console.log(`🔧 Fixing application ${data.applicationId} (${docId})`);
        
        // Use updatedAt as submittedAt, or createdAt if updatedAt is not available
        let submissionDate = data.updatedAt || data.createdAt;
        
        // If it's a Firestore Timestamp, convert it
        if (submissionDate && submissionDate.toDate) {
          submissionDate = submissionDate.toDate().toISOString();
        } else if (typeof submissionDate === 'string') {
          // Already a string, use as is
        } else {
          // Fallback to current time
          submissionDate = new Date().toISOString();
        }
        
        // Update the document
        await doc.ref.update({
          submittedAt: submissionDate
        });
        
        console.log(`   ✅ Fixed: Set submittedAt to ${submissionDate}`);
        fixedCount++;
      } else if (data.submittedAt) {
        console.log(`   ⏭️ Skipped: ${data.applicationId} already has submittedAt`);
        skippedCount++;
      } else {
        console.log(`   ⏭️ Skipped: ${data.applicationId} is not submitted (status: ${data.applicationStatus})`);
        skippedCount++;
      }
    }
    
    console.log('\n🎯 Summary:');
    console.log(`   - Total applications: ${applicationsSnapshot.size}`);
    console.log(`   - Fixed: ${fixedCount}`);
    console.log(`   - Skipped: ${skippedCount}`);
    
    if (fixedCount > 0) {
      console.log('\n✅ Successfully fixed submission dates!');
    } else {
      console.log('\nℹ️ No applications needed fixing.');
    }

  } catch (error) {
    console.error('❌ Error during fix:', error);
  } finally {
    process.exit(0);
  }
}

fixSubmissionDates();


