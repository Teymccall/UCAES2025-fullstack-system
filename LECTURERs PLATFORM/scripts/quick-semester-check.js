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

async function quickSemesterCheck() {
  console.log('🔍 Quick Semester Format Check...\n');

  try {
    const studentGradesRef = collection(db, 'student-grades');
    
    // Get all grades for nanak@gmail.com
    console.log('📋 Checking grades for nanak@gmail.com...');
    const nanakQuery = query(
      studentGradesRef,
      where('studentId', '==', 'nanak@gmail.com')
    );
    const nanakSnapshot = await getDocs(nanakQuery);
    
    if (!nanakSnapshot.empty) {
      console.log(`✅ Found ${nanakSnapshot.size} grades for nanak@gmail.com:`);
      nanakSnapshot.forEach((doc, index) => {
        const gradeData = doc.data();
        console.log(`\n📄 Grade ${index + 1}:`);
        console.log(`   Course: ${gradeData.courseName}`);
        console.log(`   Grade: ${gradeData.grade} (${gradeData.total}/100)`);
        console.log(`   Year: "${gradeData.academicYear}"`);
        console.log(`   Semester: "${gradeData.semester}"`);
        console.log(`   Status: ${gradeData.status}`);
      });
    } else {
      console.log('❌ No grades found for nanak@gmail.com');
    }

    // Check all semester formats
    console.log('\n📋 Checking all semester formats in database...');
    const allGradesQuery = query(studentGradesRef);
    const allGradesSnapshot = await getDocs(allGradesQuery);
    
    const semesterFormats = new Set();
    
    allGradesSnapshot.forEach((doc) => {
      const gradeData = doc.data();
      if (gradeData.semester) {
        semesterFormats.add(gradeData.semester);
      }
    });
    
    console.log('\n📊 SEMESTER FORMATS FOUND:');
    semesterFormats.forEach(format => {
      console.log(`   "${format}"`);
    });

    console.log('\n💡 ANALYSIS:');
    console.log('Student portal dropdown: "First Semester"');
    console.log('Student portal searches for: "First"');
    console.log('Firebase stores: "Semester 1"');
    console.log('MISMATCH: "First" ≠ "Semester 1"');

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

quickSemesterCheck().then(() => {
  console.log('\n✅ Check completed!');
  process.exit(0);
}).catch((error) => {
  console.error('❌ Failed:', error);
  process.exit(1);
}); 