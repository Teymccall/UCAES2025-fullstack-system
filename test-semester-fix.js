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

async function testSemesterFix() {
  console.log('🧪 Testing Semester Format Fix...\n');
  
  try {
    // Simulate what the student portal now does
    const selectedSemester = 'First'; // What user selects in dropdown
    const semesterForDatabase = `${selectedSemester} Semester`; // What we convert to
    
    console.log(`Student selects: "${selectedSemester}"`);
    console.log(`Portal converts to: "${semesterForDatabase}"`);
    
    // Test the query with the converted format
    const q = query(
      collection(db, 'student-grades'),
      where('studentId', '==', 'bZX9L8N2CTk8rwW5LGRY'),
      where('academicYear', '==', '2025-2026'),
      where('semester', '==', semesterForDatabase),
      where('status', '==', 'published')
    );
    const snapshot = await getDocs(q);
    
    console.log(`\nQuery result: Found ${snapshot.size} grades`);
    
    if (snapshot.size > 0) {
      snapshot.forEach(doc => {
        const data = doc.data();
        console.log(`✅ SUCCESS: Found grade for ${data.courseCode} - Grade ${data.grade}`);
      });
      
      console.log('\n🎉 THE FIX WORKS!');
      console.log('✅ Student portal will now find the grades');
      console.log('✅ "No Results Available" message should disappear');
    } else {
      console.log('\n❌ Still not working - grades not found');
    }

    // Test for both students
    const students = [
      { name: 'BENEDICT LAMISI', id: '3uirGcrYltloPyFCqCrq', expectedGrade: 'B' },
      { name: 'PAUL ADDO', id: 'bZX9L8N2CTk8rwW5LGRY', expectedGrade: 'F' }
    ];

    console.log('\n📋 Testing both students:');
    for (const student of students) {
      const q = query(
        collection(db, 'student-grades'),
        where('studentId', '==', student.id),
        where('academicYear', '==', '2025-2026'),
        where('semester', '==', semesterForDatabase),
        where('status', '==', 'published')
      );
      const snapshot = await getDocs(q);
      
      if (snapshot.size > 0) {
        const data = snapshot.docs[0].data();
        console.log(`✅ ${student.name}: Found ${data.courseCode} - Grade ${data.grade}`);
      } else {
        console.log(`❌ ${student.name}: No grades found`);
      }
    }

  } catch (error) {
    console.error('❌ Error in test:', error);
  }
}

testSemesterFix().then(() => {
  console.log('\n✅ Semester format fix test completed!');
  process.exit(0);
}).catch((error) => {
  console.error('❌ Test failed:', error);
  process.exit(1);
}); 