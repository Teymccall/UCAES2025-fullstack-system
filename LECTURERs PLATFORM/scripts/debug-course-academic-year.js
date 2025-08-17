const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, query, where } = require('firebase/firestore');

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

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function debugCourseAcademicYear() {
  try {
    console.log('🔍 Debugging Course Academic Year/Semester Combinations...');
    console.log('='.repeat(60));
    
    // 1. Check lecturer assignments
    console.log('\n📋 1. Lecturer Assignments:');
    console.log('-'.repeat(30));
    
    const assignmentsRef = collection(db, 'lecturer-assignments');
    const assignmentsSnapshot = await getDocs(assignmentsRef);
    
    console.log(`Found ${assignmentsSnapshot.size} lecturer assignments:`);
    assignmentsSnapshot.forEach((doc, index) => {
      const data = doc.data();
      console.log(`\n${index + 1}. Assignment ID: ${doc.id}`);
      console.log(`   Lecturer ID: ${data.lecturerId}`);
      console.log(`   Course ID: ${data.courseId}`);
      console.log(`   Academic Year ID: ${data.academicYearId}`);
      console.log(`   Academic Semester ID: ${data.academicSemesterId}`);
      console.log(`   Academic Year: ${data.academicYear}`);
      console.log(`   Semester: ${data.semester}`);
      console.log(`   Status: ${data.status}`);
    });
    
    // 2. Check academic years
    console.log('\n📅 2. Academic Years:');
    console.log('-'.repeat(30));
    
    const yearsRef = collection(db, 'academic-years');
    const yearsSnapshot = await getDocs(yearsRef);
    
    console.log(`Found ${yearsSnapshot.size} academic years:`);
    yearsSnapshot.forEach((doc, index) => {
      const data = doc.data();
      console.log(`\n${index + 1}. Year ID: ${doc.id}`);
      console.log(`   Year: ${data.year}`);
      console.log(`   Name: ${data.name}`);
      console.log(`   Status: ${data.status}`);
    });
    
    // 3. Check academic semesters
    console.log('\n📚 3. Academic Semesters:');
    console.log('-'.repeat(30));
    
    const semestersRef = collection(db, 'academic-semesters');
    const semestersSnapshot = await getDocs(semestersRef);
    
    console.log(`Found ${semestersSnapshot.size} academic semesters:`);
    semestersSnapshot.forEach((doc, index) => {
      const data = doc.data();
      console.log(`\n${index + 1}. Semester ID: ${doc.id}`);
      console.log(`   Name: ${data.name}`);
      console.log(`   Academic Year ID: ${data.academicYearId}`);
      console.log(`   Status: ${data.status}`);
    });
    
    // 4. Check student registrations for specific courses
    console.log('\n👥 4. Student Registrations by Course:');
    console.log('-'.repeat(30));
    
    const registrationsRef = collection(db, 'course-registrations');
    const registrationsSnapshot = await getDocs(registrationsRef);
    
    // Group registrations by course
    const courseRegistrations = {};
    registrationsSnapshot.forEach(doc => {
      const data = doc.data();
      if (data.courses && Array.isArray(data.courses)) {
        data.courses.forEach(course => {
          const courseCode = typeof course === 'string' ? course : (course.courseCode || course.code || 'Unknown');
          if (!courseRegistrations[courseCode]) {
            courseRegistrations[courseCode] = [];
          }
          courseRegistrations[courseCode].push({
            studentName: data.studentName,
            registrationNumber: data.registrationNumber,
            academicYear: data.academicYear,
            semester: data.semester,
            studentId: data.studentId
          });
        });
      }
    });
    
    // Show registrations for ESM courses
    const esmCourses = Object.keys(courseRegistrations).filter(code => code.includes('ESM'));
    esmCourses.forEach(courseCode => {
      console.log(`\n📊 ${courseCode} Registrations:`);
      const registrations = courseRegistrations[courseCode];
      const groupedByYearSemester = {};
      
      registrations.forEach(reg => {
        const key = `${reg.academicYear}-${reg.semester}`;
        if (!groupedByYearSemester[key]) {
          groupedByYearSemester[key] = [];
        }
        groupedByYearSemester[key].push(reg);
      });
      
      Object.entries(groupedByYearSemester).forEach(([yearSemester, students]) => {
        console.log(`  ${yearSemester}: ${students.length} students`);
        students.forEach(student => {
          console.log(`    - ${student.studentName} (${student.registrationNumber})`);
        });
      });
    });
    
    // 5. Test specific lecturer assignments
    console.log('\n🎯 5. Testing Specific Lecturer Assignments:');
    console.log('-'.repeat(30));
    
    // Find assignments for a specific lecturer (you can change this ID)
    const testLecturerId = "7DA5aIx8KWTMq0nFBIJaCzRzMlv1"; // Change this to your lecturer ID
    const lecturerAssignments = assignmentsSnapshot.docs.filter(doc => {
      const data = doc.data();
      return data.lecturerId === testLecturerId;
    });
    
    console.log(`Found ${lecturerAssignments.length} assignments for lecturer ${testLecturerId}:`);
    lecturerAssignments.forEach((doc, index) => {
      const data = doc.data();
      console.log(`\n${index + 1}. Course ID: ${data.courseId}`);
      console.log(`   Academic Year: ${data.academicYear}`);
      console.log(`   Semester: ${data.semester}`);
      console.log(`   Status: ${data.status}`);
      
      // Check if there are students registered for this combination
      const matchingRegistrations = registrationsSnapshot.docs.filter(regDoc => {
        const regData = regDoc.data();
        return regData.academicYear === data.academicYear && 
               regData.semester === data.semester &&
               regData.courses && 
               regData.courses.some(course => {
                 const courseCode = typeof course === 'string' ? course : (course.courseCode || course.code);
                 return courseCode && courseCode.includes('ESM');
               });
      });
      
      console.log(`   Matching registrations: ${matchingRegistrations.length}`);
      matchingRegistrations.forEach(regDoc => {
        const regData = regDoc.data();
        console.log(`     - ${regData.studentName} (${regData.registrationNumber})`);
      });
    });
    
  } catch (error) {
    console.error('❌ Error debugging course academic year:', error);
  }
}

debugCourseAcademicYear(); 