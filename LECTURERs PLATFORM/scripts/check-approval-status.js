const { initializeApp } = require('firebase/app');
const { getFirestore, collection, query, where, getDocs } = require('firebase/firestore');

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

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function checkApprovalStatus() {
  console.log('🔍 Checking if Director Approval Actually Updated Database...\n');

  try {
    const gradeSubmissionsRef = collection(db, 'grade-submissions');
    
    // Check Principles of Management submission
    console.log('📋 Checking Principles of Management submission...');
    const principlesQuery = query(
      gradeSubmissionsRef,
      where('courseName', '==', 'Principles of Management')
    );
    const principlesSnapshot = await getDocs(principlesQuery);
    
    if (!principlesSnapshot.empty) {
      principlesSnapshot.forEach((doc, index) => {
        const submissionData = doc.data();
        console.log(`\n📄 Submission ${index + 1}:`);
        console.log(`   ID: ${doc.id}`);
        console.log(`   Course: ${submissionData.courseName}`);
        console.log(`   Status: ${submissionData.status}`);
        console.log(`   Lecturer: ${submissionData.submittedBy}`);
        console.log(`   Students: ${submissionData.totalStudents || submissionData.grades?.length || 0}`);
        console.log(`   Year: ${submissionData.academicYear}, Semester: ${submissionData.semester}`);
        console.log(`   Submitted: ${submissionData.submissionDate?.toDate?.() || submissionData.submissionDate}`);
        
        if (submissionData.approvedBy) {
          console.log(`   Approved By: ${submissionData.approvedBy}`);
        }
        if (submissionData.approvedDate) {
          console.log(`   Approved Date: ${submissionData.approvedDate?.toDate?.() || submissionData.approvedDate}`);
        }
      });
    }

    // Check Principles of Biochemistry submission
    console.log('\n📋 Checking Principles of Biochemistry submission...');
    const biochemistryQuery = query(
      gradeSubmissionsRef,
      where('courseName', '==', 'Principles of Biochemistry')
    );
    const biochemistrySnapshot = await getDocs(biochemistryQuery);
    
    if (!biochemistrySnapshot.empty) {
      biochemistrySnapshot.forEach((doc, index) => {
        const submissionData = doc.data();
        console.log(`\n📄 Submission ${index + 1}:`);
        console.log(`   ID: ${doc.id}`);
        console.log(`   Course: ${submissionData.courseName}`);
        console.log(`   Status: ${submissionData.status}`);
        console.log(`   Lecturer: ${submissionData.submittedBy}`);
        console.log(`   Students: ${submissionData.totalStudents || submissionData.grades?.length || 0}`);
        console.log(`   Year: ${submissionData.academicYear}, Semester: ${submissionData.semester}`);
        console.log(`   Submitted: ${submissionData.submissionDate?.toDate?.() || submissionData.submissionDate}`);
        
        if (submissionData.approvedBy) {
          console.log(`   Approved By: ${submissionData.approvedBy}`);
        }
        if (submissionData.approvedDate) {
          console.log(`   Approved Date: ${submissionData.approvedDate?.toDate?.() || submissionData.approvedDate}`);
        }
      });
    }

    // Check individual student grades status
    console.log('\n📋 Checking individual student grades status...');
    const studentGradesRef = collection(db, 'student-grades');
    
    // Check for Principles of Management grades
    const principlesGradesQuery = query(
      studentGradesRef,
      where('courseName', '==', 'Principles of Management')
    );
    const principlesGradesSnapshot = await getDocs(principlesGradesQuery);
    
    if (!principlesGradesSnapshot.empty) {
      console.log(`\n📊 Principles of Management Grades:`);
      principlesGradesSnapshot.forEach((doc, index) => {
        const gradeData = doc.data();
        console.log(`   Student ${index + 1}: ${gradeData.studentId}`);
        console.log(`   Course: ${gradeData.courseName}`);
        console.log(`   Grade: ${gradeData.grade} (${gradeData.total}/100)`);
        console.log(`   Status: ${gradeData.status}`);
        console.log(`   Year: ${gradeData.academicYear}, Semester: ${gradeData.semester}`);
        console.log(`   Submission ID: ${gradeData.submissionId}`);
        console.log('');
      });
    }

    // Check for Principles of Biochemistry grades
    const biochemistryGradesQuery = query(
      studentGradesRef,
      where('courseName', '==', 'Principles of Biochemistry')
    );
    const biochemistryGradesSnapshot = await getDocs(biochemistryGradesQuery);
    
    if (!biochemistryGradesSnapshot.empty) {
      console.log(`\n📊 Principles of Biochemistry Grades:`);
      biochemistryGradesSnapshot.forEach((doc, index) => {
        const gradeData = doc.data();
        console.log(`   Student ${index + 1}: ${gradeData.studentId}`);
        console.log(`   Course: ${gradeData.courseName}`);
        console.log(`   Grade: ${gradeData.grade} (${gradeData.total}/100)`);
        console.log(`   Status: ${gradeData.status}`);
        console.log(`   Year: ${gradeData.academicYear}, Semester: ${gradeData.semester}`);
        console.log(`   Submission ID: ${gradeData.submissionId}`);
        console.log('');
      });
    }

    console.log('\n📊 APPROVAL STATUS ANALYSIS:');
    console.log('💡 From the image, we can see:');
    console.log('   ✅ Director has approved both courses');
    console.log('   ✅ UI shows "Approved" status with checkmarks');
    console.log('   ⏳ "Publish to Students" buttons are still available');
    console.log('\n💡 Next Step:');
    console.log('   Director needs to click "Publish to Students" to make grades visible to students');

  } catch (error) {
    console.error('❌ Error checking approval status:', error);
  }
}

checkApprovalStatus().then(() => {
  console.log('\n✅ Approval status check completed!');
  process.exit(0);
}).catch((error) => {
  console.error('❌ Check failed:', error);
  process.exit(1);
}); 