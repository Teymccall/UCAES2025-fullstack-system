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

async function checkSemesterFormats() {
  console.log('🔍 Checking semester formats in database...\n');
  
  try {
    // Check all published grades
    const q = query(
      collection(db, 'student-grades'),
      where('academicYear', '==', '2025-2026'),
      where('status', '==', 'published')
    );
    const snapshot = await getDocs(q);
    
    console.log(`Found ${snapshot.size} published grades for 2025-2026:`);
    snapshot.forEach(doc => {
      const data = doc.data();
      console.log(`- Student: ${data.studentId}`);
      console.log(`  Semester: "${data.semester}"`);
      console.log(`  Course: ${data.courseCode}`);
      console.log(`  Grade: ${data.grade}`);
      console.log('');
    });

    // Test the exact queries that are failing
    console.log('🧪 Testing exact query scenarios:');
    
    // Query 1: What the student portal is searching for
    console.log('\n1. Student portal search (semester: "First"):');
    const q1 = query(
      collection(db, 'student-grades'),
      where('studentId', '==', 'bZX9L8N2CTk8rwW5LGRY'),
      where('academicYear', '==', '2025-2026'),
      where('semester', '==', 'First'),
      where('status', '==', 'published')
    );
    const snapshot1 = await getDocs(q1);
    console.log(`   Found: ${snapshot1.size} grades`);

    // Query 2: What should work (semester: "First Semester")
    console.log('\n2. Correct search (semester: "First Semester"):');
    const q2 = query(
      collection(db, 'student-grades'),
      where('studentId', '==', 'bZX9L8N2CTk8rwW5LGRY'),
      where('academicYear', '==', '2025-2026'),
      where('semester', '==', 'First Semester'),
      where('status', '==', 'published')
    );
    const snapshot2 = await getDocs(q2);
    console.log(`   Found: ${snapshot2.size} grades`);
    snapshot2.forEach(doc => {
      const data = doc.data();
      console.log(`     - Course: ${data.courseCode}, Grade: ${data.grade}`);
    });

    console.log('\n📋 The Problem:');
    console.log('❌ Student portal searches for: "First"');
    console.log('✅ Database stores: "First Semester"');
    console.log('💡 Solution: Fix the semester format mapping in student portal');

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

checkSemesterFormats().then(() => {
  console.log('\n✅ Semester format check completed!');
  process.exit(0);
}).catch((error) => {
  console.error('❌ Check failed:', error);
  process.exit(1);
}); 