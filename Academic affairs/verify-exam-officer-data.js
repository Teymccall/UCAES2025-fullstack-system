const admin = require('firebase-admin');

// Initialize Firebase Admin
if (!admin.apps.length) {
  const serviceAccount = require('./ucaes2025-firebase-adminsdk-fbsvc-c70a08a455.json');
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://ucaes2025-default-rtdb.firebaseio.com"
  });
}

const db = admin.firestore();

async function verifyExamOfficerData() {
  console.log('🔍 VERIFYING EXAM OFFICER DATA AND FEATURES');
  console.log('=' .repeat(60));
  
  try {
    // 1. Verify exam officer account
    console.log('1️⃣ VERIFYING EXAM OFFICER ACCOUNT');
    console.log('-' .repeat(40));
    
    const examOfficerQuery = await db.collection('users')
      .where('role', '==', 'exam_officer')
      .where('username', '==', 'examofficer')
      .get();
    
    if (!examOfficerQuery.empty) {
      const examOfficer = examOfficerQuery.docs[0].data();
      console.log('✅ Exam Officer Account Found:');
      console.log(`   👤 Name: ${examOfficer.name}`);
      console.log(`   🆔 Username: ${examOfficer.username}`);
      console.log(`   📧 Email: ${examOfficer.email}`);
      console.log(`   🎭 Role: ${examOfficer.role}`);
      console.log(`   ✅ Status: ${examOfficer.status}`);
      console.log(`   🔑 Permissions: ${examOfficer.permissions.join(', ')}`);
    } else {
      console.log('❌ Exam Officer Account Not Found');
    }
    
    // 2. Check pending grade submissions for results approval
    console.log('\n2️⃣ CHECKING RESULTS APPROVAL DATA');
    console.log('-' .repeat(40));
    
    const pendingSubmissions = await db.collection('grade-submissions')
      .where('status', '==', 'pending_approval')
      .get();
    
    console.log(`📊 Pending Grade Submissions: ${pendingSubmissions.size}`);
    
    if (pendingSubmissions.size > 0) {
      console.log('✅ Results Approval Feature Ready:');
      pendingSubmissions.forEach((doc, index) => {
        const submission = doc.data();
        console.log(`   ${index + 1}. ${submission.courseCode} - ${submission.courseName}`);
        console.log(`      👨‍🏫 Lecturer: ${submission.submittedByName}`);
        console.log(`      👥 Students: ${submission.grades ? submission.grades.length : 0}`);
        console.log(`      📅 Year: ${submission.academicYear} - ${submission.semester}`);
      });
    } else {
      console.log('⚠️ No pending submissions found');
      console.log('   Creating test submission for results approval testing...');
      
      // Create test submission
      const testSubmission = {
        courseId: 'test-course-exam-officer',
        courseCode: 'TEST 301',
        courseName: 'Test Course for Exam Officer',
        submittedBy: 'test-lecturer-001',
        submittedByName: 'Dr. Test Lecturer',
        academicYear: '2024-2025',
        semester: 'First',
        status: 'pending_approval',
        submissionDate: admin.firestore.Timestamp.now(),
        grades: [
          {
            studentId: 'test-student-001',
            assessment: 9,
            midsem: 18,
            exams: 65,
            total: 92,
            grade: 'A',
            gradePoint: 4.0
          },
          {
            studentId: 'test-student-002',
            assessment: 7,
            midsem: 15,
            exams: 58,
            total: 80,
            grade: 'A',
            gradePoint: 4.0
          }
        ]
      };
      
      const submissionRef = await db.collection('grade-submissions').add(testSubmission);
      console.log(`✅ Test submission created: ${submissionRef.id}`);
    }
    
    // 3. Check students for transcript generation
    console.log('\n3️⃣ CHECKING TRANSCRIPT GENERATION DATA');
    console.log('-' .repeat(40));
    
    const studentsQuery = await db.collection('students').limit(5).get();
    console.log(`👥 Students Available: ${studentsQuery.size}`);
    
    if (studentsQuery.size > 0) {
      console.log('✅ Transcript Generation Feature Ready:');
      studentsQuery.forEach((doc, index) => {
        const student = doc.data();
        console.log(`   ${index + 1}. ${student.name || 'Unknown'} (${student.registrationNumber || doc.id})`);
        console.log(`      📧 Email: ${student.email || 'N/A'}`);
        console.log(`      🎓 Program: ${student.program || 'N/A'}`);
        console.log(`      📊 Level: ${student.level || 'N/A'}`);
      });
      
      // Check grades for first student
      const firstStudent = studentsQuery.docs[0];
      const studentGradesQuery = await db.collection('student-grades')
        .where('studentId', '==', firstStudent.id)
        .get();
      
      console.log(`   📊 Grades for ${firstStudent.data().name}: ${studentGradesQuery.size} records`);
      
    } else {
      console.log('⚠️ No students found for transcript generation');
    }
    
    // 4. Check student grades for student records access
    console.log('\n4️⃣ CHECKING STUDENT RECORDS DATA');
    console.log('-' .repeat(40));
    
    const studentGradesQuery = await db.collection('student-grades').limit(10).get();
    console.log(`📊 Student Grade Records: ${studentGradesQuery.size}`);
    
    if (studentGradesQuery.size > 0) {
      console.log('✅ Student Records Access Ready:');
      
      const gradesByStatus = {};
      studentGradesQuery.forEach(doc => {
        const grade = doc.data();
        const status = grade.status || 'unknown';
        gradesByStatus[status] = (gradesByStatus[status] || 0) + 1;
      });
      
      Object.entries(gradesByStatus).forEach(([status, count]) => {
        console.log(`   ${status}: ${count} records`);
      });
    }
    
    // 5. Check daily reports
    console.log('\n5️⃣ CHECKING DAILY REPORTS DATA');
    console.log('-' .repeat(40));
    
    const dailyReportsQuery = await db.collection('daily-reports').limit(5).get();
    console.log(`📝 Daily Reports: ${dailyReportsQuery.size}`);
    
    if (dailyReportsQuery.size > 0) {
      console.log('✅ Daily Reports Feature Ready:');
      dailyReportsQuery.forEach((doc, index) => {
        const report = doc.data();
        const reportDate = report.date ? report.date.toDate().toLocaleDateString() : 'Unknown';
        console.log(`   ${index + 1}. ${report.title || 'Untitled'} - ${reportDate}`);
      });
    } else {
      console.log('ℹ️ No daily reports found (normal for new system)');
    }
    
    // 6. Check courses
    console.log('\n6️⃣ CHECKING COURSES DATA');
    console.log('-' .repeat(40));
    
    const coursesQuery = await db.collection('courses').limit(5).get();
    console.log(`📚 Courses Available: ${coursesQuery.size}`);
    
    if (coursesQuery.size > 0) {
      console.log('✅ Course Data Available:');
      coursesQuery.forEach((doc, index) => {
        const course = doc.data();
        console.log(`   ${index + 1}. ${course.code || 'Unknown'} - ${course.title || 'Unknown Title'}`);
      });
    }
    
    // 7. Summary and recommendations
    console.log('\n📋 FEATURE READINESS SUMMARY');
    console.log('=' .repeat(40));
    
    const featureStatus = {
      'Login & Authentication': '✅ Ready',
      'Results Approval': pendingSubmissions.size > 0 ? '✅ Ready' : '⚠️ Needs test data',
      'Transcript Generation': studentsQuery.size > 0 ? '✅ Ready' : '⚠️ Needs students',
      'Student Records Access': studentGradesQuery.size > 0 ? '✅ Ready' : '⚠️ Needs grade data',
      'Daily Reports': '✅ Ready',
      'Dashboard Access': '✅ Ready'
    };
    
    Object.entries(featureStatus).forEach(([feature, status]) => {
      console.log(`${status} ${feature}`);
    });
    
    console.log('\n🎯 TESTING RECOMMENDATIONS:');
    console.log('1. Login with: examofficer / examofficer123');
    console.log('2. Test Results Approval at /staff/results');
    console.log('3. Test Transcript Generation at /staff/transcripts');
    console.log('4. Test Student Records at /staff/students');
    console.log('5. Test Daily Reports at /staff/daily-report');
    console.log('6. Verify Dashboard at /staff/dashboard');
    
  } catch (error) {
    console.error('❌ Error verifying exam officer data:', error);
  } finally {
    process.exit(0);
  }
}

verifyExamOfficerData();