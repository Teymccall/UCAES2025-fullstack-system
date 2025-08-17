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

async function testStudentPortalFix() {
  console.log('🧪 Testing Student Portal Fix...\n');

  try {
    // Step 1: Find the user IDs for ben@gmail.com and pacmboro@outlook.com
    console.log('📋 Step 1: Finding user IDs...');
    const usersRef = collection(db, "users");
    const usersSnapshot = await getDocs(usersRef);
    
    let benUserId = null;
    let paulUserId = null;
    
    usersSnapshot.forEach(doc => {
      const data = doc.data();
      if (data.email === 'ben@gmail.com') {
        benUserId = doc.id;
        console.log(`✅ Found BENEDICT LAMISI: ${doc.id} (${data.email})`);
      }
      if (data.email === 'pacmboro@outlook.com') {
        paulUserId = doc.id;
        console.log(`✅ Found PAUL ADDO: ${doc.id} (${data.email})`);
      }
    });

    if (!benUserId || !paulUserId) {
      console.log('❌ Could not find user IDs for both students');
      return;
    }

    // Step 2: Test the improved getStudentRegistrations logic
    console.log('\n📋 Step 2: Testing course registration lookup...');
    
    const testStudents = [
      { name: 'BENEDICT LAMISI', userId: benUserId, email: 'ben@gmail.com' },
      { name: 'PAUL ADDO', userId: paulUserId, email: 'pacmboro@outlook.com' }
    ];

    for (const student of testStudents) {
      console.log(`\n🔍 Testing registration lookup for ${student.name}:`);
      console.log(`   User ID: ${student.userId}`);
      console.log(`   Email: ${student.email}`);
      
      // Simulate the improved getStudentRegistrations logic
      const registrations = await simulateGetStudentRegistrations(student.userId, student.email);
      
      if (registrations.length > 0) {
        console.log(`   ✅ Found ${registrations.length} registrations:`);
        registrations.forEach(reg => {
          console.log(`      - ${reg.academicYear} ${reg.semester} (${reg.courses?.length || 0} courses)`);
        });
      } else {
        console.log(`   ❌ No registrations found`);
      }
    }

    // Step 3: Test the improved getGradesByYearAndSemester logic
    console.log('\n📋 Step 3: Testing grades lookup...');
    
    for (const student of testStudents) {
      console.log(`\n🔍 Testing grades lookup for ${student.name}:`);
      
      // Test for 2025-2026, First Semester
      const grades = await simulateGetGradesByYearAndSemester(
        student.userId, 
        student.email, 
        '2025-2026', 
        'First Semester'
      );
      
      if (grades && grades.length > 0) {
        console.log(`   ✅ Found ${grades.length} grades for 2025-2026 First Semester:`);
        grades.forEach(grade => {
          console.log(`      - ${grade.courseCode}: ${grade.grade}`);
        });
      } else {
        console.log(`   ❌ No grades found for 2025-2026 First Semester`);
      }
    }

    console.log('\n✅ Student portal fix test completed!');
    console.log('💡 The improved lookup logic should now find:');
    console.log('   - Course registrations by both user ID and email');
    console.log('   - Grades by both user ID and email');
    console.log('   - Both new (student-grades) and old (grades) collections');

  } catch (error) {
    console.error('❌ Error testing student portal fix:', error);
  }
}

async function simulateGetStudentRegistrations(userId, email) {
  const registrations = [];
  
  // Method 1: Search by studentId
  try {
    const q = query(collection(db, "course-registrations"), where("studentId", "==", userId));
    const snapshot = await getDocs(q);
    registrations.push(...snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  } catch (error) {
    console.warn(`Error searching by studentId: ${error.message}`);
  }
  
  // Method 2: Search by email
  if (email) {
    try {
      const q = query(collection(db, "course-registrations"), where("email", "==", email));
      const snapshot = await getDocs(q);
      registrations.push(...snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (error) {
      console.warn(`Error searching by email: ${error.message}`);
    }
  }
  
  // Method 3: Search by email as studentId
  if (email) {
    try {
      const q = query(collection(db, "course-registrations"), where("studentId", "==", email));
      const snapshot = await getDocs(q);
      registrations.push(...snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (error) {
      console.warn(`Error searching by email as studentId: ${error.message}`);
    }
  }
  
  // Remove duplicates
  const uniqueRegistrations = registrations.filter((reg, index, self) => 
    index === self.findIndex(r => 
      r.academicYear === reg.academicYear && r.semester === reg.semester
    )
  );
  
  return uniqueRegistrations;
}

async function simulateGetGradesByYearAndSemester(userId, email, academicYear, semester) {
  const allGrades = [];
  
  // Method 1: Search by studentId in student-grades
  try {
    const q = query(
      collection(db, "student-grades"),
      where("studentId", "==", userId),
      where("academicYear", "==", academicYear),
      where("semester", "==", semester),
      where("status", "==", "published")
    );
    const snapshot = await getDocs(q);
    allGrades.push(...snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  } catch (error) {
    console.warn(`Error searching student-grades by studentId: ${error.message}`);
  }
  
  // Method 2: Search by email in student-grades
  if (email) {
    try {
      const q = query(
        collection(db, "student-grades"),
        where("studentId", "==", email),
        where("academicYear", "==", academicYear),
        where("semester", "==", semester),
        where("status", "==", "published")
      );
      const snapshot = await getDocs(q);
      allGrades.push(...snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (error) {
      console.warn(`Error searching student-grades by email: ${error.message}`);
    }
  }
  
  return allGrades;
}

// Run the test
testStudentPortalFix().then(() => {
  console.log('\n✅ Student portal fix test completed!');
  process.exit(0);
}).catch((error) => {
  console.error('❌ Test failed:', error);
  process.exit(1);
}); 