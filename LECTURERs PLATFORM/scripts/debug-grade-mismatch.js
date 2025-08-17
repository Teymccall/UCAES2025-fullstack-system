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

async function debugGradeMismatch() {
  console.log('🔍 Debugging Grade Mismatch Issue...\n');

  try {
    // Step 1: Check student-registrations collection
    console.log('📋 Step 1: Checking student-registrations collection...');
    const studentRegsRef = collection(db, 'student-registrations');
    const studentRegsSnapshot = await getDocs(studentRegsRef);
    
    if (studentRegsSnapshot.empty) {
      console.log('❌ No students found in student-registrations collection');
    } else {
      console.log(`✅ Found ${studentRegsSnapshot.size} students in student-registrations`);
      
      const sampleStudent = studentRegsSnapshot.docs[0];
      const studentData = sampleStudent.data();
      console.log('\n📄 Sample student from student-registrations:');
      console.log(`   Document ID: ${sampleStudent.id}`);
      console.log(`   Name: ${studentData.surname} ${studentData.otherNames}`);
      console.log(`   Email: ${studentData.email}`);
      console.log(`   Registration Number: ${studentData.registrationNumber}`);
      console.log(`   Index Number: ${studentData.studentIndexNumber}`);
    }

    // Step 2: Check students collection (used by lecturer platform)
    console.log('\n📋 Step 2: Checking students collection...');
    const studentsRef = collection(db, 'students');
    const studentsSnapshot = await getDocs(studentsRef);
    
    if (studentsSnapshot.empty) {
      console.log('❌ No students found in students collection');
    } else {
      console.log(`✅ Found ${studentsSnapshot.size} students in students collection`);
      
      const sampleStudent = studentsSnapshot.docs[0];
      const studentData = sampleStudent.data();
      console.log('\n📄 Sample student from students collection:');
      console.log(`   Document ID: ${sampleStudent.id}`);
      console.log(`   Name: ${studentData.firstName} ${studentData.lastName}`);
      console.log(`   Email: ${studentData.email}`);
      console.log(`   Registration Number: ${studentData.registrationNumber}`);
      console.log(`   Index Number: ${studentData.indexNumber}`);
    }

    // Step 3: Check published grades
    console.log('\n📋 Step 3: Checking published grades...');
    const studentGradesRef = collection(db, 'student-grades');
    const publishedGradesQuery = query(studentGradesRef, where('status', '==', 'published'));
    const publishedGradesSnapshot = await getDocs(publishedGradesQuery);
    
    if (publishedGradesSnapshot.empty) {
      console.log('❌ No published grades found');
    } else {
      console.log(`✅ Found ${publishedGradesSnapshot.size} published grades`);
      
      publishedGradesSnapshot.forEach((doc, index) => {
        const gradeData = doc.data();
        console.log(`\n📄 Published Grade ${index + 1}:`);
        console.log(`   Document ID: ${doc.id}`);
        console.log(`   Student ID: ${gradeData.studentId}`);
        console.log(`   Course: ${gradeData.courseName || gradeData.courseCode}`);
        console.log(`   Grade: ${gradeData.grade} (${gradeData.total}/100)`);
        console.log(`   Year: ${gradeData.academicYear}, Semester: ${gradeData.semester}`);
      });
    }

    // Step 4: Test the mismatch
    console.log('\n🔍 Step 4: Testing the mismatch...');
    
    if (!studentRegsSnapshot.empty && !publishedGradesSnapshot.empty) {
      const sampleStudentReg = studentRegsSnapshot.docs[0];
      const sampleStudentData = sampleStudentReg.data();
      const studentRegId = sampleStudentReg.id;
      const studentEmail = sampleStudentData.email;
      
      console.log(`\n🔍 Testing with student from student-registrations:`);
      console.log(`   Document ID: ${studentRegId}`);
      console.log(`   Email: ${studentEmail}`);
      
      // Test 1: Search grades by student-registrations document ID
      const testQuery1 = query(
        studentGradesRef,
        where('studentId', '==', studentRegId),
        where('status', '==', 'published')
      );
      const testResult1 = await getDocs(testQuery1);
      console.log(`   Search by student-registrations ID: ${testResult1.size} grades found`);
      
      // Test 2: Search grades by email
      const testQuery2 = query(
        studentGradesRef,
        where('studentId', '==', studentEmail),
        where('status', '==', 'published')
      );
      const testResult2 = await getDocs(testQuery2);
      console.log(`   Search by email: ${testResult2.size} grades found`);
      
      // Test 3: Search grades by registration number
      const testQuery3 = query(
        studentGradesRef,
        where('studentId', '==', sampleStudentData.registrationNumber),
        where('status', '==', 'published')
      );
      const testResult3 = await getDocs(testQuery3);
      console.log(`   Search by registration number: ${testResult3.size} grades found`);
      
      // Test 4: Search grades by index number
      const testQuery4 = query(
        studentGradesRef,
        where('studentId', '==', sampleStudentData.studentIndexNumber),
        where('status', '==', 'published')
      );
      const testResult4 = await getDocs(testQuery4);
      console.log(`   Search by index number: ${testResult4.size} grades found`);
      
      console.log('\n📊 Summary of search results:');
      console.log(`   By student-registrations ID: ${testResult1.size}`);
      console.log(`   By email: ${testResult2.size}`);
      console.log(`   By registration number: ${testResult3.size}`);
      console.log(`   By index number: ${testResult4.size}`);
      
      if (testResult2.size > 0) {
        console.log('\n✅ SUCCESS: Grades found by email!');
        console.log('💡 This confirms the issue: grades are stored with email as studentId');
      } else if (testResult1.size > 0) {
        console.log('\n✅ SUCCESS: Grades found by student-registrations ID!');
        console.log('💡 This would work if student portal used the right ID');
      } else {
        console.log('\n❌ FAILURE: No grades found with any identifier');
        console.log('💡 This suggests a deeper issue with the data structure');
      }
    }

  } catch (error) {
    console.error('❌ Error debugging grade mismatch:', error);
  }
}

// Run the debug
debugGradeMismatch().then(() => {
  console.log('\n✅ Grade mismatch debug completed!');
  process.exit(0);
}).catch((error) => {
  console.error('❌ Debug failed:', error);
  process.exit(1);
}); 