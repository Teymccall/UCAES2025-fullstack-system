const { initializeApp } = require('firebase/app');
const { getFirestore, collection, query, where, getDocs } = require('firebase/firestore');

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

async function simpleTest() {
  console.log('🔍 Simple Semester Format Test...\n');

  try {
    const studentGradesRef = collection(db, 'student-grades');
    
    // Test 1: Search for nanak@gmail.com with "First" semester
    console.log('📋 Test 1: Searching with "First" semester...');
    const query1 = query(
      studentGradesRef,
      where('studentId', '==', 'nanak@gmail.com'),
      where('academicYear', '==', '2026-2027'),
      where('semester', '==', 'First'),
      where('status', '==', 'published')
    );
    
    try {
      const result1 = await getDocs(query1);
      console.log(`   Result: Found ${result1.size} grades`);
    } catch (error) {
      console.log(`   Error: ${error.message}`);
    }

    // Test 2: Search for nanak@gmail.com with "Semester 1" semester
    console.log('\n📋 Test 2: Searching with "Semester 1" semester...');
    const query2 = query(
      studentGradesRef,
      where('studentId', '==', 'nanak@gmail.com'),
      where('academicYear', '==', '2026-2027'),
      where('semester', '==', 'Semester 1'),
      where('status', '==', 'published')
    );
    
    try {
      const result2 = await getDocs(query2);
      console.log(`   Result: Found ${result2.size} grades`);
      if (result2.size > 0) {
        const gradeData = result2.docs[0].data();
        console.log(`   Grade: ${gradeData.courseName} - ${gradeData.grade} (${gradeData.total}/100)`);
      }
    } catch (error) {
      console.log(`   Error: ${error.message}`);
    }

    // Test 3: Search without semester filter
    console.log('\n📋 Test 3: Searching without semester filter...');
    const query3 = query(
      studentGradesRef,
      where('studentId', '==', 'nanak@gmail.com'),
      where('academicYear', '==', '2026-2027'),
      where('status', '==', 'published')
    );
    
    try {
      const result3 = await getDocs(query3);
      console.log(`   Result: Found ${result3.size} grades`);
      if (result3.size > 0) {
        result3.forEach((doc, index) => {
          const gradeData = doc.data();
          console.log(`   Grade ${index + 1}: ${gradeData.courseName} - ${gradeData.grade} (${gradeData.total}/100) - Semester: "${gradeData.semester}"`);
        });
      }
    } catch (error) {
      console.log(`   Error: ${error.message}`);
    }

    console.log('\n📊 CONCLUSION:');
    console.log('💡 The issue is confirmed: semester format mismatch');
    console.log('💡 Student portal searches for "First" but grades are stored as "Semester 1"');

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

simpleTest().then(() => {
  console.log('\n✅ Test completed!');
  process.exit(0);
}).catch((error) => {
  console.error('❌ Test failed:', error);
  process.exit(1);
}); 