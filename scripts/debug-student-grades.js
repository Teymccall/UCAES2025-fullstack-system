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

async function debugStudentGrades() {
  console.log('🔍 Debugging Student Grades...\n');

  try {
    // Step 1: Check student-grades collection for published grades
    console.log('📋 Step 1: Checking student-grades collection...');
    const studentGradesRef = collection(db, "student-grades");
    const publishedGradesQuery = query(
      studentGradesRef,
      where("status", "==", "published")
    );
    const publishedGradesSnapshot = await getDocs(publishedGradesQuery);
    
    console.log(`✅ Found ${publishedGradesSnapshot.size} published grades in student-grades:`);
    publishedGradesSnapshot.forEach(doc => {
      const data = doc.data();
      console.log(`   - Student: ${data.studentName || data.studentId}`);
      console.log(`     Course: ${data.courseName || data.courseCode}`);
      console.log(`     Year: ${data.academicYear}, Semester: ${data.semester}`);
      console.log(`     Grade: ${data.grade}, Total: ${data.total}`);
      console.log(`     Status: ${data.status}`);
      console.log('');
    });

    // Step 2: Check course registrations
    console.log('📋 Step 2: Checking course registrations...');
    const registrationsRef = collection(db, "course-registrations");
    const registrationsSnapshot = await getDocs(registrationsRef);
    
    console.log(`✅ Found ${registrationsSnapshot.size} course registrations:`);
    registrationsSnapshot.forEach(doc => {
      const data = doc.data();
      console.log(`   - Student: ${data.studentId}`);
      console.log(`     Year: ${data.academicYear}, Semester: ${data.semester}`);
      console.log(`     Courses: ${data.courses?.length || 0}`);
      console.log(`     Status: ${data.status}`);
      console.log('');
    });

    // Step 3: Check if there are any students in the system
    console.log('📋 Step 3: Checking students collection...');
    const studentsRef = collection(db, "students");
    const studentsSnapshot = await getDocs(studentsRef);
    
    console.log(`✅ Found ${studentsSnapshot.size} students:`);
    studentsSnapshot.forEach(doc => {
      const data = doc.data();
      console.log(`   - ${data.surname} ${data.otherNames} (${data.indexNumber})`);
    });

    // Step 4: Check grade-submissions collection
    console.log('\n📋 Step 4: Checking grade-submissions collection...');
    const submissionsRef = collection(db, "grade-submissions");
    const submissionsSnapshot = await getDocs(submissionsRef);
    
    console.log(`✅ Found ${submissionsSnapshot.size} grade submissions:`);
    submissionsSnapshot.forEach(doc => {
      const data = doc.data();
      console.log(`   - Course: ${data.courseName || data.courseCode}`);
      console.log(`     Year: ${data.academicYear}, Semester: ${data.semester}`);
      console.log(`     Status: ${data.status}`);
      console.log(`     Students: ${data.totalStudents}`);
      console.log('');
    });

    console.log('\n✅ Debug completed!');
    console.log('💡 This will help identify why grades are not showing for students.');

  } catch (error) {
    console.error('❌ Error debugging student grades:', error);
  }
}

// Run the debug
debugStudentGrades().then(() => {
  console.log('\n✅ Debug completed!');
  process.exit(0);
}).catch((error) => {
  console.error('❌ Debug failed:', error);
  process.exit(1);
}); 