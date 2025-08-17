// Script to check application statuses and submission dates
const admin = require('firebase-admin');

// Initialize Firebase Admin SDK
const serviceAccount = require('../ucaes2025-firebase-adminsdk-fbsvc-c70a08a455.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function checkApplicationStatuses() {
  console.log('🔍 Checking Application Statuses and Submission Dates...\n');

  try {
    // Get all applications
    const applicationsRef = db.collection('admission-applications');
    const applicationsSnapshot = await applicationsRef.get();
    
    console.log(`📊 Found ${applicationsSnapshot.size} applications\n`);
    
    const statusCounts = {};
    const applicationsByStatus = {};
    
    applicationsSnapshot.docs.forEach((doc, index) => {
      const data = doc.data();
      const status = data.applicationStatus || 'undefined';
      const hasSubmittedAt = !!data.submittedAt;
      
      // Count statuses
      statusCounts[status] = (statusCounts[status] || 0) + 1;
      
      // Group by status
      if (!applicationsByStatus[status]) {
        applicationsByStatus[status] = [];
      }
      
      applicationsByStatus[status].push({
        applicationId: data.applicationId,
        name: `${data.personalInfo?.firstName || ''} ${data.personalInfo?.lastName || ''}`.trim(),
        email: data.contactInfo?.email || '',
        submittedAt: data.submittedAt,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
        paymentStatus: data.paymentStatus
      });
    });
    
    console.log('📈 Status Distribution:');
    Object.entries(statusCounts).forEach(([status, count]) => {
      console.log(`   - ${status}: ${count} applications`);
    });
    
    console.log('\n📋 Applications by Status:');
    Object.entries(applicationsByStatus).forEach(([status, apps]) => {
      console.log(`\n🔸 ${status.toUpperCase()} (${apps.length}):`);
      apps.forEach((app, index) => {
        console.log(`   ${index + 1}. ${app.applicationId} - ${app.name} (${app.email})`);
        console.log(`      - Payment: ${app.paymentStatus}`);
        console.log(`      - Submitted: ${app.submittedAt ? 'Yes' : 'No'}`);
        if (app.submittedAt) {
          console.log(`      - Submitted Date: ${app.submittedAt}`);
        }
        console.log(`      - Created: ${app.createdAt ? (app.createdAt.toDate ? app.createdAt.toDate() : app.createdAt) : 'N/A'}`);
      });
    });
    
    // Check for applications that should have submittedAt but don't
    console.log('\n🔍 Applications that should have submittedAt:');
    let shouldHaveSubmittedAt = 0;
    
    applicationsSnapshot.docs.forEach((doc) => {
      const data = doc.data();
      const status = data.applicationStatus;
      const hasSubmittedAt = !!data.submittedAt;
      
      // Applications with these statuses should have submittedAt
      const shouldHave = ['submitted', 'under_review', 'accepted', 'rejected'];
      
      if (shouldHave.includes(status) && !hasSubmittedAt) {
        shouldHaveSubmittedAt++;
        console.log(`   ❌ ${data.applicationId} - Status: ${status}, Payment: ${data.paymentStatus}`);
        console.log(`      - Name: ${data.personalInfo?.firstName} ${data.personalInfo?.lastName}`);
        console.log(`      - Missing submittedAt field`);
      }
    });
    
    console.log(`\n📊 Summary:`);
    console.log(`   - Total applications: ${applicationsSnapshot.size}`);
    console.log(`   - Should have submittedAt: ${shouldHaveSubmittedAt}`);
    
    if (shouldHaveSubmittedAt > 0) {
      console.log(`\n💡 ${shouldHaveSubmittedAt} applications need submittedAt dates fixed.`);
    } else {
      console.log(`\n✅ All applications have proper submittedAt dates.`);
    }

  } catch (error) {
    console.error('❌ Error during check:', error);
  } finally {
    process.exit(0);
  }
}

checkApplicationStatuses();


