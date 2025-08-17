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

async function testStudentGradeAccess() {
  console.log('🧪 Testing Student Grade Access...\n');

  try {
    // Step 1: Get a sample student from student-registrations
    console.log('📋 Step 1: Finding a sample student...');
    const studentsRef = collection(db, 'student-registrations');
    const studentsSnapshot = await getDocs(studentsRef);
    
    if (studentsSnapshot.empty) {
      console.log('❌ No students found in student-registrations collection');
      return;
    }

    const sampleStudent = studentsSnapshot.docs[0];
    const studentData = sampleStudent.data();
    const studentId = sampleStudent.id;
    
    console.log(`✅ Found sample student: ${studentData.surname} ${studentData.otherNames}`);
    console.log(`📧 Email: ${studentData.email}`);
    console.log(`📋 Registration: ${studentData.registrationNumber}`);
    console.log(`🔢 Index: ${studentData.studentIndexNumber}`);

    // Step 2: Check for published grades using different identifiers
    console.log('\n🔍 Step 2: Checking for published grades...');
    
    const identifiers = [
      { name: 'Document ID', value: studentId },
      { name: 'Email', value: studentData.email },
      { name: 'Registration Number', value: studentData.registrationNumber },
      { name: 'Index Number', value: studentData.studentIndexNumber }
    ];

    let totalGradesFound = 0;
    
    for (const identifier of identifiers) {
      if (!identifier.value) continue;
      
      console.log(`\n🔍 Searching by ${identifier.name}: ${identifier.value}`);
      
      try {
        const studentGradesRef = collection(db, 'student-grades');
        const studentGradesQuery = query(
          studentGradesRef,
          where('studentId', '==', identifier.value),
          where('status', '==', 'published')
        );
        const studentGradesSnapshot = await getDocs(studentGradesQuery);
        
        if (!studentGradesSnapshot.empty) {
          console.log(`✅ Found ${studentGradesSnapshot.size} published grades`);
          totalGradesFound += studentGradesSnapshot.size;
          
          studentGradesSnapshot.forEach(doc => {
            const gradeData = doc.data();
            console.log(`   📄 Course: ${gradeData.courseName || gradeData.courseCode}`);
            console.log(`   📊 Grade: ${gradeData.grade} (${gradeData.total}/100)`);
            console.log(`   📅 Year: ${gradeData.academicYear}, Semester: ${gradeData.semester}`);
          });
        } else {
          console.log(`❌ No published grades found`);
        }
      } catch (error) {
        console.log(`❌ Error searching by ${identifier.name}:`, error.message);
      }
    }

    // Step 3: Test semester-specific grade lookup
    console.log('\n📚 Step 3: Testing semester-specific grade lookup...');
    
    if (totalGradesFound > 0) {
      // Get a sample grade to test semester lookup
      const studentGradesRef = collection(db, 'student-grades');
      const publishedQuery = query(
        studentGradesRef,
        where('status', '==', 'published'),
        where('studentId', '==', studentData.email || studentId)
      );
      const publishedSnapshot = await getDocs(publishedQuery);
      
      if (!publishedSnapshot.empty) {
        const sampleGrade = publishedSnapshot.docs[0].data();
        const academicYear = sampleGrade.academicYear;
        const semester = sampleGrade.semester;
        
        console.log(`🔍 Testing lookup for ${academicYear} ${semester}...`);
        
        // Test the exact semester lookup
        const semesterQuery = query(
          studentGradesRef,
          where('studentId', '==', studentData.email || studentId),
          where('academicYear', '==', academicYear),
          where('semester', '==', semester),
          where('status', '==', 'published')
        );
        const semesterSnapshot = await getDocs(semesterQuery);
        
        if (!semesterSnapshot.empty) {
          console.log(`✅ Found ${semesterSnapshot.size} grades for ${academicYear} ${semester}`);
          semesterSnapshot.forEach(doc => {
            const gradeData = doc.data();
            console.log(`   📄 ${gradeData.courseName || gradeData.courseCode}: ${gradeData.grade} (${gradeData.total}/100)`);
          });
        } else {
          console.log(`❌ No grades found for ${academicYear} ${semester}`);
        }
      }
    }

    // Step 4: Summary
    console.log('\n📊 Summary:');
    console.log(`   ✅ Student found: ${studentData.surname} ${studentData.otherNames}`);
    console.log(`   📧 Email: ${studentData.email}`);
    console.log(`   📋 Registration: ${studentData.registrationNumber}`);
    console.log(`   🔢 Index: ${studentData.studentIndexNumber}`);
    console.log(`   📚 Total published grades found: ${totalGradesFound}`);
    
    if (totalGradesFound > 0) {
      console.log('\n🎉 SUCCESS: Student can access their published grades!');
      console.log('💡 The grade publishing workflow is working correctly.');
    } else {
      console.log('\n⚠️  WARNING: No published grades found for this student.');
      console.log('💡 This could mean:');
      console.log('   - No grades have been published yet');
      console.log('   - The student has no course registrations');
      console.log('   - There\'s still an ID mismatch issue');
    }

  } catch (error) {
    console.error('❌ Error testing student grade access:', error);
  }
}

// Run the test
testStudentGradeAccess().then(() => {
  console.log('\n✅ Student grade access test completed!');
  process.exit(0);
}).catch((error) => {
  console.error('❌ Test failed:', error);
  process.exit(1);
}); 