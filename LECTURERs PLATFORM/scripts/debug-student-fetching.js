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

async function debugStudentFetching() {
  try {
    console.log('🔍 Debugging Student Fetching for New Grade Submission Page...');
    console.log('='.repeat(60));
    
    // 1. Check lecturer assignments
    console.log('\n📋 1. Lecturer Assignments:');
    console.log('-'.repeat(30));
    
    const assignmentsRef = collection(db, 'lecturer-assignments');
    const assignmentsSnapshot = await getDocs(assignmentsRef);
    
    console.log(`Found ${assignmentsSnapshot.size} total lecturer assignments:`);
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
    
    // 2. Check specific lecturer (mathew@gmail.com)
    console.log('\n👨‍🏫 2. Specific Lecturer (mathew@gmail.com):');
    console.log('-'.repeat(30));
    
    const usersRef = collection(db, 'users');
    const userQuery = query(usersRef, where("email", "==", "mathew@gmail.com"));
    const userSnapshot = await getDocs(userQuery);
    
    if (!userSnapshot.empty) {
      const lecturerDoc = userSnapshot.docs[0];
      const lecturerId = lecturerDoc.id;
      console.log(`✅ Lecturer found: ${lecturerId}`);
      
      // Get this lecturer's assignments
      const lecturerAssignmentsQuery = query(assignmentsRef, where("lecturerId", "==", lecturerId));
      const lecturerAssignmentsSnapshot = await getDocs(lecturerAssignmentsQuery);
      
      console.log(`\n📋 Lecturer has ${lecturerAssignmentsSnapshot.size} assignments:`);
      lecturerAssignmentsSnapshot.forEach((doc, index) => {
        const data = doc.data();
        console.log(`\n${index + 1}. Assignment ID: ${doc.id}`);
        console.log(`   Course ID: ${data.courseId}`);
        console.log(`   Academic Year: ${data.academicYear}`);
        console.log(`   Semester: ${data.semester}`);
      });
      
      // 3. Check course details
      console.log('\n📚 3. Course Details:');
      console.log('-'.repeat(30));
      
      const coursesRef = collection(db, 'academic-courses');
      const coursesSnapshot = await getDocs(coursesRef);
      
      lecturerAssignmentsSnapshot.forEach((assignmentDoc) => {
        const assignmentData = assignmentDoc.data();
        const courseDoc = coursesSnapshot.docs.find(doc => doc.id === assignmentData.courseId);
        
        if (courseDoc) {
          const courseData = courseDoc.data();
          console.log(`\n📖 Course: ${courseData.title || courseData.name}`);
          console.log(`   Course ID: ${courseDoc.id}`);
          console.log(`   Code: ${courseData.code}`);
          console.log(`   Title: ${courseData.title}`);
          console.log(`   Name: ${courseData.name}`);
        }
      });
      
      // 4. Check student registrations for these courses
      console.log('\n👥 4. Student Registrations:');
      console.log('-'.repeat(30));
      
      const registrationsRef = collection(db, 'course-registrations');
      const registrationsSnapshot = await getDocs(registrationsRef);
      
      lecturerAssignmentsSnapshot.forEach((assignmentDoc) => {
        const assignmentData = assignmentDoc.data();
        const courseDoc = coursesSnapshot.docs.find(doc => doc.id === assignmentData.courseId);
        
        if (courseDoc) {
          const courseData = courseDoc.data();
          const courseCode = courseData.code || courseData.title?.split(' - ')[0];
          
          console.log(`\n🔍 Checking registrations for course: ${courseCode}`);
          console.log(`   Academic Year: ${assignmentData.academicYear}`);
          console.log(`   Semester: ${assignmentData.semester}`);
          
          const matchingRegistrations = registrationsSnapshot.docs.filter(regDoc => {
            const regData = regDoc.data();
            return regData.academicYear === assignmentData.academicYear && 
                   regData.semester === assignmentData.semester &&
                   regData.courses && 
                   regData.courses.some(course => {
                     const courseCode = typeof course === 'string' ? course : (course.courseCode || course.code);
                     return courseCode && courseCode.includes(courseCode);
                   });
          });
          
          console.log(`   Found ${matchingRegistrations.length} matching registrations`);
          matchingRegistrations.forEach(regDoc => {
            const regData = regDoc.data();
            console.log(`     - ${regData.studentName} (${regData.registrationNumber})`);
          });
        }
      });
      
    } else {
      console.log('❌ Lecturer not found');
    }
    
  } catch (error) {
    console.error('❌ Error debugging student fetching:', error);
  }
}

debugStudentFetching(); 