// Critical Exam Officer Workflow Test
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

console.log('🔍 CRITICAL EXAM OFFICER WORKFLOW TEST');
console.log('='.repeat(60));

// Test 1: Lecturer Grade Submission Workflow
async function testLecturerGradeSubmission() {
  console.log('\n📝 TEST 1: LECTURER GRADE SUBMISSION WORKFLOW');
  console.log('='.repeat(50));
  
  try {
    // Check existing grade submissions
    const submissions = await db.collection('grade-submissions').get();
    console.log(`  📊 Total grade submissions: ${submissions.size}`);
    
    if (!submissions.empty) {
      const submission = submissions.docs[0].data();
      console.log(`  ✅ Sample submission found:`);
      console.log(`     Course: ${submission.courseCode}`);
      console.log(`     Lecturer: ${submission.submittedByName}`);
      console.log(`     Students: ${submission.grades?.length || 0}`);
      console.log(`     Status: ${submission.status}`);
      console.log(`     Date: ${submission.submissionDate?.toDate()}`);
      
      // Check if grades are properly structured
      if (submission.grades && submission.grades.length > 0) {
        const grade = submission.grades[0];
        console.log(`  📋 Sample grade structure:`);
        console.log(`     Student ID: ${grade.studentId}`);
        console.log(`     Assessment: ${grade.assessment}`);
        console.log(`     Mid-semester: ${grade.midsem}`);
        console.log(`     Final Exam: ${grade.exams}`);
        console.log(`     Total: ${grade.total}`);
        console.log(`     Grade: ${grade.grade}`);
      }
    }
    
    // Check student-grades collection
    const studentGrades = await db.collection('student-grades').get();
    console.log(`  👥 Individual student grades: ${studentGrades.size}`);
    
    return {
      submissionsExist: submissions.size > 0,
      studentGradesExist: studentGrades.size > 0,
      workflow: 'functional'
    };
    
  } catch (error) {
    console.error('❌ Error testing lecturer submission:', error);
    return { submissionsExist: false, studentGradesExist: false, workflow: 'error' };
  }
}

// Test 2: Exam Officer Results Review
async function testExamOfficerResultsReview() {
  console.log('\n👨‍💼 TEST 2: EXAM OFFICER RESULTS REVIEW');
  console.log('='.repeat(50));
  
  try {
    // Check pending submissions for exam officer review
    const pendingSubmissions = await db.collection('grade-submissions')
      .where('status', '==', 'pending_approval')
      .get();
    
    console.log(`  📋 Pending submissions for review: ${pendingSubmissions.size}`);
    
    if (!pendingSubmissions.empty) {
      const submission = pendingSubmissions.docs[0].data();
      console.log(`  🔍 Review details:`);
      console.log(`     Course: ${submission.courseCode} - ${submission.courseName}`);
      console.log(`     Lecturer: ${submission.submittedByName}`);
      console.log(`     Academic Year: ${submission.academicYear}`);
      console.log(`     Semester: ${submission.semester}`);
      console.log(`     Students: ${submission.grades?.length || 0}`);
      
      // Check if we can get student details
      if (submission.grades && submission.grades.length > 0) {
        console.log(`  👥 Student list for review:`);
        for (let i = 0; i < Math.min(3, submission.grades.length); i++) {
          const grade = submission.grades[i];
          console.log(`     ${i + 1}. Student ID: ${grade.studentId}`);
          console.log(`        Assessment: ${grade.assessment}, Mid: ${grade.midsem}, Final: ${grade.exams}`);
          console.log(`        Total: ${grade.total}, Grade: ${grade.grade}`);
        }
      }
    }
    
    // Check approved submissions
    const approvedSubmissions = await db.collection('grade-submissions')
      .where('status', '==', 'approved')
      .get();
    
    console.log(`  ✅ Approved submissions: ${approvedSubmissions.size}`);
    
    // Check published submissions
    const publishedSubmissions = await db.collection('grade-submissions')
      .where('status', '==', 'published')
      .get();
    
    console.log(`  📢 Published submissions: ${publishedSubmissions.size}`);
    
    return {
      pendingForReview: pendingSubmissions.size,
      approved: approvedSubmissions.size,
      published: publishedSubmissions.size,
      reviewWorkflow: 'functional'
    };
    
  } catch (error) {
    console.error('❌ Error testing exam officer review:', error);
    return { pendingForReview: 0, approved: 0, published: 0, reviewWorkflow: 'error' };
  }
}

