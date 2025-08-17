const admin = require('firebase-admin');

// Initialize Firebase Admin if not already done
if (!admin.apps.length) {
  const serviceAccount = require('./ucaes2025-firebase-adminsdk-fbsvc-c70a08a455.json');
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://ucaes2025-default-rtdb.firebaseio.com"
  });
}

const db = admin.firestore();

async function createCourseReportsTestData() {
  console.log('🔧 CREATING COMPREHENSIVE TEST DATA FOR COURSE REPORTS');
  console.log('=' .repeat(60));
  
  try {
    // Create multiple test submissions for different scenarios
    const testSubmissions = [
      {
        courseId: 'course-csc101',
        courseCode: 'CSC101',
        courseName: 'Introduction to Computer Science',
        courseTitle: 'Introduction to Computer Science',
        submittedBy: 'lecturer-001',
        submittedByName: 'Dr. John Smith',
        academicYear: '2024/2025',
        semester: 'First',
        status: 'published',
        programme: 'BSc. Computer Science',
        program: 'BSc. Computer Science',
        grades: [
          { studentId: 'student-001', registrationNumber: 'CS/2024/001', studentName: 'Alice Johnson', assessment: 9, midsem: 18, exams: 68, total: 95, grade: 'A' },
          { studentId: 'student-002', registrationNumber: 'CS/2024/002', studentName: 'Bob Wilson', assessment: 8, midsem: 16, exams: 62, total: 86, grade: 'A' },
          { studentId: 'student-003', registrationNumber: 'CS/2024/003', studentName: 'Carol Davis', assessment: 7, midsem: 15, exams: 55, total: 77, grade: 'B' },
          { studentId: 'student-004', registrationNumber: 'CS/2024/004', studentName: 'David Brown', assessment: 6, midsem: 13, exams: 48, total: 67, grade: 'C' },
          { studentId: 'student-005', registrationNumber: 'CS/2024/005', studentName: 'Eva Martinez', assessment: 5, midsem: 11, exams: 42, total: 58, grade: 'D' },
          { studentId: 'student-006', registrationNumber: 'CS/2024/006', studentName: 'Frank Taylor', assessment: 4, midsem: 9, exams: 35, total: 48, grade: 'F' }
        ]
      },
      {
        courseId: 'course-math101',
        courseCode: 'MATH101',
        courseName: 'Calculus I',
        courseTitle: 'Calculus I',
        submittedBy: 'lecturer-002',
        submittedByName: 'Prof. Sarah Lee',
        academicYear: '2024/2025',
        semester: 'First',
        status: 'published',
        programme: 'BSc. Mathematics',
        program: 'BSc. Mathematics',
        grades: [
          { studentId: 'student-007', registrationNumber: 'MATH/2024/001', studentName: 'Grace Chen', assessment: 10, midsem: 19, exams: 70, total: 99, grade: 'A' },
          { studentId: 'student-008', registrationNumber: 'MATH/2024/002', studentName: 'Henry Kim', assessment: 8, midsem: 17, exams: 63, total: 88, grade: 'A' },
          { studentId: 'student-009', registrationNumber: 'MATH/2024/003', studentName: 'Ivy Zhang', assessment: 7, midsem: 14, exams: 56, total: 77, grade: 'B' },
          { studentId: 'student-010', registrationNumber: 'MATH/2024/004', studentName: 'Jack Robinson', assessment: 6, midsem: 12, exams: 49, total: 67, grade: 'C' }
        ]
      },
      {
        courseId: 'course-eng101',
        courseCode: 'ENG101',
        courseName: 'English Composition',
        courseTitle: 'English Composition',
        submittedBy: 'lecturer-003',
        submittedByName: 'Dr. Michael Johnson',
        academicYear: '2024/2025',
        semester: 'Second',
        status: 'published',
        programme: 'BA. English Literature',
        program: 'BA. English Literature',
        grades: [
          { studentId: 'student-011', registrationNumber: 'ENG/2024/001', studentName: 'Kate Williams', assessment: 9, midsem: 18, exams: 65, total: 92, grade: 'A' },
          { studentId: 'student-012', registrationNumber: 'ENG/2024/002', studentName: 'Luke Anderson', assessment: 7, midsem: 15, exams: 58, total: 80, grade: 'A' },
          { studentId: 'student-013', registrationNumber: 'ENG/2024/003', studentName: 'Mia Thompson', assessment: 6, midsem: 13, exams: 51, total: 70, grade: 'B' },
          { studentId: 'student-014', registrationNumber: 'ENG/2024/004', studentName: 'Noah Garcia', assessment: 5, midsem: 11, exams: 44, total: 60, grade: 'C' },
          { studentId: 'student-015', registrationNumber: 'ENG/2024/005', studentName: 'Olivia Martinez', assessment: 4, midsem: 8, exams: 38, total: 50, grade: 'D' }
        ]
      }
    ];

    console.log('📊 Creating grade submissions...');
    
    for (const [index, submission] of testSubmissions.entries()) {
      // Create grade submission
      const submissionRef = await db.collection('grade-submissions').add({
        ...submission,
        submissionDate: admin.firestore.Timestamp.now(),
        createdAt: admin.firestore.Timestamp.now()
      });
      
      console.log(`✅ Created submission ${index + 1}: ${submission.courseCode} (${submissionRef.id})`);
      
      // Create individual student grade records
      for (const grade of submission.grades) {
        await db.collection('student-grades').add({
          submissionId: submissionRef.id,
          studentId: grade.studentId,
          registrationNumber: grade.registrationNumber,
          studentName: grade.studentName,
          courseId: submission.courseId,
          courseCode: submission.courseCode,
          courseName: submission.courseName,
          courseTitle: submission.courseTitle,
          academicYear: submission.academicYear,
          semester: submission.semester,
          programme: submission.programme,
          assessment: grade.assessment,
          midsem: grade.midsem,
          exams: grade.exams,
          total: grade.total,
          grade: grade.grade,
          status: 'published',
          submittedBy: submission.submittedBy,
          submittedAt: submission.submissionDate || admin.firestore.Timestamp.now(),
          createdAt: admin.firestore.Timestamp.now()
        });
      }
      
      console.log(`   ✅ Created ${submission.grades.length} student grade records`);
    }

    // Create corresponding student records
    console.log('\n👥 Creating student records...');
    
    const allStudents = testSubmissions.flatMap(sub => sub.grades.map(grade => ({
      id: grade.studentId,
      name: grade.studentName,
      registrationNumber: grade.registrationNumber,
      programme: sub.programme,
      email: `${grade.studentName.toLowerCase().replace(/\s+/g, '.')}@student.ucaes.edu.gh`,
      level: '200',
      yearOfAdmission: 2024,
      status: 'active'
    })));

    for (const student of allStudents) {
      const studentRef = db.collection('students').doc(student.id);
      const studentDoc = await studentRef.get();
      
      if (!studentDoc.exists) {
        await studentRef.set({
          ...student,
          createdAt: admin.firestore.Timestamp.now(),
          updatedAt: admin.firestore.Timestamp.now()
        });
        console.log(`✅ Created student: ${student.name} (${student.registrationNumber})`);
      }
    }

    // Create lecturer records
    console.log('\n👨‍🏫 Creating lecturer records...');
    
    const lecturers = [
      { id: 'lecturer-001', name: 'Dr. John Smith', department: 'Computer Science', email: 'john.smith@ucaes.edu.gh' },
      { id: 'lecturer-002', name: 'Prof. Sarah Lee', department: 'Mathematics', email: 'sarah.lee@ucaes.edu.gh' },
      { id: 'lecturer-003', name: 'Dr. Michael Johnson', department: 'English', email: 'michael.johnson@ucaes.edu.gh' }
    ];

    for (const lecturer of lecturers) {
      const lecturerRef = db.collection('users').doc(lecturer.id);
      const lecturerDoc = await lecturerRef.get();
      
      if (!lecturerDoc.exists) {
        await lecturerRef.set({
          username: lecturer.id,
          name: lecturer.name,
          email: lecturer.email,
          role: 'Lecturer',
          department: lecturer.department,
          permissions: ['course_management', 'result_entry', 'student_records'],
          status: 'active',
          createdAt: admin.firestore.Timestamp.now()
        });
        console.log(`✅ Created lecturer: ${lecturer.name}`);
      }
    }

    console.log('\n📋 TEST DATA SUMMARY:');
    console.log('=' .repeat(40));
    console.log(`✅ ${testSubmissions.length} course submissions created`);
    console.log(`✅ ${allStudents.length} student records created`);
    console.log(`✅ ${lecturers.length} lecturer records created`);
    console.log(`✅ ${testSubmissions.reduce((sum, sub) => sum + sub.grades.length, 0)} individual grade records created`);

    console.log('\n🎯 TESTING INSTRUCTIONS:');
    console.log('1. Login as exam officer: examofficer / examofficer123');
    console.log('2. Navigate to: /staff/results/reports');
    console.log('3. Test with these course codes:');
    console.log('   - CSC101 (2024/2025, First Semester) - 6 students');
    console.log('   - MATH101 (2024/2025, First Semester) - 4 students');
    console.log('   - ENG101 (2024/2025, Second Semester) - 5 students');
    console.log('4. Each course should show:');
    console.log('   - Statistics cards with student count, average, pass rate');
    console.log('   - Grade distribution chart');
    console.log('   - Detailed student results table');
    console.log('   - Export and print functionality');

    console.log('\n🚀 COURSE REPORTS TEST DATA READY!');

  } catch (error) {
    console.error('❌ Error creating test data:', error);
  } finally {
    process.exit(0);
  }
}

createCourseReportsTestData();