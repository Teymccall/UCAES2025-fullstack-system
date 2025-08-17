const admin = require('firebase-admin');

// Initialize Firebase Admin (reuse existing initialization if already done)
if (!admin.apps.length) {
  const serviceAccount = require('./ucaes2025-firebase-adminsdk-fbsvc-c70a08a455.json');
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://ucaes2025-default-rtdb.firebaseio.com"
  });
}

const db = admin.firestore();

async function createTestDataForExamOfficer() {
  try {
    console.log('🧪 Creating Test Data for Exam Officer Testing...\n');
    
    // 1. Create test students if they don't exist
    console.log('1️⃣ Creating test students...');
    
    const testStudents = [
      {
        id: 'test-student-001',
        name: 'John Doe',
        email: 'john.doe@student.ucaes.edu.gh',
        registrationNumber: 'UCAES20240001',
        program: 'BSc. Sustainable Agriculture',
        level: '200',
        yearOfAdmission: 2024,
        status: 'active',
        gender: 'Male',
        dateOfBirth: '2002-05-15'
      },
      {
        id: 'test-student-002',
        name: 'Jane Smith',
        email: 'jane.smith@student.ucaes.edu.gh',
        registrationNumber: 'UCAES20240002',
        program: 'BSc. Sustainable Agriculture',
        level: '200',
        yearOfAdmission: 2024,
        status: 'active',
        gender: 'Female',
        dateOfBirth: '2003-08-22'
      },
      {
        id: 'test-student-003',
        name: 'Michael Johnson',
        email: 'michael.johnson@student.ucaes.edu.gh',
        registrationNumber: 'UCAES20240003',
        program: 'BSc. Sustainable Agriculture',
        level: '100',
        yearOfAdmission: 2024,
        status: 'active',
        gender: 'Male',
        dateOfBirth: '2004-01-10'
      }
    ];
    
    for (const student of testStudents) {
      const studentRef = db.collection('students').doc(student.id);
      const studentDoc = await studentRef.get();
      
      if (!studentDoc.exists) {
        await studentRef.set({
          ...student,
          createdAt: admin.firestore.Timestamp.now(),
          updatedAt: admin.firestore.Timestamp.now()
        });
        console.log(`✅ Created student: ${student.name} (${student.registrationNumber})`);
      } else {
        console.log(`ℹ️ Student already exists: ${student.name}`);
      }
    }
    
    // 2. Create test lecturer
    console.log('\n2️⃣ Creating test lecturer...');
    
    const testLecturer = {
      id: 'test-lecturer-001',
      username: 'test_lecturer',
      name: 'Dr. Sarah Wilson',
      email: 'sarah.wilson@ucaes.edu.gh',
      role: 'Lecturer',
      permissions: ['course_management', 'result_entry', 'student_records', 'daily_reports'],
      status: 'active',
      department: 'Agriculture',
      position: 'Senior Lecturer',
      assignedCourses: ['AGM151', 'AGM251', 'CHEM121']
    };
    
    const lecturerRef = db.collection('users').doc(testLecturer.id);
    const lecturerDoc = await lecturerRef.get();
    
    if (!lecturerDoc.exists) {
      await lecturerRef.set({
        ...testLecturer,
        createdAt: admin.firestore.Timestamp.now(),
        updatedAt: admin.firestore.Timestamp.now()
      });
      console.log(`✅ Created lecturer: ${testLecturer.name}`);
    } else {
      console.log(`ℹ️ Lecturer already exists: ${testLecturer.name}`);
    }
    
    // 3. Create test courses
    console.log('\n3️⃣ Creating test courses...');
    
    const testCourses = [
      {
        id: 'course-agm151',
        code: 'AGM 151',
        title: 'Introduction to Agriculture',
        credits: 3,
        level: 100,
        semester: 'First',
        department: 'Agriculture',
        description: 'Basic principles of agriculture'
      },
      {
        id: 'course-agm251',
        code: 'AGM 251',
        title: 'Crop Production',
        credits: 4,
        level: 200,
        semester: 'First',
        department: 'Agriculture',
        description: 'Advanced crop production techniques'
      },
      {
        id: 'course-chem121',
        code: 'CHEM 121',
        title: 'General Chemistry',
        credits: 3,
        level: 100,
        semester: 'First',
        department: 'Chemistry',
        description: 'Fundamental chemistry concepts'
      }
    ];
    
    for (const course of testCourses) {
      const courseRef = db.collection('courses').doc(course.id);
      const courseDoc = await courseRef.get();
      
      if (!courseDoc.exists) {
        await courseRef.set({
          ...course,
          createdAt: admin.firestore.Timestamp.now(),
          updatedAt: admin.firestore.Timestamp.now()
        });
        console.log(`✅ Created course: ${course.code} - ${course.title}`);
      } else {
        console.log(`ℹ️ Course already exists: ${course.code}`);
      }
    }
    
    // 4. Create pending grade submissions for exam officer to approve
    console.log('\n4️⃣ Creating pending grade submissions...');
    
    const gradeSubmissions = [
      {
        courseId: 'course-agm151',
        courseCode: 'AGM 151',
        courseName: 'Introduction to Agriculture',
        submittedBy: 'test-lecturer-001',
        submittedByName: 'Dr. Sarah Wilson',
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
            assessment: 8,
            midsem: 16,
            exams: 58,
            total: 82,
            grade: 'A',
            gradePoint: 4.0
          },
          {
            studentId: 'test-student-003',
            assessment: 7,
            midsem: 14,
            exams: 52,
            total: 73,
            grade: 'B',
            gradePoint: 3.0
          }
        ]
      },
      {
        courseId: 'course-chem121',
        courseCode: 'CHEM 121',
        courseName: 'General Chemistry',
        submittedBy: 'test-lecturer-001',
        submittedByName: 'Dr. Sarah Wilson',
        academicYear: '2024-2025',
        semester: 'First',
        status: 'pending_approval',
        submissionDate: admin.firestore.Timestamp.now(),
        grades: [
          {
            studentId: 'test-student-001',
            assessment: 8,
            midsem: 15,
            exams: 60,
            total: 83,
            grade: 'A',
            gradePoint: 4.0
          },
          {
            studentId: 'test-student-002',
            assessment: 6,
            midsem: 12,
            exams: 45,
            total: 63,
            grade: 'C',
            gradePoint: 2.0
          },
          {
            studentId: 'test-student-003',
            assessment: 9,
            midsem: 17,
            exams: 62,
            total: 88,
            grade: 'A',
            gradePoint: 4.0
          }
        ]
      }
    ];
    
    for (const submission of gradeSubmissions) {
      const submissionRef = await db.collection('grade-submissions').add(submission);
      console.log(`✅ Created grade submission: ${submission.courseCode} (${submissionRef.id})`);
      
      // Also create individual student grade records
      for (const grade of submission.grades) {
        const studentGradeRef = await db.collection('student-grades').add({
          submissionId: submissionRef.id,
          studentId: grade.studentId,
          courseId: submission.courseId,
          courseCode: submission.courseCode,
          courseName: submission.courseName,
          academicYear: submission.academicYear,
          semester: submission.semester,
          assessment: grade.assessment,
          midsem: grade.midsem,
          exams: grade.exams,
          total: grade.total,
          grade: grade.grade,
          gradePoint: grade.gradePoint,
          status: 'pending_approval',
          submittedBy: submission.submittedBy,
          submittedAt: submission.submissionDate,
          createdAt: admin.firestore.Timestamp.now()
        });
        console.log(`   ✅ Created student grade record for ${grade.studentId}`);
      }
    }
    
    // 5. Create some approved/published grades for transcript testing
    console.log('\n5️⃣ Creating published grades for transcript testing...');
    
    const publishedGrades = [
      {
        submissionId: 'published-submission-001',
        studentId: 'test-student-001',
        courseId: 'course-agm251',
        courseCode: 'AGM 251',
        courseName: 'Crop Production',
        academicYear: '2023-2024',
        semester: 'Second',
        assessment: 9,
        midsem: 19,
        exams: 68,
        total: 96,
        grade: 'A',
        gradePoint: 4.0,
        status: 'published',
        submittedBy: 'test-lecturer-001',
        approvedBy: 'exam_officer',
        publishedBy: 'exam_officer',
        submittedAt: admin.firestore.Timestamp.fromDate(new Date('2024-06-15')),
        approvedAt: admin.firestore.Timestamp.fromDate(new Date('2024-06-20')),
        publishedAt: admin.firestore.Timestamp.fromDate(new Date('2024-06-25')),
        createdAt: admin.firestore.Timestamp.now()
      },
      {
        submissionId: 'published-submission-002',
        studentId: 'test-student-002',
        courseId: 'course-agm251',
        courseCode: 'AGM 251',
        courseName: 'Crop Production',
        academicYear: '2023-2024',
        semester: 'Second',
        assessment: 7,
        midsem: 15,
        exams: 55,
        total: 77,
        grade: 'B',
        gradePoint: 3.0,
        status: 'published',
        submittedBy: 'test-lecturer-001',
        approvedBy: 'exam_officer',
        publishedBy: 'exam_officer',
        submittedAt: admin.firestore.Timestamp.fromDate(new Date('2024-06-15')),
        approvedAt: admin.firestore.Timestamp.fromDate(new Date('2024-06-20')),
        publishedAt: admin.firestore.Timestamp.fromDate(new Date('2024-06-25')),
        createdAt: admin.firestore.Timestamp.now()
      }
    ];
    
    for (const grade of publishedGrades) {
      const gradeRef = await db.collection('student-grades').add(grade);
      console.log(`✅ Created published grade: ${grade.courseCode} for ${grade.studentId}`);
    }
    
    // 6. Create a daily report template
    console.log('\n6️⃣ Creating daily report template...');
    
    const dailyReport = {
      title: 'Exam Officer Daily Report',
      date: admin.firestore.Timestamp.now(),
      submittedBy: 'exam_officer',
      submittedByName: 'Exam Officer',
      activities: [
        'Reviewed and approved 2 grade submissions',
        'Generated 3 student transcripts',
        'Processed examination results for AGM 151',
        'Coordinated with lecturers on grade submission deadlines'
      ],
      statistics: {
        gradesApproved: 2,
        transcriptsGenerated: 3,
        studentsProcessed: 6
      },
      notes: 'All grade submissions processed within deadline. No issues encountered.',
      status: 'submitted',
      createdAt: admin.firestore.Timestamp.now()
    };
    
    const reportRef = await db.collection('daily-reports').add(dailyReport);
    console.log(`✅ Created daily report template (${reportRef.id})`);
    
    // Summary
    console.log('\n📋 TEST DATA CREATION SUMMARY:');
    console.log('✅ 3 test students created');
    console.log('✅ 1 test lecturer created');
    console.log('✅ 3 test courses created');
    console.log('✅ 2 pending grade submissions created (6 student grades)');
    console.log('✅ 2 published grades created for transcript testing');
    console.log('✅ 1 daily report template created');
    
    console.log('\n🎯 EXAM OFFICER TESTING INSTRUCTIONS:');
    console.log('1. Login with username: iphone, password: examofficer123');
    console.log('2. Go to /staff/results to see 2 pending grade submissions');
    console.log('3. Review and approve the grade submissions');
    console.log('4. Go to /staff/transcripts and search for "John" or "Jane"');
    console.log('5. Generate transcripts for the test students');
    console.log('6. Go to /staff/students to view student records');
    console.log('7. Go to /staff/daily-report to submit daily reports');
    console.log('8. Check /staff/dashboard for overview statistics');
    
    console.log('\n✨ All test data created successfully!');
    
  } catch (error) {
    console.error('❌ Error creating test data:', error);
  } finally {
    process.exit(0);
  }
}

createTestDataForExamOfficer();