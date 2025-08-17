const { initializeApp } = require('firebase/app');
const { getFirestore, collection, query, where, getDocs, doc, getDoc } = require('firebase/firestore');

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

async function checkPendingPublications() {
  console.log('🔍 Checking Grades Ready for Publication...\n');

  try {
    // Check approved grade submissions
    console.log('📋 Checking approved grade submissions...');
    const gradeSubmissionsRef = collection(db, 'grade-submissions');
    const approvedSubmissionsQuery = query(gradeSubmissionsRef, where('status', '==', 'approved'));
    const approvedSubmissionsSnapshot = await getDocs(approvedSubmissionsQuery);
    
    if (approvedSubmissionsSnapshot.empty) {
      console.log('❌ No approved submissions found');
    } else {
      console.log(`✅ Found ${approvedSubmissionsSnapshot.size} approved submissions ready for publication`);
      
      approvedSubmissionsSnapshot.forEach((doc, index) => {
        const submissionData = doc.data();
        console.log(`\n📄 Approved Submission ${index + 1}:`);
        console.log(`   ID: ${doc.id}`);
        console.log(`   Course: ${submissionData.courseName || submissionData.courseCode}`);
        console.log(`   Lecturer: ${submissionData.submittedBy}`);
        console.log(`   Students: ${submissionData.totalStudents || submissionData.grades?.length || 0}`);
        console.log(`   Year: ${submissionData.academicYear}, Semester: ${submissionData.semester}`);
        console.log(`   Submitted: ${submissionData.submissionDate?.toDate?.() || submissionData.submissionDate}`);
        console.log(`   Status: ${submissionData.status}`);
      });
    }

    // Check approved individual student grades
    console.log('\n📋 Checking approved individual student grades...');
    const studentGradesRef = collection(db, 'student-grades');
    const approvedGradesQuery = query(studentGradesRef, where('status', '==', 'approved'));
    const approvedGradesSnapshot = await getDocs(approvedGradesQuery);
    
    if (approvedGradesSnapshot.empty) {
      console.log('❌ No approved individual grades found');
    } else {
      console.log(`✅ Found ${approvedGradesSnapshot.size} approved individual grades ready for publication`);
      
      approvedGradesSnapshot.forEach((doc, index) => {
        const gradeData = doc.data();
        console.log(`\n📄 Approved Grade ${index + 1}:`);
        console.log(`   ID: ${doc.id}`);
        console.log(`   Student: ${gradeData.studentId}`);
        console.log(`   Course: ${gradeData.courseName || gradeData.courseCode}`);
        console.log(`   Grade: ${gradeData.grade} (${gradeData.total}/100)`);
        console.log(`   Year: ${gradeData.academicYear}, Semester: ${gradeData.semester}`);
        console.log(`   Status: ${gradeData.status}`);
      });
    }

    // Check specifically for nanak@gmail.com
    console.log('\n🔍 Checking specifically for nanak@gmail.com...');
    const nanakGradesQuery = query(studentGradesRef, where('studentId', '==', 'nanak@gmail.com'));
    const nanakGradesSnapshot = await getDocs(nanakGradesQuery);
    
    if (nanakGradesSnapshot.empty) {
      console.log('❌ No grades found for nanak@gmail.com');
    } else {
      console.log(`✅ Found ${nanakGradesSnapshot.size} grades for nanak@gmail.com`);
      
      nanakGradesSnapshot.forEach((doc, index) => {
        const gradeData = doc.data();
        console.log(`\n📄 Grade ${index + 1} for nanak@gmail.com:`);
        console.log(`   ID: ${doc.id}`);
        console.log(`   Course: ${gradeData.courseName || gradeData.courseCode}`);
        console.log(`   Grade: ${gradeData.grade} (${gradeData.total}/100)`);
        console.log(`   Year: ${gradeData.academicYear}, Semester: ${gradeData.semester}`);
        console.log(`   Status: ${gradeData.status}`);
        console.log(`   Submission ID: ${gradeData.submissionId}`);
      });
    }

    console.log('\n📊 Summary:');
    console.log('💡 To fix the student portal issue:');
    console.log('   1. Go to Academic Affairs Director Panel');
    console.log('   2. Navigate to Results/Approvals');
    console.log('   3. Find approved submissions');
    console.log('   4. Click "Publish" for each approved submission');
    console.log('   5. This will change status from "approved" to "published"');
    console.log('   6. Students will then see their grades in the portal');

  } catch (error) {
    console.error('❌ Error checking pending publications:', error);
  }
}

// Run the check
checkPendingPublications().then(() => {
  console.log('\n✅ Pending publications check completed!');
  process.exit(0);
}).catch((error) => {
  console.error('❌ Check failed:', error);
  process.exit(1);
}); 