const { initializeApp } = require('firebase/app');
const { getFirestore, collection, query, where, getDocs } = require('firebase/firestore');

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
    console.log('📋 Checking grade-submissions collection...');
    const submissionsRef = collection(db, "grade-submissions");
    const submissionsSnapshot = await getDocs(submissionsRef);
    
    console.log(`✅ Found ${submissionsSnapshot.size} grade submissions:`);
    submissionsSnapshot.forEach(doc => {
      const data = doc.data();
      console.log(`   - ID: ${doc.id}`);
      console.log(`     Course: ${data.courseName || data.courseCode}`);
      console.log(`     Year: ${data.academicYear}, Semester: ${data.semester}`);
      console.log(`     Status: ${data.status}`);
      console.log(`     Submitted by: ${data.submittedBy}`);
      console.log(`     Students: ${data.totalStudents}`);
      console.log(`     Submission Date: ${data.submissionDate?.toDate?.() || 'Unknown'}`);
      console.log('');
    });

    // Check student-grades collection
    console.log('📋 Checking student-grades collection...');
    const studentGradesRef = collection(db, "student-grades");
    const studentGradesSnapshot = await getDocs(studentGradesRef);
    
    console.log(`✅ Found ${studentGradesSnapshot.size} student grades:`);
    studentGradesSnapshot.forEach(doc => {
      const data = doc.data();
      console.log(`   - ID: ${doc.id}`);
      console.log(`     Student: ${data.studentName || data.studentId}`);
      console.log(`     Course: ${data.courseName || data.courseCode}`);
      console.log(`     Year: ${data.academicYear}, Semester: ${data.semester}`);
      console.log(`     Status: ${data.status}`);
      console.log(`     Grade: ${data.grade}, Total: ${data.total}`);
      console.log(`     Submission ID: ${data.submissionId}`);
      console.log('');
    });

    // Check if there are any published grades
    const publishedGradesQuery = query(studentGradesRef, where("status", "==", "published"));
    const publishedGradesSnapshot = await getDocs(publishedGradesQuery);
    
    console.log(`📊 Summary:`);
    console.log(`   Total submissions: ${submissionsSnapshot.size}`);
    console.log(`   Total student grades: ${studentGradesSnapshot.size}`);
    console.log(`   Published grades: ${publishedGradesSnapshot.size}`);
    
    if (publishedGradesSnapshot.size === 0) {
      console.log('\n⚠️  No published grades found!');
      console.log('💡 This explains why students cannot see their grades.');
      console.log('   The director needs to approve and publish the grades.');
    } else {
      console.log('\n✅ Published grades found!');
      console.log('💡 Students should be able to see these grades.');
    }

  } catch (error) {
    console.error('❌ Error checking grade submissions:', error);
  }
}

// Run the check
checkGradeSubmissions().then(() => {
  console.log('\n✅ Grade submissions check completed!');
  process.exit(0);
}).catch((error) => {
  console.error('❌ Check failed:', error);
  process.exit(1);
}); 