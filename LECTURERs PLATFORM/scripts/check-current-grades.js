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

async function checkCurrentGrades() {
  console.log('🔍 Checking Current Grades State...\n');

  try {
    // Check student-grades collection
    console.log('📋 Checking student-grades collection...');
    const studentGradesRef = collection(db, 'student-grades');
    const studentGradesSnapshot = await getDocs(studentGradesRef);
    
    if (studentGradesSnapshot.empty) {
      console.log('❌ No grades found in student-grades collection');
    } else {
      console.log(`✅ Found ${studentGradesSnapshot.size} grades in student-grades collection`);
      
      studentGradesSnapshot.forEach((doc, index) => {
        const gradeData = doc.data();
        console.log(`\n📄 Grade ${index + 1}:`);
        console.log(`   Student ID: ${gradeData.studentId}`);
        console.log(`   Course: ${gradeData.courseName || gradeData.courseCode}`);
        console.log(`   Status: ${gradeData.status}`);
        console.log(`   Grade: ${gradeData.grade} (${gradeData.total}/100)`);
        console.log(`   Year: ${gradeData.academicYear}, Semester: ${gradeData.semester}`);
      });
    }

    // Check grade-submissions collection
    console.log('\n📋 Checking grade-submissions collection...');
    const gradeSubmissionsRef = collection(db, 'grade-submissions');
    const gradeSubmissionsSnapshot = await getDocs(gradeSubmissionsRef);
    
    if (gradeSubmissionsSnapshot.empty) {
      console.log('❌ No submissions found in grade-submissions collection');
    } else {
      console.log(`✅ Found ${gradeSubmissionsSnapshot.size} submissions in grade-submissions collection`);
      
      gradeSubmissionsSnapshot.forEach((doc, index) => {
        const submissionData = doc.data();
        console.log(`\n📄 Submission ${index + 1}:`);
        console.log(`   Course: ${submissionData.courseName || submissionData.courseCode}`);
        console.log(`   Status: ${submissionData.status}`);
        console.log(`   Students: ${submissionData.totalStudents || submissionData.grades?.length || 0}`);
        console.log(`   Year: ${submissionData.academicYear}, Semester: ${submissionData.semester}`);
        console.log(`   Submitted: ${submissionData.submissionDate?.toDate?.() || submissionData.submissionDate}`);
      });
    }

    // Check if there are any published grades specifically
    console.log('\n📋 Checking for published grades...');
    const publishedGradesQuery = query(studentGradesRef, where('status', '==', 'published'));
    const publishedGradesSnapshot = await getDocs(publishedGradesQuery);
    
    if (publishedGradesSnapshot.empty) {
      console.log('❌ No published grades found');
    } else {
      console.log(`✅ Found ${publishedGradesSnapshot.size} published grades`);
      
      publishedGradesSnapshot.forEach((doc, index) => {
        const gradeData = doc.data();
        console.log(`\n📄 Published Grade ${index + 1}:`);
        console.log(`   Student ID: ${gradeData.studentId}`);
        console.log(`   Course: ${gradeData.courseName || gradeData.courseCode}`);
        console.log(`   Grade: ${gradeData.grade} (${gradeData.total}/100)`);
        console.log(`   Year: ${gradeData.academicYear}, Semester: ${gradeData.semester}`);
      });
    }

    // Check for the specific student's grades
    console.log('\n🔍 Checking for specific student grades...');
    const studentEmail = 'nanak@gmail.com';
    const studentGradesQuery = query(studentGradesRef, where('studentId', '==', studentEmail));
    const studentGradesSnapshot = await getDocs(studentGradesQuery);
    
    if (studentGradesSnapshot.empty) {
      console.log(`❌ No grades found for student: ${studentEmail}`);
    } else {
      console.log(`✅ Found ${studentGradesSnapshot.size} grades for student: ${studentEmail}`);
      
      studentGradesSnapshot.forEach((doc, index) => {
        const gradeData = doc.data();
        console.log(`\n📄 Student Grade ${index + 1}:`);
        console.log(`   Course: ${gradeData.courseName || gradeData.courseCode}`);
        console.log(`   Status: ${gradeData.status}`);
        console.log(`   Grade: ${gradeData.grade} (${gradeData.total}/100)`);
        console.log(`   Year: ${gradeData.academicYear}, Semester: ${gradeData.semester}`);
      });
    }

  } catch (error) {
    console.error('❌ Error checking current grades:', error);
  }
}

// Run the check
checkCurrentGrades().then(() => {
  console.log('\n✅ Current grades check completed!');
  process.exit(0);
}).catch((error) => {
  console.error('❌ Check failed:', error);
  process.exit(1);
}); 