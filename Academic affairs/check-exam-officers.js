const admin = require('firebase-admin');
const path = require('path');

// Initialize Firebase Admin
const serviceAccount = require('./ucaes2025-firebase-adminsdk-fbsvc-c70a08a455.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://ucaes2025-default-rtdb.firebaseio.com"
});

const db = admin.firestore();

async function checkExamOfficers() {
  try {
    console.log('🔍 Checking for exam officers in the database...\n');
    
    // Query for exam officers
    const examOfficersQuery = await db.collection('users')
      .where('role', '==', 'exam_officer')
      .get();
    
    console.log(`📊 Found ${examOfficersQuery.size} exam officer(s):`);
    
    if (examOfficersQuery.empty) {
      console.log('❌ No exam officers found in the database.');
    } else {
      examOfficersQuery.forEach((doc) => {
        const data = doc.data();
        console.log(`\n👤 Exam Officer: ${data.name || data.username}`);
        console.log(`   📧 Email: ${data.email || 'N/A'}`);
        console.log(`   🆔 Username: ${data.username}`);
        console.log(`   📋 Department: ${data.department || 'N/A'}`);
        console.log(`   📍 Position: ${data.position || 'N/A'}`);
        console.log(`   ✅ Status: ${data.status}`);
        console.log(`   🔑 Permissions: ${data.permissions ? data.permissions.join(', ') : 'None'}`);
        console.log(`   📅 Created: ${data.createdAt || 'N/A'}`);
      });
    }
    
    // Also check all users to see what roles exist
    console.log('\n🔍 Checking all user roles in the database...\n');
    const allUsersQuery = await db.collection('users').get();
    
    const roleCount = {};
    allUsersQuery.forEach((doc) => {
      const data = doc.data();
      const role = data.role || 'unknown';
      roleCount[role] = (roleCount[role] || 0) + 1;
    });
    
    console.log('📊 User roles summary:');
    Object.entries(roleCount).forEach(([role, count]) => {
      console.log(`   ${role}: ${count} user(s)`);
    });
    
    // Check for grade submissions that need approval
    console.log('\n🔍 Checking for grade submissions that need exam officer approval...\n');
    
    const gradeSubmissionsQuery = await db.collection('grade-submissions')
      .where('status', '==', 'pending_approval')
      .get();
    
    console.log(`📊 Found ${gradeSubmissionsQuery.size} grade submission(s) pending approval:`);
    
    if (!gradeSubmissionsQuery.empty) {
      gradeSubmissionsQuery.forEach((doc) => {
        const data = doc.data();
        console.log(`\n📝 Submission: ${data.courseCode || 'Unknown Course'}`);
        console.log(`   👨‍🏫 Submitted by: ${data.submittedBy || 'Unknown'}`);
        console.log(`   📅 Academic Year: ${data.academicYear || 'N/A'}`);
        console.log(`   📚 Semester: ${data.semester || 'N/A'}`);
        console.log(`   👥 Students: ${data.grades ? data.grades.length : 0}`);
        console.log(`   📅 Submitted: ${data.submissionDate ? new Date(data.submissionDate.seconds * 1000).toLocaleDateString() : 'N/A'}`);
      });
    } else {
      console.log('✅ No pending grade submissions found.');
    }
    
    // Check for published grades
    console.log('\n🔍 Checking for published grades...\n');
    
    const publishedGradesQuery = await db.collection('grade-submissions')
      .where('status', '==', 'published')
      .get();
    
    console.log(`📊 Found ${publishedGradesQuery.size} published grade submission(s)`);
    
    // Check student grades collection
    console.log('\n🔍 Checking student-grades collection...\n');
    
    const studentGradesQuery = await db.collection('student-grades').limit(5).get();
    console.log(`📊 Found ${studentGradesQuery.size} student grade records (showing first 5)`);
    
    if (!studentGradesQuery.empty) {
      studentGradesQuery.forEach((doc) => {
        const data = doc.data();
        console.log(`\n📝 Grade Record: ${doc.id}`);
        console.log(`   👤 Student: ${data.studentId || 'Unknown'}`);
        console.log(`   📚 Course: ${data.courseCode || 'Unknown'}`);
        console.log(`   📊 Grade: ${data.grade || 'N/A'}`);
        console.log(`   ✅ Status: ${data.status || 'N/A'}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error checking exam officers:', error);
  } finally {
    process.exit(0);
  }
}

checkExamOfficers();