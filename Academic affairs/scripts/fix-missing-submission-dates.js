// Script to fix specific applications missing submittedAt dates
const admin = require('firebase-admin');

// Initialize Firebase Admin SDK
const serviceAccount = require('../ucaes2025-firebase-adminsdk-fbsvc-c70a08a455.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function fixMissingSubmissionDates() {
  console.log('🔧 Fixing Missing Submission Dates for Specific Applications...\n');

  try {
    // Applications that need fixing
    const applicationsToFix = [
      'UCAES20260003', // Test Student - under_review
      'UCAES20260011'  // ali prince - rejected
    ];
    
    let fixedCount = 0;
    
    for (const applicationId of applicationsToFix) {
      console.log(`🔧 Processing application: ${applicationId}`);
      
      // Find the application
      const applicationsRef = db.collection('admission-applications');
      const querySnapshot = await applicationsRef.where('applicationId', '==', applicationId).get();
      
      if (querySnapshot.empty) {
        console.log(`   ❌ Application ${applicationId} not found`);
        continue;
      }
      
      const doc = querySnapshot.docs[0];
      const data = doc.data();
      
      console.log(`   📋 Found: ${data.personalInfo?.firstName} ${data.personalInfo?.lastName}`);
      console.log(`   📊 Status: ${data.applicationStatus}, Payment: ${data.paymentStatus}`);
      
      if (data.submittedAt) {
        console.log(`   ⏭️ Already has submittedAt: ${data.submittedAt}`);
        continue;
      }
      
      // Determine the submission date
      let submissionDate;
      
      if (data.updatedAt) {
        // Use updatedAt if available
        if (data.updatedAt.toDate) {
          submissionDate = data.updatedAt.toDate().toISOString();
        } else {
          submissionDate = data.updatedAt;
        }
      } else if (data.createdAt) {
        // Use createdAt as fallback
        if (data.createdAt.toDate) {
          submissionDate = data.createdAt.toDate().toISOString();
        } else {
          submissionDate = data.createdAt;
        }
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
    }
    
    console.log('\n🎯 Summary:');
    console.log(`   - Applications processed: ${applicationsToFix.length}`);
    console.log(`   - Fixed: ${fixedCount}`);
    
    if (fixedCount > 0) {
      console.log('\n✅ Successfully fixed submission dates!');
      console.log('💡 The applications should now show correct submission dates in the status page.');
    } else {
      console.log('\nℹ️ No applications needed fixing.');
    }

  } catch (error) {
    console.error('❌ Error during fix:', error);
  } finally {
    process.exit(0);
  }
}

fixMissingSubmissionDates();


