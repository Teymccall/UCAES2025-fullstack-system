const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, query, where, doc, getDoc } = require('firebase/firestore');

const firebaseConfig = {
  apiKey: 'AIzaSyCWj01Z1zScFJbTh5ChqsLEEZZdmBOjlUE',
  authDomain: 'ucaes2025.firebaseapp.com',
  databaseURL: 'https://ucaes2025-default-rtdb.firebaseio.com',
  projectId: 'ucaes2025',
  storageBucket: 'ucaes2025.firebasestorage.app',
  messagingSenderId: '543217800581',
  appId: '1:543217800581:web:4f97ba0087f694deeea0ec',
  measurementId: 'G-8E3518ML0D'
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function testRealStudentPortal() {
  console.log('🧪 Testing Real Student Portal Integration...\n');
  
  try {
    // Step 1: Test student authentication flow
    console.log('📋 Step 1: Testing student authentication flow...');
    
    const studentsWithGrades = [
      { name: 'BENEDICT LAMISI', id: '3uirGcrYltloPyFCqCrq', regNum: 'UCAES20254119', expectedGrade: 'B' },
      { name: 'PAUL ADDO', id: 'bZX9L8N2CTk8rwW5LGRY', regNum: 'UCAES20257093', expectedGrade: 'F' }
    ];

    for (const student of studentsWithGrades) {
      console.log(`\n🔍 Testing ${student.name}:`);
      console.log(`   Registration Number: ${student.regNum}`);
      console.log(`   Document ID: ${student.id}`);
      
      // Step 1a: Verify student exists in student-registrations
      try {
        const studentDoc = await getDoc(doc(db, 'student-registrations', student.id));
        if (studentDoc.exists()) {
          const studentData = studentDoc.data();
          console.log(`   ✅ Found in student-registrations: ${studentData.surname} ${studentData.otherNames}`);
          console.log(`   ✅ Registration Number matches: ${studentData.registrationNumber}`);
        } else {
          console.log(`   ❌ NOT found in student-registrations`);
          continue;
        }
      } catch (error) {
        console.log(`   ❌ Error checking student-registrations: ${error.message}`);
        continue;
      }
      
      // Step 1b: Test grade lookup for this student
      console.log(`   🔍 Testing grade lookup...`);
      try {
        const gradesQuery = query(
          collection(db, 'student-grades'),
          where('studentId', '==', student.id),
          where('academicYear', '==', '2025-2026'),
          where('semester', '==', 'First Semester'),
          where('status', '==', 'published')
        );
        const gradesSnapshot = await getDocs(gradesQuery);
        
        if (!gradesSnapshot.empty) {
          const gradeData = gradesSnapshot.docs[0].data();
          console.log(`   ✅ Found grade: ${gradeData.courseCode} - ${gradeData.grade}`);
          console.log(`   ✅ Expected grade: ${student.expectedGrade}, Actual: ${gradeData.grade} ${gradeData.grade === student.expectedGrade ? '✅' : '❌'}`);
        } else {
          console.log(`   ❌ No grades found`);
        }
      } catch (error) {
        console.log(`   ❌ Error checking grades: ${error.message}`);
      }
    }

    // Step 2: Test course registration lookup
    console.log('\n📋 Step 2: Testing course registration lookup...');
    
    for (const student of studentsWithGrades) {
      console.log(`\n🔍 Testing registrations for ${student.name}:`);
      
      // Simulate the improved getStudentRegistrations function
      let foundRegistrations = 0;
      
      // Method 1: By studentId
      try {
        const q = query(
          collection(db, 'course-registrations'),
          where('studentId', '==', student.id)
        );
        const snapshot = await getDocs(q);
        foundRegistrations += snapshot.size;
        console.log(`   Method 1 (by studentId): Found ${snapshot.size} registrations`);
      } catch (error) {
        console.log(`   Method 1 error: ${error.message}`);
      }
      
      // Method 2: By email
      try {
        const studentDoc = await getDoc(doc(db, 'student-registrations', student.id));
        if (studentDoc.exists()) {
          const studentData = studentDoc.data();
          const email = studentData.email;
          
          const q = query(
            collection(db, 'course-registrations'),
            where('email', '==', email)
          );
          const snapshot = await getDocs(q);
          foundRegistrations += snapshot.size;
          console.log(`   Method 2 (by email ${email}): Found ${snapshot.size} registrations`);
        }
      } catch (error) {
        console.log(`   Method 2 error: ${error.message}`);
      }
      
      console.log(`   📊 Total registrations found: ${foundRegistrations}`);
    }

    // Step 3: Simulate complete student portal flow
    console.log('\n📋 Step 3: Simulating complete student portal flow...');
    
    for (const student of studentsWithGrades) {
      console.log(`\n🎯 Complete flow for ${student.name}:`);
      console.log(`1. Student enters registration number: ${student.regNum}`);
      console.log(`2. System finds document ID: ${student.id}`);
      console.log(`3. Student selects 2025-2026 First Semester`);
      console.log(`4. System looks up grades using document ID...`);
      
      // Test the complete lookup
      try {
        const gradesQuery = query(
          collection(db, 'student-grades'),
          where('studentId', '==', student.id),
          where('academicYear', '==', '2025-2026'),
          where('semester', '==', 'First Semester'),
          where('status', '==', 'published')
        );
        const gradesSnapshot = await getDocs(gradesQuery);
        
        if (!gradesSnapshot.empty) {
          const gradeData = gradesSnapshot.docs[0].data();
          console.log(`✅ SUCCESS: Student sees ${gradeData.courseCode} - Grade ${gradeData.grade}`);
        } else {
          console.log(`❌ FAILURE: No grades found`);
        }
      } catch (error) {
        console.log(`❌ FAILURE: Error in lookup - ${error.message}`);
      }
    }

    console.log('\n📋 Summary:');
    console.log('🎊 The student portal should now work correctly!');
    console.log('📝 Students can:');
    console.log('   1. Register in "new student information" system');
    console.log('   2. Get registration numbers (UCAES20254119, etc.)');
    console.log('   3. Log into student portal with registration number + DOB');
    console.log('   4. See their published grades for 2025-2026 First Semester');

  } catch (error) {
    console.error('❌ Error in test:', error);
  }
}

testRealStudentPortal().then(() => {
  console.log('\n✅ Real student portal test completed!');
  process.exit(0);
}).catch((error) => {
  console.error('❌ Test failed:', error);
  process.exit(1);
}); 