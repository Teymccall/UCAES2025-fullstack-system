const { initializeApp } = require('firebase/app');
const { getFirestore, collection, query, where, getDocs, doc, getDoc } = require('firebase/firestore');

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function testDefermentSystem() {
  console.log('🔍 Testing Deferment System...\n');

  try {
    // 1. Check for deferred students
    console.log('1. Checking for deferred students...');
    const deferredStudentsQuery = query(
      collection(db, "student-registrations"),
      where("defermentStatus", "==", "deferred")
    );
    const deferredSnapshot = await getDocs(deferredStudentsQuery);
    
    if (deferredSnapshot.empty) {
      console.log('❌ No deferred students found in student-registrations');
    } else {
      console.log(`✅ Found ${deferredSnapshot.size} deferred student(s):`);
      deferredSnapshot.forEach(doc => {
        const data = doc.data();
        console.log(`   - ${data.surname} ${data.otherNames} (${data.registrationNumber})`);
        console.log(`     Deferment Period: ${data.defermentPeriod}`);
        console.log(`     Reason: ${data.defermentReason}`);
        console.log(`     Approved: ${data.defermentApprovedAt}`);
        console.log(`     Academic Status: ${data.academicStatus}`);
        console.log(`     Timeline Paused: ${data.academicTimelinePaused}`);
      });
    }

    // 2. Check deferment requests
    console.log('\n2. Checking deferment requests...');
    const requestsQuery = query(collection(db, "deferment-requests"));
    const requestsSnapshot = await getDocs(requestsQuery);
    
    if (requestsSnapshot.empty) {
      console.log('❌ No deferment requests found');
    } else {
      console.log(`✅ Found ${requestsSnapshot.size} deferment request(s):`);
      requestsSnapshot.forEach(doc => {
        const data = doc.data();
        console.log(`   - ${data.name} (${data.regNumber})`);
        console.log(`     Status: ${data.status}`);
        console.log(`     Period: ${data.period}`);
        console.log(`     Reason: ${data.reason}`);
        console.log(`     Type: ${data.type}`);
      });
    }

    // 3. Check academic records
    console.log('\n3. Checking academic records...');
    const academicRecordsQuery = query(
      collection(db, "academic-records"),
      where("recordType", "in", ["deferment", "reactivation"])
    );
    const academicSnapshot = await getDocs(academicRecordsQuery);
    
    if (academicSnapshot.empty) {
      console.log('❌ No deferment/reactivation academic records found');
    } else {
      console.log(`✅ Found ${academicSnapshot.size} academic record(s):`);
      academicSnapshot.forEach(doc => {
        const data = doc.data();
        console.log(`   - ${data.studentName} (${data.recordType})`);
        console.log(`     Academic Impact: ${JSON.stringify(data.academicImpact)}`);
        console.log(`     Tuition Status: ${JSON.stringify(data.tuitionStatus)}`);
      });
    }

    // 4. Check course registrations
    console.log('\n4. Checking course registrations...');
    const courseRegQuery = query(
      collection(db, "course-registrations"),
      where("status", "==", "deferred")
    );
    const courseRegSnapshot = await getDocs(courseRegQuery);
    
    if (courseRegSnapshot.empty) {
      console.log('❌ No deferred course registrations found');
    } else {
      console.log(`✅ Found ${courseRegSnapshot.size} deferred course registration(s):`);
      courseRegSnapshot.forEach(doc => {
        const data = doc.data();
        console.log(`   - Student: ${data.studentId}`);
        console.log(`     Academic Activities Paused: ${data.academicActivitiesPaused}`);
        console.log(`     No Classes: ${data.noClasses}`);
        console.log(`     No Exams: ${data.noExams}`);
      });
    }

    // 5. Check fee accounts
    console.log('\n5. Checking fee accounts...');
    const feeAccountsQuery = query(
      collection(db, "feeAccounts"),
      where("defermentStatus", "==", "deferred")
    );
    const feeAccountsSnapshot = await getDocs(feeAccountsQuery);
    
    if (feeAccountsSnapshot.empty) {
      console.log('❌ No deferred fee accounts found');
    } else {
      console.log(`✅ Found ${feeAccountsSnapshot.size} deferred fee account(s):`);
      feeAccountsSnapshot.forEach(doc => {
        const data = doc.data();
        console.log(`   - Student: ${data.studentId}`);
        console.log(`     Refund Eligible: ${data.refundEligible}`);
        console.log(`     Fees Rolled Over: ${data.feesRolledOver}`);
        console.log(`     Rollover Amount: ${data.rolloverAmount}`);
      });
    }

    // 6. Check notifications
    console.log('\n6. Checking notifications...');
    const notificationsQuery = query(
      collection(db, "notifications"),
      where("type", "in", ["deferment_approved", "student_reactivation"])
    );
    const notificationsSnapshot = await getDocs(notificationsQuery);
    
    if (notificationsSnapshot.empty) {
      console.log('❌ No deferment notifications found');
    } else {
      console.log(`✅ Found ${notificationsSnapshot.size} deferment notification(s):`);
      notificationsSnapshot.forEach(doc => {
        const data = doc.data();
        console.log(`   - ${data.title}`);
        console.log(`     Type: ${data.type}`);
        console.log(`     Student: ${data.studentId}`);
        console.log(`     Read: ${data.read}`);
      });
    }

    // 7. Check audit trail
    console.log('\n7. Checking audit trail...');
    const auditTrailQuery = query(
      collection(db, "audit-trail"),
      where("action", "in", ["student_deferment_approved", "student_reactivation_approved"])
    );
    const auditTrailSnapshot = await getDocs(auditTrailQuery);
    
    if (auditTrailSnapshot.empty) {
      console.log('❌ No deferment audit trail entries found');
    } else {
      console.log(`✅ Found ${auditTrailSnapshot.size} audit trail entry(ies):`);
      auditTrailSnapshot.forEach(doc => {
        const data = doc.data();
        console.log(`   - Action: ${data.action}`);
        console.log(`     Student: ${data.studentName}`);
        console.log(`     Performed By: ${data.performedBy}`);
        console.log(`     Impact: ${JSON.stringify(data.impact)}`);
      });
    }

    console.log('\n🎯 Deferment System Test Complete!');
    console.log('\n📋 Summary:');
    console.log(`   - Deferred Students: ${deferredSnapshot.size}`);
    console.log(`   - Deferment Requests: ${requestsSnapshot.size}`);
    console.log(`   - Academic Records: ${academicSnapshot.size}`);
    console.log(`   - Course Registrations: ${courseRegSnapshot.size}`);
    console.log(`   - Fee Accounts: ${feeAccountsSnapshot.size}`);
    console.log(`   - Notifications: ${notificationsSnapshot.size}`);
    console.log(`   - Audit Trail Entries: ${auditTrailSnapshot.size}`);

  } catch (error) {
    console.error('❌ Error testing deferment system:', error);
  }
}

// Run the test
testDefermentSystem(); 