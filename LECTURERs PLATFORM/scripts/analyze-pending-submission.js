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

async function analyzePendingSubmission() {
  console.log('🔍 Analyzing Pending Submission for Principles of Management...\n');

  try {
    // Find the pending submission for Principles of Management
    console.log('📋 Looking for pending submission for Principles of Management...');
    const gradeSubmissionsRef = collection(db, 'grade-submissions');
    const pendingQuery = query(
      gradeSubmissionsRef, 
      where('courseName', '==', 'Principles of Management'),
      where('status', '==', 'pending_approval')
    );
    const pendingSnapshot = await getDocs(pendingQuery);
    
    if (pendingSnapshot.empty) {
      console.log('❌ No pending submission found for Principles of Management');
      
      // Try alternative search
      const allSubmissionsQuery = query(gradeSubmissionsRef);
      const allSubmissionsSnapshot = await getDocs(allSubmissionsQuery);
      
      console.log('\n📋 Checking all submissions for Principles of Management...');
      allSubmissionsSnapshot.forEach((doc, index) => {
        const submissionData = doc.data();
        if (submissionData.courseName === 'Principles of Management' || 
            submissionData.courseCode === 'ESM 161') {
          console.log(`\n📄 Submission ${index + 1}:`);
          console.log(`   ID: ${doc.id}`);
          console.log(`   Course: ${submissionData.courseName || submissionData.courseCode}`);
          console.log(`   Status: ${submissionData.status}`);
          console.log(`   Lecturer: ${submissionData.submittedBy}`);
          console.log(`   Students: ${submissionData.totalStudents || submissionData.grades?.length || 0}`);
          console.log(`   Year: ${submissionData.academicYear}, Semester: ${submissionData.semester}`);
          console.log(`   Submitted: ${submissionData.submissionDate?.toDate?.() || submissionData.submissionDate}`);
        }
      });
    } else {
      console.log(`✅ Found ${pendingSnapshot.size} pending submission(s) for Principles of Management`);
      
      pendingSnapshot.forEach((doc, index) => {
        const submissionData = doc.data();
        console.log(`\n📄 Pending Submission ${index + 1}:`);
        console.log(`   ID: ${doc.id}`);
        console.log(`   Course: ${submissionData.courseName || submissionData.courseCode}`);
        console.log(`   Status: ${submissionData.status}`);
        console.log(`   Lecturer: ${submissionData.submittedBy}`);
        console.log(`   Students: ${submissionData.totalStudents || submissionData.grades?.length || 0}`);
        console.log(`   Year: ${submissionData.academicYear}, Semester: ${submissionData.semester}`);
        console.log(`   Submitted: ${submissionData.submissionDate?.toDate?.() || submissionData.submissionDate}`);
        
        // Show individual grades if available
        if (submissionData.grades && submissionData.grades.length > 0) {
          console.log(`\n📊 Individual Grades:`);
          submissionData.grades.forEach((grade, gradeIndex) => {
            console.log(`   Student ${gradeIndex + 1}: ${grade.studentName || grade.studentId}`);
            console.log(`   Grade: ${grade.grade} (${grade.total}/100)`);
            console.log(`   Assessment: ${grade.assessment}, Mid-sem: ${grade.midsem}, Exams: ${grade.exams}`);
          });
        }
      });
    }

    // Check for individual student grades related to this submission
    console.log('\n📋 Checking individual student grades for Principles of Management...');
    const studentGradesRef = collection(db, 'student-grades');
    const principlesGradesQuery = query(
      studentGradesRef,
      where('courseName', '==', 'Principles of Management')
    );
    const principlesGradesSnapshot = await getDocs(principlesGradesQuery);
    
    if (principlesGradesSnapshot.empty) {
      console.log('❌ No individual grades found for Principles of Management');
    } else {
      console.log(`✅ Found ${principlesGradesSnapshot.size} individual grades for Principles of Management`);
      
      principlesGradesSnapshot.forEach((doc, index) => {
        const gradeData = doc.data();
        console.log(`\n📄 Grade ${index + 1}:`);
        console.log(`   ID: ${doc.id}`);
        console.log(`   Student: ${gradeData.studentId}`);
        console.log(`   Course: ${gradeData.courseName || gradeData.courseCode}`);
        console.log(`   Grade: ${gradeData.grade} (${gradeData.total}/100)`);
        console.log(`   Year: ${gradeData.academicYear}, Semester: ${gradeData.semester}`);
        console.log(`   Status: ${gradeData.status}`);
        console.log(`   Submission ID: ${gradeData.submissionId}`);
      });
    }

    // Check for nanak@gmail.com specifically in Principles of Management
    console.log('\n🔍 Checking if nanak@gmail.com has grades for Principles of Management...');
    const nanakPrinciplesQuery = query(
      studentGradesRef,
      where('studentId', '==', 'nanak@gmail.com'),
      where('courseName', '==', 'Principles of Management')
    );
    const nanakPrinciplesSnapshot = await getDocs(nanakPrinciplesQuery);
    
    if (nanakPrinciplesSnapshot.empty) {
      console.log('❌ No grades found for nanak@gmail.com in Principles of Management');
    } else {
      console.log(`✅ Found ${nanakPrinciplesSnapshot.size} grades for nanak@gmail.com in Principles of Management`);
      
      nanakPrinciplesSnapshot.forEach((doc, index) => {
        const gradeData = doc.data();
        console.log(`\n📄 Grade ${index + 1} for nanak@gmail.com:`);
        console.log(`   ID: ${doc.id}`);
        console.log(`   Course: ${gradeData.courseName || gradeData.courseCode}`);
        console.log(`   Grade: ${gradeData.grade} (${gradeData.total}/100)`);
        console.log(`   Year: ${gradeData.academicYear}, Semester: ${gradeData.semester}`);
        console.log(`   Status: ${gradeData.status}`);
        console.log(`   Submission ID: ${gradeData.submissionId}`);
      });
    }

    console.log('\n📊 WORKFLOW ANALYSIS:');
    console.log('💡 Current Status:');
    console.log('   1. Lecturer submitted grades for Principles of Management');
    console.log('   2. Grades are in "pending_approval" status');
    console.log('   3. Director needs to review and approve');
    console.log('   4. After approval, director needs to publish');
    console.log('   5. Only then will students see grades in portal');
    console.log('\n💡 Next Steps:');
    console.log('   1. Director should click "Review" on the pending submission');
    console.log('   2. Review the grades and click "Approve"');
    console.log('   3. After approval, click "Publish"');
    console.log('   4. Students will then see their grades in the portal');

  } catch (error) {
    console.error('❌ Error analyzing pending submission:', error);
  }
}

// Run the analysis
analyzePendingSubmission().then(() => {
  console.log('\n✅ Pending submission analysis completed!');
  process.exit(0);
}).catch((error) => {
  console.error('❌ Analysis failed:', error);
  process.exit(1);
}); 