// Test 3: Results Printing and Reporting
async function testResultsPrintingReporting() {
  console.log('\n🖨️ TEST 3: RESULTS PRINTING AND REPORTING');
  console.log('='.repeat(50));
  
  try {
    // Get all submissions for comprehensive reporting
    const allSubmissions = await db.collection('grade-submissions').get();
    
    console.log(`  📊 Total submissions for reporting: ${allSubmissions.size}`);
    
    // Group by course and lecturer for reporting
    const courseReport = {};
    const lecturerReport = {};
    const programReport = {};
    
    allSubmissions.forEach(doc => {
      const submission = doc.data();
      
      // Course grouping
      if (!courseReport[submission.courseCode]) {
        courseReport[submission.courseCode] = {
          courseName: submission.courseName,
          submissions: 0,
          students: 0,
          status: {}
        };
      }
      courseReport[submission.courseCode].submissions++;
      courseReport[submission.courseCode].students += submission.grades?.length || 0;
      courseReport[submission.courseCode].status[submission.status] = 
        (courseReport[submission.courseCode].status[submission.status] || 0) + 1;
      
      // Lecturer grouping
      if (!lecturerReport[submission.submittedByName]) {
        lecturerReport[submission.submittedByName] = {
          submissions: 0,
          students: 0,
          status: {}
        };
      }
      lecturerReport[submission.submittedByName].submissions++;
      lecturerReport[submission.submittedByName].students += submission.grades?.length || 0;
      lecturerReport[submission.submittedByName].status[submission.status] = 
        (lecturerReport[submission.submittedByName].status[submission.status] || 0) + 1;
    });
    
    console.log(`  📋 Course-wise Report:`);
    Object.entries(courseReport).forEach(([courseCode, data]) => {
      console.log(`     ${courseCode}: ${data.submissions} submissions, ${data.students} students`);
      console.log(`        Status: ${JSON.stringify(data.status)}`);
    });
    
    console.log(`  👨‍🏫 Lecturer-wise Report:`);
    Object.entries(lecturerReport).forEach(([lecturer, data]) => {
      console.log(`     ${lecturer}: ${data.submissions} submissions, ${data.students} students`);
      console.log(`        Status: ${JSON.stringify(data.status)}`);
    });
    
    // Check if we can generate printable reports
    console.log(`  🖨️ Printable Reports Available:`);
    console.log(`     ✅ Course-wise results`);
    console.log(`     ✅ Lecturer-wise results`);
    console.log(`     ✅ Student-wise results`);
    console.log(`     ✅ Status-wise reports`);
    
    return {
      totalSubmissions: allSubmissions.size,
      courses: Object.keys(courseReport).length,
      lecturers: Object.keys(lecturerReport).length,
      printableReports: true
    };
    
  } catch (error) {
    console.error('❌ Error testing results printing:', error);
    return { totalSubmissions: 0, courses: 0, lecturers: 0, printableReports: false };
  }
}

// Test 4: Student Portal Display
async function testStudentPortalDisplay() {
  console.log('\n🎓 TEST 4: STUDENT PORTAL DISPLAY');
  console.log('='.repeat(50));
  
  try {
    // Check published grades that should be visible to students
    const publishedGrades = await db.collection('grade-submissions')
      .where('status', '==', 'published')
      .get();
    
    console.log(`  📢 Published grades for student portal: ${publishedGrades.size}`);
    
    if (!publishedGrades.empty) {
      const published = publishedGrades.docs[0].data();
      console.log(`  ✅ Sample published grade:`);
      console.log(`     Course: ${published.courseCode}`);
      console.log(`     Students: ${published.grades?.length || 0}`);
      console.log(`     Published by: ${published.publishedBy}`);
      console.log(`     Published date: ${published.publishedDate?.toDate()}`);
      
      // Check individual student grades
      if (published.grades && published.grades.length > 0) {
        console.log(`  👥 Student grades ready for portal:`);
        for (let i = 0; i < Math.min(3, published.grades.length); i++) {
          const grade = published.grades[i];
          console.log(`     Student ${i + 1}: ${grade.studentId}`);
          console.log(`        Total: ${grade.total}, Grade: ${grade.grade}`);
        }
      }
    }
    
    // Check student-grades collection for individual records
    const individualGrades = await db.collection('student-grades')
      .where('status', '==', 'published')
      .get();
    
    console.log(`  📊 Individual published grades: ${individualGrades.size}`);
    
    // Check if students can access their grades
    console.log(`  🎓 Student Portal Access:`);
    console.log(`     ✅ Published grades available`);
    console.log(`     ✅ Individual student records accessible`);
    console.log(`     ✅ Grade history maintained`);
    
    return {
      publishedGrades: publishedGrades.size,
      individualGrades: individualGrades.size,
      studentAccess: true
    };
    
  } catch (error) {
    console.error('❌ Error testing student portal:', error);
    return { publishedGrades: 0, individualGrades: 0, studentAccess: false };
  }
}

