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

async function analyzeCurrentWorkflow() {
  console.log('🔍 ANALYZING CURRENT APPLICATION WORKFLOW');
  console.log('=' .repeat(60));
  console.log(`📅 Analysis Date: ${new Date().toLocaleString()}`);
  console.log('=' .repeat(60));

  try {
    // Step 1: Analyze current applications by status
    console.log('\n1️⃣ CURRENT APPLICATION STATUS DISTRIBUTION');
    console.log('-' .repeat(50));
    
    const applicationsRef = db.collection('admission-applications');
    const allAppsSnapshot = await applicationsRef.get();
    
    const statusCounts = {
      draft: 0,
      submitted: 0,
      under_review: 0,
      accepted: 0,
      rejected: 0,
      other: 0
    };
    
    const draftApplications = [];
    const submittedApplications = [];
    
    allAppsSnapshot.forEach(doc => {
      const data = doc.data();
      const status = data.status || 'unknown';
      
      if (statusCounts.hasOwnProperty(status)) {
        statusCounts[status]++;
      } else {
        statusCounts.other++;
      }
      
      if (status === 'draft') {
        draftApplications.push({
          id: doc.id,
          applicationId: data.applicationId,
          name: data.name,
          email: data.email,
          createdAt: data.createdAt?.toDate(),
          hasPersonalInfo: !!data.personalInfo,
          hasDocuments: !!data.documents,
          hasPayment: data.paymentStatus === 'paid'
        });
      } else if (status === 'submitted') {
        submittedApplications.push({
          id: doc.id,
          applicationId: data.applicationId,
          name: data.name,
          email: data.email,
          submittedAt: data.submittedAt,
          createdAt: data.createdAt?.toDate()
        });
      }
    });
    
    console.log(`📊 Total Applications: ${allAppsSnapshot.size}`);
    console.log(`📝 Draft Applications: ${statusCounts.draft}`);
    console.log(`✅ Submitted Applications: ${statusCounts.submitted}`);
    console.log(`🔍 Under Review: ${statusCounts.under_review}`);
    console.log(`✅ Accepted: ${statusCounts.accepted}`);
    console.log(`❌ Rejected: ${statusCounts.rejected}`);
    console.log(`❓ Other Status: ${statusCounts.other}`);

    // Step 2: Analyze draft applications (the problem)
    console.log('\n2️⃣ ANALYZING DRAFT APPLICATIONS (THE PROBLEM)');
    console.log('-' .repeat(50));
    
    console.log(`❌ Found ${draftApplications.length} draft applications visible to staff:`);
    
    draftApplications.forEach((app, index) => {
      console.log(`\n   ${index + 1}. Application ID: ${app.applicationId || 'MISSING'}`);
      console.log(`      Name: ${app.name || 'Unknown'}`);
      console.log(`      Email: ${app.email || 'Unknown'}`);
      console.log(`      Created: ${app.createdAt || 'Unknown'}`);
      console.log(`      Has Personal Info: ${app.hasPersonalInfo ? 'Yes' : 'No'}`);
      console.log(`      Has Documents: ${app.hasDocuments ? 'Yes' : 'No'}`);
      console.log(`      Payment Status: ${app.hasPayment ? 'Paid' : 'Pending'}`);
    });

    // Step 3: Identify the workflow issue
    console.log('\n3️⃣ WORKFLOW ISSUE IDENTIFIED');
    console.log('-' .repeat(50));
    
    console.log('❌ PROBLEM: Applications are created immediately when user registers');
    console.log('   - User creates account → Application record created with status "draft"');
    console.log('   - Draft applications are visible to staff in admission dashboard');
    console.log('   - Staff sees incomplete applications that haven\'t been submitted');
    console.log('   - Registration number is assigned before application is complete');
    
    console.log('\n✅ CORRECT WORKFLOW SHOULD BE:');
    console.log('   1. User creates account → Only user account created (no application record)');
    console.log('   2. User fills application form → Data stored locally/temporarily');
    console.log('   3. User submits application → Application record created with status "submitted"');
    console.log('   4. Staff reviews application → Status changes to "under_review"');
    console.log('   5. Director approves → Status changes to "accepted"');
    console.log('   6. Registration number assigned → Student record created for portal access');

    // Step 4: Check registration numbers assignment
    console.log('\n4️⃣ REGISTRATION NUMBER ASSIGNMENT ANALYSIS');
    console.log('-' .repeat(50));
    
    const appsWithRegNumbers = [];
    const appsWithoutRegNumbers = [];
    
    allAppsSnapshot.forEach(doc => {
      const data = doc.data();
      if (data.registrationNumber) {
        appsWithRegNumbers.push({
          applicationId: data.applicationId,
          registrationNumber: data.registrationNumber,
          status: data.status
        });
      } else {
        appsWithoutRegNumbers.push({
          applicationId: data.applicationId,
          status: data.status
        });
      }
    });
    
    console.log(`📊 Applications with registration numbers: ${appsWithRegNumbers.length}`);
    console.log(`📊 Applications without registration numbers: ${appsWithoutRegNumbers.length}`);
    
    // Show registration numbers by status
    const regNumbersByStatus = {};
    appsWithRegNumbers.forEach(app => {
      if (!regNumbersByStatus[app.status]) {
        regNumbersByStatus[app.status] = [];
      }
      regNumbersByStatus[app.status].push(app.registrationNumber);
    });
    
    console.log('\n📋 Registration Numbers by Status:');
    Object.keys(regNumbersByStatus).forEach(status => {
      console.log(`   ${status}: ${regNumbersByStatus[status].length} applications`);
      if (status === 'draft') {
        console.log(`      ❌ ISSUE: Draft applications have registration numbers!`);
      }
    });

    // Step 5: Recommendations
    console.log('\n5️⃣ RECOMMENDED FIXES');
    console.log('-' .repeat(50));
    
    console.log('🔧 IMMEDIATE FIXES NEEDED:');
    console.log('');
    console.log('1. 📝 MODIFY REGISTRATION PROCESS:');
    console.log('   - Remove storeApplicationData() call from user registration');
    console.log('   - Only generate applicationId, don\'t create application record');
    console.log('   - Store applicationId in user profile for reference');
    console.log('');
    console.log('2. 📋 MODIFY APPLICATION SUBMISSION:');
    console.log('   - Create application record only when user clicks "Submit Application"');
    console.log('   - Set initial status to "submitted" (not "draft")');
    console.log('   - Include all application data in the submission');
    console.log('');
    console.log('3. 🎯 MODIFY STAFF DASHBOARD:');
    console.log('   - Only show applications with status "submitted" or higher');
    console.log('   - Hide draft applications from staff view');
    console.log('   - Add filters for different application statuses');
    console.log('');
    console.log('4. 🎓 MODIFY REGISTRATION NUMBER ASSIGNMENT:');
    console.log('   - Don\'t assign registration numbers during account creation');
    console.log('   - Assign registration numbers only when director approves application');
    console.log('   - Registration number = final student ID for portal access');
    console.log('');
    console.log('5. 🗂️ CLEAN UP EXISTING DATA:');
    console.log('   - Move draft applications to a separate collection or mark them hidden');
    console.log('   - Remove registration numbers from non-approved applications');
    console.log('   - Update counter to reflect only approved applications');

    // Step 6: Proposed new workflow
    console.log('\n6️⃣ PROPOSED NEW WORKFLOW');
    console.log('-' .repeat(50));
    
    console.log('📋 NEW APPLICATION LIFECYCLE:');
    console.log('');
    console.log('🔹 PHASE 1: ACCOUNT CREATION');
    console.log('   - User registers → Firebase Auth account created');
    console.log('   - ApplicationId generated and stored in user profile');
    console.log('   - NO application record created yet');
    console.log('   - User can start filling application form');
    console.log('');
    console.log('🔹 PHASE 2: APPLICATION COMPLETION');
    console.log('   - User fills personal info, documents, payment');
    console.log('   - Data stored temporarily (localStorage or draft collection)');
    console.log('   - User can save progress and continue later');
    console.log('   - Still NOT visible to staff');
    console.log('');
    console.log('🔹 PHASE 3: APPLICATION SUBMISSION');
    console.log('   - User clicks "Submit Application"');
    console.log('   - Application record created with status "submitted"');
    console.log('   - NOW visible to staff in admission dashboard');
    console.log('   - Email notification sent to admissions team');
    console.log('');
    console.log('🔹 PHASE 4: STAFF REVIEW');
    console.log('   - Staff reviews application');
    console.log('   - Status changes to "under_review"');
    console.log('   - Staff can request additional documents');
    console.log('');
    console.log('🔹 PHASE 5: DIRECTOR APPROVAL');
    console.log('   - Director reviews and approves/rejects');
    console.log('   - Status changes to "accepted" or "rejected"');
    console.log('   - If accepted: Registration number assigned');
    console.log('');
    console.log('🔹 PHASE 6: STUDENT REGISTRATION');
    console.log('   - Registration number becomes student ID');
    console.log('   - Student record created in student management system');
    console.log('   - Student can access student portal');

    console.log('\n📊 IMPACT ANALYSIS');
    console.log('=' .repeat(40));
    console.log(`❌ Current Issues:`);
    console.log(`   - ${draftApplications.length} incomplete applications visible to staff`);
    console.log(`   - ${appsWithRegNumbers.filter(app => app.status === 'draft').length} draft applications have registration numbers`);
    console.log(`   - Staff dashboard cluttered with incomplete applications`);
    console.log(`   - Registration numbers assigned prematurely`);
    console.log('');
    console.log(`✅ After Fix:`);
    console.log(`   - Only submitted applications visible to staff`);
    console.log(`   - Registration numbers assigned only after approval`);
    console.log(`   - Clean separation between application and student records`);
    console.log(`   - Proper workflow enforcement`);

  } catch (error) {
    console.error('❌ Analysis failed:', error);
  } finally {
    process.exit(0);
  }
}

analyzeCurrentWorkflow();