const { initializeApp } = require('firebase/app');
const { getFirestore, collection, query, where, getDocs, doc, getDoc, updateDoc } = require('firebase/firestore');

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

async function fixStudentIdMismatch() {
  console.log('🔧 Fixing Student ID Mismatch...\n');

  try {
    // Step 1: Check published grades
    console.log('📋 Step 1: Analyzing published grades...');
    const studentGradesRef = collection(db, "student-grades");
    const publishedGradesQuery = query(studentGradesRef, where("status", "==", "published"));
    const publishedGradesSnapshot = await getDocs(publishedGradesQuery);
    
    console.log(`✅ Found ${publishedGradesSnapshot.size} published grades:`);
    const gradeStudents = [];
    publishedGradesSnapshot.forEach(doc => {
      const data = doc.data();
      gradeStudents.push({
        id: doc.id,
        studentId: data.studentId,
        studentName: data.studentName,
        courseCode: data.courseCode,
        academicYear: data.academicYear,
        semester: data.semester,
        grade: data.grade
      });
      console.log(`   - ${data.studentName || data.studentId} (${data.studentId})`);
      console.log(`     Course: ${data.courseCode}, Grade: ${data.grade}`);
      console.log('');
    });

    // Step 2: Check course registrations for 2025-2026
    console.log('📋 Step 2: Analyzing course registrations for 2025-2026...');
    const registrationsRef = collection(db, "course-registrations");
    const registrationsQuery = query(
      registrationsRef,
      where("academicYear", "==", "2025-2026")
    );
    const registrationsSnapshot = await getDocs(registrationsQuery);
    
    console.log(`✅ Found ${registrationsSnapshot.size} registrations for 2025-2026:`);
    const registeredStudents = [];
    registrationsSnapshot.forEach(doc => {
      const data = doc.data();
      registeredStudents.push({
        id: doc.id,
        studentId: data.studentId,
        studentName: data.studentName,
        email: data.email,
        academicYear: data.academicYear,
        semester: data.semester,
        courses: data.courses
      });
      console.log(`   - ${data.studentName} (${data.studentId})`);
      console.log(`     Email: ${data.email}, Semester: ${data.semester}`);
      console.log(`     Courses: ${data.courses?.length || 0}`);
      console.log('');
    });

    // Step 3: Find matches by name
    console.log('📋 Step 3: Finding matches by student name...');
    const matches = [];
    
    for (const grade of gradeStudents) {
      for (const registration of registeredStudents) {
        if (grade.studentName && registration.studentName) {
          // Check if names match (case insensitive)
          const gradeName = grade.studentName.toLowerCase();
          const regName = registration.studentName.toLowerCase();
          
          if (gradeName.includes(regName) || regName.includes(gradeName)) {
            matches.push({
              grade: grade,
              registration: registration,
              matchType: 'name'
            });
            console.log(`✅ Match found: ${grade.studentName} ↔ ${registration.studentName}`);
          }
        }
      }
    }

    // Step 4: Check if grades are for Basic Mathematics
    console.log('\n📋 Step 4: Checking if grades are for registered courses...');
    for (const grade of gradeStudents) {
      if (grade.courseCode === 'Basic Mathematics' || grade.courseCode === 'GNS 151') {
        console.log(`📚 Grade for ${grade.studentName}: ${grade.courseCode}`);
        
        // Check if any registration has this course
        for (const registration of registeredStudents) {
          if (registration.courses && Array.isArray(registration.courses)) {
            const hasCourse = registration.courses.some(course => 
              (typeof course === 'object' && (
                course.courseCode === 'GNS 151' || 
                course.courseName === 'Basic Mathematics' ||
                course.courseCode === 'Basic Mathematics'
              ))
            );
            
            if (hasCourse) {
              console.log(`✅ ${registration.studentName} is registered for Basic Mathematics`);
            }
          }
        }
      }
    }

    // Step 5: Provide recommendations
    console.log('\n📋 Step 5: Recommendations...');
    console.log('💡 The issue is that grades were published for students using email IDs,');
    console.log('   but course registrations use different student IDs.');
    console.log('');
    console.log('🔧 To fix this, you need to:');
    console.log('   1. Register the correct students for Basic Mathematics in 2025-2026');
    console.log('   2. Or update the grade records to use the correct student IDs');
    console.log('');
    console.log('📝 Students who need Basic Mathematics registration:');
    console.log('   - ben@gmail.com (BENEDICT LAMISI)');
    console.log('   - pacmboro@outlook.com (PAUL ADDO)');

  } catch (error) {
    console.error('❌ Error fixing student ID mismatch:', error);
  }
}

// Run the fix
fixStudentIdMismatch().then(() => {
  console.log('\n✅ Student ID mismatch analysis completed!');
  process.exit(0);
}).catch((error) => {
  console.error('❌ Fix failed:', error);
  process.exit(1);
}); 