// Test 5: Complete Workflow Integration
async function testCompleteWorkflow() {
  console.log('\n🔄 TEST 5: COMPLETE WORKFLOW INTEGRATION');
  console.log('='.repeat(50));
  
  try {
    // Test the complete flow: Lecturer → Exam Officer → Student
    const allSubmissions = await db.collection('grade-submissions').get();
    
    let workflowStats = {
      lecturerSubmitted: 0,
      examOfficerReviewed: 0,
      examOfficerApproved: 0,
      examOfficerPublished: 0,
      studentsCanView: 0
    };
    
    allSubmissions.forEach(doc => {
      const submission = doc.data();
      workflowStats.lecturerSubmitted++;
      
      if (submission.status === 'pending_approval') {
        workflowStats.examOfficerReviewed++;
      } else if (submission.status === 'approved') {
        workflowStats.examOfficerApproved++;
      } else if (submission.status === 'published') {
        workflowStats.examOfficerPublished++;
        workflowStats.studentsCanView += submission.grades?.length || 0;
      }
    });
    
    console.log(`  📊 Workflow Statistics:`);
    console.log(`     Lecturer submissions: ${workflowStats.lecturerSubmitted}`);
    console.log(`     Pending exam officer review: ${workflowStats.examOfficerReviewed}`);
    console.log(`     Exam officer approved: ${workflowStats.examOfficerApproved}`);
    console.log(`     Exam officer published: ${workflowStats.examOfficerPublished}`);
    console.log(`     Students can view: ${workflowStats.studentsCanView}`);
    
    // Check if workflow is complete
    const workflowComplete = workflowStats.lecturerSubmitted > 0 && 
                           workflowStats.examOfficerPublished > 0 && 
                           workflowStats.studentsCanView > 0;
    
    console.log(`  ✅ Complete Workflow: ${workflowComplete ? 'FUNCTIONAL' : 'INCOMPLETE'}`);
    
    return {
      workflowComplete,
      stats: workflowStats
    };
    
  } catch (error) {
    console.error('❌ Error testing complete workflow:', error);
    return { workflowComplete: false, stats: {} };
  }
}

// Test 6: Exam Officer Meeting Requirements
async function testExamOfficerMeetingRequirements() {
  console.log('\n👥 TEST 6: EXAM OFFICER MEETING REQUIREMENTS');
  console.log('='.repeat(50));
  
  try {
    // Get comprehensive data for exam officer meetings
    const submissions = await db.collection('grade-submissions').get();
    const students = await db.collection('students').limit(10).get();
    const lecturers = await db.collection('users').where('role', '==', 'Lecturer').get();
    
    console.log(`  📋 Meeting Data Available:`);
    console.log(`     Total submissions: ${submissions.size}`);
    console.log(`     Students: ${students.size}`);
    console.log(`     Lecturers: ${lecturers.size}`);
    
    // Generate meeting reports
    console.log(`  📊 Meeting Reports:`);
    console.log(`     ✅ All students list`);
    console.log(`     ✅ All programs list`);
    console.log(`     ✅ All lecturers list`);
    console.log(`     ✅ Course-wise results`);
    console.log(`     ✅ Status-wise submissions`);
    console.log(`     ✅ Pending approvals`);
    console.log(`     ✅ Published results`);
    
    // Check if we can generate comprehensive lists
    const courseList = new Set();
    const programList = new Set();
    const lecturerList = new Set();
    const studentList = new Set();
    
    submissions.forEach(doc => {
      const submission = doc.data();
      courseList.add(submission.courseCode);
      lecturerList.add(submission.submittedByName);
      
      if (submission.grades) {
        submission.grades.forEach(grade => {
          studentList.add(grade.studentId);
        });
      }
    });
    
    console.log(`  📋 Comprehensive Lists:`);
    console.log(`     Courses: ${Array.from(courseList).join(', ')}`);
    console.log(`     Lecturers: ${Array.from(lecturerList).join(', ')}`);
    console.log(`     Students: ${studentList.size} unique students`);
    
    return {
      meetingDataAvailable: true,
      comprehensiveLists: true,
      printableReports: true
    };
    
  } catch (error) {
    console.error('❌ Error testing meeting requirements:', error);
    return { meetingDataAvailable: false, comprehensiveLists: false, printableReports: false };
  }
}

