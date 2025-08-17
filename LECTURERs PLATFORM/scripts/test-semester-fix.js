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

// Copy the semester mapping functions from the student portal
const normalizeSemester = (semester) => {
  if (semester === "First" || semester === "1" || semester === "Semester 1") return "First"
  if (semester === "Second" || semester === "2" || semester === "Semester 2") return "Second"
  return semester
}

const getReverseSemesterMapping = (semester) => {
  if (semester === "First" || semester === "1") return "Semester 1"
  if (semester === "Second" || semester === "2") return "Semester 2"
  if (semester === "Semester 1") return "First"
  if (semester === "Semester 2") return "Second"
  return semester
}

async function testSemesterFix() {
  console.log('🔍 Testing Semester Mapping Fix...\n');

  try {
    const studentGradesRef = collection(db, 'student-grades');
    
    // Test the semester mapping functions
    console.log('📋 Testing semester mapping functions:');
    console.log(`   normalizeSemester("First") -> "${normalizeSemester("First")}"`);
    console.log(`   normalizeSemester("Semester 1") -> "${normalizeSemester("Semester 1")}"`);
    console.log(`   getReverseSemesterMapping("First") -> "${getReverseSemesterMapping("First")}"`);
    console.log(`   getReverseSemesterMapping("Semester 1") -> "${getReverseSemesterMapping("Semester 1")}"`);
    
    // Test searching for nanak@gmail.com with "First" semester
    console.log('\n📋 Testing search with "First" semester for nanak@gmail.com...');
    
    const searchQueries = [
      // Original: "First"
      query(
        studentGradesRef,
        where('studentId', '==', 'nanak@gmail.com'),
        where('academicYear', '==', '2026-2027'),
        where('semester', '==', 'First'),
        where('status', '==', 'published')
      ),
      // Normalized: "First" (same as original)
      query(
        studentGradesRef,
        where('studentId', '==', 'nanak@gmail.com'),
        where('academicYear', '==', '2026-2027'),
        where('semester', '==', normalizeSemester('First')),
        where('status', '==', 'published')
      ),
      // Reverse mapping: "First" -> "Semester 1"
      query(
        studentGradesRef,
        where('studentId', '==', 'nanak@gmail.com'),
        where('academicYear', '==', '2026-2027'),
        where('semester', '==', getReverseSemesterMapping('First')),
        where('status', '==', 'published')
      )
    ];
    
    const queryNames = ['Original "First"', 'Normalized "First"', 'Reverse "First" -> "Semester 1"'];
    
    for (let i = 0; i < searchQueries.length; i++) {
      try {
        const result = await getDocs(searchQueries[i]);
        console.log(`   ${queryNames[i]}: Found ${result.size} grades`);
        if (result.size > 0) {
          const gradeData = result.docs[0].data();
          console.log(`   Grade: ${gradeData.courseName} - ${gradeData.grade} (${gradeData.total}/100) - Semester: "${gradeData.semester}"`);
        }
      } catch (error) {
        console.log(`   ${queryNames[i]}: Error - ${error.message}`);
      }
    }
    
    console.log('\n💡 EXPECTED RESULT:');
    console.log('   Original "First": 0 grades (no match)');
    console.log('   Normalized "First": 0 grades (no match)');
    console.log('   Reverse "First" -> "Semester 1": 1 grade (MATCH!)');
    console.log('\n✅ If the third query finds the grade, the fix is working!');

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

testSemesterFix().then(() => {
  console.log('\n✅ Test completed!');
  process.exit(0);
}).catch((error) => {
  console.error('❌ Test failed:', error);
  process.exit(1);
}); 