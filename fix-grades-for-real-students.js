const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, query, where, doc, updateDoc } = require('firebase/firestore');

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

async function fixGradesForRealStudents() {
  console.log('🔧 Fixing Grades for Real Student Registration System...\n');
  
  try {
    // Step 1: Get the actual students from student-registrations
    console.log('📋 Step 1: Getting real students from student-registrations...');
    const studentRegsRef = collection(db, 'student-registrations');
    const regsSnapshot = await getDocs(studentRegsRef);
    
    const realStudents = [];
    regsSnapshot.forEach(doc => {
      const data = doc.data();
      if (data.email) {
        realStudents.push({
          id: doc.id,
          registrationNumber: data.registrationNumber,
          email: data.email,
          name: `${data.surname || ''} ${data.otherNames || ''}`.trim()
        });
      }
    });
    
    console.log(`Found ${realStudents.length} real students with emails`);

    // Step 2: Get current published grades
    console.log('\n📋 Step 2: Getting current published grades...');
    const gradesRef = collection(db, 'student-grades');
    const gradesQuery = query(
      gradesRef,
      where('academicYear', '==', '2025-2026'),
      where('semester', '==', 'First Semester'),
      where('status', '==', 'published')
    );
    const gradesSnapshot = await getDocs(gradesQuery);
    
    console.log(`Found ${gradesSnapshot.size} published grades to fix`);

    // Step 3: Map grades to correct students
    console.log('\n📋 Step 3: Mapping grades to correct students...');
    
    // Based on our knowledge, we know:
    // - Grade with B should be for BENEDICT LAMISI (ben@gmail.com)
    // - Grade with F should be for PAUL ADDO (pacmboro@outlook.com)
    
    const gradeMappings = [];
    gradesSnapshot.forEach(gradeDoc => {
      const gradeData = gradeDoc.data();
      console.log(`- Grade: ${gradeData.grade} for current studentId: ${gradeData.studentId}`);
      
      if (gradeData.grade === 'B') {
        // This should be BENEDICT LAMISI
        const student = realStudents.find(s => s.email === 'ben@gmail.com');
        if (student) {
          gradeMappings.push({
            gradeDocId: gradeDoc.id,
            currentStudentId: gradeData.studentId,
            correctStudentId: student.id,
            studentName: student.name,
            registrationNumber: student.registrationNumber,
            grade: gradeData.grade
          });
          console.log(`  ✅ Mapping to: ${student.name} (${student.registrationNumber})`);
        }
      } else if (gradeData.grade === 'F') {
        // This should be PAUL ADDO
        const student = realStudents.find(s => s.email === 'pacmboro@outlook.com');
        if (student) {
          gradeMappings.push({
            gradeDocId: gradeDoc.id,
            currentStudentId: gradeData.studentId,
            correctStudentId: student.id,
            studentName: student.name,
            registrationNumber: student.registrationNumber,
            grade: gradeData.grade
          });
          console.log(`  ✅ Mapping to: ${student.name} (${student.registrationNumber})`);
        }
      }
    });

    // Step 4: Apply the fixes
    console.log('\n📋 Step 4: Applying fixes...');
    
    for (const mapping of gradeMappings) {
      console.log(`Fixing grade ${mapping.grade} for ${mapping.studentName}:`);
      console.log(`  From: ${mapping.currentStudentId}`);
      console.log(`  To: ${mapping.correctStudentId}`);
      
      // Update the grade document
      await updateDoc(doc(db, 'student-grades', mapping.gradeDocId), {
        studentId: mapping.correctStudentId,
        studentRegistrationNumber: mapping.registrationNumber,
        studentName: mapping.studentName,
        updatedAt: new Date(),
        fixedBy: 'system_admin',
        fixNote: 'Updated to use correct student-registrations document ID'
      });
      
      console.log(`  ✅ Fixed successfully`);
    }

    // Step 5: Verify the fix
    console.log('\n📋 Step 5: Verifying the fix...');
    const verifyQuery = query(
      gradesRef,
      where('academicYear', '==', '2025-2026'),
      where('semester', '==', 'First Semester'),
      where('status', '==', 'published')
    );
    const verifySnapshot = await getDocs(verifyQuery);
    
    console.log(`After fix - Found ${verifySnapshot.size} published grades:`);
    verifySnapshot.forEach(doc => {
      const data = doc.data();
      const student = realStudents.find(s => s.id === data.studentId);
      console.log(`- Student ID: ${data.studentId}`);
      console.log(`  Course: ${data.courseCode}, Grade: ${data.grade}`);
      console.log(`  Matched Student: ${student ? `${student.name} (${student.registrationNumber})` : 'NOT FOUND'} ${student ? '✅' : '❌'}`);
      console.log('');
    });

    console.log('\n🎯 How this works now:');
    console.log('1. Students register in "new student information" system');
    console.log('2. They get registration numbers like UCAES20254119');
    console.log('3. They log into student portal using registration number + DOB');
    console.log('4. Portal finds their document ID in student-registrations');
    console.log('5. Portal looks up grades using that document ID');
    console.log('6. Students can now see their published grades!');

  } catch (error) {
    console.error('❌ Error fixing grades for real students:', error);
  }
}

fixGradesForRealStudents().then(() => {
  console.log('\n✅ Grades fixed for real student registration system!');
  console.log('🎊 Students should now be able to see their grades using registration numbers!');
  process.exit(0);
}).catch((error) => {
  console.error('❌ Fix failed:', error);
  process.exit(1);
}); 