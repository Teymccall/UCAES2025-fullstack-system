const admin = require('firebase-admin');

// Initialize Firebase Admin
if (!admin.apps.length) {
  const serviceAccount = require('../../Academic affairs/ucaes2025-firebase-adminsdk-fbsvc-c70a08a455.json');
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://ucaes2025-default-rtdb.firebaseio.com"
  });
}

const db = admin.firestore();

async function cleanupDraftApplications() {
  console.log('🧹 CLEANING UP DRAFT APPLICATIONS');
  console.log('=' .repeat(60));
  console.log(`📅 Cleanup Date: ${new Date().toLocaleString()}`);
  console.log('=' .repeat(60));
  
  try {
    // Step 1: Find all draft applications
    console.log('\n1️⃣ FINDING DRAFT APPLICATIONS');
    console.log('-' .repeat(40));
    
    const applicationsRef = db.collection('admission-applications');
    const draftQuery = applicationsRef.where('status', '==', 'draft');
    const draftSnapshot = await draftQuery.get();
    
    console.log(`📊 Found ${draftSnapshot.size} draft applications to clean up`);
    
    if (draftSnapshot.size === 0) {
      console.log('✅ No draft applications found - system is already clean');
      
      // Still check for applications without proper status
      const allAppsSnapshot = await applicationsRef.get();
      let noStatusCount = 0;
      
      allAppsSnapshot.forEach(doc => {
        const data = doc.data();
        if (!data.status) {
          noStatusCount++;
        }
      });
      
      if (noStatusCount > 0) {
        console.log(`⚠️ Found ${noStatusCount} applications without status field`);
        console.log('   These may also need cleanup');
      }
      
      return;
    }
    
    // Step 2: Analyze draft applications
    console.log('\n2️⃣ ANALYZING DRAFT APPLICATIONS');
    console.log('-' .repeat(40));
    
    const draftApps = [];
    draftSnapshot.forEach(doc => {
      const data = doc.data();
      draftApps.push({
        id: doc.id,
        applicationId: data.applicationId,
        name: data.name || 'Unknown',
        email: data.email || 'Unknown',
        createdAt: data.createdAt,
        hasPersonalInfo: !!data.personalInfo,
        hasDocuments: !!data.documents,
        hasPayment: data.paymentStatus === 'paid',
        registrationNumber: data.registrationNumber
      });
    });
    
    console.log('📋 Draft Applications Details:');
    draftApps.forEach((app, index) => {
      console.log(`\n   ${index + 1}. Application ID: ${app.applicationId || 'MISSING'}`);
      console.log(`      Name: ${app.name}`);
      console.log(`      Email: ${app.email}`);
      console.log(`      Has Personal Info: ${app.hasPersonalInfo ? 'Yes' : 'No'}`);
      console.log(`      Has Documents: ${app.hasDocuments ? 'Yes' : 'No'}`);
      console.log(`      Payment Status: ${app.hasPayment ? 'Paid' : 'Pending'}`);
      console.log(`      Registration Number: ${app.registrationNumber || 'None'}`);
    });

    // Step 3: Move draft applications to separate collection
    console.log('\n3️⃣ MOVING DRAFT APPLICATIONS');
    console.log('-' .repeat(40));
    
    const batch = db.batch();
    let moveCount = 0;
    
    draftSnapshot.forEach(doc => {
      const data = doc.data();
      
      // Add to draft collection with additional metadata
      const draftRef = db.collection('application-drafts').doc();
      batch.set(draftRef, {
        ...data,
        originalId: doc.id,
        movedAt: admin.firestore.FieldValue.serverTimestamp(),
        reason: 'Workflow fix - moved from main applications to prevent staff visibility',
        cleanupVersion: '1.0'
      });
      
      // Delete from main collection
      batch.delete(doc.ref);
      moveCount++;
    });
    
    await batch.commit();
    
    console.log(`✅ Successfully moved ${moveCount} draft applications`);
    console.log('   - Moved to: application-drafts collection');
    console.log('   - Removed from: admission-applications collection');
    console.log('   - Staff dashboard will no longer show these applications');

    // Step 4: Verify cleanup
    console.log('\n4️⃣ VERIFYING CLEANUP');
    console.log('-' .repeat(40));
    
    const remainingDraftsSnapshot = await draftQuery.get();
    console.log(`📊 Remaining draft applications: ${remainingDraftsSnapshot.size}`);
    
    const movedAppsSnapshot = await db.collection('application-drafts').get();
    console.log(`📊 Applications in draft collection: ${movedAppsSnapshot.size}`);
    
    // Check what's left in main collection
    const remainingAppsSnapshot = await applicationsRef.get();
    const statusCounts = {
      submitted: 0,
      under_review: 0,
      accepted: 0,
      rejected: 0,
      other: 0
    };
    
    remainingAppsSnapshot.forEach(doc => {
      const data = doc.data();
      const status = data.status || 'other';
      
      if (statusCounts.hasOwnProperty(status)) {
        statusCounts[status]++;
      } else {
        statusCounts.other++;
      }
    });
    
    console.log('\n📊 Remaining applications by status:');
    console.log(`   ✅ Submitted: ${statusCounts.submitted}`);
    console.log(`   🔍 Under Review: ${statusCounts.under_review}`);
    console.log(`   ✅ Accepted: ${statusCounts.accepted}`);
    console.log(`   ❌ Rejected: ${statusCounts.rejected}`);
    console.log(`   ❓ Other: ${statusCounts.other}`);

    // Step 5: Create user profiles for existing users (if needed)
    console.log('\n5️⃣ CHECKING USER PROFILES');
    console.log('-' .repeat(40));
    
    // Check if we need to create user profiles for existing applications
    const submittedAppsSnapshot = await applicationsRef.where('status', '==', 'submitted').get();
    let profilesCreated = 0;
    
    for (const doc of submittedAppsSnapshot.docs) {
      const data = doc.data();
      if (data.userId && data.applicationId) {
        // Check if user profile exists
        const userProfileRef = db.doc(`user-profiles/${data.userId}`);
        const userProfileDoc = await userProfileRef.get();
        
        if (!userProfileDoc.exists) {
          // Create user profile
          await userProfileRef.set({
            applicationId: data.applicationId,
            email: data.email,
            name: data.name,
            role: 'applicant',
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            createdBy: 'cleanup-script'
          });
          profilesCreated++;
        }
      }
    }
    
    console.log(`✅ Created ${profilesCreated} user profiles for existing applications`);

    // Step 6: Summary and recommendations
    console.log('\n6️⃣ CLEANUP SUMMARY');
    console.log('-' .repeat(40));
    
    console.log('✅ CLEANUP COMPLETED SUCCESSFULLY');
    console.log('');
    console.log('📊 Actions Taken:');
    console.log(`   - Moved ${moveCount} draft applications to separate collection`);
    console.log(`   - Created ${profilesCreated} user profiles`);
    console.log(`   - Verified ${remainingAppsSnapshot.size} applications remain in main collection`);
    console.log('');
    console.log('🎯 Results:');
    console.log('   ✅ Staff dashboard will only show submitted applications');
    console.log('   ✅ Draft applications are preserved but hidden');
    console.log('   ✅ User profiles created for proper workflow');
    console.log('');
    console.log('🔧 Next Steps:');
    console.log('   1. Replace AuthContext.tsx with AuthContext_FIXED.tsx');
    console.log('   2. Test new user registration (should not create application record)');
    console.log('   3. Test application submission (should create application record)');
    console.log('   4. Verify staff dashboard only shows submitted applications');
    console.log('');
    console.log('📁 Collections Status:');
    console.log(`   - admission-applications: ${remainingAppsSnapshot.size} records (submitted+ only)`);
    console.log(`   - application-drafts: ${movedAppsSnapshot.size} records (hidden from staff)`);
    console.log(`   - user-profiles: Ready for new workflow`);

  } catch (error) {
    console.error('❌ Cleanup failed:', error);
  } finally {
    process.exit(0);
  }
}

cleanupDraftApplications();