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

async function checkGradeSubmissions() {
  console.log('🔍 Checking Grade Submissions...\n');

  try {
    // Check grade-submissions collection
    console.log('📋 Checking grade-submissions collection:');
    const submissionsRef = collection(db, 'grade-submissions');
    const submissionsSnapshot = await getDocs(submissionsRef);
    
    if (submissionsSnapshot.empty) {
      console.log('❌ No grade submissions found in grade-submissions collection');
    } else {
      console.log(`✅ Found ${submissionsSnapshot.size} grade submission(s):`);
      submissionsSnapshot.forEach((doc) => {
        const data = doc.data();
        console.log(`\n📄 Submission ID: ${doc.id}`);
        console.log(`   Course: ${data.courseName || data.courseCode || 'Unknown'}`);
        console.log(`   Lecturer: ${data.submittedBy || 'Unknown'}`);
        console.log(`   Status: ${data.status || 'Unknown'}`);
        console.log(`   Students: ${data.totalStudents || data.grades?.length || 0}`);
        console.log(`   Submitted: ${data.submissionDate?.toDate?.()?.toLocaleString() || 'Unknown'}`);
        console.log(`   Academic Year: ${data.academicYear || 'Unknown'}`);
        console.log(`   Semester: ${data.semester || 'Unknown'}`);
      });
    }

    // Check student-grades collection
    console.log('\n📊 Checking student-grades collection:');
    const studentGradesRef = collection(db, 'student-grades');
    const studentGradesSnapshot = await getDocs(studentGradesRef);
    
    if (studentGradesSnapshot.empty) {
      console.log('❌ No student grades found in student-grades collection');
    } else {
      console.log(`✅ Found ${studentGradesSnapshot.size} student grade(s):`);
      studentGradesSnapshot.forEach((doc) => {
        const data = doc.data();
        console.log(`\n📄 Grade ID: ${doc.id}`);
        console.log(`   Student: ${data.studentName || data.studentId || 'Unknown'}`);
        console.log(`   Course: ${data.courseName || data.courseCode || 'Unknown'}`);
        console.log(`   Status: ${data.status || 'Unknown'}`);
        console.log(`   Total: ${data.total || 0}`);
        console.log(`   Grade: ${data.grade || 'Unknown'}`);
        console.log(`   Lecturer: ${data.lecturerId || 'Unknown'}`);
      });
    }

    // Check old grades collection for backward compatibility
    console.log('\n📋 Checking grades collection (old format):');
    const gradesRef = collection(db, 'grades');
    const gradesSnapshot = await getDocs(gradesRef);
    
    if (gradesSnapshot.empty) {
      console.log('❌ No grades found in grades collection');
    } else {
      console.log(`✅ Found ${gradesSnapshot.size} grade(s) in old format:`);
      gradesSnapshot.forEach((doc) => {
        const data = doc.data();
        console.log(`\n📄 Grade ID: ${doc.id}`);
        console.log(`   Course: ${data.courseCode || 'Unknown'}`);
        console.log(`   Student: ${data.studentId || 'Unknown'}`);
        console.log(`   Status: ${data.status || 'Unknown'}`);
        console.log(`   Total: ${data.total || 0}`);
        console.log(`   Grade: ${data.grade || 'Unknown'}`);
      });
    }

    // Check for pending approvals specifically
    console.log('\n⏳ Checking for pending approvals:');
    const pendingSubmissionsQuery = query(submissionsRef, where('status', '==', 'pending_approval'));
    const pendingSnapshot = await getDocs(pendingSubmissionsQuery);
    
    if (pendingSnapshot.empty) {
      console.log('❌ No pending approvals found');
    } else {
      console.log(`✅ Found ${pendingSnapshot.size} pending approval(s):`);
      pendingSnapshot.forEach((doc) => {
        const data = doc.data();
        console.log(`\n📄 Pending: ${doc.id}`);
        console.log(`   Course: ${data.courseName || data.courseCode || 'Unknown'}`);
        console.log(`   Lecturer: ${data.submittedBy || 'Unknown'}`);
        console.log(`   Students: ${data.totalStudents || data.grades?.length || 0}`);
      });
    }

  } catch (error) {
    console.error('❌ Error checking grade submissions:', error);
  }
}

// Run the check
checkGradeSubmissions().then(() => {
  console.log('\n✅ Grade submission check completed!');
  process.exit(0);
}).catch((error) => {
  console.error('❌ Script failed:', error);
  process.exit(1);
}); 