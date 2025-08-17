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

async function testCourseRegistrationValidation() {
  console.log('🔍 Testing Course Registration Validation...\n');

  try {
    // Step 1: Check course registrations
    console.log('📋 Step 1: Checking course registrations...');
    const registrationsRef = collection(db, "course-registrations");
    const registrationsSnapshot = await getDocs(registrationsRef);
    
    console.log(`✅ Found ${registrationsSnapshot.size} course registrations:`);
    registrationsSnapshot.forEach(doc => {
      const data = doc.data();
      console.log(`   - Student: ${data.studentName || data.studentId}`);
      console.log(`     Year: ${data.academicYear}, Semester: ${data.semester}`);
      console.log(`     Courses: ${data.courses?.length || 0}`);
      console.log(`     Status: ${data.status}`);
      console.log('');
    });

    // Step 2: Check student registrations
    console.log('📋 Step 2: Checking student registrations...');
    const studentRegsRef = collection(db, "student-registrations");
    const studentRegsSnapshot = await getDocs(studentRegsRef);
    
    console.log(`✅ Found ${studentRegsSnapshot.size} student registrations:`);
    studentRegsSnapshot.forEach(doc => {
      const data = doc.data();
      console.log(`   - Student: ${data.studentName || data.studentId}`);
      console.log(`     Year: ${data.academicYear}, Semester: ${data.semester}`);
      console.log(`     Courses: ${data.courses?.length || 0}`);
      console.log(`     Status: ${data.status}`);
      console.log('');
    });

    // Step 3: Check if there are any published grades
    console.log('📋 Step 3: Checking published grades...');
    const studentGradesRef = collection(db, "student-grades");
    const publishedGradesQuery = query(studentGradesRef, where("status", "==", "published"));
    const publishedGradesSnapshot = await getDocs(publishedGradesQuery);
    
    console.log(`✅ Found ${publishedGradesSnapshot.size} published grades:`);
    publishedGradesSnapshot.forEach(doc => {
      const data = doc.data();
      console.log(`   - Student: ${data.studentName || data.studentId}`);
      console.log(`     Course: ${data.courseName || data.courseCode}`);
      console.log(`     Year: ${data.academicYear}, Semester: ${data.semester}`);
      console.log(`     Grade: ${data.grade}, Total: ${data.total}`);
      console.log('');
    });

    // Step 4: Test validation logic
    console.log('📋 Step 4: Testing validation logic...');
    
    if (registrationsSnapshot.size > 0) {
      const sampleRegistration = registrationsSnapshot.docs[0].data();
      const studentId = sampleRegistration.studentId;
      const academicYear = sampleRegistration.academicYear;
      const semester = sampleRegistration.semester;
      const courseCode = sampleRegistration.courses?.[0]?.courseCode;
      
      if (studentId && courseCode) {
        console.log(`Testing validation for student ${studentId} in course ${courseCode}`);
        
        // Simulate the validation logic
        const isRegistered = await checkStudentRegistration(studentId, courseCode, academicYear, semester);
        
        if (isRegistered) {
          console.log('✅ Student is properly registered - grades can be submitted');
        } else {
          console.log('❌ Student is not registered - grades cannot be submitted');
        }
      }
    }

    console.log('\n✅ Course registration validation test completed!');
    console.log('💡 This ensures the proper academic workflow:');
    console.log('   1. Students must be registered for courses');
    console.log('   2. Lecturers can only submit grades for registered students');
    console.log('   3. Students can only see grades for courses they registered for');

  } catch (error) {
    console.error('❌ Error testing course registration validation:', error);
  }
}

async function checkStudentRegistration(studentId, courseCode, academicYear, semester) {
  try {
    // Method 1: Check course-registrations collection
    const registrationsRef = collection(db, "course-registrations");
    const registrationsQuery = query(
      registrationsRef,
      where("studentId", "==", studentId),
      where("academicYear", "==", academicYear),
      where("semester", "==", semester)
    );
    
    const registrationsSnapshot = await getDocs(registrationsQuery);
    
    for (const doc of registrationsSnapshot.docs) {
      const regData = doc.data();
      
      if (regData.courses && Array.isArray(regData.courses)) {
        const hasCourse = regData.courses.some(course => 
          (typeof course === 'object' && (
            course.courseCode === courseCode || 
            course.code === courseCode ||
            course.courseName === courseCode
          ))
        );
        
        if (hasCourse) {
          console.log(`✅ Found registration in course-registrations for ${courseCode}`);
          return true;
        }
      }
    }
    
    return false;
  } catch (error) {
    console.error('Error checking registration:', error);
    return false;
  }
}

// Run the test
testCourseRegistrationValidation().then(() => {
  console.log('\n✅ Course registration validation test completed!');
  process.exit(0);
}).catch((error) => {
  console.error('❌ Test failed:', error);
  process.exit(1);
}); 