const { initializeApp } = require('firebase/app');
const { getFirestore, collection, query, where, getDocs } = require('firebase/firestore');

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

async function testStudentId() {
  console.log('🔍 Testing Student ID Matching...\n');

  try {
    // Step 1: Check what student IDs are in the grades
    console.log('📋 Step 1: Checking student IDs in grades...');
    const studentGradesRef = collection(db, "student-grades");
    const studentGradesSnapshot = await getDocs(studentGradesRef);
    
    const gradeStudentIds = new Set();
    studentGradesSnapshot.forEach(doc => {
      const data = doc.data();
      gradeStudentIds.add(data.studentId);
      console.log(`   Grade student ID: ${data.studentId}`);
    });

    // Step 2: Check what students exist in the system
    console.log('\n📋 Step 2: Checking students in the system...');
    const studentsRef = collection(db, "students");
    const studentsSnapshot = await getDocs(studentsRef);
    
    const systemStudentIds = new Set();
    studentsSnapshot.forEach(doc => {
      const data = doc.data();
      systemStudentIds.add(doc.id);
      systemStudentIds.add(data.email);
      systemStudentIds.add(data.indexNumber);
      console.log(`   Student ID: ${doc.id}, Email: ${data.email}, Index: ${data.indexNumber}`);
    });

    // Step 3: Check student registrations
    console.log('\n📋 Step 3: Checking student registrations...');
    const registrationsRef = collection(db, "student-registrations");
    const registrationsSnapshot = await getDocs(registrationsRef);
    
    const registrationStudentIds = new Set();
    registrationsSnapshot.forEach(doc => {
      const data = doc.data();
      registrationStudentIds.add(doc.id);
      registrationStudentIds.add(data.email);
      console.log(`   Registration ID: ${doc.id}, Email: ${data.email}`);
    });

    // Step 4: Find matching IDs
    console.log('\n📋 Step 4: Finding matching student IDs...');
    const allGradeIds = Array.from(gradeStudentIds);
    const allSystemIds = Array.from(systemStudentIds);
    const allRegistrationIds = Array.from(registrationStudentIds);

    console.log('Grade Student IDs:', allGradeIds);
    console.log('System Student IDs:', allSystemIds);
    console.log('Registration Student IDs:', allRegistrationIds);

    // Check for matches
    const matches = allGradeIds.filter(gradeId => 
      allSystemIds.includes(gradeId) || allRegistrationIds.includes(gradeId)
    );

    console.log('\n✅ Matching Student IDs:', matches);

    if (matches.length > 0) {
      console.log('✅ Found matching student IDs!');
      console.log('💡 This means grades should be visible to students.');
    } else {
      console.log('❌ No matching student IDs found!');
      console.log('💡 This explains why students cannot see their grades.');
      console.log('   The student IDs in grades do not match the student IDs in the system.');
    }

  } catch (error) {
    console.error('❌ Error testing student ID:', error);
  }
}

// Run the test
testStudentId().then(() => {
  console.log('\n✅ Student ID test completed!');
  process.exit(0);
}).catch((error) => {
  console.error('❌ Test failed:', error);
  process.exit(1);
}); 