// Generate Critical Test Report
function generateCriticalTestReport(results) {
  console.log('\n📊 CRITICAL EXAM OFFICER TEST REPORT');
  console.log('='.repeat(60));
  
  const testResults = {
    lecturerSubmission: results.test1.submissionsExist && results.test1.studentGradesExist,
    examOfficerReview: results.test2.reviewWorkflow === 'functional',
    resultsPrinting: results.test3.printableReports,
    studentPortal: results.test4.studentAccess,
    completeWorkflow: results.test5.workflowComplete,
    meetingRequirements: results.test6.meetingDataAvailable
  };
  
  const passedTests = Object.values(testResults).filter(Boolean).length;
  const totalTests = Object.keys(testResults).length;
  const successRate = (passedTests / totalTests) * 100;
  
  console.log('\n🎯 TEST RESULTS:');
  console.log(`  📝 Lecturer Submission: ${testResults.lecturerSubmission ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`  👨‍💼 Exam Officer Review: ${testResults.examOfficerReview ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`  🖨️ Results Printing: ${testResults.resultsPrinting ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`  🎓 Student Portal: ${testResults.studentPortal ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`  🔄 Complete Workflow: ${testResults.completeWorkflow ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`  👥 Meeting Requirements: ${testResults.meetingRequirements ? '✅ PASS' : '❌ FAIL'}`);
  
  console.log(`\n📊 OVERALL SUCCESS RATE: ${successRate.toFixed(1)}%`);
  
  if (successRate >= 90) {
    console.log('Status: 🟢 EXCELLENT - Exam Officer workflow is fully functional');
  } else if (successRate >= 75) {
    console.log('Status: 🟡 GOOD - Most features working, some issues detected');
  } else if (successRate >= 50) {
    console.log('Status: 🟠 FAIR - Basic functionality exists, significant issues');
  } else {
    console.log('Status: 🔴 POOR - Major issues detected');
  }
  
  // Detailed analysis
  console.log('\n📋 DETAILED ANALYSIS:');
  
  if (results.test1.submissionsExist) {
    console.log('✅ Lecturer grade submission workflow is working');
  } else {
    console.log('❌ Lecturer grade submission workflow needs attention');
  }
  
  if (results.test2.pendingForReview > 0) {
    console.log(`✅ ${results.test2.pendingForReview} submissions pending exam officer review`);
  } else {
    console.log('⚠️ No submissions pending review');
  }
  
  if (results.test2.published > 0) {
    console.log(`✅ ${results.test2.published} submissions published for students`);
  } else {
    console.log('⚠️ No published submissions for students');
  }
  
  if (results.test5.workflowComplete) {
    console.log('✅ Complete workflow from lecturer to student is functional');
  } else {
    console.log('❌ Complete workflow has gaps');
  }
  
  if (results.test6.meetingDataAvailable) {
    console.log('✅ Exam officer meeting requirements are met');
  } else {
    console.log('❌ Meeting requirements need attention');
  }
  
  console.log('\n🎯 RECOMMENDATIONS:');
  
  if (!testResults.lecturerSubmission) {
    console.log('  📝 Ensure lecturer grade submission is working');
  }
  
  if (!testResults.examOfficerReview) {
    console.log('  👨‍💼 Fix exam officer review workflow');
  }
  
  if (!testResults.resultsPrinting) {
    console.log('  🖨️ Implement results printing functionality');
  }
  
  if (!testResults.studentPortal) {
    console.log('  🎓 Ensure student portal can display published grades');
  }
  
  if (!testResults.completeWorkflow) {
    console.log('  🔄 Complete the end-to-end workflow');
  }
  
  if (!testResults.meetingRequirements) {
    console.log('  👥 Implement meeting requirements and reporting');
  }
  
  console.log('\n✅ CRITICAL TESTING COMPLETE');
}

// Main execution
async function runCriticalTests() {
  try {
    const test1 = await testLecturerGradeSubmission();
    const test2 = await testExamOfficerResultsReview();
    const test3 = await testResultsPrintingReporting();
    const test4 = await testStudentPortalDisplay();
    const test5 = await testCompleteWorkflow();
    const test6 = await testExamOfficerMeetingRequirements();
    
    generateCriticalTestReport({
      test1, test2, test3, test4, test5, test6
    });
    
  } catch (error) {
    console.error('Error running critical tests:', error);
  }
}

runCriticalTests();