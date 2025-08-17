const { initializeApp } = require('firebase/app');
const { getFirestore, collection, query, where, getDocs } = require('firebase/firestore');

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

async function checkGradeStatus() {
  console.log('🔍 Checking grade status and semester formats...\n');
  
  try {
    // Check student-grades collection
    console.log('📋 Checking student-grades collection:');
    const studentGradesRef = collection(db, 'student-grades');
    const q1 = query(studentGradesRef, where('academicYear', '==', '2025-2026'));
    const snapshot1 = await getDocs(q1);
    
    console.log(`Found ${snapshot1.size} student grades for 2025-2026:`);
    snapshot1.forEach(doc => {
      const data = doc.data();
      console.log(`- Student: ${data.studentId}`);
      console.log(`  Course: ${data.courseCode}`);
      console.log(`  Status: ${data.status}`);
      console.log(`  Semester: "${data.semester}"`);
      console.log(`  Grade: ${data.grade}`);
      console.log('');
    });

    // Check grade-submissions collection
    console.log('📋 Checking grade-submissions collection:');
    const submissionsRef = collection(db, 'grade-submissions');
    const q2 = query(submissionsRef, where('academicYear', '==', '2025-2026'));
    const snapshot2 = await getDocs(q2);
    
    console.log(`Found ${snapshot2.size} grade submissions for 2025-2026:`);
    snapshot2.forEach(doc => {
      const data = doc.data();
      console.log(`- Course: ${data.courseCode}`);
      console.log(`  Status: ${data.status}`);
      console.log(`  Semester: "${data.semester}"`);
      console.log(`  Students: ${data.grades?.length || 0}`);
      console.log('');
    });

    // Check what the student portal is looking for
    console.log('📋 Checking what student portal searches for:');
    console.log('Student portal searches for semester: "First Semester"');
    console.log('Student portal searches for academicYear: "2025-2026"');
    console.log('Student portal searches for status: "published"');
    
    // Check if there's a mismatch
    console.log('\n🔍 Checking for semester format mismatch:');
    const q3 = query(studentGradesRef, 
      where('academicYear', '==', '2025-2026'),
      where('semester', '==', 'First Semester'),
      where('status', '==', 'published')
    );
    const snapshot3 = await getDocs(q3);
    console.log(`Found ${snapshot3.size} published grades for "First Semester"`);

    const q4 = query(studentGradesRef, 
      where('academicYear', '==', '2025-2026'),
      where('semester', '==', '1'),
      where('status', '==', 'published')
    );
    const snapshot4 = await getDocs(q4);
    console.log(`Found ${snapshot4.size} published grades for "1"`);

  } catch (error) {
    console.error('❌ Error checking grade status:', error);
  }
}

checkGradeStatus().then(() => {
  console.log('\n✅ Grade status check completed!');
  process.exit(0);
}).catch((error) => {
  console.error('❌ Check failed:', error);
  process.exit(1);
}); 