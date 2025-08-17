const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, query, where } = require('firebase/firestore');

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

async function checkRealStudentSystem() {
  console.log('🔍 Checking the Real Student Registration System...\n');
  
  try {
    // Step 1: Check student-registrations collection (where students from new info system are stored)
    console.log('📋 Step 1: Checking student-registrations collection...');
    const studentRegsRef = collection(db, 'student-registrations');
    const regsSnapshot = await getDocs(studentRegsRef);
    
    console.log(`Found ${regsSnapshot.size} student registrations:`);
    const registeredStudents = [];
    regsSnapshot.forEach(doc => {
      const data = doc.data();
      registeredStudents.push({
        id: doc.id,
        registrationNumber: data.registrationNumber,
        indexNumber: data.studentIndexNumber,
        email: data.email,
        name: `${data.surname || ''} ${data.otherNames || ''}`.trim(),
        dateOfBirth: data.dateOfBirth
      });
      
      console.log(`- ID: ${doc.id}`);
      console.log(`  Registration Number: ${data.registrationNumber || 'N/A'}`);
      console.log(`  Index Number: ${data.studentIndexNumber || 'N/A'}`);
      console.log(`  Email: ${data.email || 'N/A'}`);
      console.log(`  Name: ${data.surname || ''} ${data.otherNames || ''}`);
      console.log('');
    });

    // Step 2: Check current published grades
    console.log('📋 Step 2: Checking current published grades...');
    const gradesRef = collection(db, 'student-grades');
    const gradesQuery = query(
      gradesRef,
      where('academicYear', '==', '2025-2026'),
      where('semester', '==', 'First Semester'),
      where('status', '==', 'published')
    );
    const gradesSnapshot = await getDocs(gradesQuery);
    
    console.log(`Found ${gradesSnapshot.size} published grades:`);
    const currentGrades = [];
    gradesSnapshot.forEach(doc => {
      const data = doc.data();
      currentGrades.push({
        id: doc.id,
        studentId: data.studentId,
        courseCode: data.courseCode,
        grade: data.grade
      });
      
      console.log(`- Grade ID: ${doc.id}`);
      console.log(`  Student ID: ${data.studentId}`);
      console.log(`  Course: ${data.courseCode}`);
      console.log(`  Grade: ${data.grade}`);
      console.log('');
    });

    // Step 3: Check if grades match registered students
    console.log('📋 Step 3: Checking if grades match registered students...');
    
    for (const grade of currentGrades) {
      console.log(`\n🔍 Checking grade for student: ${grade.studentId}`);
      
      // Method 1: Check if studentId matches a student-registrations document ID
      const studentByDocId = registeredStudents.find(s => s.id === grade.studentId);
      if (studentByDocId) {
        console.log(`  ✅ Found by document ID: ${studentByDocId.name} (${studentByDocId.registrationNumber})`);
        continue;
      }
      
      // Method 2: Check if studentId matches a registration number
      const studentByRegNum = registeredStudents.find(s => s.registrationNumber === grade.studentId);
      if (studentByRegNum) {
        console.log(`  ✅ Found by registration number: ${studentByRegNum.name}`);
        continue;
      }
      
      // Method 3: Check if studentId matches an index number
      const studentByIndexNum = registeredStudents.find(s => s.indexNumber === grade.studentId);
      if (studentByIndexNum) {
        console.log(`  ✅ Found by index number: ${studentByIndexNum.name}`);
        continue;
      }
      
      // Method 4: Check if studentId matches an email
      const studentByEmail = registeredStudents.find(s => s.email === grade.studentId);
      if (studentByEmail) {
        console.log(`  ✅ Found by email: ${studentByEmail.name}`);
        continue;
      }
      
      console.log(`  ❌ No matching student found for: ${grade.studentId}`);
    }

    // Step 4: Suggest the correct approach
    console.log('\n📋 Step 4: Recommendations...');
    console.log('🎯 For the student portal to work correctly:');
    console.log('1. Grades should be linked to students using their document IDs from student-registrations');
    console.log('2. Students log in with registration numbers, which maps to their document ID');
    console.log('3. The portal then looks up grades using that document ID');
    console.log('');
    console.log('📝 Current situation:');
    console.log(`- ${registeredStudents.length} students registered in the system`);
    console.log(`- ${currentGrades.length} grades published`);
    console.log('- Need to link grades to the correct student document IDs');

  } catch (error) {
    console.error('❌ Error checking real student system:', error);
  }
}

checkRealStudentSystem().then(() => {
  console.log('\n✅ Real student system check completed!');
  process.exit(0);
}).catch((error) => {
  console.error('❌ Check failed:', error);
  process.exit(1);
}); 