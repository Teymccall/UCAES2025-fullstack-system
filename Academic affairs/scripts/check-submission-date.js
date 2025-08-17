// Script to check submission date issue
const admin = require('firebase-admin');

// Initialize Firebase Admin SDK
const serviceAccount = require('../ucaes2025-firebase-adminsdk-fbsvc-c70a08a455.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function checkSubmissionDate() {
  console.log('🔍 Checking Submission Date Issue...\n');

  try {
    // Find the application with ID UCAES20260011
    const applicationsRef = db.collection('admission-applications');
    const querySnapshot = await applicationsRef.where('applicationId', '==', 'UCAES20260011').get();
    
    if (querySnapshot.empty) {
      console.log('❌ Application UCAES20260011 not found');
      return;
    }

    const doc = querySnapshot.docs[0];
    const data = doc.data();
    
    console.log('📋 Application Details:');
    console.log(`   - Document ID: ${doc.id}`);
    console.log(`   - Application ID: ${data.applicationId}`);
    console.log(`   - User ID: ${data.userId}`);
    console.log(`   - Name: ${data.personalInfo?.firstName} ${data.personalInfo?.lastName}`);
    console.log(`   - Email: ${data.contactInfo?.email}`);
    
    console.log('\n📅 Date Fields:');
    console.log(`   - createdAt: ${data.createdAt ? (data.createdAt.toDate ? data.createdAt.toDate() : data.createdAt) : 'N/A'}`);
    console.log(`   - updatedAt: ${data.updatedAt ? (data.updatedAt.toDate ? data.updatedAt.toDate() : data.updatedAt) : 'N/A'}`);
    console.log(`   - submittedAt: ${data.submittedAt ? (data.submittedAt.toDate ? data.submittedAt.toDate() : data.submittedAt) : 'N/A'}`);
    
    console.log('\n🔍 Raw Date Values:');
    console.log(`   - createdAt (raw): ${JSON.stringify(data.createdAt)}`);
    console.log(`   - updatedAt (raw): ${JSON.stringify(data.updatedAt)}`);
    console.log(`   - submittedAt (raw): ${JSON.stringify(data.submittedAt)}`);
    
    console.log('\n📊 Application Status:');
    console.log(`   - applicationStatus: ${data.applicationStatus}`);
    console.log(`   - paymentStatus: ${data.paymentStatus}`);
    
    // Check if submittedAt is missing or incorrect
    if (!data.submittedAt) {
      console.log('\n❌ ISSUE: submittedAt is missing!');
      console.log('💡 This should be set when the application is submitted.');
    } else if (data.submittedAt.toDate) {
      const submittedDate = data.submittedAt.toDate();
      const now = new Date();
      const diffInDays = Math.abs((now - submittedDate) / (1000 * 60 * 60 * 24));
      
      if (diffInDays > 365) {
        console.log('\n❌ ISSUE: submittedAt date seems incorrect!');
        console.log(`   - Submitted date: ${submittedDate}`);
        console.log(`   - Current date: ${now}`);
        console.log(`   - Difference: ${diffInDays.toFixed(0)} days`);
      } else {
        console.log('\n✅ submittedAt date looks reasonable');
      }
    }
    
    // Check all applications for date issues
    console.log('\n🔍 Checking all applications for date issues...');
    const allApplicationsSnapshot = await applicationsRef.get();
    
    let applicationsWithDateIssues = 0;
    let applicationsWithoutSubmittedAt = 0;
    
    allApplicationsSnapshot.docs.forEach((doc, index) => {
      const appData = doc.data();
      const hasSubmittedAt = appData.submittedAt;
      const hasDateIssue = hasSubmittedAt && appData.submittedAt.toDate && 
        Math.abs((new Date() - appData.submittedAt.toDate()) / (1000 * 60 * 60 * 24)) > 365;
      
      if (!hasSubmittedAt) {
        applicationsWithoutSubmittedAt++;
        console.log(`   ❌ App ${index + 1}: Missing submittedAt - ${appData.applicationId}`);
      } else if (hasDateIssue) {
        applicationsWithDateIssues++;
        console.log(`   ⚠️ App ${index + 1}: Possible date issue - ${appData.applicationId} (${appData.submittedAt.toDate()})`);
      }
    });
    
    console.log('\n📊 Summary:');
    console.log(`   - Total applications: ${allApplicationsSnapshot.size}`);
    console.log(`   - Missing submittedAt: ${applicationsWithoutSubmittedAt}`);
    console.log(`   - Possible date issues: ${applicationsWithDateIssues}`);

  } catch (error) {
    console.error('❌ Error during check:', error);
  } finally {
    process.exit(0);
  }
}

checkSubmissionDate();


