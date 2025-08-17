const { initializeApp } = require('firebase/app');
const { getFirestore, collection, query, where, getDocs, doc, getDoc } = require('firebase/firestore');

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

async function debugStudentPortalLookup() {
  console.log('🧪 Debugging Student Portal Lookup Process...\n');
  
  try {
    // Step 1: Find all users
    console.log('📋 Step 1: Finding all users in the system:');
    const usersRef = collection(db, 'users');
    const usersSnapshot = await getDocs(usersRef);
    
    const users = [];
    usersSnapshot.forEach(doc => {
      const data = doc.data();
      users.push({
        id: doc.id,
        email: data.email,
        name: `${data.surname || ''} ${data.otherNames || ''}`.trim()
      });
      console.log(`- User ID: ${doc.id}, Email: ${data.email}, Name: ${data.surname || ''} ${data.otherNames || ''}`);
    });

    // Step 2: For each user, simulate the student portal grade lookup
    console.log('\n📋 Step 2: Simulating student portal grade lookup for each user:');
    
    for (const user of users) {
      console.log(`\n🔍 Testing lookup for User: ${user.name} (${user.email})`);
      console.log(`   User ID: ${user.id}`);
      
      // Simulate the improved getGradesByYearAndSemester function
      const grades = await simulateGradeLookup(user.id, user.email, '2025-2026', 'First Semester');
      
      if (grades.length > 0) {
        console.log(`   ✅ Found ${grades.length} grades:`);
        grades.forEach(grade => {
          console.log(`      - Course: ${grade.courseCode}, Grade: ${grade.grade}, Status: ${grade.status}`);
        });
      } else {
        console.log(`   ❌ No grades found`);
      }
    }

    // Step 3: Check exactly what grades exist for the academic period
    console.log('\n📋 Step 3: All published grades for 2025-2026 First Semester:');
    const allGradesQuery = query(
      collection(db, 'student-grades'),
      where('academicYear', '==', '2025-2026'),
      where('semester', '==', 'First Semester'),
      where('status', '==', 'published')
    );
    const allGradesSnapshot = await getDocs(allGradesQuery);
    
    console.log(`Found ${allGradesSnapshot.size} published grades:`);
    allGradesSnapshot.forEach(doc => {
      const data = doc.data();
      console.log(`- Student ID: ${data.studentId}, Course: ${data.courseCode}, Grade: ${data.grade}`);
    });

    // Step 4: Test specific emails that should have grades
    console.log('\n📋 Step 4: Testing specific email lookups:');
    const testEmails = ['ben@gmail.com', 'pacmboro@outlook.com'];
    
    for (const email of testEmails) {
      console.log(`\n🔍 Direct lookup for ${email}:`);
      
      // Find user ID for this email
      const user = users.find(u => u.email === email);
      if (user) {
        console.log(`   Found user ID: ${user.id}`);
        const grades = await simulateGradeLookup(user.id, email, '2025-2026', 'First Semester');
        console.log(`   Grades found: ${grades.length}`);
      } else {
        console.log(`   ❌ No user found for email: ${email}`);
      }
    }

  } catch (error) {
    console.error('❌ Error in debug:', error);
  }
}

async function simulateGradeLookup(studentId, studentEmail, academicYear, semester) {
  let allGrades = [];

  // Method 1: Search by studentId in student-grades collection
  try {
    const q1 = query(
      collection(db, 'student-grades'),
      where('studentId', '==', studentId),
      where('academicYear', '==', academicYear),
      where('semester', '==', semester),
      where('status', '==', 'published')
    );
    const snapshot1 = await getDocs(q1);
    allGrades.push(...snapshot1.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  } catch (error) {
    console.warn(`   Error searching by studentId: ${error.message}`);
  }

  // Method 2: Search by email in student-grades collection
  if (studentEmail) {
    try {
      const q2 = query(
        collection(db, 'student-grades'),
        where('studentId', '==', studentEmail),
        where('academicYear', '==', academicYear),
        where('semester', '==', semester),
        where('status', '==', 'published')
      );
      const snapshot2 = await getDocs(q2);
      allGrades.push(...snapshot2.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (error) {
      console.warn(`   Error searching by email: ${error.message}`);
    }
  }

  // Method 3: Search by studentId in old grades collection
  try {
    const q3 = query(
      collection(db, 'grades'),
      where('studentId', '==', studentId),
      where('academicYear', '==', academicYear),
      where('semester', '==', semester),
      where('status', '==', 'published')
    );
    const snapshot3 = await getDocs(q3);
    allGrades.push(...snapshot3.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  } catch (error) {
    console.warn(`   Error searching old grades by studentId: ${error.message}`);
  }

  // Method 4: Search by email in old grades collection
  if (studentEmail) {
    try {
      const q4 = query(
        collection(db, 'grades'),
        where('studentId', '==', studentEmail),
        where('academicYear', '==', academicYear),
        where('semester', '==', semester),
        where('status', '==', 'published')
      );
      const snapshot4 = await getDocs(q4);
      allGrades.push(...snapshot4.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (error) {
      console.warn(`   Error searching old grades by email: ${error.message}`);
    }
  }

  return allGrades;
}

debugStudentPortalLookup().then(() => {
  console.log('\n✅ Student portal debug completed!');
  process.exit(0);
}).catch((error) => {
  console.error('❌ Debug failed:', error);
  process.exit(1);
}); 