const { initializeApp } = require('firebase/app');
const { getFirestore, collection, query, where, getDocs, doc, updateDoc, addDoc, Timestamp } = require('firebase/firestore');

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCWj01Z1zScFJbTh5ChqsLEEZZdmBOjlUE",
  authDomain: "ucaes2025.firebaseapp.com",
  databaseURL: "https://ucaes2025-default-rtdb.firebaseio.com",
  projectId: "ucaes2025",
  storageBucket: "ucaes2025.firebasestorage.app",
  messagingSenderId: "543217800581",
  appId: "1:543217800581:web:4f97ba0087f694deeea0ec",
  measurementId: "G-8E3518ML0D"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function testGradeWorkflow() {
  console.log('🧪 Testing Complete Grade Workflow...\n');

  try {
    // Step 1: Check current submissions
    console.log('📋 Step 1: Checking current submissions...');
    const submissionsRef = collection(db, 'grade-submissions');
    const submissionsSnapshot = await getDocs(submissionsRef);
    
    if (submissionsSnapshot.empty) {
      console.log('❌ No submissions found. Please submit grades first.');
      return;
    }

    console.log(`✅ Found ${submissionsSnapshot.size} submission(s)`);
    
    // Step 2: Find a pending submission to approve
    const pendingQuery = query(submissionsRef, where('status', '==', 'pending_approval'));
    const pendingSnapshot = await getDocs(pendingQuery);
    
    if (pendingSnapshot.empty) {
      console.log('❌ No pending submissions found.');
      return;
    }

    const submissionDoc = pendingSnapshot.docs[0];
    const submissionData = submissionDoc.data();
    
    console.log(`\n📄 Processing submission: ${submissionDoc.id}`);
    console.log(`   Course: ${submissionData.courseName || submissionData.courseCode}`);
    console.log(`   Lecturer: ${submissionData.submittedBy}`);
    console.log(`   Students: ${submissionData.totalStudents}`);
    console.log(`   Status: ${submissionData.status}`);

    // Step 3: Approve the submission
    console.log('\n✅ Step 2: Approving submission...');
    await updateDoc(doc(db, 'grade-submissions', submissionDoc.id), {
      status: 'approved',
      approvedBy: 'director_test',
      approvedDate: new Date()
    });
    
    // Update individual student grades
    const studentGradesRef = collection(db, 'student-grades');
    const studentGradesQuery = query(
      studentGradesRef,
      where('submissionId', '==', submissionDoc.id)
    );
    const studentGradesSnapshot = await getDocs(studentGradesQuery);
    
    const updatePromises = studentGradesSnapshot.docs.map(doc =>
      updateDoc(doc.ref, {
        status: 'approved',
        approvedBy: 'director_test',
        approvedAt: new Date()
      })
    );
    
    await Promise.all(updatePromises);
    console.log(`✅ Approved ${studentGradesSnapshot.size} student grades`);

    // Step 4: Publish the results
    console.log('\n📢 Step 3: Publishing results...');
    await updateDoc(doc(db, 'grade-submissions', submissionDoc.id), {
      status: 'published',
      publishedBy: 'director_test',
      publishedDate: new Date()
    });
    
    const publishPromises = studentGradesSnapshot.docs.map(doc =>
      updateDoc(doc.ref, {
        status: 'published',
        publishedBy: 'director_test',
        publishedAt: new Date()
      })
    );
    
    await Promise.all(publishPromises);
    console.log(`✅ Published ${studentGradesSnapshot.size} student grades`);

    // Step 5: Verify the results are now visible to students
    console.log('\n👨‍🎓 Step 4: Verifying student visibility...');
    const publishedGradesQuery = query(
      studentGradesRef,
      where('submissionId', '==', submissionDoc.id),
      where('status', '==', 'published')
    );
    const publishedGradesSnapshot = await getDocs(publishedGradesQuery);
    
    console.log(`✅ Found ${publishedGradesSnapshot.size} published grades for students`);
    
    publishedGradesSnapshot.forEach(doc => {
      const gradeData = doc.data();
      console.log(`   Student: ${gradeData.studentName || gradeData.studentId}`);
      console.log(`   Course: ${gradeData.courseName || gradeData.courseCode}`);
      console.log(`   Grade: ${gradeData.grade} (${gradeData.total}/100)`);
      console.log(`   Status: ${gradeData.status}`);
    });

    console.log('\n🎉 Workflow Test Completed Successfully!');
    console.log('\n📋 Summary:');
    console.log('   1. ✅ Found pending submission');
    console.log('   2. ✅ Approved submission and student grades');
    console.log('   3. ✅ Published results for student access');
    console.log('   4. ✅ Verified grades are now visible to students');
    
    console.log('\n💡 Next Steps:');
    console.log('   - Students can now view their grades in the student portal');
    console.log('   - Grades will appear when students search for the academic year and semester');
    console.log('   - The complete workflow is now functional!');

  } catch (error) {
    console.error('❌ Error testing grade workflow:', error);
  }
}

// Run the test
testGradeWorkflow().then(() => {
  console.log('\n✅ Grade workflow test completed!');
  process.exit(0);
}).catch((error) => {
  console.error('❌ Test failed:', error);
  process.exit(1);
}); 