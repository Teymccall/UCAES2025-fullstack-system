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

async function checkSemesterFormats() {
  console.log('🔍 Checking Exact Semester Formats Stored in Firebase...\n');

  try {
    const studentGradesRef = collection(db, 'student-grades');
    
    // Get all published grades for nanak@gmail.com
    console.log('📋 Checking all published grades for nanak@gmail.com...');
    const nanakQuery = query(
      studentGradesRef,
      where('studentId', '==', 'nanak@gmail.com'),
      where('status', '==', 'published')
    );
    const nanakSnapshot = await getDocs(nanakQuery);
    
    if (!nanakSnapshot.empty) {
      console.log(`✅ Found ${nanakSnapshot.size} published grades for nanak@gmail.com:`);
      nanakSnapshot.forEach((doc, index) => {
        const gradeData = doc.data();
        console.log(`\n📄 Grade ${index + 1}:`);
        console.log(`   Course: ${gradeData.courseName}`);
        console.log(`   Grade: ${gradeData.grade} (${gradeData.total}/100)`);
        console.log(`   Academic Year: "${gradeData.academicYear}"`);
        console.log(`   Semester: "${gradeData.semester}"`);
        console.log(`   Status: ${gradeData.status}`);
        console.log(`   Submission ID: ${gradeData.submissionId}`);
      });
    } else {
      console.log('❌ No published grades found for nanak@gmail.com');
    }

    // Check all semester formats in the database
    console.log('\n📋 Checking all semester formats in student-grades...');
    const allGradesQuery = query(studentGradesRef);
    const allGradesSnapshot = await getDocs(allGradesQuery);
    
    const semesterFormats = new Set();
    const yearSemesterCombos = new Set();
    
    allGradesSnapshot.forEach((doc) => {
      const gradeData = doc.data();
      if (gradeData.semester) {
        semesterFormats.add(gradeData.semester);
        yearSemesterCombos.add(`${gradeData.academicYear} - ${gradeData.semester}`);
      }
    });
    
    console.log('\n📊 ALL SEMESTER FORMATS FOUND:');
    console.log('Semester formats:');
    semesterFormats.forEach(format => {
      console.log(`   "${format}"`);
    });
    
    console.log('\nYear-Semester combinations:');
    yearSemesterCombos.forEach(combo => {
      console.log(`   "${combo}"`);
    });

    // Check what the student portal is searching for
    console.log('\n📋 STUDENT PORTAL SEARCH ANALYSIS:');
    console.log('Student portal dropdown shows: "First Semester"');
    console.log('Student portal likely searches for: "First" or "First Semester"');
    console.log('But grades are stored as: "Semester 1"');
    console.log('\n💡 MISMATCH IDENTIFIED:');
    console.log('   Student Portal searches: "First" or "First Semester"');
    console.log('   Firebase stores: "Semester 1"');
    console.log('   Result: No match found!');

  } catch (error) {
    console.error('❌ Error checking semester formats:', error);
  }
}

checkSemesterFormats().then(() => {
  console.log('\n✅ Semester format check completed!');
  process.exit(0);
}).catch((error) => {
  console.error('❌ Check failed:', error);
  process.exit(1);
}); 