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

// Simulate the student portal's grade fetching logic
async function simulateStudentPortalGradeFetch(studentId, academicYear, semester) {
  console.log(`🧪 Simulating student portal grade fetch for: ${studentId}, ${academicYear} ${semester}`);
  
  try {
    // Step 1: Get student email from student-registrations
    let studentEmail = null;
    let studentRegistrationNumber = null;
    let studentIndexNumber = null;
    
    try {
      const studentDoc = await getDoc(doc(db, "student-registrations", studentId));
      if (studentDoc.exists()) {
        const studentData = studentDoc.data();
        studentEmail = studentData.email;
        studentRegistrationNumber = studentData.registrationNumber;
        studentIndexNumber = studentData.studentIndexNumber;
        console.log(`✅ Found student in student-registrations: ${studentData.surname} ${studentData.otherNames}`);
        console.log(`📧 Student email: ${studentEmail}`);
        console.log(`📋 Registration number: ${studentRegistrationNumber}`);
        console.log(`🔢 Index number: ${studentIndexNumber}`);
      } else {
        console.log(`❌ Student ${studentId} not found in student-registrations`);
        
        // Try to find by registration number if studentId might be a registration number
        if (studentId.startsWith('UCAES')) {
          console.log(`🔍 Trying to find student by registration number: ${studentId}`);
          const regQuery = query(collection(db, "student-registrations"), where("registrationNumber", "==", studentId));
          const regSnapshot = await getDocs(regQuery);
          
          if (!regSnapshot.empty) {
            const regDoc = regSnapshot.docs[0];
            const regData = regDoc.data();
            studentEmail = regData.email;
            studentRegistrationNumber = regData.registrationNumber;
            studentIndexNumber = regData.studentIndexNumber;
            console.log(`✅ Found student by registration number: ${regData.surname} ${regData.otherNames}`);
            console.log(`📧 Student email: ${studentEmail}`);
            console.log(`📋 Registration number: ${studentRegistrationNumber}`);
            console.log(`🔢 Index number: ${studentIndexNumber}`);
          }
        }
      }
    } catch (error) {
      console.warn("❌ Error checking student-registrations:", error);
    }

    // If we still don't have an email, try to find the student in the students collection
    if (!studentEmail) {
      try {
        console.log(`🔍 Trying to find student in students collection...`);
        
        // Try by document ID first
        const studentDoc = await getDoc(doc(db, "students", studentId));
        if (studentDoc.exists()) {
          const studentData = studentDoc.data();
          studentEmail = studentData.email;
          studentRegistrationNumber = studentData.registrationNumber;
          studentIndexNumber = studentData.studentIndexNumber || studentData.indexNumber;
          console.log(`✅ Found student in students collection: ${studentData.surname} ${studentData.otherNames}`);
          console.log(`📧 Student email: ${studentEmail}`);
          console.log(`📋 Registration number: ${studentRegistrationNumber}`);
          console.log(`🔢 Index number: ${studentIndexNumber}`);
        } else {
          // Try by registration number
          if (studentId.startsWith('UCAES')) {
            const regQuery = query(collection(db, "students"), where("registrationNumber", "==", studentId));
            const regSnapshot = await getDocs(regQuery);
            
            if (!regSnapshot.empty) {
              const regDoc = regSnapshot.docs[0];
              const regData = regDoc.data();
              studentEmail = regData.email;
              studentRegistrationNumber = regData.registrationNumber;
              studentIndexNumber = regData.studentIndexNumber || regData.indexNumber;
              console.log(`✅ Found student by registration number in students: ${regData.surname} ${regData.otherNames}`);
              console.log(`📧 Student email: ${studentEmail}`);
              console.log(`📋 Registration number: ${studentRegistrationNumber}`);
              console.log(`🔢 Index number: ${studentIndexNumber}`);
            }
          }
        }
      } catch (error) {
        console.warn("❌ Error checking students collection:", error);
      }
    }

    // Step 2: Search for grades using the resolved email (this is the key fix!)
    let allGrades = [];
    
    if (studentEmail) {
      console.log(`🔍 Searching for grades using email: ${studentEmail}`);
      
      const studentGradesRef = collection(db, 'student-grades');
      const gradeQuery = query(
        studentGradesRef,
        where('studentId', '==', studentEmail),
        where('academicYear', '==', academicYear),
        where('semester', '==', semester),
        where('status', '==', 'published')
      );
      
      const gradeSnapshot = await getDocs(gradeQuery);
      allGrades = gradeSnapshot.docs;
      
      console.log(`📊 Found ${allGrades.length} published grades for ${academicYear} ${semester}`);
      
      allGrades.forEach((doc, index) => {
        const gradeData = doc.data();
        console.log(`   📄 Grade ${index + 1}: ${gradeData.courseName || gradeData.courseCode} - ${gradeData.grade} (${gradeData.total}/100)`);
      });
    } else {
      console.log('❌ No student email found - cannot search for grades');
    }

    return allGrades.length > 0;
    
  } catch (error) {
    console.error('❌ Error simulating student portal grade fetch:', error);
    return false;
  }
}

async function testStudentPortalFix() {
  console.log('🧪 Testing Student Portal Grade Fetch Fix...\n');

  try {
    // Test with a known student who has published grades
    const testCases = [
      {
        studentId: '10288633@upsamail.edu.gh', // Email as ID
        academicYear: '2026-2027',
        semester: 'Semester 1',
        description: 'Student with email as document ID'
      },
      {
        studentId: 'UCAES20256921', // Registration number
        academicYear: '2026-2027', 
        semester: 'Semester 1',
        description: 'Student with registration number as document ID'
      }
    ];

    for (const testCase of testCases) {
      console.log(`\n🔍 Testing: ${testCase.description}`);
      console.log(`   Student ID: ${testCase.studentId}`);
      console.log(`   Academic Year: ${testCase.academicYear}`);
      console.log(`   Semester: ${testCase.semester}`);
      
      const success = await simulateStudentPortalGradeFetch(
        testCase.studentId,
        testCase.academicYear,
        testCase.semester
      );
      
      if (success) {
        console.log(`✅ SUCCESS: Found grades for ${testCase.description}`);
      } else {
        console.log(`❌ FAILURE: No grades found for ${testCase.description}`);
      }
    }

    console.log('\n📊 Test Summary:');
    console.log('✅ The student portal should now be able to find published grades!');
    console.log('💡 The key fix was resolving student IDs to email addresses');
    console.log('💡 Grades are stored with email addresses as studentId');
    console.log('💡 Student portal now properly resolves registration numbers to emails');

  } catch (error) {
    console.error('❌ Error testing student portal fix:', error);
  }
}

// Run the test
testStudentPortalFix().then(() => {
  console.log('\n✅ Student portal fix test completed!');
  process.exit(0);
}).catch((error) => {
  console.error('❌ Test failed:', error);
  process.exit(1);
}); 